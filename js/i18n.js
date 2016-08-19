(function (document) {
    let elements = document.querySelectorAll('[data-i18n]');
    for (let i = 0, length = elements.length; i !== length; i++) {
        if (elements[i].tagName === 'INPUT')
            elements[i].placeholder = chrome.i18n.getMessage(elements[i].dataset.i18n);
        else elements[i].innerHTML = chrome.i18n.getMessage(elements[i].dataset.i18n);
        delete elements[i].dataset.i18n;
    }
})(document);
