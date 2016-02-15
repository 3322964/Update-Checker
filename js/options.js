const chromeI18n   = chrome.i18n.getMessage;
var backgroundPage = chrome.extension.getBackgroundPage();
var timeout;

for (let i = 0, tmp, elements = document.getElementsByTagName('*'), length = elements.length; i != length; i++) {
    tmp = elements[i].id;
    if (tmp != '')
        window[tmp] = elements[i];
}

window.addEventListener('load', function () {
    document.title          = chromeI18n('options');
    notifications.innerHTML = chromeI18n('notifications');
    restore.value           = chromeI18n('restore');
    backup.value            = chromeI18n('backup');
    let seconds             = backgroundPage.settings['backgroundcheck'];
    if (seconds != 0)
        backgroundcheck.valueAsNumber = seconds;
    widget.hidden = false;
}, false);

backgroundcheck.addEventListener('change', function (e) {
    let value                                  = e.target.valueAsNumber;
    backgroundPage.settings['backgroundcheck'] = isNaN(value) ? 0 : value;
    backgroundPage.writeSettings();
    backgroundPage.location.reload();
}, false);

restoreh.addEventListener('change', function (event) {
    let file    = new FileReader();
    file.onload = function (e) {
        event.target.value = '';
        try {
            backgroundPage.parseArrays(JSON.parse(e.target.result)['arrays']);
            backgroundPage.location.reload();
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
    a.href     = window.URL.createObjectURL(new Blob([JSON.stringify({ 'arrays': backgroundPage.arrays }, null, 4)], { 'type': 'text/plain;charset=UTF-8' }));
    a.click();
    window.URL.revokeObjectURL(a.href);
}, false);
