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
const getFavicon        = 'http://www.google.com/s2/favicons?domain_url=';
var settings            = { 'homeview': 'viewseries' };
var files               = {};
var arrays, regExpSeries, date, timeout;

for (let i = 0, tmp, elements = document.getElementsByTagName('*'), length = elements.length; i != length; i++) {
    tmp = elements[i].id;
    if (tmp != '')
        window[tmp] = elements[i];
}

function writeSettings() {
    chrome.storage.local.set({ 'settings': settings });
}

function toggleHeaderActive(e) {
    var element                                                 = e.target;
    var activeHeader                                            = element.parentElement.getElementsByClassName('active')[0];
    document.getElementById(activeHeader.id + 'content').hidden = true;
    activeHeader.classList.remove('active');
    element.classList.add('active');
    document.getElementById(element.id + 'content').hidden = false;
    settings['homeview']                                   = element.id;
    writeSettings();
}

function writeArrays() {
    chrome.storage.local.set({ 'arrays': arrays });
}

function parseSettings(tmpSettings) {
    for (let key in tmpSettings) {
        if (key in settings)
            settings[key] = tmpSettings[key];
    }
    writeSettings();
}

function parseArrays(tmpArrays) {
    arrays = { 'news': [], 'series': [], 'movies': [], 'blurays': [] };
    for (let key in tmpArrays) {
        if (key in arrays)
            arrays[key] = tmpArrays[key];
    }
    if (tmpArrays != null && tmpArrays['rss'] != null) {
        for (let i = 0, length = tmpArrays['rss'].length; i != length; i++)
            arrays['news'].push({ 'name': '', 'link': tmpArrays['rss'][i]['link'], 'regexp': '', 'current': tmpArrays['rss'][i]['current'] });
    }
    writeArrays();
}

function deleteDynamicSMB(type, value) {
    let i = objectInArray(value, arrays[type]);
    if (i != -1) {
        arrays[type].splice(i, 1);
        writeArrays();
    }
}

var deleteDynamic = {
    'news': function (type, value) {
        let i = propertyInArray(value, 'link', arrays[type]);
        if (i != -1) {
            arrays[type].splice(i, 1);
            writeArrays();
        }
    },
    'series': deleteDynamicSMB,
    'movies': deleteDynamicSMB,
    'blurays': deleteDynamicSMB
};

function writeDynamic(type, value, cur) {
    let i = propertyInArray(value, 'link', arrays[type]);
    if (i != -1) {
        arrays[type][i]['current'] = cur;
        writeArrays();
    }
}

window.addEventListener('load', function () {
    for (let i = 0, headers = header.children, length = headers.length; i != length; i++) {
        headers[i].innerHTML = chromeI18n(headers[i].id);
        headers[i].addEventListener('click', toggleHeaderActive, false);

        let ths = document.getElementById(headers[i].id + 'content').firstElementChild.firstElementChild.firstElementChild.children;
        for (let i = 0, length = ths.length; i != length; i++)
            ths[i].innerHTML = chromeI18n(ths[i].id);
    }

    chrome.storage.local.get(null, function (items) {
        parseSettings(items['settings']);
        document.getElementById(settings['homeview']).classList.add('active');
        document.getElementById(settings['homeview'] + 'content').hidden = false;

        parseArrays(items['arrays']);
        displayAll(arrays);
        // checkAll(arrays);
    });

    restore.value              = chromeI18n('restore');
    backup.value               = chromeI18n('backup');

    newsname.placeholder       = chromeI18n('name');
    newslink.placeholder       = chromeI18n('link');
    newsregexp.placeholder     = chromeI18n('regexp');
    newsvalid.value            = chromeI18n('add');

    newsnameedit.placeholder   = chromeI18n('name');
    newslinkedit.placeholder   = chromeI18n('link');
    newsregexpedit.placeholder = chromeI18n('regexp');
    newscanceledit.value       = chromeI18n('cancel');
    newsvalidedit.value        = chromeI18n('ok');

    confirmtext.innerHTML      = chromeI18n('confirm');
    confirmno.value            = chromeI18n('no');
    confirmyes.value           = chromeI18n('yes');
}, false);

