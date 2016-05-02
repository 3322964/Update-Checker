chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.tabs.query({ 'url': chrome.runtime.getURL('uc.html'), 'windowId': tab.windowId }, function (tabs) {
        if (tabs.length == 0)
            window.open('uc.html');
        else chrome.tabs.update(tabs[0].id, { 'selected': true }, function () {});
    });
});

var settings = { 'hometab': 'seriestab' };
var arrays;

window.addEventListener('load', function () {
    chrome.storage.local.get(null, function (items) {
        parseLocalStorage(items['settings'], items['arrays']);
    });
}, false);

function writeSettings() {
    chrome.storage.local.set({ 'settings': settings });
}

function writeArrays() {
    chrome.storage.local.set({ 'arrays': arrays });
}

function parseLocalStorage(tmpSettings, tmpArrays) {
    let key;
    for (key in tmpSettings) {
        if (key in settings) {
            settings[key] = tmpSettings[key];
            if (settings[key] == 'rsstab')
                settings[key] = 'newstab';
        }
    }
    writeSettings();

    parseArrays(tmpArrays);
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

function deleteDynamicNews(type, value) {
    let i = propertyInArray(value, 'link', arrays[type]);
    if (i != -1) {
        arrays[type].splice(i, 1);
        writeArrays();
    }
}

function deleteDynamicSMB(type, value) {
    let i = objectInArray(value, arrays[type]);
    if (i != -1) {
        arrays[type].splice(i, 1);
        writeArrays();
    }
}

var deleteDynamic = {
    'news': deleteDynamicNews,
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
