const chromeI18n   = chrome.i18n.getMessage;
const dropdownNews = [
    { title: 'Chrome Web Store', link: 'https://chrome.google.com/webstore/detail/*', regexp: 'itemprop="version" content="([^"]*)' },
    { title: 'Facebook', link: 'https://www.facebook.com*', regexp: 'id="requestsCountValue">([^<]*)</span> <i [^>]*>([^<]*)<(/).*id="mercurymessagesCountValue">([^<]*)</span> <i [^>]*>([^<]*)<(/).*id="notificationsCountValue">([^<]*)</span> <i [^>]*>([^<]*)' },
    { title: 'Facebook Page', link: 'https://www.facebook.com/*', regexp: 'class="_5pcq"[^>]*><abbr title="([^"]*)' },
    { title: 'Google Play Store Apps', link: 'https://play.google.com/store/apps/details?id=*', regexp: 'itemprop="softwareVersion"> v(\\S*)' },
    { title: 'RuTracker', link: 'http://rutracker.org/forum/tracker.php?nm=*', regexp: 'data-topic_id="([^"]*)' },
    { title: 'YouTube', link: 'https://www.youtube.com/*/*/videos', regexp: 'class="yt-lockup-title "><a [^>]*>([^<]*)' }
];
let arrays;

function escapeHTML(string) {
    return string.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;');
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

function writeArrays() {
    chrome.storage.local.set({ arrays: arrays });
}

function parseArrays(tmpArrays) {
    arrays = { series: [], movies: [], blurays: [], news: [] };
    for (let type in tmpArrays) {
        if (type in arrays)
            arrays[type] = tmpArrays[type];
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

for (let i = 0, headers = header.children, length = headers.length; i !== length; i++) {
    headers[i].innerHTML = chromeI18n(headers[i].id);
    headers[i].addEventListener('click', function (e) {
        let element                                                 = e.target;
        let activeHeader                                            = element.parentElement.getElementsByClassName('active')[0];
        document.getElementById(activeHeader.id + 'content').hidden = true;
        activeHeader.classList.remove('active');
        element.classList.add('active');
        document.getElementById(element.id + 'content').hidden = false;
        chrome.storage.local.set({ settings: element.id });
    }, false);
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
        reCheckAll(body);
    }, false);

    recheckerrors.addEventListener('click', function () {
        reCheckErrors(body);
    }, false);

    addEventsToInput(name);

    name.addEventListener('input', classType.parse, false);
    name.addEventListener('keyup', classType.parse, false);
    name.addEventListener('search', classType.parse, false);

    add.addEventListener('click', function () {
        name.click();
        if (results.hidden)
            name.classList.add('invalid');
        else {
            name.value     = '';
            results.hidden = true;
            let object     = results.value;
            arrays[type].push(object);
            writeArrays();
            (new classType(object)).check();
        }
    }, false);
}

function reCheckAll(body) {
    let toReCheck = [];
    let trs       = body.children;
    let i, length;
    for (i = 0, length = trs.length - 1; i !== length; i++)
        toReCheck.push(trs[i].obj);
    for (i = 0, length = toReCheck.length; i !== length; i++)
        toReCheck[i].reCheck();
}

function reCheckErrors(body) {
    let toReCheck = [];
    let trs       = body.children;
    let i, length;
    for (i = 0, length = trs.length - 1; i !== length; i++) {
        if (trs[i].obj.color === 'red' || trs[i].obj.color === 'orange')
            toReCheck.push(trs[i].obj);
    }
    for (i = 0, length = toReCheck.length; i !== length; i++)
        toReCheck[i].reCheck();
}

viewmoviescountry.innerHTML     = viewblurayscountry.innerHTML     = chromeI18n('country');
viewmoviesreleasedate.innerHTML = viewbluraysreleasedate.innerHTML = chromeI18n('releasedate');
viewseriesseason.innerHTML                  = chromeI18n('season');
viewseriesepisode.innerHTML                 = chromeI18n('episode');
viewseriesepisodename.innerHTML             = chromeI18n('episodename');
viewseriesepisodebroadcastingdate.innerHTML = chromeI18n('episodebroadcastingdate');
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

function saveGreen(method) {
    let toSave = [];
    let trs    = newsbody.children;
    let i, length;
    for (i = 0, length = trs.length - 1; i !== length; i++) {
        if (trs[i].obj.color === 'green')
            toSave.push(trs[i].obj);
    }
    for (i = 0, length = toSave.length; i !== length; i++)
        toSave[i][method]();
}

newsopensavenews.addEventListener('click', function () {
    saveGreen('openSave');
}, false);

newssavenews.addEventListener('click', function () {
    saveGreen('save');
}, false);

newsrecheckall.addEventListener('click', function () {
    reCheckAll(newsbody);
}, false);

newsrecheckerrors.addEventListener('click', function () {
    reCheckErrors(newsbody);
}, false);

newsadd.addEventListener('click', function () {
    New.parse();
}, false);

addEventsToInput(newslink);

let option;
for (let i = 0, length = dropdownNews.length; i !== length; i++) {
    option           = document.createElement('option');
    option.value     = dropdownNews[i].regexp;
    option.innerHTML = dropdownNews[i].title + ' (' + dropdownNews[i].link + ')';
    newsregexpdropdown.appendChild(option);
}

viewdatamanagement.innerHTML = chromeI18n('datamanagement');
importdata.innerHTML         = chromeI18n('importdata');
exportdata.innerHTML         = chromeI18n('exportdata');

importdatah.addEventListener('change', function (event) {
    let file    = new FileReader();
    file.onload = function (e) {
        event.target.value = '';
        try {
            parseArrays(JSON.parse(e.target.result).arrays);
            let body;
            for (let type in arrays) {
                body = document.getElementById(type + 'body');
                while (body.childElementCount !== 1)
                    body.removeChild(body.firstElementChild);
            }
            checkArrays();
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

moment.locale(window.navigator.language);

chrome.storage.local.get(null, function (items) {
    let settings;
    if (!('settings' in items)) {
        settings = 'viewseries';
        chrome.storage.local.set({ settings: settings });
    }
    else settings = items.settings;
    document.getElementById(settings).classList.add('active');
    document.getElementById(settings + 'content').hidden = false;
    parseArrays(items.arrays);
    checkArrays();
});
