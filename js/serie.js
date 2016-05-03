class Serie {
    constructor(imdbId) {
        this.link         = imdb + imdbId + '/';
        this.tr           = document.createElement('tr');
        this.tr.innerHTML = '<td>' + this.link + '</td><td></td><td></td><td></td><td></td><td><a>' + chromeI18n('delete') + '</a></td>';
        viewseriesbody.appendChild(this.tr);
    }
    check() {
        new GetRequest(this.link, (ok, response) =>
            if (!ok)
                this.tr.children[4].innerHTML = chromeI18n('error');
        );
    }
}
