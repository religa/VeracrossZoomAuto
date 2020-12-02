const setValues = new Promise(resolve => {
    chrome.storage.local.get(['flights', 'url', 'launchZoom', 'closeZoomWindow'], (obj) => {
        resolve(obj);
    })
});

document.addEventListener("DOMContentLoaded", function() {
    const launchZoom = document.getElementById('launchZoom');
    setValues.then(val => {
        launchZoom.checked=val.launchZoom;
    });
    launchZoom.addEventListener('change', () => {
        chrome.storage.local.set({launchZoom: launchZoom.checked})
    });

    const closeZoomWindow = document.getElementById('closeZoomWindow');
    setValues.then(val => {
        closeZoomWindow.checked=val.closeZoomWindow;
    });
    closeZoomWindow.addEventListener('change', () => {
        chrome.storage.local.set({closeZoomWindow: closeZoomWindow.checked})
    });
});

