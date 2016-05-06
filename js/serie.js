class Serie extends SMB {
    constructor(value) {
        super(5, viewseriesbody, 'series', value, 'http://www.imdb.com/title/' + value + '/', 'http://www.imdb.com/');
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
                        this.tr.children[2].innerHTML = escapeHTML(result[1]);
                        this.tr.children[3].innerHTML = escapeHTML(result[2]);
                        this.tr.children[4].innerHTML = escapeHTML(result[3]);
                        this.sortDate(name[1], result[4]);
                    }
                }
            }
        });
    }
}

Serie.regExpName = /<title>&#x22;(.*)&#x22;/;
