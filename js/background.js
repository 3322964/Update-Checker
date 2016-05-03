chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.tabs.query({ 'url': chrome.runtime.getURL('index.html'), 'windowId': tab.windowId }, function (tabs) {
        if (tabs.length == 0)
            window.open('index.html');
        else chrome.tabs.update(tabs[0].id, { 'selected': true }, function () {});
    });
});
