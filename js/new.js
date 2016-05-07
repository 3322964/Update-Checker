class New {
    constructor(value) {
        this.deleted      = false;
        this.currentId    = 2;
        this.body         = viewnewsbody;
        this.type         = 'news';
        this.link         = value.link;
        this.regexp       = value.regexp;
        this.current      = value.current;
        this.name         = this.link;
        this.tr           = document.createElement('tr');
        this.tr.object    = this;
        this.tr.innerHTML = '<td><img src="' + getFavicon + escape(this.link) + '"></td><td><a href="' + escapeAttribute(this.link) + '" target="_blank">' + escapeHTML(this.name) + '</a></td><td class="loading"></td><td><a>' + chromeI18n('edit') + '</a> / <a>' + chromeI18n('delete') + '</a></td>';
        this.savedName    = this.tr.children[1];
        this.savedResult  = this.tr.children[this.currentId];
        this.tr.lastElementChild.firstElementChild.addEventListener('click', () => {
            let save = this.tr.lastElementChild;
            this.tr.removeChild(this.savedName);
            this.tr.removeChild(this.savedResult);
            this.tr.removeChild(save);
            let td1       = document.createElement('td');
            let td2       = document.createElement('td');
            let td        = document.createElement('td');
            td1.innerHTML = '<input type="url" placeholder="' + chromeI18n('link') + '" required value="' + this.link + '"">';
            td2.innerHTML = '<input type="text" placeholder="' + chromeI18n('regexp') + '" list="news' + this.link + '" value="' + this.regexp + '""><datalist id="news' + this.link + '"></datalist>';
            td.innerHTML  = '<a>' + chromeI18n('confirm') + '</a> / <a>' + chromeI18n('cancel') + '</a>';
            addEventsToDropdowns(td2.lastElementChild);
            addEventsToInput(td1.firstElementChild);
            addEventsToInput(td2.firstElementChild);
            td.firstElementChild.addEventListener('click', () => {
                New.parseNews(this.current, this.link, td1.firstElementChild, td2.firstElementChild, this.delete.bind(this));
            }, false);
            td.lastElementChild.addEventListener('click', () => {
                this.tr.removeChild(td1);
                this.tr.removeChild(td2);
                this.tr.removeChild(td);
                this.tr.appendChild(this.savedName);
                this.tr.appendChild(this.savedResult);
                this.tr.appendChild(save);
            }, false);
            this.tr.appendChild(td1);
            this.tr.appendChild(td2);
            this.tr.appendChild(td);
        }, false);
        this.tr.lastElementChild.lastElementChild.addEventListener('click', () => {
            let save = this.tr.lastElementChild;
            this.tr.removeChild(save);
            let td       = document.createElement('td');
            td.innerHTML = '<a>' + chromeI18n('confirm') + '</a> / <a>' + chromeI18n('cancel') + '</a>';
            td.firstElementChild.addEventListener('click', () => {
                this.delete();
            }, false);
            td.lastElementChild.addEventListener('click', () => {
                this.tr.removeChild(td);
                this.tr.appendChild(save);
            }, false);
            this.tr.appendChild(td);
        }, false);
        this.body.insertBefore(this.tr, this.body.lastElementChild);
    }
    check() {
        getLink(this.link, (ok, response) => {
            if (!this.deleted) {
                if (!ok)
                    this.sortOrange();
                else if (this.regexp == '') {
                    let rssParser = new RSSParser(response, this.current);
                    if (rssParser.getErrorFlag())
                        this.sortRed();
                    else {
                        this.setName(rssParser.getName());
                        if (this.edited)
                        this.savedName.firstElementChild.href = escapeAttribute(rssParser.getLink());
                        let newItemCount                      = rssParser.getNewItemCount();
                        let result                            = chrome.i18n.getMessage('newitems', [newItemCount]);
                        if (newItemCount == 0)
                            this.sortNoCurrent(result);
                        else this.sortCurrent(result, rssParser.getNewDate());
                    }
                }
                else {
                    let tmp = response.match(New.regExpName);
                    if (tmp != null && tmp.length == 2)
                        this.setName(tmp[1]);
                    try {
                        let result = response.match(new RegExp(this.regexp));
                        if (result.length != 1)
                            result.splice(0, 1);
                        result = result.join(' ').trim();
                        if (result == this.current)
                            this.sortNoCurrent(result);
                        else this.sortCurrent(result, result);
                    }
                    catch (err) {
                        this.sortRed();
                    }
                }
            }
        });
    }
    setName(name) {
        this.name                                  = escapeHTML(name);
        this.savedName.firstElementChild.innerHTML = this.name;
    }
    sortRed() {
        this.savedResult.className = 'red';
        this.savedResult.innerHTML = chromeI18n('error');
        let trs                    = this.body.children;
        let i                      = 0;
        let length                 = trs.length - 1;
        for ( ; i != length && trs[i].object.savedResult.className == 'red' && trs[i].object.savedName.firstElementChild.innerHTML.localeCompare(this.name) < 0; i++) ;
        this.body.insertBefore(this.tr, trs[i]);
    }
    sortOrange() {
        this.savedResult.className = 'orange';
        this.savedResult.innerHTML = chromeI18n('unreachable');
        let trs                    = this.body.children;
        let i                      = 0;
        let length                 = trs.length - 1;
        for ( ; i != length && trs[i].object.savedResult.className == 'red'; i++) ;
        for ( ; i != length && trs[i].object.savedResult.className == 'orange' && trs[i].object.savedName.firstElementChild.innerHTML.localeCompare(this.name) < 0; i++) ;
        this.body.insertBefore(this.tr, trs[i]);
    }
    sortCurrent(result, current) {
        this.savedResult.innerHTML = result;
        this.savedResult.className = 'green';
        this.tr.children[1].firstElementChild.addEventListener('click', () => {
            this.current = current;
            let i = propertyInArray(this.link, 'link', arrays[this.type]);
            if (i != -1) {
                arrays[this.type][i].current = current;
                writeArrays();
            }
            this.body.removeChild(this.tr);
            this.sortNoCurrent(result);
        }, false);
        let trs    = this.body.children;
        let i      = 0;
        let length = trs.length - 1;
        let value;
        for ( ; i != length && trs[i].object.savedResult.className == 'red'; i++) ;
        for ( ; i != length && trs[i].object.savedResult.className == 'orange'; i++) ;
        for ( ; i != length && trs[i].object.savedResult.className == 'green' && trs[i].object.savedName.firstElementChild.innerHTML.localeCompare(this.name) < 0; i++) ;
        this.body.insertBefore(this.tr, trs[i]);
    }
    sortNoCurrent(result) {
        this.savedResult.innerHTML = result;
        this.savedResult.className = '';
        let trs    = this.body.children;
        let i      = 0;
        let length = trs.length - 1;
        for ( ; i != length && trs[i].object.savedResult.className == 'red'; i++) ;
        for ( ; i != length && trs[i].object.savedResult.className == 'orange'; i++) ;
        for ( ; i != length && trs[i].object.savedResult.className == 'green'; i++) ;
        for ( ; i != length && trs[i].object.savedResult.className == '' && trs[i].object.savedName.firstElementChild.innerHTML.localeCompare(this.name) < 0; i++) ;
        this.body.insertBefore(this.tr, trs[i]);
    }
    delete() {
        this.body.removeChild(this.tr);
        let i = propertyInArray(this.link, 'link', arrays[this.type]);
        if (i != -1) {
            arrays[this.type].splice(i, 1);
            writeArrays();
        }
        this.deleted = true;
    }
    static parse(current, previousLink, newslink, newsregexp, remove) {
        newslink.click();
        newsregexp.click();
        let link      = newslink.value.trim();
        let regexp    = newsregexp.value.trim();
        let arrayNews = arrays.news;
        if (!newslink.validity.valid || (previousLink != link && propertyInArray(link, 'link', arrayNews) != -1))
            newslink.className = 'invalid';
        else {
            newslink.value   = '';
            newsregexp.value = '';
            if (remove != null)
                remove();
            let toCheck = new New(arrayNews[arrayNews.push({ link: link, regexp: regexp, current: current }) - 1]);
            writeArrays();
            toCheck.check();
        }
    }
}

New.regExpName = /<title>([^<]*)/;
