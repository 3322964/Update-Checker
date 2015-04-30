'use strict';

const getFavicon   = 'http://www.google.com/s2/favicons?domain_url=';
var backgroundPage = chrome.extension.getBackgroundPage();
var files          = {};

for (let i = 0, tmp, elements = document.getElementsByTagName('*'), length = elements.length; i != length; i++) {
    tmp = elements[i].id;
    if (tmp != '')
        window[tmp] = document.getElementById(tmp);
}

options.addEventListener('click', function() {
    chrome.tabs.query({ 'url': 'chrome-extension://' + chrome.runtime.id + '/options.html', 'currentWindow': true }, function(tabs) {
        if (tabs.length == 0)
            window.open('options.html');
        else chrome.tabs.update(tabs[0].id, { 'selected': true }, function() {});
    });
}, false);

window.addEventListener('load', function() {
    rsslink.placeholder         = chromeI18n('link');
    rssmaxitems.placeholder     = chromeI18n('maxitems');
    rssvalid.value              = chromeI18n('add');

    newsname.placeholder        = chromeI18n('name');
    newslink.placeholder        = chromeI18n('link');
    newsvalid.value             = chromeI18n('add');

    rsslinkedit.placeholder     = chromeI18n('link');
    rssmaxitemsedit.placeholder = chromeI18n('maxitems');
    rsscanceledit.value         = chromeI18n('cancel');
    rssvalidedit.value          = chromeI18n('ok');

    newsnameedit.placeholder    = chromeI18n('name');
    newslinkedit.placeholder    = chromeI18n('link');
    newscanceledit.value        = chromeI18n('cancel');
    newsvalidedit.value         = chromeI18n('ok');

    confirmtext.innerHTML       = chromeI18n('confirm');
    confirmno.value             = chromeI18n('no');
    confirmyes.value            = chromeI18n('yes');

    options.title               = chromeI18n('options');

    document.getElementById(backgroundPage.settings['hometab']).click();
    widget.hidden = false;
    let arrays    = backgroundPage.arrays;
    checkAll(arrays);
    for (let key in arrays)
        if (arrays[key].length == 0)
            updateProgress(key);
}, false);

var dropdownNews = [
    { 'title': 'Chrome Web Store', 'link': 'https://chrome.google.com/webstore/detail/*/details', 'regexp': 'itemprop="version" content="([^"]*)' },
    { 'title': 'Facebook', 'link': 'https://www.facebook.com*', 'regexp': 'id="requestsCountValue">([^<]*)</span><i class="accessible_elem"> ([^<]*)<(/).*id="mercurymessagesCountValue">([^<]*)</span><i class="accessible_elem"> ([^<]*)<(/).*id="notificationsCountValue">([^<]*)</span><i class="accessible_elem"> ([^<]*)' },
    { 'title': 'Google Play Store Apps', 'link': 'https://play.google.com/store/apps/details?id=*', 'regexp': 'itemprop="softwareVersion"> v(\\S*)' },
    { 'title': 'Outlook', 'link': 'https://*.mail.live.com*', 'regexp': '<span\\s+class="count">\\s*([^<]*)(?:<[^>]*>[^<]*){17}<span\\s+class="count">\\s*([^<]*)' },
    { 'title': 'RuTracker', 'link': 'http://rutracker.org/forum/tracker.php?nm=*', 'regexp': 'data-topic_id=.* href="([^"]*)' },
    { 'title': 'YouTube', 'link': 'https://www.youtube.com/user/*/videos', 'regexp': 'class="yt-lockup-title"><a [^>]*>([^<]*)' },
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
    newsregexphelp.addEventListener('click', function() {
        newsregexpdropdown.classList.add('visible');
    }, false);

    for (let i = 0, length = dropdownNews.length; i != length; i++) {
        let li       = document.createElement('li');
        li.innerHTML = '<a name="' + i + '">' + dropdownNews[i]['title'] + ' (' + dropdownNews[i]['link'] + ')</a>';
        li.firstElementChild.addEventListener('click', function(e) {
            newsregexp.value = dropdownNews[parseInt(e.target.name)]['regexp'];
            newsregexpdropdown.classList.remove('visible');
        }, false);
        newsregexpdropdown.appendChild(li)
    }
}
addEventsToDropdowns(newslink, newsregexphelp, newsregexp, newsregexpdropdown);
addEventsToDropdowns(newslinkedit, newsregexphelpedit, newsregexpedit, newsregexpdropdownedit);