function displayAll() {
    let arrayType, i, length, tr;
    for (let type in arrays) {
        arrayType = arrays[type];

        switch (type) {
            case 'series':
                for (i = 0, length = arrayType.length; i != length; i++)
                    (new Serie(arrayType[i]));
                break;
            /*case 'movies':
                for (i = 0, length = arrayType.length; i != length; i++)
                    (new Movie(arrayType[i]));
                break;
            case 'blurays':
                for (i = 0, length = arrayType.length; i != length; i++)
                    (new Bluray(arrayType[i]));
                break;
            case 'news':
                for (i = 0, length = arrayType.length; i != length; i++)
                    (new New(arrayType[i]));
                break;*/
        }
    }
}

var dropdownNews = [
    { 'title': 'Chrome Web Store', 'link': 'https://chrome.google.com/webstore/detail/*', 'regexp': 'itemprop="version" content="([^"]*)' },
    { 'title': 'Facebook', 'link': 'https://www.facebook.com*', 'regexp': 'id="requestsCountValue">([^<]*)</span> <i class="accessible_elem">([^<]*)<(/).*id="mercurymessagesCountValue">([^<]*)</span> <i class="accessible_elem">([^<]*)<(/).*id="notificationsCountValue">([^<]*)</span> <i class="accessible_elem">([^<]*)' },
    { 'title': 'Google Play Store Apps', 'link': 'https://play.google.com/store/apps/details?id=*', 'regexp': 'itemprop="softwareVersion"> v(\\S*)' },
    { 'title': 'Outlook', 'link': 'https://*.mail.live.com*', 'regexp': '<span\\s+class="count">\\s*([^<]*)(?:<[^>]*>[^<]*){17}<span\\s+class="count">\\s*([^<]*)' },
    { 'title': 'RuTracker', 'link': 'http://rutracker.org/forum/tracker.php?nm=*', 'regexp': 'data-topic_id=.* href="([^"]*)' },
    { 'title': 'YouTube', 'link': 'https://www.youtube.com/*/*/videos', 'regexp': 'class="yt-lockup-title "><a [^>]*>([^<]*)' }
];

