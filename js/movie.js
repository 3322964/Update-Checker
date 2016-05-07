class Movie extends SMB {
    constructor(value) {
        super(2, moviesbody, 'movies', value, 'http://www.imdb.com/title/' + value + '/', 'http://www.imdb.com/');
    }
    check() {
        getLink(this.link, (ok, response) => {
            if (!this.deleted) {
                if (!ok)
                    this.sortOrange();
                else {
                    let name = response.match(Movie.regExpName);
                    if (name == null)
                        this.sortRed();
                    else {
                        let result = response.match(Movie.regExpDate);
                        if (result == null || iso.findCountryByName(result[3]).value != result[1])
                            this.sortNoDate(name[1]);
                        else this.sortDate(name[1], result[2]);
                    }
                }
            }
        });
    }
    static parse() {
        moviesname.click();
        moviesresults.hidden = true;

        try {
            Movie.file.onreadystatechange = null;
            Movie.file.abort();
        }
        catch (err) {}

        let value = moviesname.value.trim();
        if (value == '')
            moviesname.classList.remove('loading');
        else {
            moviesname.classList.add('loading');
            Movie.file = new XMLHttpRequest();
            Movie.file.open('GET', 'http://www.imdb.com/find?s=tt&q=' + encodeURIComponent(value), true);
            Movie.file.setRequestHeader('Pragma', 'no-cache');
            Movie.file.setRequestHeader('Cache-Control', 'no-cache, must-revalidate');
            Movie.file.onreadystatechange = function () {
                if (Movie.file.readyState == XMLHttpRequest.DONE) {
                    moviesname.classList.remove('loading');
                    if (Movie.file.status != 200)
                        moviesname.classList.add('invalid');
                    else {
                        let response  = Movie.file.responseText;
                        let regExp    = /class="result_text"> <a href="\/title\/(tt[^\/]*)\/[^>]*>([^<]*)<\/a>([^<]*) /g;
                        let output    = '';
                        let arrayType = arrays.movies;
                        let tmp;
                        while ((tmp = regExp.exec(response)) != null) {
                            if (!tmp[3].match(/Series\)/) && !tmp[3].match(/\(Video Game\)/) && !tmp[3].match(/\(Video\)/) && !tmp[3].match(/\(TV Episode\)/) && objectInArray(tmp[1], arrayType) == -1)
                                output += '<option value="' + tmp[1] + '">' + tmp[2] + tmp[3] + '</option>';
                        }
                        if (output == '')
                            moviesname.classList.add('invalid');
                        else {
                            moviesresults.innerHTML = output;
                            moviesresults.hidden    = false;
                        }
                    }
                }
            };
            Movie.file.send();
        }
    }
}

Movie.regExpName = /<title>(.*) \(/;
Movie.regExpDate = /set_twilight_info\(\n"title",\n"([A-Z][A-Z])"[\s\S]*title="See more release dates" >(.*) \(([^\)]*)/;
// Movie.regExpDate = /set_twilight_info\(\n"title",\n"([A-Z][A-Z])"[\s\S]*title="See all release dates" > ([^<]*).*\n\(([^\)]*)/;
