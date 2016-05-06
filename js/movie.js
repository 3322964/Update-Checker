class Movie extends SMB {
    constructor(value) {
        super(2, viewmoviesbody, 'movies', value, 'http://www.imdb.com/title/' + value + '/', 'http://www.imdb.com/');
    }
    check() {
        getLink(this.link, (ok, response) => {
            if (!ok)
                this.sortOrange();
            else {
                let name = response.match(Movie.regExpName);
                if (name == null)
                    this.sortRed();
                else {
                    let result = response.match(Movie.regExpDate);
                    if (result == null || iso.findCountryByName(result[3])['value'] != result[1])
                        this.sortNoDate(name[1]);
                    else this.sortDate(name[1], result[2]);
                }
            }
        });
    }
}

Movie.regExpName = /<title>(.*) \(/;
Movie.regExpDate = /set_twilight_info\(\n"title",\n"([A-Z][A-Z])"[\s\S]*title="See more release dates" >(.*) \(([^\)]*)/;
// Movie.regExpDate = /set_twilight_info\(\n"title",\n"([A-Z][A-Z])"[\s\S]*title="See all release dates" > ([^<]*).*\n\(([^\)]*)/;
