chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.tabs.query({ 'url': chrome.runtime.getURL('uc.html'), 'windowId': tab.windowId }, function (tabs) {
        if (tabs.length == 0)
            window.open('uc.html');
        else chrome.tabs.update(tabs[0].id, { 'selected': true }, function () {});
    });
});

var settings = { 'hometab': 'seriestab' };
var arrays   = { 'rss': [], 'news': [], 'series': [], 'movies': [], 'blurays': [] };

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
    for (key in tmpSettings)
        if (key in settings)
            settings[key] = tmpSettings[key];

    for (key in tmpArrays) {
        if (key in arrays)
            arrays[key] = tmpArrays[key];
    }
    writeSettings();
    writeArrays();
}

function parseArrays(tmpArrays) {
    arrays = { 'rss': [], 'news': [], 'series': [], 'movies': [], 'blurays': [] };
    for (let key in tmpArrays)
        if (key in arrays)
            arrays[key] = tmpArrays[key];
    writeArrays();
}

function deleteDynamicRN(type, value) {
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
    'rss': deleteDynamicRN,
    'news': deleteDynamicRN,
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

var getFunctionDynamic = {
    'rss': function (link, type, value, cur) {
        return function () {
            link();
            writeDynamic(type, value, cur);
        };
    },
    'news': function (link, type, value, cur) {
        return function () {
            window.open(link);
            writeDynamic(type, value, cur);
        };
    },
    'series': window.open,
    'movies': window.open,
    'blurays': window.open
};
