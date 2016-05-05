class New {
    constructor(value) {
        this.currentId    = 2;
        this.body         = viewnewsbody;
        this.type         = 'news';
        this.value        = value;
        this.name         = this.value['name'];
        this.link         = this.value['link'];
        this.regexp       = this.value['regexp'];
        this.current      = this.value['current'];
        if (this.name == '')
            this.name = this.link;
        this.tr           = document.createElement('tr');
        this.tr.innerHTML = '<td><a href="' + escapeAttribute(this.link) + '" target="_blank">' + escapeHTML(this.name) + '</a></td><td><img src="' + getFavicon + escape(this.link) + '"></td><td class="checking"></td><td><a>' + chromeI18n('edit') + '</a> / <a>' + chromeI18n('delete') + '</a></td>';
        this.tr.lastElementChild.firstElementChild.addEventListener('click', () => {
            newsnameedit.value   = this.value['name'];
            newslinkedit.value   = this.value['link'];
            newsregexpedit.value = this.value['regexp'];
            newsnameedit.click();
            newslinkedit.click();
            newsregexpedit.click();
            newsvalidedit.onclick = () => {
                // parseNews(this.value['current'], this.value['link'], newsnameedit, newsnameeditspan, newslinkedit, newslinkeditspan, newsregexpedit, newsregexpeditspan, typeDom, li, type, value, newsfade);
            };
            newslight.classList.add('visible');
            newsfade.classList.add('visible');
        }, false);
        this.tr.lastElementChild.lastElementChild.addEventListener('click', () => {
            confirmyes.onclick = () => {
                this.delete();
                confirmfade.click();
            };
            confirmlight.classList.add('visible');
            confirmfade.classList.add('visible');
        }, false);
        this.body.appendChild(this.tr);
    }
    check() {
        getLink(this.link, (ok, response) => {
            if (!ok)
                this.sortOrange();
            else if (this.regexp == '') {
                let rssParser = new RSSParser(response, this.current);
                if (rssParser.getErrorFlag())
                    this.sortRed();
                else {
                    if (this.value['name'] == '')
                        this.setName(rssParser.getName());
                    this.tr.children[0].firstElementChild.href = escapeAttribute(rssParser.getLink());
                    let newItemCount                           = rssParser.getNewItemCount();
                    let result                                 = chrome.i18n.getMessage('newitems', [newItemCount]);
                    if (newItemCount == 0)
                        this.sortNoCurrent(result);
                    else this.sortCurrent(result, rssParser.getNewDate());
                }
            }
            else {
                if (this.value['name'] == '') {
                    let tmp = response.match(New.regExpName);
                    if (tmp != null && tmp.length == 2)
                        this.setName(tmp[1]);
                }
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
        });
    }
    setName(name) {
        this.name                                       = escapeHTML(name);
        this.tr.children[0].firstElementChild.innerHTML = this.name;
    }
    sortRed() {
        this.tr.children[this.currentId].className = 'red';
        this.tr.children[this.currentId].innerHTML = chromeI18n('error');
        let trs                                    = this.body.children;
        let i                                      = 0;
        let length                                 = trs.length;
        for ( ; i != length && trs[i].children[this.currentId].className == 'red' && trs[i].children[0].firstElementChild.innerHTML.localeCompare(this.name) < 0; i++) ;
        this.body.insertBefore(this.tr, i != length ? trs[i] : null);
    }
    sortOrange() {
        this.tr.children[this.currentId].className = 'orange';
        this.tr.children[this.currentId].innerHTML = chromeI18n('unreachable');
        let trs                                    = this.body.children;
        let i                                      = 0;
        let length                                 = trs.length;
        for ( ; i != length && trs[i].children[this.currentId].className == 'red'; i++) ;
        for ( ; i != length && trs[i].children[this.currentId].className == 'orange' && trs[i].children[0].firstElementChild.innerHTML.localeCompare(this.name) < 0; i++) ;
        this.body.insertBefore(this.tr, i != length ? trs[i] : null);
    }
    sortCurrent(result, current) {
        this.tr.children[this.currentId].innerHTML = result;
        this.tr.children[this.currentId].className = 'green';
        this.tr.children[0].firstElementChild.addEventListener('click', () => {
            let i = propertyInArray(this.link, 'link', arrays[this.type]);
            if (i != -1) {
                arrays[this.type][i]['current'] = current;
                writeArrays();
            }
        }, false);
        let trs    = this.body.children;
        let i      = 0;
        let length = trs.length;
        let value;
        for ( ; i != length && trs[i].children[this.currentId].className == 'red'; i++) ;
        for ( ; i != length && trs[i].children[this.currentId].className == 'orange'; i++) ;
        for ( ; i != length && trs[i].children[this.currentId].className == 'green' && trs[i].children[0].firstElementChild.innerHTML.localeCompare(this.name) < 0; i++) ;
        this.body.insertBefore(this.tr, i != length ? trs[i] : null);
    }
    sortNoCurrent(result) {
        this.tr.children[this.currentId].innerHTML = result;
        this.tr.children[this.currentId].className = '';
        let trs    = this.body.children;
        let i      = 0;
        let length = trs.length;
        for ( ; i != length && trs[i].children[this.currentId].className == 'red'; i++) ;
        for ( ; i != length && trs[i].children[this.currentId].className == 'orange'; i++) ;
        for ( ; i != length && trs[i].children[this.currentId].className == 'green'; i++) ;
        for ( ; i != length && trs[i].children[0].firstElementChild.innerHTML.localeCompare(this.name) < 0; i++) ;
        this.body.insertBefore(this.tr, i != length ? trs[i] : null);
    }
    delete() {
        this.body.removeChild(this.tr);
        let i = propertyInArray(this.link, 'link', arrays[this.type]);
        if (i != -1) {
            arrays[this.type].splice(i, 1);
            writeArrays();
        }
    }
}

New.regExpName = /<title>([^<]*)/;
