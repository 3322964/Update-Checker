class Bluray extends SMB {
    constructor(value) {
        super(3, viewbluraysbody, 'blurays', value, 'http://www.blu-ray.com/movies/' + value, 'http://www.blu-ray.com/');
    }
    check() {
        getLink(this.link, (ok, response) => {
            if (!this.deleted) {
                if (!ok)
                    this.sortOrange();
                else {
                    let name = response.match(Bluray.regExpName);
                    if (name == null)
                        this.sortRed();
                    else {
                        if (name.length == 3)
                            this.tr.children[2].innerHTML = '<img src="' + escapeAttribute(name[2]) + '">';
                        let result = response.match(Bluray.regExpDate);
                        if (result == null)
                            this.sortNoDate(name[1]);
                        else this.sortDate(name[1], result[1]);
                    }
                }
            }
        });
    }
    static parse() {
        getSearch('blurays', bluraysname, bluraysselect, 'http://www.blu-ray.com/search/quicksearch.php', (response) => {
            let tmp    = response.match(/var urls = new Array\(([^\)]*)/);
            let output = '';
            if (tmp == null)
                return output;
            let URLs      = tmp[1].replace(/'|http:\/\/www\.blu-ray\.com\/movies\//g, '').split(', ');
            let regExp    = /<img src="([^"]*)" [^>]*>&nbsp;([^\n<]*)/g;
            let arrayType = arrays.blurays;
            for (let i = 0; (tmp = regExp.exec(response)) != null; i++) {
                if (objectInArray(URLs[i], arrayType) == -1)
                    output += '<option value="' + URLs[i] + '">' + tmp[2] + '</a> <img src="' + tmp[1] + '"></option>';
            }
            return output;
        });
    }
}

Bluray.regExpName = /itemprop="itemReviewed">(?:<a[^>]*>)?([^<]*)(?:<\/a>)? Blu-ray<\/h1><\/a><img src="([^\.]*\.static-bluray.com\/flags\/[^"]*)/;
Bluray.regExpDate = /style="text-decoration: none; color: #666666">([^<]*)/;
