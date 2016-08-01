class SMB extends Base {
    constructor(body, type, value, link, favicon, resultId) {
        super(body, type, value, link, favicon, resultId);
    }
    setDate(result) {
        this._date = moment(new Date(result));
    }
    sortRed() {
        this.setResult(chromeI18n('error', ['RegExp']));
        this.setColor('red');
        let trs = this.body.children;
        let i   = trs.length - 2;
        for ( ; i !== -1 && trs[i].obj.color === 'empty'; i--) ;
        for ( ; i !== -1 && trs[i].obj.color === 'black'; i--) ;
        for ( ; i !== -1 && trs[i].obj.color === 'green'; i--) ;
        for ( ; i !== -1 && trs[i].obj.color === 'orange'; i--) ;
        for ( ; i !== -1 && trs[i].obj.color === 'red' && trs[i].obj.name.localeCompare(this._name) > 0; i--) ;
        this.body.insertBefore(this.tr, trs[i + 1]);
    }
    sortOrange() {
        this.setResult(chromeI18n('error', [chromeI18n('link')]));
        this.setColor('orange');
        let trs = this.body.children;
        let i   = trs.length - 2;
        for ( ; i !== -1 && trs[i].obj.color === 'empty'; i--) ;
        for ( ; i !== -1 && trs[i].obj.color === 'black'; i--) ;
        for ( ; i !== -1 && trs[i].obj.color === 'green'; i--) ;
        for ( ; i !== -1 && trs[i].obj.color === 'orange' && trs[i].obj.name.localeCompare(this._name) > 0; i--) ;
        this.body.insertBefore(this.tr, trs[i + 1]);
    }
    sortDate(name, result) {
        this.setName(name);
        this.setDate(result);
        this.setResult(this._date.format('LL'));
        this.setColor(!this._date.isAfter(moment().startOf('day')) ? 'green' : 'black');
        let trs = this.body.children;
        let i   = trs.length - 2;
        for ( ; i !== -1 && trs[i].obj.color === 'empty'; i--) ;
        for ( ; i !== -1 && (trs[i].obj.color === 'black' || trs[i].obj.color === 'green') && this.date.isBefore(trs[i].obj.date); i--) ;
        for ( ; i !== -1 && (trs[i].obj.color === 'black' || trs[i].obj.color === 'green') && this.date.isSame(trs[i].obj.date) && trs[i].obj.name.localeCompare(this._name) > 0; i--) ;
        this.body.insertBefore(this.tr, trs[i + 1]);
    }
    sortNoDate(name) {
        this.setName(name);
        this.setColor('empty');
        let trs = this.body.children;
        let i   = trs.length - 2;
        for ( ; i !== -1 && trs[i].obj.color === 'empty' && trs[i].obj.name.localeCompare(this._name) > 0; i--) ;
        this.body.insertBefore(this.tr, trs[i + 1]);
    }
    delete() {
        super.delete(objectInArray(this.value, arrays[this.type]));
    }
    get date() { return this._date; }
}
