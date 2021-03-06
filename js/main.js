const dropdownNews = [
    { title: 'Chrome Web Store Extension Version', link: 'https://chrome.google.com/webstore/detail/*', regexp: 'itemprop="version" content="([^"]*)' },
    { title: 'Facebook Page Last Post', link: 'https://www.facebook.com/*', regexp: 'class="_5pcq"[^>]*><abbr title="([^"]*)' },
    { title: 'RuTracker Search Last Thread', link: 'http://rutracker.org/forum/tracker.php?nm=*', regexp: 'data-topic_id="([^"]*)' },
    { title: 'YouTube Channel Last Video', link: 'https://www.youtube.com/*/*/videos', regexp: 'class="yt-lockup-title "><a [^>]*>([^<]*)' }
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

function removeInvalid(e) {
    e.target.classList.remove('invalid');
}

function addEventsToInput(input) {
    input.addEventListener('keydown', removeInvalid, false);
    input.addEventListener('input', removeInvalid, false);
    input.addEventListener('click', removeInvalid, false);
}

function addEventsToInputsSMB(type, classType, name, results, add, body, expand) {
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
            let object     = results.firstElementChild.value;
            arrays[type].push(object);
            writeArrays();
            (new classType(object)).check();
        }
    }, false);

    expand.addEventListener('click', function () {
        let hide = expand.innerHTML !== chrome.i18n.getMessage('expand');
        let trs  = body.children;
        for (let i = trs.length - 2; i !== -1 && (trs[i].obj.color === 'empty' || trs[i].obj.color === 'black'); i--)
            trs[i].hidden = hide;
        expand.innerHTML = chrome.i18n.getMessage(hide ? 'expand' : 'reduce');
    }, false);
}

addEventsToInputsSMB('series', Serie, seriesname, seriesresults, seriesadd, seriesbody, seriesexpand);
addEventsToInputsSMB('movies', Movie, moviesname, moviesresults, moviesadd, moviesbody, moviesexpand);
addEventsToInputsSMB('blurays', Bluray, bluraysname, bluraysresults, bluraysadd, bluraysbody, bluraysexpand);

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

opensavenews.addEventListener('click', function () {
    saveGreen('openSave');
}, false);

savenews.addEventListener('click', function () {
    saveGreen('save');
}, false);

recheckall.addEventListener('click', function () {
    let toReCheck = [];
    let trs, i, length;
    for (let type in arrays) {
        trs = document.getElementById(type + 'body').children;
        for (i = 0, length = trs.length - 1; i !== length; i++)
            toReCheck.push(trs[i].obj);
    }
    for (i = 0, length = toReCheck.length; i !== length; i++)
        toReCheck[i].reCheck();
}, false);

recheckerrors.addEventListener('click', function () {
    let toReCheck = [];
    let trs, i, length;
    for (let type in arrays) {
        trs = document.getElementById(type + 'body').children;
        for (i = 0, length = trs.length - 1; i !== length; i++) {
            if (trs[i].obj.color === 'red' || trs[i].obj.color === 'orange')
                toReCheck.push(trs[i].obj);
        }
    }
    for (i = 0, length = toReCheck.length; i !== length; i++)
        toReCheck[i].reCheck();
}, false);

newsadd.addEventListener('click', function () {
    New.parse();
}, false);

addEventsToInput(newslink);

newsexpand.addEventListener('click', function () {
    let hide = newsexpand.innerHTML !== chrome.i18n.getMessage('expand');
    let trs  = newsbody.children;
    for (let i = trs.length - 2; i !== -1 && trs[i].obj.color === 'black'; i--)
        trs[i].hidden = hide;
    newsexpand.innerHTML = chrome.i18n.getMessage(hide ? 'expand' : 'reduce');
}, false);

let option;
for (let i = 0, length = dropdownNews.length; i !== length; i++) {
    option           = document.createElement('option');
    option.value     = dropdownNews[i].regexp;
    option.innerHTML = dropdownNews[i].title + ' (' + dropdownNews[i].link + ')';
    newsregexpdropdown.appendChild(option);
}

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
    parseArrays(items.arrays);
    checkArrays();
});

// A SUPPRIMER DANS LONGTEMPS
chrome.storage.local.remove(['notifications', 'settings']);