document.addEventListener('click', function(e) {
    let potentialNewsRegExp = e.target.parentElement;
    if (potentialNewsRegExp == null || potentialNewsRegExp.lastElementChild == null || (potentialNewsRegExp.lastElementChild != newsregexpdropdown && potentialNewsRegExp.lastElementChild != newsregexpdropdownedit)) {
        newsregexpdropdown.classList.remove('visible');
        newsregexpdropdownedit.classList.remove('visible');
    }
}, false);

for (let i = 0, tab, list, lists = widget.getElementsByClassName('widget-list'), length = lists.length; i != length; i++) {
    list                        = lists[i];
    tab                         = document.getElementById(list.id + 'tab');
    tab.childNodes[0].nodeValue = chromeI18n(list.id) + ' ';

    tab.addEventListener('click', (function(currentTab, currentList) {
        return function() {
            widget.getElementsByClassName('active-list')[0].classList.remove('active-list');
            widget.getElementsByClassName('active-tab')[0].classList.remove('active-tab');
            currentTab.classList.add('active-tab');
            currentList.classList.add('active-list');
            backgroundPage.settings['hometab'] = currentTab.id;
            backgroundPage.writeSettings();
        };
    })(tab, list), false);
}

function removeError(e) {
    if (e.target.classList.contains('error')) {
        e.target.classList.remove('error');
        document.getElementById(e.target.id + 'span').innerHTML = '';
    }
}
function addEventsToInputs(typeDom, typeValid) {
    for (let i = 0, inputs = typeDom.getElementsByClassName('checkout-input'), length = inputs.length; i != length; i++) {
        inputs[i].addEventListener('keypress', function(e) {
            if (e.keyCode == 13)
                typeValid.click();
        }, false);
        inputs[i].addEventListener('keydown', removeError, false);
        inputs[i].addEventListener('click', removeError, false);
    }
}
addEventsToInputs(rss, rssvalid);
addEventsToInputs(rsslight, rssvalidedit);
addEventsToInputs(news, newsvalid);
addEventsToInputs(newslight, newsvalidedit);

