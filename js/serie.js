class Serie extends SMB {
    constructor(value) {
        super(5, seriesbody, 'series', value, 'http://www.imdb.com/title/' + value + '/', 'http://www.imdb.com/');
    }
    check() {
        this.request = new GetRequest(this.link + 'epcast');
        this.request.send((ok, response) => {
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
    static parse() {
        seriesname.click();
        seriesresults.hidden = true;

        try {
            Serie.request.abort();
        }
        catch (err) {}

        let value = seriesname.value.trim();
        if (value == '')
            seriesname.classList.remove('loading');
        else {
            seriesname.classList.add('loading');
            Serie.request = new GetRequest('http://www.imdb.com/find?s=tt&q=' + encodeURIComponent(value));
            Serie.request.send(function (ok, response) {
                seriesname.classList.remove('loading');
                if (!ok)
                    seriesname.classList.add('invalid');
                else {
                    let regExp    = /class="result_text"> <a href="\/title\/(tt[^\/]*)\/[^>]*>([^<]*)<\/a>([^<]*) /g;
                    let output    = '';
                    let arrayType = arrays.series;
                    let tmp;
                    while ((tmp = regExp.exec(response)) != null) {
                        if (tmp[3].match(/Series\)/) && objectInArray(tmp[1], arrayType) == -1)
                            output += '<option value="' + tmp[1] + '">' + tmp[2] + tmp[3] + '</option>';
                    }
                    if (output == '')
                        seriesname.classList.add('invalid');
                    else {
                        seriesresults.innerHTML = output;
                        seriesresults.hidden    = false;
                    }
                }
            });
        }
    }
}

Serie.regExpName = /<title>&#x22;(.*)&#x22;/;
