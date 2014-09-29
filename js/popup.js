var backgroundPage = chrome.extension.getBackgroundPage();
var valid          = document.getElementById('valid');
var type, value, array;

window.addEventListener('load', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { 'getPopupInfos': true }, setPopupInfos);
    });
});

function setPopupInfos(obj) {
    type  = obj['type'];
    value = obj['value'];
    array = backgroundPage.arrays[type];

    if (objectInArray(value, array) == -1) {
        valid.value = chromeI18n('add');
        valid.addEventListener('click', function() {
            array.push(value);
            backgroundPage.writeArrays();
            window.close();
        }, false);
    }
    else {
        valid.value = chromeI18n('delete');
        valid.classList.add('redlike');
        valid.addEventListener('click', function() {
            backgroundPage.deleteDynamic[type](type, value);
            window.close();
        }, false);
    }
}