function linkToRegExp(link) {
    return new RegExp('^' + link.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&').replace(/^https?:\/\/(www\\\.)?/, 'https?://(www\\.)?').replace(/\\\*/g, '.*'));
}

function addEventsToDropdowns(newslink, newsregexphelp, newsregexp, newsregexpdropdown) {
    function highlightDropdowns() {
        let link   = newslink.value.trim();
        let regexp = newsregexp.value.trim();
        let i, length;
        for (i = 0, length = dropdownNews.length; i != length; i++) {
            if ((regexp != '' || link != '') && (regexp == '' || dropdownNews[i]['regexp'] == regexp) && (link == '' || link.match(linkToRegExp(dropdownNews[i]['link'])))) {
                newsregexpdropdown.children[i].firstElementChild.classList.add('greenlike');
                break;
            }
            newsregexpdropdown.children[i].firstElementChild.classList.remove('greenlike');
        }
        if (i != length) {
            newsregexphelp.classList.add('highlight');
            for (i++; i != length; i++)
                newsregexpdropdown.children[i].firstElementChild.classList.remove('greenlike');
        }
        else newsregexphelp.classList.remove('highlight');
    }

    newslink.addEventListener('input', highlightDropdowns, false);
    newsregexp.addEventListener('input', highlightDropdowns, false);
    newsregexp.addEventListener('click', highlightDropdowns, false);

    newsregexphelp.title = chromeI18n('help');
    newsregexphelp.addEventListener('click', function () {
        newsregexpdropdown.classList.add('visible');
    }, false);

    for (let i = 0, length = dropdownNews.length; i != length; i++) {
        let li       = document.createElement('li');
        li.innerHTML = '<a name="' + i + '">' + dropdownNews[i]['title'] + ' (' + dropdownNews[i]['link'] + ')</a>';
        li.firstElementChild.addEventListener('click', function (e) {
            newsregexp.value = dropdownNews[parseInt(e.target.name)]['regexp'];
            newsregexpdropdown.classList.remove('visible');
        }, false);
        newsregexpdropdown.appendChild(li)
    }
}

addEventsToDropdowns(newslink, newsregexphelp, newsregexp, newsregexpdropdown);
addEventsToDropdowns(newslinkedit, newsregexphelpedit, newsregexpedit, newsregexpdropdownedit);

document.addEventListener('click', function (e) {
    let potentialNewsRegExp = e.target.parentElement;
    if (potentialNewsRegExp == null || potentialNewsRegExp.lastElementChild == null || (potentialNewsRegExp.lastElementChild != newsregexpdropdown && potentialNewsRegExp.lastElementChild != newsregexpdropdownedit)) {
        newsregexpdropdown.classList.remove('visible');
        newsregexpdropdownedit.classList.remove('visible');
    }
}, false);

function removeError(e) {
    if (e.target.classList.contains('error')) {
        e.target.classList.remove('error');
        document.getElementById(e.target.id + 'span').innerHTML = '';
    }
}

function addEventsToInputs(typeValid) {
    for (let i = 0, inputs = document.body.getElementsByClassName('checkout-input'), length = inputs.length; i != length; i++) {
        inputs[i].addEventListener('keydown', removeError, false);
        inputs[i].addEventListener('input', removeError, false);
        inputs[i].addEventListener('click', removeError, false);

        inputs[i].addEventListener('keypress', function (e) {
            if (e.keyCode == 13)
                typeValid.click();
        }, false);
    }
}

addEventsToInputs(newsvalid);
addEventsToInputs(newsvalidedit);

function addSearchValid(type, typeName, typeSearch, typeResults, typeButtons, typeValid, typeCancel) {
    typeName.placeholder = chromeI18n('name');
    typeSearch.value     = chromeI18n('search');
    typeValid.value      = chromeI18n('add');
    typeCancel.value     = chromeI18n('cancel');

    addEventsToInputs(typeSearch);

    typeValid.addEventListener('click', function () {
        let array = arrays[type], checked = typeResults.getElementsByTagName('input');
        for (let i = 0, length = checked.length; i != length; i++) {
            if (checked[i].checked && objectInArray(checked[i].value, array) == -1)
                getLinkAll(type, array[array.push(checked[i].value) - 1]);
        }
        writeArrays();
        typeName.value     = '';
        typeResults.hidden = true;
        typeButtons.classList.add('hidden');
    }, false);

    typeCancel.addEventListener('click', function () {
        typeName.value     = '';
        typeResults.hidden = true;
        typeButtons.classList.add('hidden');
    }, false);
}

addSearchValid('series', seriesname, seriessearch, seriesresults, seriesbuttons, seriesvalid, seriescancel);
addSearchValid('movies', moviesname, moviessearch, moviesresults, moviesbuttons, moviesvalid, moviescancel);
addSearchValid('blurays', bluraysname, blurayssearch, bluraysresults, bluraysbuttons,bluraysvalid, blurayscancel);

function showError(string, element, elementspan) {
    element.classList.add('error');
    elementspan.innerHTML = string;
}

function getSearch(type, typeName, typeNameSpan, typeResults, typeButtons, link, toDoSuccess, toDoError) {
    typeName.click();
    let string = typeName.value.trim();
    if (string == '') {
        showError(chromeI18n('empty'), typeName, typeNameSpan);
        return;
    }
    typeResults.hidden = true;
    typeButtons.classList.add('hidden');

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
            if (files[type].status == 200) {
                let output            = toDoSuccess(files[type].responseText, arrays[type]);
                typeResults.innerHTML = output;
                if (output != '') {
                    typeResults.hidden    = false;
                    typeResults.scrollTop = 0;
                    typeButtons.classList.remove('hidden');
                }
                else showError(chromeI18n('noresults'), typeName, typeNameSpan);
            }
            else showError(chromeI18n('unreachable'), typeName, typeNameSpan);
        }
    };
    if (type == 'blurays')
        files[type].send('userid=-1&country=all&section=bluraymovies&keyword='+ encodeURIComponent(string));
    else files[type].send();
}