function addSearchValid(type, typeDom, typeName, typeSearch, typeResults, typeButtons, typeValid, typeCancel) {
    typeName.placeholder = chromeI18n('name');
    typeSearch.value     = chromeI18n('search');
    typeValid.value      = chromeI18n('add');
    typeCancel.value     = chromeI18n('cancel');

    addEventsToInputs(typeDom, typeSearch);

    typeValid.addEventListener('click', function() {
        let array = backgroundPage.arrays[type], checked = typeResults.getElementsByTagName('input');
        for (let i = 0, length = checked.length; i != length; i++)
            if (checked[i].checked && objectInArray(checked[i].value, array) == -1)
                check[type](type, array[array.push(checked[i].value) - 1]);
        backgroundPage.writeArrays();
        typeName.value     = '';
        typeResults.hidden = true;
        typeButtons.classList.add('hidden');
    }, false);

    typeCancel.addEventListener('click', function() {
        typeName.value     = '';
        typeResults.hidden = true;
        typeButtons.classList.add('hidden');
    }, false);
}
addSearchValid('series', series, seriesname, seriessearch, seriesresults, seriesbuttons, seriesvalid, seriescancel);
addSearchValid('movies', movies, moviesname, moviessearch, moviesresults, moviesbuttons, moviesvalid, moviescancel);
addSearchValid('blurays', blurays, bluraysname, blurayssearch, bluraysresults, bluraysbuttons,bluraysvalid, blurayscancel);

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

    files[type].onreadystatechange = function() {
        if (files[type].readyState == XMLHttpRequest.DONE) {
            typeName.classList.remove('loading');
            if (files[type].status == 200) {
                let output            = toDoSuccess(files[type].responseText, backgroundPage.arrays[type]);
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

seriessearch.addEventListener('click', function() {
    getSearch('series', seriesname, seriesnamespan, seriesresults, seriesbuttons,
        'http://www.imdb.com/find?s=tt&q=',
        function(response, array) {
            let regExp = /class="result_text"> <a href="\/title\/(tt[^\/]*)\/[^>]*>([^<]*)<\/a>([^<]*) /g, tmp, output = '';
            while ((tmp = regExp.exec(response)) != null)
                if (tmp[3].match(/Series\)/))
                    output += '<label><input type="checkbox" class="tasks-list-cb" value="' + tmp[1] + (objectInArray(tmp[1], array) == -1 ? '"><span class="tasks-list-mark"></span></label><a href="' : '" disabled><span class="tasks-list-mark"></span></label><a href="') + imdb + tmp[1] + '" target="_blank">' + tmp[2] + tmp[3] + '</a></br>';
            return output;
        }
    );
}, false);

moviessearch.addEventListener('click', function() {
    getSearch('movies', moviesname, moviesnamespan, moviesresults, moviesbuttons,
        'http://www.imdb.com/find?s=tt&q=',
        function(response, array) {
            let regExp = /class="result_text"> <a href="\/title\/(tt[^\/]*)\/[^>]*>([^<]*)<\/a>([^<]*) /g, tmp, output = '';
            while ((tmp = regExp.exec(response)) != null)
                if (!tmp[3].match(/Series\)/) && !tmp[3].match(/\(Video Game\)/) && !tmp[3].match(/\(Video\)/) && !tmp[3].match(/\(TV Episode\)/))
                    output += '<label><input type="checkbox" class="tasks-list-cb" value="' + tmp[1] + (objectInArray(tmp[1], array) == -1 ? '"><span class="tasks-list-mark"></span></label><a href="' : '" disabled><span class="tasks-list-mark"></span></label><a href="') + imdb + tmp[1] + '" target="_blank">' + tmp[2] + tmp[3] + '</a></br>';
            return output;
        }
    );
}, false);

blurayssearch.addEventListener('click', function() {
    getSearch('blurays', bluraysname, bluraysnamespan, bluraysresults, bluraysbuttons,
        'http://www.blu-ray.com/search/quicksearch.php',
        function(response, array) {
            let tmp = response.match(/let urls = new Array\(([^\)]*)/), output = '';
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
    backgroundPage.deleteDynamic[type](type, value);
    updateProgress(type);
    fade.click();
}

function parseRss(current, save, rsslink, rsslinkspan, rssmaxitems, rssmaxitemsspan, typeDom, li, type, value, rssfade) {
    rsslink.click();
    rssmaxitems.click();
    let link         = rsslink.value.trim(), maxitems = parseInt(rssmaxitems.valueAsNumber);
    let errorOccured = false;
    if (link == '') {
        showError(chromeI18n('empty'), rsslink, rsslinkspan);
        errorOccured = true;
    }
    if (rssmaxitems.validity.badInput || maxitems < 0) {
        showError(chromeI18n('number'), rssmaxitems, rssmaxitemsspan);
        errorOccured = true;
    }
    if (isNaN(maxitems))
        maxitems = 0;
    let aR = backgroundPage.arrays['rss'];
    if (save != link && propertyInArray(link, 'link', aR) != -1) {
        showError(chromeI18n('alreadyexists'), rsslink, rsslinkspan);
        errorOccured = true;
    }
    if (errorOccured)
        return;
    if (typeDom)
        removeElement(typeDom, li, type, value, rssfade);
    else {
        rsslink.value     = '';
        rssmaxitems.value = '';
    }
    check['rss']('rss', aR[aR.push({ 'link': link, 'maxitems': maxitems, 'current': current }) - 1]);
    backgroundPage.writeArrays();
}

function parseNews(current, save, newsname, newsnamespan, newslink, newslinkspan, newsregexp, newsregexpspan, typeDom, li, type, value, newsfade) {
    newsname.click();
    newslink.click();
    newsregexp.click();
    let name         = newsname.value.trim(), link = newslink.value.trim(), regexp = newsregexp.value.trim();
    let errorOccured = false;
    if (name == '') {
        showError(chromeI18n('empty'), newsname, newsnamespan);
        errorOccured = true;
    }
    if (link == '') {
        showError(chromeI18n('empty'), newslink, newslinkspan);
        errorOccured = true;
    }
    if (regexp == '') {
        showError(chromeI18n('empty'), newsregexp, newsregexpspan);
        errorOccured = true;
    }
    let aN = backgroundPage.arrays['news'];
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
    check['news']('news', aN[aN.push({ 'name': name, 'link': link, 'regexp': regexp, 'current': current }) - 1]);
    backgroundPage.writeArrays();
}

rssvalid.addEventListener('click', function() {
    parseRss('', '', rsslink, rsslinkspan, rssmaxitems, rssmaxitemsspan);
}, false);

newsvalid.addEventListener('click', function() {
    parseNews('', '', newsname, newsnamespan, newslink, newslinkspan, newsregexp, newsregexpspan);
}, false);

function addDelete(li, typeDom, type, value) {
    let img       = document.createElement('img');
    img.className = 'button';
    img.src       = '/images/delete.png';
    img.title     = chromeI18n('delete');
    img.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        confirmyes.onclick = function() {
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
    img.src       = '/images/edit.png';
    img.title     = chromeI18n('edit');
    img.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        edit[type](li, typeDom, type, valueObject, value);
    }, false);
    li.firstElementChild.appendChild(img);
}

let edit = {
    'rss': function(li, typeDom, type, valueObject, value) {
        rsslinkedit.value     = valueObject['link'];
        rssmaxitemsedit.value = valueObject['maxitems'];
        rsslinkedit.click();
        rssmaxitemsedit.click();
        rssvalidedit.onclick  = function() {
            parseRss(valueObject['current'], valueObject['link'], rsslinkedit, rsslinkeditspan, rssmaxitemsedit, rssmaxitemseditspan, typeDom, li, type, value, rssfade)
        };
        rsslight.classList.add('visible');
        rssfade.classList.add('visible');
    },
    'news': function(li, typeDom, type, valueObject, value) {
        newsnameedit.value   = valueObject['name'];
        newslinkedit.value   = valueObject['link'];
        newsregexpedit.value = valueObject['regexp'];
        newsnameedit.click();
        newslinkedit.click();
        newsregexpedit.click();
        newsvalidedit.onclick = function() {
            parseNews(valueObject['current'], valueObject['link'], newsnameedit, newsnameeditspan, newslinkedit, newslinkeditspan, newsregexpedit, newsregexpeditspan, typeDom, li, type, value, newsfade);
        };
        newslight.classList.add('visible');
        newsfade.classList.add('visible');
    }
};

function confirmFadeClick() {
    confirmlight.classList.remove('visible');
    confirmfade.classList.remove('visible');
}
function rssFadeClick() {
    rsslight.classList.remove('visible');
    rssfade.classList.remove('visible');
}
function newsFadeClick() {
    newslight.classList.remove('visible');
    newsfade.classList.remove('visible');
}
confirmfade.addEventListener('click', confirmFadeClick, false);
rssfade.addEventListener('click', rssFadeClick, false);
newsfade.addEventListener('click', newsFadeClick, false);
confirmno.addEventListener('click', confirmFadeClick, false);
rsscanceledit.addEventListener('click', rssFadeClick, false);
newscanceledit.addEventListener('click', newsFadeClick, false);

function escapeHTML(result) {
    return result.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttribute(result) {
    return escapeHTML(result).replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
}

function updateProgress(type) {
    updateTab[type](type);
    if (progressbar.style.width != '100%') {
        let value, total = 0, currentProgress = 0;
        for (let t in progress) {
            total           += arrays[t].length;
            currentProgress += progress[t];
        }

        if (total == 0)
            value = 100;
        else value = parseInt(currentProgress * 100 / total);
        progressbar.style.width               = value + '%';
        progressbar.style['background-color'] = value > 80 ? '#86e01e' : value > 60 ? '#f2d31b' : value > 40 ? '#f2b01e' : value > 20 ? '#f27011' : '#f63a0f';
        if (value == 100) {
            setTimeout(function() {
                progressbar.classList.add('hidden');
            }, 1000);
        }
    }
}

function updateTabRN(type, typeDom, typeTab) {
    if (typeDom.getElementsByClassName('green').length != 0) {
        typeTab.classList.remove('red');
        typeTab.classList.add('green');
    }
    else if (typeDom.getElementsByClassName('red').length != 0){
        typeTab.classList.remove('green');
        typeTab.classList.add('red');
    }
    else {
        typeTab.classList.remove('green');
        typeTab.classList.remove('red');
    }
}

function updateTabSMB(type, typeDom, typeTab, typeSup) {
    let nb, j = 1, children = typeDom.children, length = children.length;
    for ( ; j != length && children[j].firstElementChild.children[1].lastElementChild.className == 'red'; j++) {}
    for ( ; j != length; j++) {
        nb = moment(children[j].firstElementChild.children[1].lastElementChild.innerHTML, 'LL').diff(date, 'days');
        if (nb >= 0)
            break;
    }
    if (j != length)
        typeSup.innerHTML = nb;
    else typeSup.innerHTML = '';
    updateTabRN(type, typeDom, typeTab);
}

var updateTab = {
    'rss': function(type) {
        updateTabRN(type, rss, rsstab);
    },
    'news': function(type) {
        updateTabRN(type, news, newstab);
    },
    'series': function(type) {
        updateTabSMB(type, series, seriestab, seriessup);
    },
    'movies': function(type) {
        updateTabSMB(type, movies, moviestab, moviessup);
    },
    'blurays': function(type) {
        updateTabSMB(type, blurays, bluraystab, blurayssup);
    }
};

function sortRN(type, value, link, name, text, dynamic, typeDom) {
    let li      = document.createElement('li');
    let current = ' ' + escapeHTML(name) + ' ';
    let j = 1, children = typeDom.children, length = children.length;
    if (text == null) {
        li.innerHTML = '<a class="widget-list-link" href="' + escapeAttribute(link) + '" target="_blank"><div class="rssnews"><img src="' + getFavicon + escape(link) + '"> ' + escapeHTML(name) +' <span class="red">' + chromeI18n(text === null ? 'unreachable' : 'error') + '</span></div></a>';
        li.firstElementChild.addEventListener('click', (function(_li) {
            return function() {
                typeDom.removeChild(_li);
                updateProgress(type);
                check[type](type, value);
            };
        })(li), false);
        for ( ; j != length && children[j].firstElementChild.firstElementChild.lastElementChild.className == 'red' && compareStrings(children[j].firstElementChild.firstElementChild.childNodes[1].nodeValue, current) < 0; j++) {}
    }
    else if (dynamic == null) {
        li.innerHTML = '<a class="widget-list-link" href="' + escapeAttribute(link) + '" target="_blank"><div class="rssnews"><img src="' + getFavicon + escape(link) + '"> ' + escapeHTML(name) + ' <span>' + escapeHTML(text) + '</span></div></a>';
        for ( ; j != length && children[j].firstElementChild.firstElementChild.lastElementChild.className == 'red'; j++) {}
        for ( ; j != length && children[j].firstElementChild.firstElementChild.lastElementChild.className == 'green'; j++) {}
        for ( ; j != length && compareStrings(children[j].firstElementChild.firstElementChild.childNodes[1].nodeValue, current) < 0; j++) {}
    }
    else {
        li.innerHTML = '<a class="widget-list-link"><div class="rssnews"><img src="' + getFavicon + escape(link) + '"> ' + escapeHTML(name) + ' <span class="green">' + escapeHTML(text) + '</span></div></a>';
        li.firstElementChild.addEventListener('click', (function(_li) {
            return function() {
                dynamic();
                typeDom.removeChild(_li);
                updateProgress(type);
                check[type](type, value);
            };
        })(li), false);
        for ( ; j != length && children[j].firstElementChild.firstElementChild.lastElementChild.className == 'red'; j++) {}
        for ( ; j != length && children[j].firstElementChild.firstElementChild.lastElementChild.className == 'green' && compareStrings(children[j].firstElementChild.firstElementChild.childNodes[1].nodeValue, current) < 0; j++) {}
    }
    typeDom.insertBefore(li, j != length ? children[j] : null);
    addDelete(li, typeDom, type, value['link']);
    addEdit(li, typeDom, type, value, value['link']);
}

function sortSMB(type, value, name, icon, tmpDate, dynamic, website, typeDom) {
    let li      = document.createElement('li');
    let current = (name == null ? website + value : name) + ' ';
    let j = 1, children = typeDom.children, length = children.length;
    if (name == null) {
        li.innerHTML = '<a class="widget-list-link" href="' + website + value + '" target="_blank"><img class="full" src=""><div>' + website + value + ' <span class="red">' + chromeI18n(name === null ? 'unreachable' : 'error') + '</span></div></a>';
        li.firstElementChild.addEventListener('click', (function(_li) {
            return function() {
                typeDom.removeChild(_li);
                updateProgress(type);
                check[type](type, value);
            };
        })(li), false);
        for ( ; j != length && children[j].firstElementChild.children[1].lastElementChild.className == 'red' && compareStrings(children[j].firstElementChild.children[1].childNodes[0].nodeValue, current) < 0; j++) {}
    }
    else if (tmpDate == null) {
        li.innerHTML = '<a class="widget-list-link" href="' + website + value + '" target="_blank"><img class="full" src="' + (icon == null ? '' : icon[1]) + '"><div>' + name + ' <span>-</span></div></a>';
        for ( ; j != length && children[j].firstElementChild.children[1].lastElementChild.innerHTML != '-'; j++) {}
        for ( ; j != length && compareStrings(children[j].firstElementChild.children[1].childNodes[0].nodeValue, current) < 0; j++) {}
    }
    else {
        if (dynamic == null)
            li.innerHTML = '<a class="widget-list-link" href="' + website + value + '" target="_blank"><img class="full" src="' + (icon == null ? '' : icon[1]) + '"><div>' + name + ' <span>' + tmpDate.format('LL') + '</span></div></a>';
        else {
            li.innerHTML = '<a class="widget-list-link"><img class="full" src="' + (icon == null ? '' : icon[1]) + '"><div>' + name + ' <span class="green">' + tmpDate.format('LL') + '</span></div></a>';
            li.firstElementChild.addEventListener('click', dynamic, false);
        }
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

var sort = {
    'rss': function(type, value, link, name, text, dynamic) {
        sortRN(type, value, link, name, text, dynamic, rss);
    },
    'news': function(type, value, link, name, text, dynamic) {
        sortRN(type, value, link, name, text, dynamic, news);
    },
    'series': function(type, value, name, icon, tmpDate, dynamic) {
        sortSMB(type, value, name, icon, tmpDate, dynamic, imdb, series);
    },
    'movies': function(type, value, name, icon, tmpDate, dynamic) {
        sortSMB(type, value, name, icon, tmpDate, dynamic, imdb, movies);
    },
    'blurays': function(type, value, name, icon, tmpDate, dynamic) {
        sortSMB(type, value, name == null ? name : name.length == 3 ? name[1] + ' <img src="' + name[2] + '">' : name[1], icon, tmpDate, dynamic, bluray, blurays);
    }
};

var check = {}, arrays = backgroundPage.arrays;
for (let key in arrays) {
    check[key] = function(type, value) {
        get[type](type, value, backgroundPage, updateProgress, sort[type], sort[type], sort[type]);
    };
}
