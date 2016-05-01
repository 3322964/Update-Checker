const regExpNewsName    = /<title>([^<]*)/;
const regExpSeriesName  = /<title>&#x22;(.*)&#x22;/;
const regExpSeriesIcon  = /<a name="poster".* src="([^"]*)/;
const regExpMovies      = /set_twilight_info\(\n"title",\n"([A-Z][A-Z])"[\s\S]*title="See more release dates" >(.*) \(([^\)]*)/;
// const regExpMovies      = /set_twilight_info\(\n"title",\n"([A-Z][A-Z])"[\s\S]*title="See all release dates" > ([^<]*).*\n\(([^\)]*)/;
const regExpMoviesName  = /<title>(.*) \(/;
const regExpMoviesIcon  = /Poster"\nsrc="([^"]*)/;
const regExpBlurays     = /style="text-decoration: none; color: #666666">([^<]*)/;
const regExpBluraysIcon = /id="frontimage_overlay" src="([^"]*)/;
const regExpBluraysName = /itemprop="itemReviewed">(?:<a[^>]*>)?([^<]*)(?:<\/a>)? Blu-ray<\/h1><\/a><img src="([^\.]*\.static-bluray.com\/flags\/[^"]*)/;
const xPathTitle        = '//*[local-name()=\'title\' and (local-name(parent::*)=\'channel\' or local-name(parent::*)=\'feed\')]/text()';
const xPathLink         = '//*[local-name()=\'link\' and local-name(parent::*)=\'channel\']/text()';
const xPathLink2        = '//*[local-name()=\'link\' and local-name(parent::*)=\'feed\']/@href';
const xPathItems        = '//*[local-name()=\'item\']';
const xPathItems2       = '//*[local-name()=\'entry\']';
const xPathDate         = '*[local-name()=\'pubDate\']/text() | *[local-name()=\'link\' and not(../*[local-name()=\'pubDate\'])]/text()';
const xPathDate2        = '*[local-name()=\'updated\']/text() | *[local-name()=\'link\' and not(../*[local-name()=\'updated\'])]/@href';
const xPathItemLink     = '*[local-name()=\'link\']/text()';
const xPathItemLink2    = '*[local-name()=\'link\']/@href';
const imdb              = 'http://www.imdb.com/title/';
const bluray            = 'http://www.blu-ray.com/movies/';
const chromeI18n        = chrome.i18n.getMessage;
var progress            = {};
var regExpSeries, date;

function compareStrings(string1, string2) {
    return string1.localeCompare(string2, window.navigator.language, { 'sensitivity': 'accent' });
}

function convertIntTo2Int(value) {
    return value < 10 ? '0' + value : value;
}

function propertyInArray(value, property, array) {
    let i, length;
    for (i = 0, length = array.length; i != length && array[i][property] != value; i++) ;
    return i == length ? -1 : i;
}

function objectInArray(value, array) {
    let i, length;
    for (i = 0, length = array.length; i != length && array[i] != value; i++) ;
    return i == length ? -1 : i;
}

function checkAll(arrays) {
    date         = moment().startOf('day');
    let year     = date.year();
    let months   = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    let month    = date.month();
    let days     = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];
    regExpSeries = new RegExp('<h4>Season (\\d{1,}), Episode (\\d{1,}): <a href="[^"]*">([^<]*)</a></h4><b>(\\d{1,2} [A-S][a-z]+ ' + (year + 1) + '|\\d{1,2} (' + months.splice(month + 1, 12).join('|') + ') ' + year + '|(' + days.splice(date.date() - 1, 31).join('|') + ') ' + months[month] + ' ' + year + ')</b>');
    moment.locale(window.navigator.language);

    let i, tmp, length;
    for (let key in arrays) {
        progress[key] = 0;
        for (i = 0, tmp = arrays[key], length = tmp.length; i != length; i++)
            get[type](key, tmp[i], updateProgress);
    }
}

function getLinkAll(type, link, value) {
    let file = new XMLHttpRequest();
    file.open('GET', link, true);
    file.setRequestHeader('Pragma', 'no-cache');
    file.setRequestHeader('Cache-Control', 'no-cache, must-revalidate');
    file.onreadystatechange = function () {
        if (file.readyState == XMLHttpRequest.DONE) {
            progress[type]++;
            getLink[type](type, value, file.status == 200, file.responseText);
            updateProgress(type);
        }
    };
    file.send();
}

var get = {
    'news': function (type, value) {
        getLinkAll(type, value['link'], value);
    },
    'series': function (type, value) {
        getLinkAll(type, imdb + value + '/epcast', value);
    },
    'movies': function (type, value) {
        getLinkAll(type, imdb + value + '/', value);
    },
    'blurays': function (type, value) {
        getLinkAll(type, bluray + value, value);
    }
};

