class Serie extends SMB {
    constructor(imdbId) {
        super(4, viewseriesbody, 'series', imdbId, 'http://www.imdb.com/title/' + imdbId + '/');
    }
    check() {
        getLink(this.link + 'epcast', (ok, response) => {
            if (!ok)
                this.sortOrange();
            else {
                let name = response.match(Serie.regExpName);
                if (name == null)
                    this.sortRed();
                else {
                    let result = response.match(Serie.regExpDate);
                    if (result == null)
                        this.sortNoDate(name[1]);
                    else {
                        this.tr.children[1].innerHTML = result[1];
                        this.tr.children[2].innerHTML = result[2];
                        this.tr.children[3].innerHTML = result[3];
                        this.sortDate(name[1], result[4]);
                    }
                }
            }
        });
    }
}

Serie.regExpName = /<title>&#x22;(.*)&#x22;/;
