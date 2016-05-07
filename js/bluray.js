class Bluray extends SMB {
    constructor(value) {
        super(3, bluraysbody, 'blurays', value, 'http://www.blu-ray.com/movies/' + value, 'http://www.blu-ray.com/');
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
        bluraysname.click();
        bluraysresults.hidden = true;

        try {
            Bluray.file.onreadystatechange = null;
            Bluray.file.abort();
        }
        catch (err) {}

        let value = bluraysname.value.trim();
        if (value == '')
            bluraysname.classList.remove('loading');
        else {
            bluraysname.classList.add('loading');
            Bluray.file = new XMLHttpRequest();
            Bluray.file.open('POST', 'http://www.blu-ray.com/search/quicksearch.php', true);
            Bluray.file.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            Bluray.file.onreadystatechange = function () {
                if (Bluray.file.readyState == XMLHttpRequest.DONE) {
                    bluraysname.classList.remove('loading');
                    if (Bluray.file.status != 200)
                        bluraysname.classList.add('invalid');
                    else {
                        let response = Bluray.file.responseText;
                        let tmp      = response.match(/var urls = new Array\(([^\)]*)/);
                        if (tmp == null)
                            bluraysname.classList.add('invalid');
                        else {
                            let URLs      = tmp[1].replace(/'|http:\/\/www\.blu-ray\.com\/movies\//g, '').split(', ');
                            let regExp    = /<img src="http:\/\/images.static-bluray.com\/flags\/([^.]*).png" [^>]*>&nbsp;([^\n<]*)/g;
                            let output    = '';
                            let arrayType = arrays.blurays;
                            for (let i = 0; (tmp = regExp.exec(response)) != null; i++) {
                                if (objectInArray(URLs[i], arrayType) == -1)
                                    output += '<option value="' + URLs[i] + '">' + tmp[2] + ' (' + tmp[1] + ')</option>';
                            }
                            if (output == '')
                                bluraysname.classList.add('invalid');
                            else {
                                bluraysresults.innerHTML = output;
                                bluraysresults.hidden    = false;
                            }
                        }
                    }
                }
            };
            Bluray.file.send('userid=-1&country=all&section=bluraymovies&keyword='+ encodeURIComponent(value));
        }
    }
}

Bluray.regExpName = /itemprop="itemReviewed">(?:<a[^>]*>)?([^<]*)(?:<\/a>)? Blu-ray<\/h1><\/a><img src="([^\.]*\.static-bluray.com\/flags\/[^"]*)/;
Bluray.regExpDate = /style="text-decoration: none; color: #666666">([^<]*)/;
