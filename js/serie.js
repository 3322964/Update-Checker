class Serie extends SMB {
    constructor(value) {
        super(5, viewseriesbody, 'series', value, 'http://www.imdb.com/title/' + value + '/', 'http://www.imdb.com/');
    }
    check() {
        getLink(this.link + 'epcast', (ok, response) => {
            if (!this.deleted) {
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
            }
        });
    }
    static parse() {
        getSearch('series', seriesname, seriesselect, 'http://www.imdb.com/find?s=tt&q=', (response) => {
            let regExp    = /class="result_text"> <a href="\/title\/(tt[^\/]*)\/[^>]*>([^<]*)<\/a>([^<]*) /g;
            let output    = '';
            let arrayType = arrays.series;
            let tmp;
            while ((tmp = regExp.exec(response)) != null) {
                if (tmp[3].match(/Series\)/) && objectInArray(tmp[1], arrays['series']) == -1)
                    output += '<option value="' + tmp[1] + '">' + tmp[2] + tmp[3] + '</option>';
            }
            return output;
        });
    }
}

Serie.regExpName = /<title>&#x22;(.*)&#x22;/;
