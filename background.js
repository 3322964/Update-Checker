chrome.browserAction.onClicked.addListener(function() {
    chrome.tabs.query({ 'url': 'chrome-extension://' + chrome.runtime.id + '/uc.html*' }, function(tabs) {
        if (tabs.length == 0)
            window.open('uc.html');
        else chrome.tabs.update(tabs[0].id, { 'selected': true }, function() {});
    });
});

var settings      = { 'hometab': 'seriestab', 'backgroundcheck': 180000 };
var arrays        = { 'rss': [], 'news': [], 'series': [], 'movies': [], 'blurays': [] };
var notifications = {}, items = { 'rss': [], 'news': [], 'series': [], 'movies': [], 'blurays': [] };

window.addEventListener('load', function() {
    chrome.alarms.clearAll();
    chrome.storage.local.get(null, function(items) {
        parseLocalStorage(items['settings'], items['arrays'], items['notifications']);

        if (settings['backgroundcheck'] != 0) {
            chrome.alarms.onAlarm.addListener(function(alarm) {
                if (alarm.name == 'Update Checker') {
                    checkAll(arrays);
                }
            });
            chrome.alarms.create('Update Checker', { 'when': Date.now(), 'periodInMinutes': settings['backgroundcheck'] / 60000 });
        }
    });
}, false);

function writeSettings() {
    chrome.storage.local.set({ 'settings': settings });
}

function writeArrays() {
    chrome.storage.local.set({ 'arrays': arrays });
}

function writeNotifications() {
    chrome.storage.local.set({ 'notifications': notifications });
}

function parseLocalStorage(tmpSettings, tmpArrays, tmpNotifications) {
    for (var key in tmpSettings)
        if (key in settings)
            settings[key] = tmpSettings[key];

    var i, length, tmp;
    for (var key in tmpArrays) {
        if (key in arrays) {
            arrays[key] = tmpArrays[key];
            if (key != 'rss' && key != 'news') {
                for (i = 0, tmp = arrays[key], length = tmp.length; i != length; i++)
                    if (key + tmp[i] in tmpNotifications)
                        notifications[key + tmp[i]] = tmpNotifications[key + tmp[i]];
            }
        }
    }
    writeSettings();
    writeArrays();
    writeNotifications();
}

function parseArrays(tmpArrays) {
    arrays = { 'rss': [], 'news': [], 'series': [], 'movies': [], 'blurays': [] };
    for (var key in tmpArrays)
        if (key in arrays)
            arrays[key] = tmpArrays[key];
    writeArrays();
}

function deleteDynamicRN(type, value) {
    var i = propertyInArray(value, 'link', arrays[type]);
    if (i != -1) {
        arrays[type].splice(i, 1);
        writeArrays();
        removeItem(type, value);
    }
}

function deleteDynamicSMB(type, value) {
    var i = objectInArray(value, arrays[type]);
    if (i != -1) {
        arrays[type].splice(i, 1);
        writeArrays();
        removeItem(type, value);
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
    var i = propertyInArray(value, 'link', arrays[type]);
    if (i != -1) {
        arrays[type][i]['current'] = cur;
        writeArrays();
    }
    removeItem(type, value);
}

function getFunctionDynamicSMB(link, type, value) {
    return function() {
        window.open(link);
        removeItem(type, value);
    };
}

var getFunctionDynamic = {
    'rss': function(link, type, value, cur) {
        return function() {
            link();
            writeDynamic(type, value, cur);
        };
    },
    'news': function(link, type, value, cur) {
        return function() {
            window.open(link);
            writeDynamic(type, value, cur);
        };
    },
    'series': getFunctionDynamicSMB,
    'movies': getFunctionDynamicSMB,
    'blurays': getFunctionDynamicSMB
};

function unescapeNotifications(result) {
    var div       = document.createElement('div');
    div.innerHTML = result;
    return div.childNodes.length === 0 ? '' : div.childNodes[0].nodeValue;
}

function removeItem(type, value) {
    var i = propertyInArray(value, 'value', items[type]);
    if (i != -1) {
        chrome.notifications.onClicked.removeListener(items[type][i]['clicked']);
        chrome.notifications.onClosed.removeListener(items[type][i]['closed']);
        items[type].splice(i, 1);
        refreshNotification(type);
    }
}

function refreshNotification(type) {
    chrome.notifications.clear(type, function() {
        if (items[type].length == 0)
            return;
        chrome.notifications.create(type, {
            'type': 'list',
            'title': chromeI18n(type),
            'message': '',
            'iconUrl': 'images/logo.png',
            'items': items[type].map(function(item) { return { 'title': item['title'], 'message': item['message'] }; })
        }, function() {});
    });
}

function computeNotification(type) {
    if (progress[type] != arrays[type].length)
        return;
    refreshNotification(type);
}

function notify(type, value, name, text, dynamic, save) {
    var i = propertyInArray(value, 'value', items[type]);
    if (i != -1) {
        if ((type == 'rss' || type == 'news') && items[type][i]['save'] == save)
            return;
        chrome.notifications.onClicked.removeListener(items[type][i]['clicked']);
        chrome.notifications.onClosed.removeListener(items[type][i]['closed']);
    }
    else i = items[type].length;
    items[type][i] = {
        'value': value,
        'save': save,
        'title': unescapeNotifications(name),
        'message': unescapeNotifications(text),
        'clicked': function(id) {
            if (id == type)
                dynamic();
        }
    };
    if (type == 'rss' || type == 'news') {
        items[type][i]['closed'] = function(id, user) {
            if (id == type && user == true)
                writeDynamic(type, value, save);
        };
    }
    else items[type][i]['closed'] = function(id, user) {
        if (id == type && user == true)
            removeItem(type, value);
    };
    chrome.notifications.onClicked.addListener(items[type][i]['clicked']);
    chrome.notifications.onClosed.addListener(items[type][i]['closed']);
    items[type].sort(function(a, b) { return compareStrings(a['title'], b['title']); });
}

function canCheck(type, value) {
    if (notifications[type + value] == null || moment(notifications[type + value].split(';')[0]).isBefore(date))
        return true;
    else {
        progress[type]++;
        computeNotification(type);
        return false;
    }
}

function hasChecked(type, value, tmpDate) {
    if (tmpDate != null) {
        var tmp  = notifications[type + value];
        var text = tmpDate.toISOString();
        notifications[type + value] = moment().toISOString() + ';' + text;
        writeNotifications();
        return tmp == null || objectInArray(';', tmp) == -1 || tmp.split(';')[1] != text;
    }
    else {
        notifications[type + value] = moment().toISOString();
        writeNotifications();
    }
}

function checkRN(type, value) {
    get[type](type, value, window, computeNotification, function(type, value, link, name, text, dynamic, current) {
        notify(type, value['link'], name, text, dynamic, current);
    });
}

function checkSM(type, value) {
    if (canCheck(type, value)) {
        get[type](type, value, window, computeNotification, function(type, value, name, icon, tmpDate, dynamic, changed) {
            if (changed)
                notify(type, value, name, tmpDate.format('LL'), dynamic);
        });
    }
}

var check = {
    'rss': checkRN,
    'news': checkRN,
    'series': checkSM,
    'movies': checkSM,
    'blurays': function(type, value) {
        if (canCheck(type, value)) {
            get[type](type, value, window, computeNotification, function(type, value, name, icon, tmpDate, dynamic, changed) {
                if (changed)
                    notify(type, value, name[1], tmpDate.format('LL'), dynamic);
            });
        }
    }
};
