class New {
    constructor(value) {
        this.body          = newsbody;
        this.type          = 'news';
        this.value         = value;
        this.link          = value.link;
        this.regexp        = value.regexp;
        this.current       = value.current;
        this.name          = this.link;
        this.tr            = document.createElement('tr');
        this.tr.innerHTML  = '<td><img src="' + getFavicon(this.link) + '"></td><td><a href="' + escapeAttribute(this.link) + '" target="_blank">' + escapeHTML(this.name) + '</a></td><td></td><td><a>' + chromeI18n('recheck') + '</a> &middot; <a>' + chromeI18n('edit') + '</a> &middot; <a>' + chromeI18n('delete') + '</a></td>';
        this.tr.domName    = this.tr.children[1];
        this.tr.domResult  = this.tr.children[2];
        this.tr.domActions = this.tr.lastElementChild;
        this.tr.domActions.firstElementChild.addEventListener('click', () => this.reCheck(), false);
        this.tr.domActions.children[1].addEventListener('click', () => {
            let td1       = document.createElement('td');
            let td2       = document.createElement('td');
            let td        = document.createElement('td');
            td1.innerHTML = '<input type="url" placeholder="' + chromeI18n('link') + '" required value="' + escapeAttribute(this.link) + '">';
            td2.innerHTML = '<input type="text" placeholder="' + chromeI18n('regexp') + '" list="news' + escapeAttribute(this.link) + '" value="' + escapeAttribute(this.regexp) + '"><datalist id="news' + escapeAttribute(this.link) + '"></datalist>';
            td.innerHTML  = '<a>' + chromeI18n('confirm') + '</a> &middot; <a>' + chromeI18n('cancel') + '</a>';
            addEventsToDropdowns(td2.lastElementChild);
            addEventsToInput(td1.firstElementChild);
            td.firstElementChild.addEventListener('click', () => New.parse(this.current, this.link, td1.firstElementChild, td2.firstElementChild, () => this.delete()), false);
            td.lastElementChild.addEventListener('click', () => {
                this.tr.replaceChild(this.tr.domName, td1);
                this.tr.replaceChild(this.tr.domResult, td2);
                this.tr.replaceChild(this.tr.domActions, td);
            }, false);
            this.tr.replaceChild(td1, this.tr.domName);
            this.tr.replaceChild(td2, this.tr.domResult);
            this.tr.replaceChild(td, this.tr.domActions);
        }, false);
        this.tr.domActions.lastElementChild.addEventListener('click', () => {
            let td       = document.createElement('td');
            td.innerHTML = '<a>' + chromeI18n('confirm') + '</a> &middot; <a>' + chromeI18n('cancel') + '</a>';
            td.firstElementChild.addEventListener('click', () => this.delete(), false);
            td.lastElementChild.addEventListener('click', () => this.tr.replaceChild(this.tr.domActions, td), false);
            this.tr.replaceChild(td, this.tr.domActions);
        }, false);
        this.body.insertBefore(this.tr, this.body.firstElementChild);
    }
    check() {
        this.request = new GetRequest(this.tr.domResult, this.link);
        this.request.send((ok, response) => {
            if (!ok)
                this.sortOrange();
            else if (this.regexp === '') {
                let rssParser = new RSSParser(response, this.current);
                if (rssParser.getErrorFlag())
                    this.sortRed('RSS');
                else {
                    this.setName(rssParser.getName());
                    let link                                        = rssParser.getLink();
                    this.tr.domName.firstElementChild.href          = escapeAttribute(link);
                    this.tr.firstElementChild.firstElementChild.src = getFavicon(link);
                    let newItemCount                                = rssParser.getNewItemCount();
                    let result                                      = chrome.i18n.getMessage('newitems', [newItemCount]);
                    if (newItemCount === 0)
                        this.sortNoCurrent(result);
                    else this.sortCurrent(result, rssParser.getNewDate());
                }
            }
            else {
                let tmp = response.match(New.regExpName);
                if (tmp !== null && tmp.length === 2)
                    this.setName(tmp[1]);
                try {
                    let result = response.match(new RegExp(this.regexp));
                    if (result.length !== 1)
                        result.splice(0, 1);
                    result = result.join(' ').trim();
                    if (result === this.current)
                        this.sortNoCurrent(result);
                    else this.sortCurrent(result, result);
                }
                catch (err) {
                    this.sortRed('RegExp');
                }
            }
        });
    }
    setName(name) {
        this.name                                   = escapeHTML(name);
        this.tr.domName.firstElementChild.innerHTML = this.name;
    }
    sortRed(string) {
        this.tr.domResult.className = 'red';
        this.tr.domResult.innerHTML = chromeI18n('error', [string]);
        let trs                     = this.body.children;
        let i                       = trs.length - 2;
        for ( ; i !== -1 && trs[i].domResult.className === ''; i--) ;
        for ( ; i !== -1 && trs[i].domResult.className === 'green'; i--) ;
        for ( ; i !== -1 && trs[i].domResult.className === 'orange'; i--) ;
        for ( ; i !== -1 && trs[i].domResult.className === 'red' && trs[i].domName.firstElementChild.innerHTML.localeCompare(this.name) > 0; i--) ;
        this.body.insertBefore(this.tr, trs[i + 1]);
    }
    sortOrange() {
        this.tr.domResult.className = 'orange';
        this.tr.domResult.innerHTML = chromeI18n('error', [chromeI18n('link')]);
        let trs                     = this.body.children;
        let i                       = trs.length - 2;
        for ( ; i !== -1 && trs[i].domResult.className === ''; i--) ;
        for ( ; i !== -1 && trs[i].domResult.className === 'green'; i--) ;
        for ( ; i !== -1 && trs[i].domResult.className === 'orange' && trs[i].domName.firstElementChild.innerHTML.localeCompare(this.name) > 0; i--) ;
        this.body.insertBefore(this.tr, trs[i + 1]);
    }
    sortCurrent(result, current) {
        this.tr.domResult.innerHTML = escapeHTML(result);
        this.tr.domResult.className = 'green';
        this.tr.domName.firstElementChild.addEventListener('click', () => this.save(current), false);
        let a       = document.createElement('a');
        a.innerHTML = chromeI18n('save');
        a.addEventListener('click', () => this.save(current), false);
        this.tr.domActions.insertBefore(document.createTextNode(' · '), this.tr.domActions.firstElementChild);
        this.tr.domActions.insertBefore(a, this.tr.domActions.firstChild);
        let trs = this.body.children;
        let i   = trs.length - 2;
        for ( ; i !== -1 && trs[i].domResult.className === ''; i--) ;
        for ( ; i !== -1 && trs[i].domResult.className === 'green' && trs[i].domName.firstElementChild.innerHTML.localeCompare(this.name) > 0; i--) ;
        this.body.insertBefore(this.tr, trs[i + 1]);
    }
    sortNoCurrent(result) {
        this.tr.domResult.innerHTML = escapeHTML(result);
        let trs                     = this.body.children;
        let i                       = trs.length - 2;
        for ( ; i !== -1 && trs[i].domResult.className === '' && trs[i].domName.firstElementChild.innerHTML.localeCompare(this.name) > 0; i--) ;
        this.body.insertBefore(this.tr, trs[i + 1]);
    }
    save(current) {
        this.value.current = current;
        let i = propertyInArray(this.link, 'link', arrays[this.type]);
        if (i !== -1) {
            arrays[this.type][i].current = current;
            writeArrays();
        }
        this.reCheck();
    }
    reCheck() {
        this.request.abort();
        this.body.removeChild(this.tr);
        let toCheck = new New(this.value);
        toCheck.check();
    }
    delete() {
        this.request.abort();
        this.body.removeChild(this.tr);
        let i = propertyInArray(this.link, 'link', arrays[this.type]);
        if (i !== -1) {
            arrays[this.type].splice(i, 1);
            writeArrays();
        }
    }
    static parse(current, previousLink, newslink, newsregexp, remove) {
        newslink.click();
        let link      = newslink.value.trim();
        let regexp    = newsregexp.value;
        let arrayNews = arrays.news;
        if (!newslink.validity.valid || (previousLink !== link && propertyInArray(link, 'link', arrayNews) !== -1))
            newslink.className = 'invalid';
        else {
            newslink.value   = '';
            newsregexp.value = '';
            if (remove !== undefined)
                remove();
            let toCheck = new New(arrayNews[arrayNews.push({ link: link, regexp: regexp, current: current }) - 1]);
            writeArrays();
            toCheck.check();
        }
    }
}

New.regExpName = /<title(?: [^>]*)?>([^<]*)/;
