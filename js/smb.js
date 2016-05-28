class SMB extends Base {
    constructor(body, type, value, link, favicon, resultId) {
        super(body, type, value, link, favicon, resultId);
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
    delete() {
        super.delete(objectInArray(this.value, arrays[this.type]));
    }
}
