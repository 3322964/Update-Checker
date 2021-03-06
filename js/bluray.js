class Bluray extends SMB {
    constructor(value) {
        super(bluraysbody, bluraysexpand, 'blurays', value, 'http://www.blu-ray.com/movies/' + value, 'http://www.blu-ray.com/', 3);
    }
    check() {
        this.request = new GetRequest(this.domResult, this.link);
        this.request.send((ok, response) => {
            if (!ok)
                this.sortOrange();
            else {
                let name = response.match(Bluray.regExpName);
                if (name === null)
                    this.sortRed();
                else {
                    this.tr.children[2].innerHTML = escapeHTML(name[2]);
                    let result = response.match(Bluray.regExpDate);
                    if (result === null)
                        this.sortNoDate(name[1]);
                    else this.sortDate(name[1], result[1]);
                }
            }
        });
    }
    static parse() {
        bluraysname.click();
        bluraysresults.hidden = true;

        if ('request' in Bluray)
            Bluray.request.abort();

        let value = bluraysname.value.trim();
        if (value !== '') {
            Bluray.request = new PostRequest(bluraysresults.parentElement, 'http://www.blu-ray.com/search/quicksearch.php');
            Bluray.request.send(function (ok, response) {
                if (!ok)
                    bluraysname.classList.add('invalid');
                else {
                    let tmp = response.match(/var urls = new Array\(([^\)]+)/);
                    if (tmp === null)
                        bluraysname.classList.add('invalid');
                    else {
                        let urls      = tmp[1].replace(/'|http:\/\/www\.blu-ray\.com\/movies\//g, '').split(', ');
                        let regExp    = /<img src="http:\/\/images.static-bluray.com\/flags\/([^.]+).png" [^>]*>&nbsp;([^\n<]+)/g;
                        let output    = '';
                        let arrayType = arrays.blurays;
                        for (let i = 0; (tmp = regExp.exec(response)) !== null; i++) {
                            if (objectInArray(urls[i], arrayType) === -1)
                                output += '<option value="' + urls[i] + '">' + tmp[2] + ' (' + tmp[1] + ')</option>';
                        }
                        if (output === '')
                            bluraysname.classList.add('invalid');
                        else {
                            bluraysresults.firstElementChild.innerHTML = output;
                            bluraysresults.hidden                       = false;
                        }
                    }
                }
            }, 'userid=-1&country=all&section=bluraymovies&keyword='+ encodeURIComponent(value));
        }
    }
}

Bluray.regExpName = /itemprop="itemReviewed">([^<]+) Blu-ray<\/h1>(?:<\/a>)?<img [^>]*title="([^"]+)/;
Bluray.regExpDate = /style="text-decoration: none; color: #666666">([^<]+)/;
