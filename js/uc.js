const chromeI18n        = chrome.i18n.getMessage;
const getFavicon        = 'http://www.google.com/s2/favicons?domain_url=';
var settings            = { homeview: 'viewseries' };
var files               = {};
var arrays, date, timeout;

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

function writeSettings() {
    chrome.storage.local.set({ settings: settings });
}

function parseSettings(tmpSettings) {
    for (let key in tmpSettings) {
        if (key in settings)
            settings[key] = tmpSettings[key];
    }
    writeSettings();
}

function toggleHeaderActive(e) {
    var element                                                 = e.target;
    var activeHeader                                            = element.parentElement.getElementsByClassName('active')[0];
    document.getElementById(activeHeader.id + 'content').hidden = true;
    activeHeader.classList.remove('active');
    element.classList.add('active');
    document.getElementById(element.id + 'content').hidden = false;
    settings.homeview                                      = element.id;
    writeSettings();
}

function writeArrays() {
    chrome.storage.local.set({ arrays: arrays });
}

function parseArrays(tmpArrays) {
    arrays = { news: [], series: [], movies: [], blurays: [] };
    for (let key in tmpArrays) {
        if (key in arrays)
            arrays[key] = tmpArrays[key];
    }
    if (tmpArrays != null) {
        for (let i = 0, length = arrays.news.length; i != length; i++)
            delete arrays.news[i].name;
        if (tmpArrays.rss != null) {
            for (let i = 0, length = tmpArrays.rss.length; i != length; i++)
                arrays.news.push({ link: tmpArrays.rss[i].link, regexp: '', current: tmpArrays.rss[i].current });
        }
    }
    writeArrays();
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
    for (let i = 0, headers = header.children, length = headers.length; i != length; i++) {
        headers[i].innerHTML = chromeI18n(headers[i].id);
        headers[i].addEventListener('click', toggleHeaderActive, false);

        let ths = document.getElementById(headers[i].id + 'content').firstElementChild.firstElementChild.firstElementChild.children;
        for (let i = 1, length = ths.length; i != length; i++)
            ths[i].innerHTML = chromeI18n(ths[i].id);
    }

    restore.value          = chromeI18n('restore');
    backup.value           = chromeI18n('backup');

    newslink.placeholder   = chromeI18n('link');
    newsregexp.placeholder = chromeI18n('regexp');
    newsadd.innerHTML      = chromeI18n('add');

    chrome.storage.local.get(null, function (items) {
        parseSettings(items.settings);
        document.getElementById(settings.homeview).classList.add('active');
        document.getElementById(settings.homeview + 'content').hidden = false;

        date         = moment().startOf('day');
        let year     = date.year();
        let months   = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        let month    = date.month();
        let days     = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];
        Serie.regExpDate = new RegExp('<h4>Season (\\d{1,}), Episode (\\d{1,}): <a href="[^"]*">([^<]*)</a></h4><b>(\\d{1,2} [A-S][a-z]+ ' + (year + 1) + '|\\d{1,2} (' + months.splice(month + 1, 12).join('|') + ') ' + year + '|(' + days.splice(date.date() - 1, 31).join('|') + ') ' + months[month] + ' ' + year + ')</b>');
        moment.locale(window.navigator.language);

        parseArrays(items.arrays);
        checkAll(arrays);
    });
}, false);

function checkAll() {
    let toCheck = [];
    let arrayType, i, length;
    for (let type in arrays) {
        arrayType = arrays[type];

        switch (type) {
            case 'series':
                for (i = 0, length = arrayType.length; i != length; i++)
                    toCheck.push(new Serie(arrayType[i]));
                break;
            case 'movies':
                for (i = 0, length = arrayType.length; i != length; i++)
                    toCheck.push(new Movie(arrayType[i]));
                break;
            case 'blurays':
                for (i = 0, length = arrayType.length; i != length; i++)
                    toCheck.push(new Bluray(arrayType[i]));
                break;
            case 'news':
                for (i = 0, length = arrayType.length; i != length; i++)
                    toCheck.push(new New(arrayType[i]));
                break;
        }
    }
    for (i = 0, length = toCheck.length; i != length; i++)
        toCheck[i].check();
}

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

