class Base {
    constructor(body, type, value, link, favicon, resultId, editString = '') {
        this.body  = body;
        this.type  = type;
        this.value = value;
        this.link  = link;
        this.name  = link;
        this.tr    = document.createElement('tr');
        let string = '<td><img src="' + getFavicon(favicon) + '"></td><td><a href="' + escapeAttribute(this.link) + '" target="_blank">' + escapeHTML(this.name) + '</a></td>';
        for (let i = 1; i !== resultId; i++)
            string += '<td></td>';
        this.tr.innerHTML  = string + '<td><a>' + chromeI18n('recheck') + '</a> &middot; ' + editString + '<a>' + chromeI18n('delete') + '</a></td>';
        this.tr.domName    = this.tr.children[1];
        this.tr.domResult  = this.tr.children[resultId];
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
    setName(name) {
        this.name                                   = escapeHTML(name);
        this.tr.domName.firstElementChild.innerHTML = this.name;
    }
    reCheck() {
        this.request.abort();
        this.body.removeChild(this.tr);
        (new this.constructor(this.value)).check();
    }
    delete(i) {
        this.request.abort();
        this.body.removeChild(this.tr);
        if (i !== -1) {
            arrays[this.type].splice(i, 1);
            writeArrays();
        }
    }
}
