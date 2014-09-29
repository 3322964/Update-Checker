var type;
var value = document.URL.match(/^http:\/\/www.imdb.com\/title\/(tt[0-9]+)\/(?:\?.*)?$/);
if (value != null) {
    type  = document.title.match(/\([^\)]*Series[^\)]*\)/) ? 'series' : 'movies';
    value = value[1];
    chrome.runtime.sendMessage({ 'setPopup': true });
}
else {
    value = document.URL.match(/^http:\/\/www.blu-ray.com\/movies\/([^\/]*\/[^\/]*\/)/);
    if (value != null) {
        type  = 'blurays';
        value = value[1];
        chrome.runtime.sendMessage({ 'setPopup': true });
    }
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request['getPopupInfos']) {
        sendResponse({ 'type': type, 'value': value });
    }
});
