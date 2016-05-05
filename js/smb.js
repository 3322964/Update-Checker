class SMB {
    constructor(dateId, body, type, value, link) {
        this.dateId = dateId;
        this.body   = body;
        this.type   = type;
        this.value  = value;
        this.link   = link;
        this.name   = this.link;
        this.tr     = document.createElement('tr');
        let string  = '<td><a href="' + escapeAttribute(this.link) + '" target="_blank">' + escapeHTML(this.name) + '</a></td>';
        for (let i = 1; i != dateId; i++)
            string += '<td></td>';
        this.tr.innerHTML = string + '<td class="checking"></td><td><a>' + chromeI18n('delete') + '</a></td>';
        this.tr.lastElementChild.lastElementChild.addEventListener('click', () => {
            confirmyes.onclick = () => {
                this.body.removeChild(this.tr);
                let i = objectInArray(this.value, arrays[this.type]);
                if (i != -1) {
                    arrays[this.type].splice(i, 1);
                    writeArrays();
                }
                confirmfade.click();
            };
            confirmlight.classList.add('visible');
            confirmfade.classList.add('visible');
        }, false);
        this.body.appendChild(this.tr);
    }
    sortRed() {
        this.tr.children[this.dateId].className = 'red';
        this.tr.children[this.dateId].innerHTML = chromeI18n('error');
        let trs                                 = this.body.children;
        let i                                   = 0;
        let length                              = trs.length;
        for ( ; i != length && trs[i].children[this.dateId].className == 'red' && trs[i].children[0].firstElementChild.innerHTML.localeCompare(this.name) < 0; i++) ;
        this.body.insertBefore(this.tr, i != length ? trs[i] : null);
    }
    sortOrange() {
        this.tr.children[this.dateId].className = 'orange';
        this.tr.children[this.dateId].innerHTML = chromeI18n('unreachable');
        let trs                                 = this.body.children;
        let i                                   = 0;
        let length                              = trs.length;
        for ( ; i != length && trs[i].children[this.dateId].className == 'red'; i++) ;
        for ( ; i != length && trs[i].children[this.dateId].className == 'orange' && trs[i].children[0].firstElementChild.innerHTML.localeCompare(this.name) < 0; i++) ;
        this.body.insertBefore(this.tr, i != length ? trs[i] : null);
    }
    setName(name) {
        this.name                                                 = escapeHTML(name);
        this.tr.children[0].firstElementChild.innerHTML           = this.name;
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
        let length                              = trs.length;
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
            if (value == '' || !this.date.isSame(moment(value, 'LL')) || trs[i].children[0].firstElementChild.innerHTML.localeCompare(this.name) > 0)
                break;
        }
        this.body.insertBefore(this.tr, i != length ? trs[i] : null);
    }
    sortNoDate(name) {
        this.setName(name);
        let trs    = this.body.children;
        let i      = 0;
        let length = trs.length;
        for ( ; i != length && trs[i].children[this.dateId].innerHTML != ''; i++) ;
        for ( ; i != length && trs[i].children[0].firstElementChild.innerHTML.localeCompare(this.name) < 0; i++) ;
        this.body.insertBefore(this.tr, i != length ? trs[i] : null);
    }
}
