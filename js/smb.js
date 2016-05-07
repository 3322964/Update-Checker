class SMB {
    constructor(dateId, body, type, value, link, favicon) {
        this.deleted   = false;
        this.body      = body;
        this.type      = type;
        this.value     = value;
        this.link      = link;
        this.name      = this.link;
        this.tr        = document.createElement('tr');
        let string     = '<td><img src="' + getFavicon + favicon + '"></td><td><a href="' + escapeAttribute(this.link) + '" target="_blank">' + escapeHTML(this.name) + '</a></td>';
        for (let i = 2; i != dateId; i++)
            string += '<td></td>';
        this.tr.innerHTML  = string + '<td class="loading"></td><td><a>' + chromeI18n('recheck') + '</a> &middot; <a>' + chromeI18n('delete') + '</a></td>';
        this.tr.domName    = this.tr.children[1];
        this.tr.domDate    = this.tr.children[dateId];
        this.tr.domActions = this.tr.lastElementChild;
        this.tr.domActions.firstElementChild.addEventListener('click', this.reCheck.bind(this), false);
        this.tr.domActions.lastElementChild.addEventListener('click', () => {
            this.tr.removeChild(this.tr.domActions);
            let td       = document.createElement('td');
            td.innerHTML = '<a>' + chromeI18n('confirm') + '</a> &middot; <a>' + chromeI18n('cancel') + '</a>';
            td.firstElementChild.addEventListener('click', this.delete.bind(this), false);
            td.lastElementChild.addEventListener('click', () => {
                this.tr.removeChild(td);
                this.tr.appendChild(this.tr.domActions);
            }, false);
            this.tr.appendChild(td);
        }, false);
        this.body.insertBefore(this.tr, this.body.lastElementChild);
    }
    sortRed() {
        this.tr.domDate.className = 'red';
        this.tr.domDate.innerHTML = chromeI18n('error');
        let trs                   = this.body.children;
        let i                     = 0;
        let length                = trs.length - 1;
        for ( ; i != length && trs[i].domDate.className == 'red' && trs[i].domName.firstElementChild.innerHTML.localeCompare(this.name) < 0; i++) ;
        this.body.insertBefore(this.tr, trs[i]);
    }
    sortOrange() {
        this.tr.domDate.className = 'orange';
        this.tr.domDate.innerHTML = chromeI18n('unreachable');
        let trs                   = this.body.children;
        let i                     = 0;
        let length                = trs.length - 1;
        for ( ; i != length && trs[i].domDate.className == 'red'; i++) ;
        for ( ; i != length && trs[i].domDate.className == 'orange' && trs[i].domName.firstElementChild.innerHTML.localeCompare(this.name) < 0; i++) ;
        this.body.insertBefore(this.tr, trs[i]);
    }
    setName(name) {
        this.name                                   = escapeHTML(name);
        this.tr.domName.firstElementChild.innerHTML = this.name;
        this.tr.domDate.className                   = '';
    }
    sortDate(name, result) {
        this.setName(name);
        this.date = moment(new Date(result));
        if (!this.date.isAfter(date))
            this.tr.domDate.className = 'green';
        this.tr.domDate.innerHTML = this.date.format('LL');
        let trs                   = this.body.children;
        let i                     = 0;
        let length                = trs.length - 1;
        let value;
        for ( ; i != length && trs[i].domDate.className == 'red'; i++) ;
        for ( ; i != length && trs[i].domDate.className == 'orange'; i++) ;
        for ( ; i != length; i++) {
            value = trs[i].domDate.innerHTML;
            if (value == '' || !this.date.isAfter(moment(value, 'LL')))
                break;
        }
        for ( ; i != length; i++) {
            value = trs[i].domDate.innerHTML;
            if (value == '' || !this.date.isSame(moment(value, 'LL')) || trs[i].domName.firstElementChild.innerHTML.localeCompare(this.name) > 0)
                break;
        }
        this.body.insertBefore(this.tr, trs[i]);
    }
    sortNoDate(name) {
        this.setName(name);
        let trs    = this.body.children;
        let i      = 0;
        let length = trs.length - 1;
        for ( ; i != length && trs[i].domDate.innerHTML != ''; i++) ;
        for ( ; i != length && trs[i].domName.firstElementChild.innerHTML.localeCompare(this.name) < 0; i++) ;
        this.body.insertBefore(this.tr, trs[i]);
    }
    reCheck() {
        this.body.removeChild(this.tr);
        createDateAndRegExpDate();
        let toCheck = new this.constructor(this.value);
        toCheck.check();
        this.deleted = true;
    }
    delete() {
        this.body.removeChild(this.tr);
        let i = objectInArray(this.value, arrays[this.type]);
        if (i != -1) {
            arrays[this.type].splice(i, 1);
            writeArrays();
        }
        this.deleted = true;
    }
}
