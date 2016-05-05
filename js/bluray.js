class Bluray extends SMB {
    constructor(value) {
        super(2, viewbluraysbody, 'blurays', value, 'http://www.blu-ray.com/movies/' + value);
    }
    check() {
        getLink(this.link, (ok, response) => {
            if (!ok)
                this.sortOrange();
            else {
                let name = response.match(Bluray.regExpName);
                if (name == null)
                    this.sortRed();
                else {
                    if (name.length == 3)
                        this.tr.children[1].innerHTML = '<img src="' + escapeAttribute(name[2]) + '">';
                    let result = response.match(Bluray.regExpDate);
                    if (result == null)
                        this.sortNoDate(name[1]);
                    else this.sortDate(name[1], result[1]);
                }
            }
        });
    }
}

Bluray.regExpName = /itemprop="itemReviewed">(?:<a[^>]*>)?([^<]*)(?:<\/a>)? Blu-ray<\/h1><\/a><img src="([^\.]*\.static-bluray.com\/flags\/[^"]*)/;
Bluray.regExpDate = /style="text-decoration: none; color: #666666">([^<]*)/;
