chrome.browserAction.onClicked.addListener(function () {
    chrome.tabs.query({ url: chrome.runtime.getURL('index.html') }, function (tabs) {
        if (tabs.length === 0)
            window.open('index.html');
        else chrome.tabs.update(tabs[0].id, { highlighted: true });
    });
});
