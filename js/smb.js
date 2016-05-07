class SMB {
    constructor(dateId, body, type, value, link, icon) {
        this.deleted = false;
        this.dateId  = dateId;
        this.body    = body;
        this.type    = type;
        this.value   = value;
        this.link    = link;
        this.name    = this.link;
        this.tr      = document.createElement('tr');
        let string   = '<td><img src="' + getFavicon + icon + '"></td><td><a href="' + escapeAttribute(this.link) + '" target="_blank">' + escapeHTML(this.name) + '</a></td>';
        for (let i = 2; i != dateId; i++)
            string += '<td></td>';
        this.tr.innerHTML = string + '<td class="loading"></td><td><a>' + chromeI18n('delete') + '</a></td>';
        this.tr.lastElementChild.lastElementChild.addEventListener('click', () => {
            let save = this.tr.lastElementChild;
            this.tr.removeChild(save);
            let td       = document.createElement('td');
            td.innerHTML = '<a>' + chromeI18n('confirm') + '</a> / <a>' + chromeI18n('cancel') + '</a>';
            td.firstElementChild.addEventListener('click', () => {
                this.body.removeChild(this.tr);
                let i = objectInArray(this.value, arrays[this.type]);
                if (i != -1) {
                    arrays[this.type].splice(i, 1);
                    writeArrays();
                }
                this.deleted = true;
            }, false);
            td.lastElementChild.addEventListener('click', () => {
                this.tr.removeChild(td);
                this.tr.appendChild(save);
            }, false);
            this.tr.appendChild(td);
        }, false);
        this.body.insertBefore(this.tr, this.body.lastElementChild);
    }
    sortRed() {
        this.tr.children[this.dateId].className = 'red';
        this.tr.children[this.dateId].innerHTML = chromeI18n('error');
        let trs                                 = this.body.children;
        let i                                   = 0;
        let length                              = trs.length - 1;
        for ( ; i != length && trs[i].children[this.dateId].className == 'red' && trs[i].children[1].firstElementChild.innerHTML.localeCompare(this.name) < 0; i++) ;
        this.body.insertBefore(this.tr, trs[i]);
    }
    sortOrange() {
        this.tr.children[this.dateId].className = 'orange';
        this.tr.children[this.dateId].innerHTML = chromeI18n('unreachable');
        let trs                                 = this.body.children;
        let i                                   = 0;
        let length                              = trs.length - 1;
        for ( ; i != length && trs[i].children[this.dateId].className == 'red'; i++) ;
        for ( ; i != length && trs[i].children[this.dateId].className == 'orange' && trs[i].children[1].firstElementChild.innerHTML.localeCompare(this.name) < 0; i++) ;
        this.body.insertBefore(this.tr, trs[i]);
    }
    setName(name) {
        this.name                                                 = escapeHTML(name);
        this.tr.children[1].firstElementChild.innerHTML           = this.name;
        this.tr.children[this.dateId].className                   = '';
    }
    sortDate(name, result) {
        this.setName(name);
        this.date = moment(new Date(result));
        if (!this.date.isAfter(date))
            this.tr.children[this.dateId].className = 'green';
        this.tr.children[this.dateId].innerHTML = this.date.format('LL');
        let trs                                 = this.body.children;
        let i                                   = 0;
        let length                              = trs.length - 1;
        let value;
        for ( ; i != length && trs[i].children[this.dateId].className == 'red'; i++) ;
        for ( ; i != length && trs[i].children[this.dateId].className == 'orange'; i++) ;
        for ( ; i != length; i++) {
            value = trs[i].children[this.dateId].innerHTML;
            if (value == '' || !this.date.isAfter(moment(value, 'LL')))
                break;
        }
        for ( ; i != length; i++) {
            value = trs[i].children[this.dateId].innerHTML;
            if (value == '' || !this.date.isSame(moment(value, 'LL')) || trs[i].children[1].firstElementChild.innerHTML.localeCompare(this.name) > 0)
                break;
        }
        this.body.insertBefore(this.tr, trs[i]);
    }
    sortNoDate(name) {
        this.setName(name);
        let trs    = this.body.children;
        let i      = 0;
        let length = trs.length - 1;
        for ( ; i != length && trs[i].children[this.dateId].innerHTML != ''; i++) ;
        for ( ; i != length && trs[i].children[1].firstElementChild.innerHTML.localeCompare(this.name) < 0; i++) ;
        this.body.insertBefore(this.tr, trs[i]);
    }
}