addEventsToDropdowns(newsregexpdropdown);

function removeError(e) {
    e.target.className = '';
}

function addEventsToInput(input) {
    input.addEventListener('keydown', removeError, false);
    input.addEventListener('input', removeError, false);
    input.addEventListener('click', removeError, false);
}

addEventsToInput(newslink);
addEventsToInput(newsregexp);

function addSearch(type, classType, typeName, typeSelect, typeAdd) {
    typeName.placeholder                   = chromeI18n('name');
    typeSelect.firstElementChild.innerHTML = chromeI18n('noresults');
    typeAdd.innerHTML                      = chromeI18n('add');

    addEventsToInput(typeName);

    typeAdd.addEventListener('click', function () {
        typeName.click();
        let value = typeSelect.value;
        if (value == '')
            typeName.classList.add('invalid');
        else {
            let arrayType = arrays[type];
            let toCheck   = new classType(arrayType[arrayType.push(value) - 1]);
            writeArrays();
            toCheck.check();
            typeName.value       = '';
            typeSelect.innerHTML = '<option value="" selected disabled>' + chromeI18n('noresults') + '</option>';
        }
    }, false);
}

addSearch('series', Serie, seriesname, seriesselect, seriesadd);
addSearch('movies', Movie, moviesname, moviesselect, moviesadd);
addSearch('blurays', Bluray, bluraysname, bluraysselect, bluraysadd);

function getSearch(type, typeName, typeSelect, link, onDone) {
    typeName.click();
    typeSelect.click();
    typeSelect.innerHTML = '<option value="" selected disabled>' + chromeI18n('noresults') + '</option>';
    let string           = typeName.value.trim();
    if (string != '') {
        try {
            files[type].onreadystatechange = null;
            files[type].abort();
        }
        catch (err) {}

        typeName.classList.add('loading');
        files[type] = new XMLHttpRequest();

        if (type == 'blurays') {
            files[type].open('POST', link, true);
            files[type].setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        }
        else {
            files[type].open('GET', link + encodeURIComponent(string), true);
            files[type].setRequestHeader('Pragma', 'no-cache');
            files[type].setRequestHeader('Cache-Control', 'no-cache, must-revalidate');
        }

        files[type].onreadystatechange = function () {
            if (files[type].readyState == XMLHttpRequest.DONE) {
                typeName.classList.remove('loading');
                if (files[type].status != 200)
                    typeName.classList.add('invalid');
                else {
                    typeSelect.innerHTML = onDone(files[type].responseText);
                    if (typeSelect.innerHTML == '') {
                        typeSelect.innerHTML = '<option value="" selected disabled>' + chromeI18n('noresults') + '</option>';
                        typeName.classList.add('invalid');
                    }
                }
            }
        };
        if (type == 'blurays')
            files[type].send('userid=-1&country=all&section=bluraymovies&keyword='+ encodeURIComponent(string));
        else files[type].send();
    }
}

seriesname.addEventListener('keyup', Serie.parse, false);
seriesname.addEventListener('search', Serie.parse, false);
moviesname.addEventListener('keyup', Movie.parse, false);
moviesname.addEventListener('search', Movie.parse, false);
bluraysname.addEventListener('keyup', Bluray.parse, false);
bluraysname.addEventListener('search', Bluray.parse, false);

newsadd.addEventListener('click', function () {
    New.parseNews('', '', newslink, newsregexp);
}, false);

restoreh.addEventListener('change', function (event) {
    let file    = new FileReader();
    file.onload = function (e) {
        event.target.value = '';
        try {
            parseArrays(JSON.parse(e.target.result).arrays);
            checkAll(arrays);
        }
        catch (err) {
            clearTimeout(timeout);
            restore.classList.add('redlike');
            restore.value = chromeI18n('jsoncompliant');
            timeout       = setTimeout(function () {
                restore.value = chromeI18n('restore');
                restore.classList.remove('redlike');
            }, 3000);
        }
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
