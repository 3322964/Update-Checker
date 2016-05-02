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
const imdb              = 'http://www.imdb.com/title/';
const bluray            = 'http://www.blu-ray.com/movies/';
const chromeI18n        = chrome.i18n.getMessage;
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
        for (i = 0, tmp = arrays[key], length = tmp.length; i != length; i++)
            getLinkAll(key, tmp[i]);
    }
}

function getLinkAll(type, value) {
    let file = new XMLHttpRequest();
    file.open('GET', createLink[type](value), true);
    file.setRequestHeader('Pragma', 'no-cache');
    file.setRequestHeader('Cache-Control', 'no-cache, must-revalidate');
    file.onreadystatechange = function () {
        if (file.readyState == XMLHttpRequest.DONE)
            getLink[type](type, value, file.status == 200, file.responseText);
    };
    file.send();
}

var createLink = {
    'news': function (value) {
        return value['link'];
    },
    'series': function (value) {
        return imdb + value + '/epcast';
    },
    'movies': function (value) {
        return imdb + value + '/';
    },
    'blurays': function (value) {
        return bluray + value;
    }
};

var getLink = {
    'news': function (type, value, status, response) {
        let name = value['name'] != '' ? value['name'] : value['link'];
        if (!status)
            sortNews(news, type, value, value['link'], name, null);
        else if (value['regexp'] == '') {
            let rssParser = new RssParser(response, value['current']);
            if (rssParser.getErrorFlag())
                sortNews(news, type, value, value['link'], name);
            else {
                if (value['name'] == '')
                    name = rssParser.getName();
                let newItemCount = rssParser.getNewItemCount();
                sortNews(news, type, value, rssParser.getLink(), name, chrome.i18n.getMessage('newitems', [newItemCount]), newItemCount != 0 ? rssParser.getNewDate() : null);
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
                sortNews(news, type, value, value['link'], name, result, result != value['current'] ? result : null);
            }
            catch (err) {
                sortNews(news, type, value, value['link'], name);
            }
        }
    },

    'series': function (type, value, status, response) {
        if (!status)
            sortSMB(series, imdb, type, value, null);
        else {
            let name = response.match(regExpSeriesName);
            if (name != null) {
                let result = response.match(regExpSeries);
                if (result != null) {
                    let tmpDate = moment(new Date(result[4]));
                    sortSMB(series, imdb, type, value,
                        name[1] + ' S' + convertIntTo2Int(result[1]) + 'E' + convertIntTo2Int(result[2]) + (/^Episode #/.test(result[3]) ? '' : ': ' + result[3]), response.match(regExpSeriesIcon), tmpDate, !tmpDate.isAfter(date));
                }
                else sortSMB(series, imdb, type, value, name[1], response.match(regExpSeriesIcon));
            }
            else sortSMB(series, imdb, type, value);
        }
    },

    'movies': function (type, value, status, response) {
        if (!status)
            sortSMB(movies, imdb, type, value, null);
        else {
            let name = response.match(regExpMoviesName);
            if (name != null) {
                let result = response.match(regExpMovies);
                if (result != null && iso.findCountryByName(result[3])['value'] == result[1]) {
                    let tmpDate = moment(new Date(result[2]));
                    sortSMB(movies, imdb, type, value, name[1], response.match(regExpMoviesIcon), tmpDate, !tmpDate.isAfter(date));
                }
                else sortSMB(movies, imdb, type, value, name[1], response.match(regExpMoviesIcon));
            }
            else sortSMB(movies, imdb, type, value);
        }
    },

    'blurays': function (type, value, status, response) {
        if (!status)
            sortSMB(blurays, bluray, type, value, null);
        else {
            let name = response.match(regExpBluraysName);
            if (name != null) {
                name       = name.length == 3 ? name[1] + ' <img src="' + name[2] + '">' : name[1];
                let result = response.match(regExpBlurays);
                if (result != null) {
                    let tmpDate = moment(new Date(result[1]));
                    sortSMB(blurays, bluray, type, value, name, response.match(regExpBluraysIcon), tmpDate, !tmpDate.isAfter(date));
                }
                else sortSMB(blurays, bluray, type, value, name, response.match(regExpBluraysIcon));
            }
            else sortSMB(blurays, bluray, type, value);
        }
    }
};
