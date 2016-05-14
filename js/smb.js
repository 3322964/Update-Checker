class SMB {
    constructor(dateId, body, type, value, link, favicon) {
        this.body      = body;
        this.type      = type;
        this.value     = value;
        this.link      = link;
        this.name      = this.link;
        this.tr        = document.createElement('tr');
        let string     = '<td><img src="' + getFavicon(favicon) + '"></td><td><a href="' + escapeAttribute(this.link) + '" target="_blank">' + escapeHTML(this.name) + '</a></td>';
        for (let i = 1; i != dateId; i++)
            string += '<td></td>';
        this.tr.innerHTML  = string + '<td><a>' + chromeI18n('recheck') + '</a> &middot; <a>' + chromeI18n('delete') + '</a></td>';
        this.tr.domName    = this.tr.children[1];
        this.tr.domDate    = this.tr.children[dateId];
        this.tr.domActions = this.tr.lastElementChild;
        this.tr.domActions.firstElementChild.addEventListener('click', () => this.reCheck(), false);
        this.tr.domActions.lastElementChild.addEventListener('click', () => {
            this.tr.removeChild(this.tr.domActions);
            let td       = document.createElement('td');
            td.innerHTML = '<a>' + chromeI18n('confirm') + '</a> &middot; <a>' + chromeI18n('cancel') + '</a>';
            td.firstElementChild.addEventListener('click', () => this.delete(), false);
            td.lastElementChild.addEventListener('click', () => {
                this.tr.removeChild(td);
                this.tr.appendChild(this.tr.domActions);
            }, false);
            this.tr.appendChild(td);
        }, false);
        this.body.insertBefore(this.tr, this.body.firstElementChild);
    }
    sortRed() {
        this.tr.domDate.className = 'red';
        this.tr.domDate.innerHTML = chromeI18n('error');
        let trs                   = this.body.children;
        let i                     = trs.length - 2;
        for ( ; i != -1 && trs[i].domDate.className == 'nodate'; i--) ;
        for ( ; i != -1 && trs[i].domDate.className == ''; i--) ;
        for ( ; i != -1 && trs[i].domDate.className == 'green'; i--) ;
        for ( ; i != -1 && trs[i].domDate.className == 'orange'; i--) ;
        for ( ; i != -1 && trs[i].domDate.className == 'red' && trs[i].domName.firstElementChild.innerHTML.localeCompare(this.name) > 0; i--) ;
        this.body.insertBefore(this.tr, trs[i + 1]);
    }
    sortOrange() {
        this.tr.domDate.className = 'orange';
        this.tr.domDate.innerHTML = chromeI18n('unreachable');
        let trs                   = this.body.children;
        let i                     = trs.length - 2;
        for ( ; i != -1 && trs[i].domDate.className == 'nodate'; i--) ;
        for ( ; i != -1 && trs[i].domDate.className == ''; i--) ;
        for ( ; i != -1 && trs[i].domDate.className == 'green'; i--) ;
        for ( ; i != -1 && trs[i].domDate.className == 'orange' && trs[i].domName.firstElementChild.innerHTML.localeCompare(this.name) > 0; i--) ;
        this.body.insertBefore(this.tr, trs[i + 1]);
    }
    setName(name) {
        this.name                                   = escapeHTML(name);
        this.tr.domName.firstElementChild.innerHTML = this.name;
    }
    sortDate(name, result) {
        this.setName(name);
        this.date = moment(new Date(result));
        if (!this.date.isAfter(date))
            this.tr.domDate.className = 'green';
        this.tr.domDate.innerHTML = this.date.format('LL');
        let trs                   = this.body.children;
        let i                     = trs.length - 2;
        for ( ; i != -1 && trs[i].domDate.className == 'nodate'; i--) ;
        for ( ; i != -1 && (trs[i].domDate.className == '' || trs[i].domDate.className == 'green') && this.date.isBefore(moment(trs[i].domDate.innerHTML, 'LL')); i--) ;
        for ( ; i != -1 && (trs[i].domDate.className == '' || trs[i].domDate.className == 'green') && this.date.isSame(moment(trs[i].domDate.innerHTML, 'LL')) && trs[i].domName.firstElementChild.innerHTML.localeCompare(this.name) > 0; i--) ;
        this.body.insertBefore(this.tr, trs[i + 1]);
    }
    sortNoDate(name) {
        this.setName(name);
        this.tr.domDate.className = 'nodate';
        let trs                   = this.body.children;
        let i                     = trs.length - 2;
        for ( ; i != -1 && trs[i].domDate.className == 'nodate' && trs[i].domName.firstElementChild.innerHTML.localeCompare(this.name) > 0; i--) ;
        this.body.insertBefore(this.tr, trs[i + 1]);
    }
    reCheck() {
        this.request.abort();
        this.body.removeChild(this.tr);
        createDateAndRegExpDate();
        let toCheck = new this.constructor(this.value);
        toCheck.check();
    }
    delete() {
        this.request.abort();
        this.body.removeChild(this.tr);
        let i = objectInArray(this.value, arrays[this.type]);
        if (i != -1) {
            arrays[this.type].splice(i, 1);
            writeArrays();
        }
    }
}
