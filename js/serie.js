class Serie extends SMB {
    constructor(value) {
        super(5, seriesbody, 'series', value, 'http://www.imdb.com/title/' + value + '/', 'http://www.imdb.com/');
    }
    check() {
        this.request = new GetRequest(this.tr.domResult, this.link + 'epcast');
        this.request.send((ok, response) => {
            if (!ok)
                this.sortOrange();
            else {
                let name = response.match(Serie.regExpName);
                if (name === null)
                    this.sortRed();
                else {
                    let result = response.match(Serie.regExpDate);
                    if (result === null)
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
    reCheck() {
        Serie.createRegExpDate();
        super.reCheck();
    }
    static parse() {
        seriesname.click();
        seriesresults.hidden = true;

        if ('request' in Serie)
            Serie.request.abort();

        let value = seriesname.value.trim();
        if (value !== '') {
            Serie.request = new GetRequest(seriesname, 'http://www.imdb.com/find?s=tt&q=' + encodeURIComponent(value));
            Serie.request.send(function (ok, response) {
                if (!ok)
                    seriesname.classList.add('invalid');
                else {
                    let regExp    = /class="result_text"> <a href="\/title\/(tt[^\/]*)\/[^>]*>([^<]*)<\/a>([^<]*Series\)) </g;
                    let output    = '';
                    let arrayType = arrays.series;
                    let tmp;
                    while ((tmp = regExp.exec(response)) !== null) {
                        if (objectInArray(tmp[1], arrayType) === -1)
                            output += '<option value="' + tmp[1] + '">' + tmp[2] + tmp[3] + '</option>';
                    }
                    if (output === '')
                        seriesname.classList.add('invalid');
                    else {
                        seriesresults.innerHTML = output;
                        seriesresults.hidden    = false;
                    }
                }
            });
        }
    }
    static createRegExpDate() {
        let date         = moment();
        let year         = date.year();
        let months       = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        let month        = date.month();
        Serie.regExpDate = new RegExp('<h4>Season (\\d{1,}), Episode (\\d{1,}): <a [^>]*>([^<]*)</a></h4><b>(\\d{1,2} [A-S][a-z]+ ' + (year + 1) + '|\\d{1,2} (' + months.splice(month + 1, 12).join('|') + ') ' + year + '|(' + [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31].splice(date.date() - 1, 31).join('|') + ') ' + months[month] + ' ' + year + ')</b>');
    }
}

Serie.regExpName = /<title>&#x22;([^<]*)&#x22;/;