seriessearch.addEventListener('click', function () {
    getSearch('series', seriesname, seriesnamespan, seriesresults, seriesbuttons,
        'http://www.imdb.com/find?s=tt&q=',
        function (response, array) {
            let regExp = /class="result_text"> <a href="\/title\/(tt[^\/]*)\/[^>]*>([^<]*)<\/a>([^<]*) /g, tmp, output = '';
            while ((tmp = regExp.exec(response)) != null)
                if (tmp[3].match(/Series\)/))
                    output += '<label><input type="checkbox" class="tasks-list-cb" value="' + tmp[1] + (objectInArray(tmp[1], array) == -1 ? '"><span class="tasks-list-mark"></span></label><a href="' : '" disabled><span class="tasks-list-mark"></span></label><a href="') + imdb + tmp[1] + '" target="_blank">' + tmp[2] + tmp[3] + '</a></br>';
            return output;
        }
    );
}, false);

moviessearch.addEventListener('click', function () {
    getSearch('movies', moviesname, moviesnamespan, moviesresults, moviesbuttons,
        'http://www.imdb.com/find?s=tt&q=',
        function (response, array) {
            let regExp = /class="result_text"> <a href="\/title\/(tt[^\/]*)\/[^>]*>([^<]*)<\/a>([^<]*) /g, tmp, output = '';
            while ((tmp = regExp.exec(response)) != null)
                if (!tmp[3].match(/Series\)/) && !tmp[3].match(/\(Video Game\)/) && !tmp[3].match(/\(Video\)/) && !tmp[3].match(/\(TV Episode\)/))
                    output += '<label><input type="checkbox" class="tasks-list-cb" value="' + tmp[1] + (objectInArray(tmp[1], array) == -1 ? '"><span class="tasks-list-mark"></span></label><a href="' : '" disabled><span class="tasks-list-mark"></span></label><a href="') + imdb + tmp[1] + '" target="_blank">' + tmp[2] + tmp[3] + '</a></br>';
            return output;
        }
    );
}, false);

blurayssearch.addEventListener('click', function () {
    getSearch('blurays', bluraysname, bluraysnamespan, bluraysresults, bluraysbuttons,
        'http://www.blu-ray.com/search/quicksearch.php',
        function (response, array) {
            let tmp = response.match(/var urls = new Array\(([^\)]*)/), output = '';
            if (tmp == null)
                return output;
            let URLs   = tmp[1].replace(/'|http:\/\/www\.blu-ray\.com\/movies\//g, '').split(', ');
            let regExp = /<img src="([^"]*)" [^>]*>&nbsp;([^\n<]*)/g;
            for (let i = 0; (tmp = regExp.exec(response)) != null; i++)
                output += '<label><input type="checkbox" class="tasks-list-cb" value="' + URLs[i] + (objectInArray(URLs[i], array) == -1 ? '"><span class="tasks-list-mark"></span></label><a href="' : '" disabled><span class="tasks-list-mark"></span></label><a href="') + bluray + URLs[i] + '" target="_blank">' + tmp[2] + '</a> <img src="' + tmp[1] + '"></br>';
            return output;
        }
    );
}, false);

function removeElement(typeDom, li, type, value, fade) {
    typeDom.removeChild(li);
    deleteDynamic[type](type, value);
    fade.click();
}

