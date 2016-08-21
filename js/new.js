class New extends Base {
    constructor(value) {
        super(newsbody, newsexpand, 'news', value, value.link, value.link, 2, '<a>' + chrome.i18n.getMessage('edit') + '</a> &middot; ');
        this.regexp  = value.regexp;
        this.current = value.current;
        this.domActions.children[1].addEventListener('click', () => {
            let td1                     = document.createElement('td');
            let td2                     = document.createElement('td');
            let td                      = document.createElement('td');
            td1.innerHTML               = '<input type="url" placeholder="' + chrome.i18n.getMessage('link') + '" required>';
            td1.firstElementChild.value = this.link;
            td2.innerHTML               = '<input type="text" placeholder="' + chrome.i18n.getMessage('regexp') + '" list="newsregexpdropdown">';
            td2.firstElementChild.value = this.regexp;
            td.innerHTML                = '<a>' + chrome.i18n.getMessage('confirm') + '</a> &middot; <a>' + chrome.i18n.getMessage('cancel') + '</a>';
            addEventsToInput(td1.firstElementChild);
            td.firstElementChild.addEventListener('click', () => New.parse(td1.firstElementChild, td2.firstElementChild, this.link, this.current, () => this.delete()), false);
            td.lastElementChild.addEventListener('click', () => {
                this.tr.replaceChild(this.domName, td1);
                this.tr.replaceChild(this.domResult, td2);
                this.tr.replaceChild(this.domActions, td);
            }, false);
            this.tr.replaceChild(td1, this.domName);
            this.tr.replaceChild(td2, this.domResult);
            this.tr.replaceChild(td, this.domActions);
        }, false);
    }
    check() {
        this.request = new GetRequest(this.domResult, this.link);
        this.request.send((ok, response) => {
            if (!ok)
                this.sortOrange();
            else if (this.regexp === '') {
                let rssParser = new RSSParser(response, this.current);
                if (rssParser.errorOccurred)
                    this.sortRed('RSS');
                else {
                    if (rssParser.title.trim() !== '')
                        this.setName(rssParser.title);
                    if (rssParser.link.trim() !== '') {
                        this.setLink(rssParser.link);
                        this.setFavicon(rssParser.link);
                    }
                    let newItemCount = rssParser.newItemCount;
                    let result       = chrome.i18n.getMessage('newitems', [newItemCount]);
                    if (newItemCount === 0)
                        this.sortNoCurrent(result);
                    else this.sortCurrent(result, rssParser.newCurrent);
                }
            }
            else {
                let tmp = response.match(New.regExpName);
                if (tmp !== null && tmp[1].trim() !== '')
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
    sortRed(string) {
        this.setResult(chrome.i18n.getMessage('error', [string]));
        this.setColor('red');
        let trs = this.body.children;
        let i   = trs.length - 2;
        for ( ; i !== -1 && trs[i].obj.color === 'black'; i--) ;
        for ( ; i !== -1 && trs[i].obj.color === 'green'; i--) ;
        for ( ; i !== -1 && trs[i].obj.color === 'orange'; i--) ;
        for ( ; i !== -1 && trs[i].obj.color === 'red' && trs[i].obj.name.localeCompare(this._name) > 0; i--) ;
        this.body.insertBefore(this.tr, trs[i + 1]);
    }
    sortOrange() {
        this.setResult(chrome.i18n.getMessage('error', [chrome.i18n.getMessage('link')]));
        this.setColor('orange');
        let trs = this.body.children;
        let i   = trs.length - 2;
        for ( ; i !== -1 && trs[i].obj.color === 'black'; i--) ;
        for ( ; i !== -1 && trs[i].obj.color === 'green'; i--) ;
        for ( ; i !== -1 && trs[i].obj.color === 'orange' && trs[i].obj.name.localeCompare(this._name) > 0; i--) ;
        this.body.insertBefore(this.tr, trs[i + 1]);
    }
    sortCurrent(result, newCurrent) {
        this.newCurrent = newCurrent;
        this.setResult(result);
        this.setColor('green');
        this.domName.firstElementChild.addEventListener('click', () => this.save(), false);
        let a       = document.createElement('a');
        a.innerHTML = chrome.i18n.getMessage('save');
        a.addEventListener('click', () => this.save(), false);
        this.domActions.insertBefore(document.createTextNode(' · '), this.domActions.firstElementChild);
        this.domActions.insertBefore(a, this.domActions.firstChild);
        let trs = this.body.children;
        let i   = trs.length - 2;
        for ( ; i !== -1 && trs[i].obj.color === 'black'; i--) ;
        for ( ; i !== -1 && trs[i].obj.color === 'green' && trs[i].obj.name.localeCompare(this._name) > 0; i--) ;
        this.body.insertBefore(this.tr, trs[i + 1]);
        this.setHideProperty(i);
    }
    sortNoCurrent(result) {
        this.setResult(result);
        this.setColor('black');
        let trs = this.body.children;
        let i   = trs.length - 2;
        for ( ; i !== -1 && trs[i].obj.color === 'black' && trs[i].obj.name.localeCompare(this._name) > 0; i--) ;
        this.body.insertBefore(this.tr, trs[i + 1]);
        this.setHideProperty(i);
    }
    save() {
        this.value.current = this.newCurrent;
        let i              = propertyInArray(this.link, 'link', arrays.news);
        if (i !== -1) {
            arrays.news[i].current = this.newCurrent;
            writeArrays();
        }
        this.reCheck();
    }
    openSave() {
        this.domName.firstElementChild.click();
    }
    delete() {
        super.delete(propertyInArray(this.link, 'link', arrays.news));
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

New.regExpName = /<title(?: [^>]*)?>([^<]+)/;
