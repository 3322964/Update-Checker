const chromeI18n = chrome.i18n.getMessage;
const getFavicon = 'http://www.google.com/s2/favicons?domain_url=';
var arrays, date;

for (let i = 0, tmp, elements = document.getElementsByTagName('*'), length = elements.length; i != length; i++) {
    tmp = elements[i].id;
    if (tmp != '')
        window[tmp] = elements[i];
}

function escapeHTML(result) {
    return result.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/:\/\/([^@]*)@/, '://***@');
}

function escapeAttribute(result) {
    return escapeHTML(result).replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
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

function toggleHeaderActive(e) {
    var element                                                 = e.target;
    var activeHeader                                            = element.parentElement.getElementsByClassName('active')[0];
    document.getElementById(activeHeader.id + 'content').hidden = true;
    activeHeader.classList.remove('active');
    element.classList.add('active');
    document.getElementById(element.id + 'content').hidden = false;
    chrome.storage.local.set({ settings: element.id });
}

function createDateAndRegExpDate() {
    date             = moment().startOf('day');
    let year         = date.year();
    let months       = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    let month        = date.month();
    Serie.regExpDate = new RegExp('<h4>Season (\\d{1,}), Episode (\\d{1,}): <a href="[^"]*">([^<]*)</a></h4><b>(\\d{1,2} [A-S][a-z]+ ' + (year + 1) + '|\\d{1,2} (' + months.splice(month + 1, 12).join('|') + ') ' + year + '|(' + [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31].splice(date.date() - 1, 31).join('|') + ') ' + months[month] + ' ' + year + ')</b>');
}

function writeArrays() {
    chrome.storage.local.set({ arrays: arrays });
}

function parseArrays(tmpArrays) {
    arrays = { series: [], movies: [], blurays: [], news: [] };
    let type;
    for (type in tmpArrays) {
        if (type in arrays)
            arrays[type] = tmpArrays[type];
    }
    if (tmpArrays != null) { // A SUPPRIMER DANS LONGTEMPS
        for (let i = 0, length = arrays.news.length; i != length; i++)
            delete arrays.news[i].name;
        if (tmpArrays.rss != null) {
            for (let i = 0, length = tmpArrays.rss.length; i != length; i++)
                arrays.news.push({ link: tmpArrays.rss[i].link, regexp: '', current: tmpArrays.rss[i].current });
        }
    }
    writeArrays();

    createDateAndRegExpDate();
    let toCheck = [];
    let arrayType, classType, i, length;
    for (type in arrays) {
        arrayType = arrays[type];
        switch(type) {
            case 'series': classType = Serie; break;
            case 'movies': classType = Movie; break;
            case 'blurays': classType = Bluray; break;
            case 'news': classType = New; break;
        }
        for (i = 0, length = arrayType.length; i != length; i++)
            toCheck.push(new classType(arrayType[i]));
    }
    for (i = 0, length = toCheck.length; i != length; i++)
        toCheck[i].check();
}

function getLink(link, onDone) {
    let file = new XMLHttpRequest();
    file.open('GET', link, true);
    file.setRequestHeader('Pragma', 'no-cache');
    file.setRequestHeader('Cache-Control', 'no-cache, must-revalidate');
    file.onreadystatechange = function () {
        if (file.readyState == XMLHttpRequest.DONE)
            onDone(file.status == 200, file.responseText);
    };
    file.send();
}

window.addEventListener('load', function () {
    let headers = header.children;
    for (let i = 0, length = headers.length; i != length; i++) {
        headers[i].innerHTML = chromeI18n(headers[i].id);
        headers[i].addEventListener('click', toggleHeaderActive, false);
    }

    viewmoviesreleasedate.innerHTML = viewbluraysreleasedate.innerHTML = chromeI18n('releasedate');
    viewseriesseason.innerHTML                  = chromeI18n('season');
    viewseriesepisode.innerHTML                 = chromeI18n('episode');
    viewseriesepisodename.innerHTML             = chromeI18n('episodename');
    viewseriesepisodebroadcastingdate.innerHTML = chromeI18n('episodebroadcastingdate');
    viewblurayscountry.innerHTML                = chromeI18n('country');
    viewnewsname.innerHTML                      = chromeI18n('name');
    viewnewsresult.innerHTML                    = chromeI18n('result');
    viewnewsactions.innerHTML                   = chromeI18n('actions');

    addEventsToInputsSMB('series', Serie, seriesbody, viewseriesgeneralactions, seriesrecheckall, viewseriesname, viewseriesactions, seriesname, seriesresults, seriesadd);
    addEventsToInputsSMB('movies', Movie, moviesbody, viewmoviesgeneralactions, moviesrecheckall, viewmoviesname, viewmoviesactions, moviesname, moviesresults, moviesadd);
    addEventsToInputsSMB('blurays', Bluray, bluraysbody, viewbluraysgeneralactions, bluraysrecheckall, viewbluraysname, viewbluraysactions, bluraysname, bluraysresults, bluraysadd);

    viewnewsgeneralactions.innerHTML = chromeI18n('generalactions');
    newsopensavenews.innerHTML       = chromeI18n('opensavenews');
    newssavenews.innerHTML           = chromeI18n('savenews');
    newsrecheckall.innerHTML         = chromeI18n('recheckall');
    newslink.placeholder             = chromeI18n('link');
    newsregexp.placeholder           = chromeI18n('regexp');
    newsadd.innerHTML                = chromeI18n('add');
    newsopensavenews.addEventListener('click', function () {
        let toClick = [];
        let trs     = newsbody.children;
        let i, length;
        for (i = 0, length = trs.length - 1; i != length; i++) {
            if (trs[i].domResult.className == 'green')
                toClick.push(trs[i].domName.firstElementChild);
        }
        for (i = 0, length = toClick.length; i != length; i++)
            toClick[i].click();
    }, false);
    newssavenews.addEventListener('click', function () {
        doAll(newsbody, chromeI18n('save'));
    }, false);
    newsrecheckall.addEventListener('click', function () {
        doAll(newsbody, chromeI18n('recheck'));
    }, false);
    addEventsToInput(newslink);
    addEventsToDropdowns(newsregexpdropdown);

    restore.value = chromeI18n('restore');
    backup.value  = chromeI18n('backup');

    moment.locale(window.navigator.language);

    chrome.storage.local.get(null, function (items) {
        let settings = items.settings == null ? 'viewseries' : items.settings;
        document.getElementById(settings).classList.add('active');
        document.getElementById(settings + 'content').hidden = false;
        parseArrays(items.arrays);
    });
}, false);

var dropdownNews = [
    { title: 'Chrome Web Store', link: 'https://chrome.google.com/webstore/detail/*', regexp: 'itemprop="version" content="([^"]*)' },
    { title: 'Facebook', link: 'https://www.facebook.com*', regexp: 'id="requestsCountValue">([^<]*)</span> <i [^>]*>([^<]*)<(/).*id="mercurymessagesCountValue">([^<]*)</span> <i [^>]*>([^<]*)<(/).*id="notificationsCountValue">([^<]*)</span> <i [^>]*>([^<]*)' },
    { title: 'Google Play Store Apps', link: 'https://play.google.com/store/apps/details?id=*', regexp: 'itemprop="softwareVersion"> v(\\S*)' },
    { title: 'Outlook', link: 'https://*.mail.live.com*', regexp: '<span\\s+class="count">\\s*([^<]*)(?:<[^>]*>[^<]*){17}<span\\s+class="count">\\s*([^<]*)' },
    { title: 'RuTracker', link: 'http://rutracker.org/forum/tracker.php?nm=*', regexp: 'data-topic_id=.* href="([^"]*)' },
    { title: 'YouTube', link: 'https://www.youtube.com/*/*/videos', regexp: 'class="yt-lockup-title "><a [^>]*>([^<]*)' }
];

function addEventsToDropdowns(newsregexpdropdown) {
    for (let i = 0, length = dropdownNews.length; i != length; i++) {
        let option       = document.createElement('option');
        option.value     = dropdownNews[i].regexp;
        option.innerHTML = dropdownNews[i].title + ' (' + dropdownNews[i].link + ')';
        newsregexpdropdown.appendChild(option);
    }
}

function removeInvalid(e) {
    e.target.classList.remove('invalid');
}

function addEventsToInput(input) {
    input.addEventListener('keydown', removeInvalid, false);
    input.addEventListener('input', removeInvalid, false);
    input.addEventListener('click', removeInvalid, false);
}

function addEventsToInputsSMB(type, classType, body, viewgeneralactions, recheckall, viewname, viewactions, name, results, add) {
    viewgeneralactions.innerHTML = chromeI18n('generalactions');
    recheckall.innerHTML         = chromeI18n('recheckall');
    viewname.innerHTML           = chromeI18n('name');
    viewactions.innerHTML        = chromeI18n('actions');
    name.placeholder             = chromeI18n('name');
    add.innerHTML                = chromeI18n('add');

    recheckall.addEventListener('click', function () {
        doAll(body, chromeI18n('recheck'));
    }, false);

    addEventsToInput(name);

    name.addEventListener('keyup', classType.parse, false);
    name.addEventListener('search', classType.parse, false);

    add.addEventListener('click', function () {
        name.click();
        let value = results.value;
        if (value == '')
            name.classList.add('invalid');
        else {
            name.value     = '';
            results.hidden = true;
            let arrayType  = arrays[type];
            let toCheck    = new classType(arrayType[arrayType.push(value) - 1]);
            writeArrays();
            toCheck.check();
        }
    }, false);
}

newsadd.addEventListener('click', function () {
    New.parse('', '', newslink, newsregexp);
}, false);

function doAll(body, text) {
    let toClick = [];
    let trs     = body.children;
    let i, length, elements, j, elementsLength;
    for (i = 0, length = trs.length - 1; i != length; i++) {
        elements = trs[i].domActions.children;
        for (j = 0, elementsLength = elements.length; j != elementsLength; j++) {
            if (elements[j].innerHTML == text)
                toClick.push(elements[j]);
        }
    }
    for (i = 0, length = toClick.length; i != length; i++)
        toClick[i].click();
}

restoreh.addEventListener('change', function (event) {
    let file    = new FileReader();
    file.onload = function (e) {
        event.target.value = '';
        try {
            parseArrays(JSON.parse(e.target.result).arrays);
        }
        catch (err) {}
    };
    file.readAsText(event.target.files[0]);
}, false);

restore.addEventListener('click', function () {
    restoreh.click();
}, false);

backup.addEventListener('click', function () {
    let a      = document.createElement('a');
    a.download = 'Update Checker.json';
    a.href     = window.URL.createObjectURL(new Blob([JSON.stringify({ arrays: arrays }, null, 4)], { type: 'text/plain;charset=UTF-8' }));
    a.click();
    window.URL.revokeObjectURL(a.href);
}, false);