function parseNews(current, save, newsname, newsnamespan, newslink, newslinkspan, newsregexp, newsregexpspan, typeDom, li, type, value, newsfade) {
    newsname.click();
    newslink.click();
    newsregexp.click();
    let name         = newsname.value.trim(), link = newslink.value.trim(), regexp = newsregexp.value.trim();
    let errorOccured = false;
    if (link == '') {
        showError(chromeI18n('empty'), newslink, newslinkspan);
        errorOccured = true;
    }
    let aN = arrays['news'];
    if (save != link && propertyInArray(link, 'link', aN) != -1) {
        showError(chromeI18n('alreadyexists'), newslink, newslinkspan);
        errorOccured = true;
    }
    if (errorOccured)
        return;
    if (typeDom)
        removeElement(typeDom, li, type, value, newsfade);
    else {
        newsname.value   = '';
        newslink.value   = '';
        newsregexp.value = '';
        newsregexp.click();
    }
    getLinkAll('news', aN[aN.push({ 'name': name, 'link': link, 'regexp': regexp, 'current': current }) - 1]);
    writeArrays();
}

newsvalid.addEventListener('click', function () {
    parseNews('', '', newsname, newsnamespan, newslink, newslinkspan, newsregexp, newsregexpspan);
}, false);

function addDelete(li, typeDom, type, value) {
    let img       = document.createElement('img');
    img.className = 'button';
    img.src       = '/img/delete.png';
    img.title     = chromeI18n('delete');
    img.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        confirmyes.onclick = function () {
            removeElement(typeDom, li, type, value, confirmfade);
        };
        confirmlight.classList.add('visible');
        confirmfade.classList.add('visible');
    }, false);
    li.firstElementChild.appendChild(img);
}

function addEdit(li, typeDom, type, valueObject, value) {
    let img       = document.createElement('img');
    img.className = 'button';
    img.src       = '/img/edit.png';
    img.title     = chromeI18n('edit');
    img.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        newsnameedit.value   = valueObject['name'];
        newslinkedit.value   = valueObject['link'];
        newsregexpedit.value = valueObject['regexp'];
        newsnameedit.click();
        newslinkedit.click();
        newsregexpedit.click();
        newsvalidedit.onclick = function () {
            parseNews(valueObject['current'], valueObject['link'], newsnameedit, newsnameeditspan, newslinkedit, newslinkeditspan, newsregexpedit, newsregexpeditspan, typeDom, li, type, value, newsfade);
        };
        newslight.classList.add('visible');
        newsfade.classList.add('visible');
    }, false);
    li.firstElementChild.appendChild(img);
}

function confirmFadeClick() {
    confirmlight.classList.remove('visible');
    confirmfade.classList.remove('visible');
}

function newsFadeClick() {
    newslight.classList.remove('visible');
    newsfade.classList.remove('visible');
}

confirmfade.addEventListener('click', confirmFadeClick, false);
newsfade.addEventListener('click', newsFadeClick, false);
confirmno.addEventListener('click', confirmFadeClick, false);
newscanceledit.addEventListener('click', newsFadeClick, false);

