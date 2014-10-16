var backgroundPage = chrome.extension.getBackgroundPage();
var chromeI18n     = chrome.i18n.getMessage;
var timeout;

for (var i = 0, tmp, elements = document.getElementsByTagName('*'), length = elements.length; i != length; i++) {
    tmp = elements[i].id;
    if (tmp != '')
        window[tmp] = document.getElementById(tmp);
}

window.addEventListener('load', function() {
    document.title          = chromeI18n('options');
    notifications.innerHTML = chromeI18n('notifications');
    restore.value           = chromeI18n('restore');
    backup.value            = chromeI18n('backup');
    var seconds             = backgroundPage.settings['backgroundcheck'];
    if (seconds != 0)
        backgroundcheck.valueAsNumber = seconds;
    widget.hidden = false;
}, false);

function showTextTimeout(string, color) {
    clearTimeout(timeout);
    results.innerHTML = '<span class="' + color + '">' + string + '</span>';
    results.hidden    = false;
    timeout           = setTimeout(function() {
        results.hidden    = true;
        results.innerHTML = '';
    }, 3000);
}

backgroundcheck.addEventListener('change', function(e) {
    var value                                  = e.target.valueAsNumber;
    backgroundPage.settings['backgroundcheck'] = isNaN(value) ? 0 : value;
    backgroundPage.writeSettings();
    backgroundPage.location.reload();
}, false);

restoreh.addEventListener('change', function(event) {
    var file    = new FileReader();
    file.onload = function(e) {
        event.target.value = '';
        try {
            backgroundPage.parseArrays(JSON.parse(e.target.result)['arrays']);
            showTextTimeout(chromeI18n('jsonrestored'), 'green');
            backgroundPage.location.reload();
        }
        catch (err) {
            showTextTimeout(chromeI18n('jsoncompliant'), 'red');
        }
    };
    file.readAsText(event.target.files[0]);
}, false);

restore.addEventListener('click', function() {
    restoreh.click();
}, false);

backup.addEventListener('click', function() {
    var a      = document.createElement('a');
    a.download = 'backup.json';
    a.href     = window.URL.createObjectURL(new Blob([JSON.stringify({ 'arrays': backgroundPage.arrays }, null, 4)], { 'type': 'text/plain;charset=UTF-8' }));
    a.click();
    window.URL.revokeObjectURL(a.href);
}, false);