var getLink = {
    'news': function (type, value, status, response) {
        let name = value['name'] != '' ? value['name'] : value['link'];
        if (!status)
            sortNews(type, value, value['link'], name, null);
        else if (value['regexp'] == '') {
            try {
                let xml = (new DOMParser()).parseFromString(response, 'text/xml');
                let tmp = xml.evaluate(xPathLink, xml, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                let link, items, rssDate, rssItemLink;
                if (tmp != null) {
                    link        = tmp.textContent;
                    items       = xml.evaluate(xPathItems, xml, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                    rssDate     = xPathDate;
                    rssItemLink = xPathItemLink;
                }
                else {
                    link        = xml.evaluate(xPathLink2, xml, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent;
                    items       = xml.evaluate(xPathItems2, xml, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                    rssDate     = xPathDate2;
                    rssItemLink = xPathItemLink2;
                }
                tmp  = xml.evaluate(xPathTitle, xml, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                if (value['name'] == '')
                    name = tmp != null ? tmp.textContent : link;
                let j;
                if (value['current'] == '')
                    j = items.snapshotLength;
                else if (!moment(new Date(value['current'])).isValid())
                    for (j = 0; j != items.snapshotLength && xml.evaluate(rssDate, items.snapshotItem(j), null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent != value['current']; j++) ;
                else for (j = 0; j != items.snapshotLength && moment(new Date(xml.evaluate(rssDate, items.snapshotItem(j), null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent)).isAfter(new Date(value['current'])); j++) ;
                if (j != 0)
                    /*let f;
                    if (value['maxitems'] == null || j > value['maxitems']) {
                        f = (function (_link) {
                            return function () {
                                window.open(_link);
                            };
                        })(link);
                    }
                    else {
                        f = (function (_xml, _rssItemLink, _items, _j) {
                            return function () {
                                for (let i = 0; i < _j; i++)
                                    window.open(_xml.evaluate(_rssItemLink, _items.snapshotItem(i), null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent);
                            };
                        })(xml, rssItemLink, items, j);
                    }*/
                    sortNews(type, value, link, name, chrome.i18n.getMessage('newitems', [j]), xml.evaluate(rssDate, items.snapshotItem(0), null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent);
                else sortNews(type, value, link, name, chrome.i18n.getMessage('newitems', [j]));
            }
            catch (err) {
                sortNews(type, value, value['link'], name);
            }
        }
        else {
            if (value['name'] == '') {
                let tmp = response.match(regExpNewsName);
                if (tmp != null && tmp.length == 2)
                    name = tmp[1];
            }
            try {
                let result = response.match(new RegExp(value['regexp']));
                if (result.length != 1)
                    result.splice(0, 1);
                result = result.join(' ');
                if (result.trim() == '')
                    result = '-';
                if (result != value['current'])
                    sortNews(type, value, value['link'], name, result, result);
                else sortNews(type, value, value['link'], name, result);
            }
            catch (err) {
                sortNews(type, value, value['link'], name);
            }
        }
    },

    'series': function (type, value, status, response) {
        if (!status)
            sortSMB(type, value, null);
        else {
            let name = response.match(regExpSeriesName);
            if (name != null) {
                let result = response.match(regExpSeries);
                if (result != null) {
                    let tmpDate = moment(new Date(result[4]));
                    sortSMB(type, value,
                        name[1] + ' S' + convertIntTo2Int(result[1]) + 'E' + convertIntTo2Int(result[2]) + (/^Episode #/.test(result[3]) ? '' : ': ' + result[3]), response.match(regExpSeriesIcon), tmpDate, !tmpDate.isAfter(date));
                }
                else sortSMB(type, value, name[1], response.match(regExpSeriesIcon));
            }
            else sortSMB(type, value);
        }
    },

    'movies': function (type, value, status, response) {
        if (!status)
            sortSMB(type, value, null);
        else {
            let name = response.match(regExpMoviesName);
            if (name != null) {
                let result = response.match(regExpMovies);
                if (result != null && iso.findCountryByName(result[3])['value'] == result[1]) {
                    let tmpDate = moment(new Date(result[2]));
                    sortSMB(type, value, name[1], response.match(regExpMoviesIcon), tmpDate, !tmpDate.isAfter(date));
                }
                else sortSMB(type, value, name[1], response.match(regExpMoviesIcon));
            }
            else sortSMB(type, value);
        }
    },

    'blurays': function (type, value, status, response) {
        if (!status)
            sortSMB(type, value, null);
        else {
            let name = response.match(regExpBluraysName);
            if (name != null) {
                let result = response.match(regExpBlurays);
                if (result != null) {
                    let tmpDate = moment(new Date(result[1]));
                    sortSMB(type, value, name, response.match(regExpBluraysIcon), tmpDate, !tmpDate.isAfter(date));
                }
                else sortSMB(type, value, name, response.match(regExpBluraysIcon));
            }
            else sortSMB(type, value);
        }
    }
};
