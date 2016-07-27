class Movie extends SMB {
    constructor(value) {
        super(moviesbody, 'movies', value, 'http://www.imdb.com/title/' + value + '/', 'http://www.imdb.com/', 3);
    }
    check() {
        this.request = new GetRequest(this.tr.domResult, this.link);
        this.request.send((ok, response) => {
            if (!ok)
                this.sortOrange();
            else {
                let name = response.match(Movie.regExpName);
                if (name === null)
                    this.sortRed();
                else {
                    let result = response.match(Movie.regExpDate);
                    if (result === null)
                        this.sortNoDate(name[1]);
                    else {
                        this.tr.children[2].innerHTML = escapeHTML(result[2]);
                        this.sortDate(name[1], result[1]);
                    }
                }
            }
        });
    }
    static parse() {
        moviesname.click();
        moviesresults.hidden = true;

        if ('request' in Movie)
            Movie.request.abort();

        let value = moviesname.value.trim();
        if (value !== '') {
            Movie.request = new GetRequest(moviesname, 'http://www.imdb.com/find?s=tt&q=' + encodeURIComponent(value));
            Movie.request.send(function (ok, response) {
                if (!ok)
                    moviesname.classList.add('invalid');
                else {
                    let regExp    = /class="result_text"> <a href="\/title\/(tt[^\/]*)\/[^>]*>([^<]*)<\/a>(?![^<]*(?:Series|\(Video Game|\(Video|\(TV Episode)\) <)([^<]*) </g;
                    let output    = '';
                    let arrayType = arrays.movies;
                    let tmp;
                    while ((tmp = regExp.exec(response)) !== null) {
                        if (objectInArray(tmp[1], arrayType) === -1)
                            output += '<option value="' + tmp[1] + '">' + tmp[2] + tmp[3] + '</option>';
                    }
                    if (output === '')
                        moviesname.classList.add('invalid');
                    else {
                        moviesresults.innerHTML = output;
                        moviesresults.hidden    = false;
                    }
                }
            });
        }
    }
}

Movie.regExpName = /<h1 itemprop="name"[^>]*>([^<]*)&nbsp;/;
Movie.regExpDate = /title="See more release dates" >(.*) \(([^\)]*)/;
