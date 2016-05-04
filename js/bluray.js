class Bluray extends SMB {
    constructor(blurayId) {
        super(2, viewbluraysbody, 'blurays', blurayId, 'http://www.blu-ray.com/movies/' + blurayId);
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
                        this.tr.children[1].innerHTML = '<img src="' + name[2] + '">';
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