function escapeHTML(result) {
    return result.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttribute(result) {
    return escapeHTML(result).replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
}

function sortNews(typeDom, type, value, link, name, text, current) {
    let tr      = document.createElement('tr');
    let tmpName = ' ' + escapeHTML(name) + ' ';
    let j = 1, children = typeDom.children, length = children.length;
    if (text == null) {
        tr.innerHTML = '<td><a href="' + escapeAttribute(link) + '" target="_blank"></a></td><td><img src="' + getFavicon + escape(link) + '">' + escapeHTML(name).replace(/:\/\/([^@]*)@/, '://***@') + '</td><td>' + chromeI18n(text === null ? 'unreachable' : 'error') + '</td>';
        tr.firstElementChild.addEventListener('click', (function (_tr) {
            return function () {
                typeDom.removeChild(_tr);
                getLinkAll(type, value);
            };
        })(tr), false);
        for ( ; j != length && children[j].firstElementChild.firstElementChild.lastElementChild.className == 'red' && compareStrings(children[j].firstElementChild.firstElementChild.childNodes[1].nodeValue, tmpName) < 0; j++) ;
    }
    else if (current == null) {
        tr.innerHTML = '<a class="widget-list-link" href="' + escapeAttribute(link) + '" target="_blank"><div class="news"><img src="' + getFavicon + escape(link) + '"> ' + escapeHTML(name) + ' <span>' + escapeHTML(text) + '</span></div></a>';
        for ( ; j != length && children[j].firstElementChild.firstElementChild.lastElementChild.className == 'red'; j++) ;
        for ( ; j != length && children[j].firstElementChild.firstElementChild.lastElementChild.className == 'green'; j++) ;
        for ( ; j != length && compareStrings(children[j].firstElementChild.firstElementChild.childNodes[1].nodeValue, tmpName) < 0; j++) ;
    }
    else {
        tr.innerHTML = '<a class="widget-list-link" href="' + escapeAttribute(link) + '" target="_blank"><div class="news"><img src="' + getFavicon + escape(link) + '"> ' + escapeHTML(name) + ' <span class="green">' + escapeHTML(text) + '</span></div></a>';
        tr.firstElementChild.addEventListener('click', (function (_tr) {
            return function () {
                writeDynamic(type, value['link'], current);
                typeDom.removeChild(_tr);
                getLinkAll(type, value);
            };
        })(tr), false);
        for ( ; j != length && children[j].firstElementChild.firstElementChild.lastElementChild.className == 'red'; j++) ;
        for ( ; j != length && children[j].firstElementChild.firstElementChild.lastElementChild.className == 'green' && compareStrings(children[j].firstElementChild.firstElementChild.childNodes[1].nodeValue, tmpName) < 0; j++) ;
    }
    typeDom.insertBefore(li, j != length ? children[j] : null);
    addDelete(li, typeDom, type, value['link']);
    addEdit(li, typeDom, type, value, value['link']);
}

function sortSMB(typeDom, website, type, value, name, icon, tmpDate, green) {
    let li      = document.createElement('li');
    let current = (name == null ? website + value : name) + ' ';
    let j = 1, children = typeDom.children, length = children.length;
    if (name == null) {
        li.innerHTML = '<a class="widget-list-link" href="' + website + value + '" target="_blank"><img class="full" src=""><div>' + website + value + ' <span class="red">' + chromeI18n(name === null ? 'unreachable' : 'error') + '</span></div></a>';
        li.firstElementChild.addEventListener('click', (function (_li) {
            return function () {
                typeDom.removeChild(_li);
                getLinkAll(type, value);
            };
        })(li), false);
        for ( ; j != length && children[j].firstElementChild.children[1].lastElementChild.className == 'red' && compareStrings(children[j].firstElementChild.children[1].childNodes[0].nodeValue, current) < 0; j++) ;
    }
    else if (tmpDate == null) {
        li.innerHTML = '<a class="widget-list-link" href="' + website + value + '" target="_blank"><img class="full" src="' + (icon == null ? '' : icon[1]) + '"><div>' + name + ' <span>-</span></div></a>';
        for ( ; j != length && children[j].firstElementChild.children[1].lastElementChild.innerHTML != '-'; j++) ;
        for ( ; j != length && compareStrings(children[j].firstElementChild.children[1].childNodes[0].nodeValue, current) < 0; j++) ;
    }
    else {
        li.innerHTML = '<a class="widget-list-link" href="' + website + value + '" target="_blank"><img class="full" src="' + (icon == null ? '' : icon[1]) + '"><div>' + name + ' <span' + (green ? ' class="green"' : '') + '>' + tmpDate.format('LL') + '</span></div></a>';
        let val;
        for ( ; j != length; j++) {
            val = children[j].firstElementChild.children[1].lastElementChild.innerHTML;
            if (val == '-' || !tmpDate.isAfter(moment(val, 'LL')))
                break;
        }
        for ( ; j != length; j++) {
            val = children[j].firstElementChild.children[1].lastElementChild.innerHTML;
            if (val == '-' || !tmpDate.isSame(moment(val, 'LL')) || compareStrings(children[j].firstElementChild.children[1].childNodes[0].nodeValue, current) > 0)
                break;
        }
    }
    typeDom.insertBefore(li, j != length ? children[j] : null);
    addDelete(li, typeDom, type, value);
}

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
            sortNews(viewnews, type, value, value['link'], name, null);
        else if (value['regexp'] == '') {
            let rssParser = new RSSParser(response, value['current']);
            if (rssParser.getErrorFlag())
                sortNews(viewnews, type, value, value['link'], name);
            else {
                if (value['name'] == '')
                    name = rssParser.getName();
                let newItemCount = rssParser.getNewItemCount();
                sortNews(viewnews, type, value, rssParser.getLink(), name, chrome.i18n.getMessage('newitems', [newItemCount]), newItemCount != 0 ? rssParser.getNewDate() : null);
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
                sortNews(viewnews, type, value, value['link'], name, result, result != value['current'] ? result : null);
            }
            catch (err) {
                sortNews(viewnews, type, value, value['link'], name);
            }
        }
    },

    'series': function (type, value, status, response) {
        if (!status)
            sortSMB(viewseries, imdb, type, value, null);
        else {
            let name = response.match(regExpSeriesName);
            if (name != null) {
                let result = response.match(regExpSeries);
                if (result != null) {
                    let tmpDate = moment(new Date(result[4]));
                    sortSMB(viewseries, imdb, type, value,
                        name[1] + ' S' + convertIntTo2Int(result[1]) + 'E' + convertIntTo2Int(result[2]) + (/^Episode #/.test(result[3]) ? '' : ': ' + result[3]), response.match(regExpSeriesIcon), tmpDate, !tmpDate.isAfter(date));
                }
                else sortSMB(viewseries, imdb, type, value, name[1], response.match(regExpSeriesIcon));
            }
            else sortSMB(viewseries, imdb, type, value);
        }
    },

    'movies': function (type, value, status, response) {
        if (!status)
            sortSMB(viewmovies, imdb, type, value, null);
        else {
            let name = response.match(regExpMoviesName);
            if (name != null) {
                let result = response.match(regExpMovies);
                if (result != null && iso.findCountryByName(result[3])['value'] == result[1]) {
                    let tmpDate = moment(new Date(result[2]));
                    sortSMB(viewmovies, imdb, type, value, name[1], response.match(regExpMoviesIcon), tmpDate, !tmpDate.isAfter(date));
                }
                else sortSMB(viewmovies, imdb, type, value, name[1], response.match(regExpMoviesIcon));
            }
            else sortSMB(viewmovies, imdb, type, value);
        }
    },

    'blurays': function (type, value, status, response) {
        if (!status)
            sortSMB(viewblurays, bluray, type, value, null);
        else {
            let name = response.match(regExpBluraysName);
            if (name != null) {
                name       = name.length == 3 ? name[1] + ' <img src="' + name[2] + '">' : name[1];
                let result = response.match(regExpBlurays);
                if (result != null) {
                    let tmpDate = moment(new Date(result[1]));
                    sortSMB(viewblurays, bluray, type, value, name, response.match(regExpBluraysIcon), tmpDate, !tmpDate.isAfter(date));
                }
                else sortSMB(viewblurays, bluray, type, value, name, response.match(regExpBluraysIcon));
            }
            else sortSMB(viewblurays, bluray, type, value);
        }
    }
};

restoreh.addEventListener('change', function (event) {
    let file    = new FileReader();
    file.onload = function (e) {
        event.target.value = '';
        try {
            parseArrays(JSON.parse(e.target.result)['arrays']);
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
    a.href     = window.URL.createObjectURL(new Blob([JSON.stringify({ 'arrays': arrays }, null, 4)], { 'type': 'text/plain;charset=UTF-8' }));
    a.click();
    window.URL.revokeObjectURL(a.href);
}, false);
