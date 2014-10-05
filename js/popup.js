var backgroundPage = chrome.extension.getBackgroundPage();
var type, value, array;

for (var i = 0, tmp, elements = document.getElementsByTagName('*'), length = elements.length; i != length; i++) {
    tmp = elements[i].id;
    if (tmp != '')
        window[tmp] = document.getElementById(tmp);
}

window.addEventListener('load', function() {
    chrome.tabs.query({ 'active': true, 'currentWindow': true }, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { 'getPopupInfos': true }, setPopupInfos);
    });
});

function showError(string, element, elementspan) {
    element.classList.add('error');
    elementspan.innerHTML = string;
}

function setPopupInfos(obj) {
    type  = obj['type'];
    value = obj['value'];
    array = backgroundPage.arrays[type];

    if (type != 'rss' && objectInArray(value, array) == -1) {
        valid.value = chromeI18n('add');
        valid.addEventListener('click', function() {
            array.push(value);
            backgroundPage.writeArrays();
            window.close();
        }, false);
    }
    else if (type == 'rss' && propertyInArray(value, 'link', array) == -1) {
        rss.hidden              = false;
        rssmaxitems.placeholder = chromeI18n('maxitems');
        valid.value             = chromeI18n('add');

        function removeError(e) {
            if (e.target.classList.contains('error')) {
                e.target.classList.remove('error');
                document.getElementById(e.target.id + 'span').innerHTML = '';
            }
        }
        rssmaxitems.addEventListener('keypress', function(e) {
            if (e.keyCode == 13)
                valid.click();
        }, false);
        rssmaxitems.addEventListener('keydown', removeError, false);
        rssmaxitems.addEventListener('click', removeError, false);

        valid.addEventListener('click', function() {
            rssmaxitems.click();
            var maxitems = parseInt(rssmaxitems.valueAsNumber);
            if (rssmaxitems.validity.badInput || maxitems < 0) {
                showError(chromeI18n('number'), rssmaxitems, rssmaxitemsspan);
                return;
            }
            if (isNaN(maxitems))
                maxitems = 0;
            array.push({ 'link': value, 'maxitems': maxitems, 'current': '' });
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
