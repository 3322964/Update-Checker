class New {
    constructor(value) {
        this.body          = newsbody;
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
            td2.innerHTML = '<input type="text" placeholder="' + chromeI18n('regexp') + '" list="newsregexpdropdown" value="' + escapeAttribute(this.regexp) + '">';
            td.innerHTML  = '<a>' + chromeI18n('confirm') + '</a> &middot; <a>' + chromeI18n('cancel') + '</a>';
            addEventsToInput(td1.firstElementChild);
            td.firstElementChild.addEventListener('click', () => New.parse(td1.firstElementChild, td2.firstElementChild, this.link, this.current, () => this.delete()), false);
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
                if (rssParser.errorOccurred)
                    this.sortRed('RSS');
                else {
                    this.setName(rssParser.title);
                    let link                                        = rssParser.link;
                    this.tr.domName.firstElementChild.href          = escapeAttribute(link);
                    this.tr.firstElementChild.firstElementChild.src = getFavicon(link);
                    let newItemCount                                = rssParser.newItemCount;
                    let result                                      = chromeI18n('newitems', [newItemCount]);
                    if (newItemCount === 0)
                        this.sortNoCurrent(result);
                    else this.sortCurrent(result, rssParser.newCurrent);
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
    sortCurrent(result, newCurrent) {
        this.tr.domResult.innerHTML = escapeHTML(result);
        this.tr.domResult.className = 'green';
        this.tr.domName.firstElementChild.addEventListener('click', () => this.save(newCurrent), false);
        let a       = document.createElement('a');
        a.innerHTML = chromeI18n('save');
        a.addEventListener('click', () => this.save(newCurrent), false);
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
    save(newCurrent) {
        this.value.current = newCurrent;
        let i = propertyInArray(this.link, 'link', arrays.news);
        if (i !== -1) {
            arrays.news[i].current = newCurrent;
            writeArrays();
        }
        this.reCheck();
    }
    reCheck() {
        this.request.abort();
        this.body.removeChild(this.tr);
        (new New(this.value)).check();
    }
    delete() {
        this.request.abort();
        this.body.removeChild(this.tr);
        let i = propertyInArray(this.link, 'link', arrays.news);
        if (i !== -1) {
            arrays.news.splice(i, 1);
            writeArrays();
        }
    }
    static parse(domLink = newslink, domRegExp = newsregexp, previousLink = '', current = '', remove = () => {}) {
        domLink.click();
        let link   = domLink.value.trim();
        let regexp = domRegExp.value;
        if (!domLink.validity.valid || (previousLink !== link && propertyInArray(link, 'link', arrays.news) !== -1))
            domLink.className = 'invalid';
        else {
            domLink.value   = '';
            domRegExp.value = '';
            remove();
            let object = { link: link, regexp: regexp, current: current };
            arrays.news.push(object);
            writeArrays();
            (new New(object)).check();
        }
    }
}

New.regExpName = /<title(?: [^>]*)?>([^<]*)/;
