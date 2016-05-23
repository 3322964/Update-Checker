const chromeI18n = chrome.i18n.getMessage;
var arrays;

for (let i = 0, tmp, elements = document.getElementsByTagName('*'), length = elements.length; i !== length; i++) {
    tmp = elements[i].id;
    if (tmp !== '')
        window[tmp] = elements[i];
}

function escapeHTML(string) {
    return string.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttribute(string) {
    return string.replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
}

function getFavicon(link) {
    return 'http://www.google.com/s2/favicons?domain_url=' + encodeURIComponent(link);
}

function propertyInArray(value, property, array) {
    let i;
    for (i = array.length - 1; i !== -1 && array[i][property] !== value; i--) ;
    return i;
}

function objectInArray(value, array) {
    let i;
    for (i = array.length - 1; i !== -1 && array[i] !== value; i--) ;
    return i;
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

function writeArrays() {
    chrome.storage.local.set({ arrays: arrays });
}

function parseArrays(tmpArrays) {
    arrays = { series: [], movies: [], blurays: [], news: [] };
    for (let type in tmpArrays) {
        if (type in arrays)
            arrays[type] = tmpArrays[type];
    }
    if (tmpArrays !== undefined) { // A SUPPRIMER DANS LONGTEMPS
        for (let i = 0, length = arrays.news.length; i !== length; i++)
            delete arrays.news[i].name;
        if ('rss' in tmpArrays) {
            for (let i = 0, length = tmpArrays.rss.length; i !== length; i++)
                arrays.news.push({ link: tmpArrays.rss[i].link, regexp: '', current: tmpArrays.rss[i].current });
        }
    }
    writeArrays();
}

function checkArrays() {
    Serie.createRegExpDate();
    let toCheck = [];
    let arrayType, classType, i, length;
    for (let type in arrays) {
        arrayType = arrays[type];
        switch (type) {
            case 'series': classType = Serie; break;
            case 'movies': classType = Movie; break;
            case 'blurays': classType = Bluray; break;
            case 'news': classType = New; break;
        }
        for (i = 0, length = arrayType.length; i !== length; i++)
            toCheck.push(new classType(arrayType[i]));
    }
    for (i = 0, length = toCheck.length; i !== length; i++)
        toCheck[i].check();
}

window.addEventListener('load', function () {
    let headers = header.children;
    for (let i = 0, length = headers.length; i !== length; i++) {
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

    addEventsToInputsSMB('series', Serie, seriesbody, viewseriesgeneralactions, seriesrecheckall, seriesrecheckerrors, viewseriesname, viewseriesactions, seriesname, seriesresults, seriesadd);
    addEventsToInputsSMB('movies', Movie, moviesbody, viewmoviesgeneralactions, moviesrecheckall, moviesrecheckerrors, viewmoviesname, viewmoviesactions, moviesname, moviesresults, moviesadd);
    addEventsToInputsSMB('blurays', Bluray, bluraysbody, viewbluraysgeneralactions, bluraysrecheckall, bluraysrecheckerrors, viewbluraysname, viewbluraysactions, bluraysname, bluraysresults, bluraysadd);

    viewnewsgeneralactions.innerHTML = chromeI18n('generalactions');
    newsopensavenews.innerHTML       = chromeI18n('opensavenews');
    newssavenews.innerHTML           = chromeI18n('savenews');
    newsrecheckall.innerHTML         = chromeI18n('recheckall');
    newsrecheckerrors.innerHTML      = chromeI18n('recheckerrors');
    newslink.placeholder             = chromeI18n('link');
    newsregexp.placeholder           = chromeI18n('regexp');
    newsadd.innerHTML                = chromeI18n('add');
    newsopensavenews.addEventListener('click', function () {
        let toClick = [];
        let trs     = newsbody.children;
        let i, length;
        for (i = 0, length = trs.length - 1; i !== length; i++) {
            if (trs[i].domResult.className === 'green')
                toClick.push(trs[i].domName.firstElementChild);
        }
        for (i = 0, length = toClick.length; i !== length; i++)
            toClick[i].click();
    }, false);
    newssavenews.addEventListener('click', function () {
        let toClick = [];
        let trs     = newsbody.children;
        let i, length;
        for (i = 0, length = trs.length - 1; i !== length; i++) {
            if (trs[i].domResult.className === 'green')
                toClick.push(trs[i].domActions.firstElementChild);
        }
        for (i = 0, length = toClick.length; i !== length; i++)
            toClick[i].click();
    }, false);
    newsrecheckall.addEventListener('click', function () {
        let toClick = [];
        let trs     = newsbody.children;
        let i, length;
        for (i = 0, length = trs.length - 1; i !== length; i++) {
            if (trs[i].domResult.className === 'green')
                toClick.push(trs[i].domActions.children[1]);
            else toClick.push(trs[i].domActions.firstElementChild);
        }
        for (i = 0, length = toClick.length; i !== length; i++)
            toClick[i].click();
    }, false);
    newsrecheckerrors.addEventListener('click', function () {
        reCheckErrors(newsbody);
    }, false);
    addEventsToInput(newslink);
    addEventsToDropdowns(newsregexpdropdown);

    viewdatamanagement.innerHTML = chromeI18n('datamanagement');
    importdata.innerHTML         = chromeI18n('importdata');
    exportdata.innerHTML         = chromeI18n('exportdata');

    moment.locale(window.navigator.language);

    chrome.storage.local.get(null, function (items) {
        let settings = (!('settings' in items) || typeof items.settings !== 'string') ? 'viewseries' : items.settings;
        document.getElementById(settings).classList.add('active');
        document.getElementById(settings + 'content').hidden = false;
        parseArrays(items.arrays);
        checkArrays();
    });
}, false);

var dropdownNews = [
    { title: 'Chrome Web Store', link: 'https://chrome.google.com/webstore/detail/*', regexp: 'itemprop="version" content="([^"]*)' },
    { title: 'Facebook', link: 'https://www.facebook.com*', regexp: 'id="requestsCountValue">([^<]*)</span> <i [^>]*>([^<]*)<(/).*id="mercurymessagesCountValue">([^<]*)</span> <i [^>]*>([^<]*)<(/).*id="notificationsCountValue">([^<]*)</span> <i [^>]*>([^<]*)' },
    { title: 'Facebook Page', link: 'https://www.facebook.com/*', regexp: 'class="_5pcq"[^>]*><abbr title="([^"]*)' },
    { title: 'Google Play Store Apps', link: 'https://play.google.com/store/apps/details?id=*', regexp: 'itemprop="softwareVersion"> v(\\S*)' },
    { title: 'Outlook', link: 'https://*.mail.live.com*', regexp: '<span\\s+class="count">\\s*([^<]*)(?:<[^>]*>[^<]*){17}<span\\s+class="count">\\s*([^<]*)' },
    { title: 'RuTracker', link: 'http://rutracker.org/forum/tracker.php?nm=*', regexp: 'data-topic_id="([^"]*)' },
    { title: 'YouTube', link: 'https://www.youtube.com/*/*/videos', regexp: 'class="yt-lockup-title "><a [^>]*>([^<]*)' }
];

function addEventsToDropdowns(newsregexpdropdown) {
    for (let i = 0, length = dropdownNews.length; i !== length; i++) {
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

function addEventsToInputsSMB(type, classType, body, viewgeneralactions, recheckall, recheckerrors, viewname, viewactions, name, results, add) {
    viewgeneralactions.innerHTML = chromeI18n('generalactions');
    recheckall.innerHTML         = chromeI18n('recheckall');
    recheckerrors.innerHTML      = chromeI18n('recheckerrors');
    viewname.innerHTML           = chromeI18n('name');
    viewactions.innerHTML        = chromeI18n('actions');
    name.placeholder             = chromeI18n('name');
    add.innerHTML                = chromeI18n('add');

    recheckall.addEventListener('click', function () {
        let toClick = [];
        let trs     = body.children;
        let i, length;
        for (i = 0, length = trs.length - 1; i !== length; i++)
            toClick.push(trs[i].domActions.firstElementChild);
        for (i = 0, length = toClick.length; i !== length; i++)
            toClick[i].click();
    }, false);

    recheckerrors.addEventListener('click', function() {
        reCheckErrors(body);
    }, false);

    addEventsToInput(name);

    name.addEventListener('keyup', classType.parse, false);
    name.addEventListener('search', classType.parse, false);

    add.addEventListener('click', function () {
        name.click();
        if (results.hidden)
            name.classList.add('invalid');
        else {
            name.value     = '';
            results.hidden = true;
            let arrayType  = arrays[type];
            let toCheck    = new classType(arrayType[arrayType.push(results.value) - 1]);
            writeArrays();
            toCheck.check();
        }
    }, false);
}

newsadd.addEventListener('click', function () {
    New.parse();
}, false);

function reCheckErrors(body) {
    let toClick = [];
    let trs     = body.children;
    let i, length;
    for (i = 0, length = trs.length - 1; i !== length; i++) {
        if (trs[i].domResult.className === 'red' || trs[i].domResult.className === 'orange')
            toClick.push(trs[i].domActions.firstElementChild);
    }
    for (i = 0, length = toClick.length; i !== length; i++)
        toClick[i].click();
}

importdatah.addEventListener('change', function (event) {
    let file    = new FileReader();
    file.onload = function (e) {
        event.target.value = '';
        try {
            parseArrays(JSON.parse(e.target.result).arrays);
            window.location.reload();
        }
        catch (err) {}
    };
    file.readAsText(event.target.files[0]);
}, false);

importdata.addEventListener('click', function () {
    importdatah.click();
}, false);

exportdata.addEventListener('click', function () {
    let a      = document.createElement('a');
    a.download = 'Update Checker.json';
    a.href     = window.URL.createObjectURL(new Blob([JSON.stringify({ arrays: arrays }, null, 4)], { type: 'text/plain;charset=UTF-8' }));
    a.click();
    window.URL.revokeObjectURL(a.href);
}, false);
