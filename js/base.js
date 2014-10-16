var regExpSeries, date;
var regExpSeriesName  = /<title>&#x22;(.*)&#x22;/;
var regExpSeriesIcon  = /<a name="poster".* src="([^"]*)/;
var regExpMovies      = /set_twilight_info\(\n"title",\n"([A-Z][A-Z])"[\s\S]*title="See all release dates" > ([^<]*).*\n\(([^\)]*)/;
var regExpMoviesName  = /itemprop="name">([^<]*)/;
var regExpMoviesIcon  = /Poster"\nsrc="([^"]*)/;
var regExpBlurays     = /style="text-decoration: none; color: #666666">([^<]*)/;
var regExpBluraysIcon = /id="frontimage_overlay" src="([^"]*)/;
var regExpBluraysName = /<a class="black[^>]*>([^<]*)<\/a> Blu-ray<\/h1><img src="([^\.]*\.static-bluray.com\/flags\/[^"]*)/;
var xPathTitle        = '//*[local-name()=\'title\' and (local-name(parent::*)=\'channel\' or local-name(parent::*)=\'feed\')]/text()';
var xPathLink         = '//*[local-name()=\'link\' and local-name(parent::*)=\'channel\']/text()';
var xPathLink2        = '//*[local-name()=\'link\' and local-name(parent::*)=\'feed\']/@href';
var xPathItems        = '//*[local-name()=\'item\']';
var xPathItems2       = '//*[local-name()=\'entry\']';
var xPathDate         = '*[local-name()=\'pubDate\']/text() | *[local-name()=\'link\' and not(../*[local-name()=\'pubDate\'])]/text()';
var xPathDate2        = '*[local-name()=\'updated\']/text() | *[local-name()=\'link\' and not(../*[local-name()=\'updated\'])]/@href';
var xPathItemLink     = '*[local-name()=\'link\']/text()';
var xPathItemLink2    = '*[local-name()=\'link\']/@href';
var imdb              = 'http://www.imdb.com/title/';
var bluray            = 'http://www.blu-ray.com/movies/';
var chromeI18n        = chrome.i18n.getMessage;
var progress          = {};

function compareStrings(string1, string2) {
    return string1.localeCompare(string2, window.navigator.language, { 'sensitivity': 'accent' });
}

function convertIntTo2Int(value) {
    return value < 10 ? '0' + value : value;
}

function propertyInArray(value, property, array) {
    var i, length;
    for (i = 0, length = array.length; i != length && array[i][property] != value; i++) {}
    return i == length ? -1 : i;
}

function objectInArray(value, array) {
    var i, length;
    for (i = 0, length = array.length; i != length && array[i] != value; i++) {}
    return i == length ? -1 : i;
}

function checkAll(arrays) {
    moment.locale('en');
    date         = moment().startOf('day');
    var tmpDate  = moment();
    var year     = tmpDate.year();
    var months   = moment.months();
    var tmpMonth = tmpDate.month();
    var month    = months[tmpMonth];
    var lastDay  = tmpDate.daysInMonth();
    var day      = '';
    for (var i = tmpDate.date(); i != lastDay; i++)
        day += i + '|';
    months.splice(0, tmpMonth + 1);
    regExpSeries = new RegExp('<h4>Season (\\d{1,}), Episode (\\d{1,}): <a href="[^"]*">([^<]*)</a></h4><b>(\\d{1,2} [A-S][a-z]+ ' + (year + 1) + '|\\d{1,2} (' + months.join('|') + ') ' + year + '|(' + day + lastDay + ') ' + month + ' ' + year + ')</b>');
    moment.locale(window.navigator.language);

    var i, length, tmp;
    for (var key in arrays) {
        progress[key] = 0;
        for (i = 0, tmp = arrays[key], length = tmp.length; i != length; i++)
            check[key](key, tmp[i]);
    }
}

function getLinkAll(type, link, value, page, toDoProgress, toDoSuccess1, toDoSuccess2, toDoError) {
    var file = new XMLHttpRequest();
    file.open('GET', link, true);
    file.setRequestHeader('Pragma', 'no-cache');
    file.setRequestHeader('Cache-Control', 'no-cache, must-revalidate');
    file.onreadystatechange = function() {
        if (file.readyState == XMLHttpRequest.DONE) {
            progress[type]++;
            getLink[type](type, value, page, toDoSuccess1, toDoSuccess2, toDoError, file.status == 200, file.responseText);
            toDoProgress(type);
        }
    };
    file.send();
}

function getRN(type, value, page, toDoProgress, toDoSuccess1, toDoSuccess2, toDoError) {
    getLinkAll(type, value['link'], value, page, toDoProgress, toDoSuccess1, toDoSuccess2, toDoError);
}

var get = {
    'rss': getRN,
    'news': getRN,
    'series': function(type, value, page, toDoProgress, toDoSuccess1, toDoSuccess2, toDoError) {
        getLinkAll(type, imdb + value + '/epcast', value, page, toDoProgress, toDoSuccess1, toDoSuccess2, toDoError);
    },
    'movies': function(type, value, page, toDoProgress, toDoSuccess1, toDoSuccess2, toDoError) {
        getLinkAll(type, imdb + value, value, page, toDoProgress, toDoSuccess1, toDoSuccess2, toDoError);
    },
    'blurays': function(type, value, page, toDoProgress, toDoSuccess1, toDoSuccess2, toDoError) {
        getLinkAll(type, bluray + value, value, page, toDoProgress, toDoSuccess1, toDoSuccess2, toDoError);
    }
};

var getLink = {
    'rss': function(type, value, page, toDoSuccess1, toDoSuccess2, toDoError, status, response) {
        if (!status) {
            if (toDoError != null)
                toDoError(type, value, value['link'], value['link'], null);
            return;
        }
        try {
            var xml = (new DOMParser()).parseFromString(response, 'text/xml');
            var tmp = xml.evaluate(xPathLink, xml, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            var link, items, rssDate, rssItemLink;
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
            tmp       = xml.evaluate(xPathTitle, xml, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
            var title = tmp != null ? tmp.textContent : link;
            var j;
            if (value['current'] == '')
                j = items.snapshotLength;
            else if (!moment(new Date(value['current'])).isValid())
                for (j = 0; j != items.snapshotLength && xml.evaluate(rssDate, items.snapshotItem(j), null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent != value['current']; j++) {}
            else for (j = 0; j != items.snapshotLength && moment(new Date(xml.evaluate(rssDate, items.snapshotItem(j), null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent)).isAfter(new Date(value['current'])); j++) {}
            if (j != 0) {
                var f;
                if (value['maxitems'] == null || j > value['maxitems']) {
                    f = (function(_link) {
                        return function() {
                            window.open(_link);
                        };
                    })(link);
                }
                else {
                    f = (function(_xml, _rssItemLink, _items, _j) {
                        return function() {
                            for (var i = 0; i < _j; i++)
                                window.open(_xml.evaluate(_rssItemLink, _items.snapshotItem(i), null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent);
                        };
                    })(xml, rssItemLink, items, j);
                }
                var current = xml.evaluate(rssDate, items.snapshotItem(0), null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue.textContent;
                toDoSuccess1(type, value, link, title, chrome.i18n.getMessage('newitems', [j]),
                    page.getFunctionDynamic[type](f, type, value['link'], current),
                    current
                );
            }
            else if (toDoSuccess2 != null)
                toDoSuccess2(type, value, link, title, chrome.i18n.getMessage('newitems', [j]));
        }
        catch (err) {
            if (toDoError != null)
                toDoError(type, value, value['link'], value['link']);
        }
    },

    'news': function(type, value, page, toDoSuccess1, toDoSuccess2, toDoError, status, response) {
        if (!status) {
            if (toDoError != null)
                toDoError(type, value, value['link'], value['name'], null);
            return;
        }
        try {
            var result = response.match(new RegExp(value['regexp']));
            if (result.length != 1)
                result.splice(0, 1);
            result = result.join(' ');
            if (result.trim() == '')
                result = '-';
            if (result != value['current']) {
                toDoSuccess1(type, value, value['link'], value['name'], result,
                    page.getFunctionDynamic[type](value['link'], type, value['link'], result),
                    result
                );
            }
            else if (toDoSuccess2 != null)
                toDoSuccess2(type, value, value['link'], value['name'], result);
        }
        catch (err) {
            if (toDoError != null)
                toDoError(type, value, value['link'], value['name']);
        }
    },

    'series': function(type, value, page, toDoSuccess1, toDoSuccess2, toDoError, status, response) {
        if (!status) {
            if (toDoError != null)
                toDoError(type, value, null);
            return;
        }
        var name = response.match(regExpSeriesName);
        if (name != null) {
            var result = response.match(regExpSeries);
            if (result != null) {
                var tmpDate = moment(new Date(result[4]));
                if (!tmpDate.isAfter(date)) {
                    toDoSuccess1(type, value,
                        name[1] + ' S' + convertIntTo2Int(result[1]) + 'E' + convertIntTo2Int(result[2]) + (/^Episode #/.test(result[3]) ? '' : ': ' + result[3]),
                        response.match(regExpSeriesIcon),
                        tmpDate,
                        page.getFunctionDynamic[type](imdb + value, type, value),
                        page.hasChecked(type, value, tmpDate)
                    );
                }
                else {
                    page.hasChecked(type, value);
                    toDoSuccess1(type, value,
                        name[1] + ' S' + convertIntTo2Int(result[1]) + 'E' + convertIntTo2Int(result[2]) + (/^Episode #/.test(result[3]) ? '' : ': ' + result[3]),
                        response.match(regExpSeriesIcon),
                        tmpDate
                    );
                }
            }
            else if (toDoSuccess2 != null) {
                page.hasChecked(type, value);
                toDoSuccess2(type, value, name[1], response.match(regExpSeriesIcon));
            }
        }
        else if (toDoError != null)
            toDoError(type, value);
    },

    'movies': function(type, value, page, toDoSuccess1, toDoSuccess2, toDoError, status, response) {
        if (!status) {
            if (toDoError != null)
                toDoError(type, value, null);
            return;
        }
        var name = response.match(regExpMoviesName);
        if (name != null) {
            var result = response.match(regExpMovies);
            if (result != null && iso.findCountryByName(result[3])['value'] == result[1]) {
                var tmpDate = moment(new Date(result[2]));
                if (!tmpDate.isAfter(date)) {
                    toDoSuccess1(type, value, name[1], response.match(regExpMoviesIcon), tmpDate,
                        page.getFunctionDynamic[type](imdb + value, type, value),
                        page.hasChecked(type, value, tmpDate)
                    );
                }
                else {
                    page.hasChecked(type, value);
                    toDoSuccess1(type, value, name[1], response.match(regExpMoviesIcon), tmpDate);
                }
            }
            else if (toDoSuccess2 != null) {
                page.hasChecked(type, value);
                toDoSuccess2(type, value, name[1], response.match(regExpMoviesIcon));
            }
        }
        else if (toDoError != null)
            toDoError(type, value);
    },

    'blurays': function(type, value, page, toDoSuccess1, toDoSuccess2, toDoError, status, response) {
        if (!status) {
            if (toDoError != null)
                toDoError(type, value, null);
            return;
        }
        var name = response.match(regExpBluraysName);
        if (name != null) {
            var result = response.match(regExpBlurays);
            if (result != null) {
                var tmpDate = moment(new Date(result[1]));
                if (!tmpDate.isAfter(date)) {
                    toDoSuccess1(type, value, name, response.match(regExpBluraysIcon), tmpDate,
                        page.getFunctionDynamic[type](bluray + value, type, value),
                        page.hasChecked(type, value, tmpDate)
                    );
                }
                else {
                    page.hasChecked(type, value);
                    toDoSuccess1(type, value, name, response.match(regExpBluraysIcon), tmpDate);
                }
            }
            else if (toDoSuccess2 != null) {
                page.hasChecked(type, value);
                toDoSuccess2(type, value, name, response.match(regExpBluraysIcon));
            }
        }
        else if (toDoError != null)
            toDoError(type, value);
    }
};
