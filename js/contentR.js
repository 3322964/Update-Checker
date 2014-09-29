var type  = 'rss';
var value = document.URL;
chrome.runtime.sendMessage({ 'setPopup': true });

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request['getPopupInfos']) {
        sendResponse({ 'type': type, 'value': value });
    }
});
