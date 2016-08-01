class Base {
    constructor(body, type, value, link, favicon, resultId, editString = '') {
        this.body  = body;
        this.type  = type;
        this.value = value;
        this.link  = link;
        this.tr    = document.createElement('tr');
        let string = '<td><img></td><td><a target="_blank"></a></td>';
        for (let i = 1; i !== resultId; i++)
            string += '<td></td>';
        this.tr.innerHTML = string + '<td><a>' + chromeI18n('recheck') + '</a> &middot; ' + editString + '<a>' + chromeI18n('delete') + '</a></td>';
        this.tr.obj       = this;
        this.domFavicon   = this.tr.firstElementChild;
        this.domName      = this.tr.children[1];
        this.domResult    = this.tr.children[resultId];
        this.domActions   = this.tr.lastElementChild;
        this.domActions.firstElementChild.addEventListener('click', () => this.reCheck(), false);
        this.domActions.lastElementChild.addEventListener('click', () => {
            let td       = document.createElement('td');
            td.innerHTML = '<a>' + chromeI18n('confirm') + '</a> &middot; <a>' + chromeI18n('cancel') + '</a>';
            td.firstElementChild.addEventListener('click', () => this.delete(), false);
            td.lastElementChild.addEventListener('click', () => this.tr.replaceChild(this.domActions, td), false);
            this.tr.replaceChild(td, this.domActions);
        }, false);
        this.setFavicon(favicon);
        this.setLink(this.link);
        this.setName(link);
        this.body.insertBefore(this.tr, this.body.firstElementChild);
    }
    setFavicon(favicon) {
        this.domFavicon.firstElementChild.src = 'http://www.google.com/s2/favicons?domain_url=' + encodeURIComponent(favicon);
    }
    setLink(link) {
        this.domName.firstElementChild.href = link;
    }
    setName(name) {
        this._name                               = escapeHTML(name);
        this.domName.firstElementChild.innerHTML = this._name;
    }
    setResult(result) {
        this.domResult.innerHTML = escapeHTML(result);
    }
    setColor(color) {
        this._color              = color;
        this.domResult.className = color;
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
    get name()  { return this._name;  }
    get color() { return this._color; }
}
