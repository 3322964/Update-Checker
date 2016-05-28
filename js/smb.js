class SMB {
    constructor(dateId, body, type, value, link, favicon) {
        this.body  = body;
        this.type  = type;
        this.value = value;
        this.link  = link;
        this.name  = this.link;
        this.tr    = document.createElement('tr');
        let string = '<td><img src="' + getFavicon(favicon) + '"></td><td><a href="' + escapeAttribute(this.link) + '" target="_blank">' + escapeHTML(this.name) + '</a></td>';
        for (let i = 1; i !== dateId; i++)
            string += '<td></td>';
        this.tr.innerHTML  = string + '<td><a>' + chromeI18n('recheck') + '</a> &middot; <a>' + chromeI18n('delete') + '</a></td>';
        this.tr.domName    = this.tr.children[1];
        this.tr.domResult  = this.tr.children[dateId];
        this.tr.domActions = this.tr.lastElementChild;
        this.tr.domActions.firstElementChild.addEventListener('click', () => this.reCheck(), false);
        this.tr.domActions.lastElementChild.addEventListener('click', () => {
            let td       = document.createElement('td');
            td.innerHTML = '<a>' + chromeI18n('confirm') + '</a> &middot; <a>' + chromeI18n('cancel') + '</a>';
            td.firstElementChild.addEventListener('click', () => this.delete(), false);
            td.lastElementChild.addEventListener('click', () => this.tr.replaceChild(this.tr.domActions, td), false);
            this.tr.replaceChild(td, this.tr.domActions);
        }, false);
        this.body.insertBefore(this.tr, this.body.firstElementChild);
    }
    sortRed() {
        this.tr.domResult.className = 'red';
        this.tr.domResult.innerHTML = chromeI18n('error', ['RegExp']);
        let trs                     = this.body.children;
        let i                       = trs.length - 2;
        for ( ; i !== -1 && trs[i].domResult.className === 'nodate'; i--) ;
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
        for ( ; i !== -1 && trs[i].domResult.className === 'nodate'; i--) ;
        for ( ; i !== -1 && trs[i].domResult.className === ''; i--) ;
        for ( ; i !== -1 && trs[i].domResult.className === 'green'; i--) ;
        for ( ; i !== -1 && trs[i].domResult.className === 'orange' && trs[i].domName.firstElementChild.innerHTML.localeCompare(this.name) > 0; i--) ;
        this.body.insertBefore(this.tr, trs[i + 1]);
    }
    setName(name) {
        this.name                                   = escapeHTML(name);
        this.tr.domName.firstElementChild.innerHTML = this.name;
    }
    sortDate(name, result) {
        this.setName(name);
        this.date = moment(new Date(result));
        if (!this.date.isAfter(moment().startOf('day')))
            this.tr.domResult.className = 'green';
        this.tr.domResult.innerHTML = this.date.format('LL');
        let trs                     = this.body.children;
        let i                       = trs.length - 2;
        for ( ; i !== -1 && trs[i].domResult.className === 'nodate'; i--) ;
        for ( ; i !== -1 && (trs[i].domResult.className === '' || trs[i].domResult.className === 'green') && this.date.isBefore(moment(trs[i].domResult.innerHTML, 'LL')); i--) ;
        for ( ; i !== -1 && (trs[i].domResult.className === '' || trs[i].domResult.className === 'green') && this.date.isSame(moment(trs[i].domResult.innerHTML, 'LL')) && trs[i].domName.firstElementChild.innerHTML.localeCompare(this.name) > 0; i--) ;
        this.body.insertBefore(this.tr, trs[i + 1]);
    }
    sortNoDate(name) {
        this.setName(name);
        this.tr.domResult.className = 'nodate';
        let trs                     = this.body.children;
        let i                       = trs.length - 2;
        for ( ; i !== -1 && trs[i].domResult.className === 'nodate' && trs[i].domName.firstElementChild.innerHTML.localeCompare(this.name) > 0; i--) ;
        this.body.insertBefore(this.tr, trs[i + 1]);
    }
    reCheck() {
        this.request.abort();
        this.body.removeChild(this.tr);
        (new this.constructor(this.value)).check();
    }
    delete() {
        this.request.abort();
        this.body.removeChild(this.tr);
        let i = objectInArray(this.value, arrays[this.type]);
        if (i !== -1) {
            arrays[this.type].splice(i, 1);
            writeArrays();
        }
    }
}
