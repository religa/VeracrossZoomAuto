const BG = {};

BG.init = () => {
    chrome.storage.local.get(['enabled'], (values) => {
        if (values.enabled === undefined)
            chrome.storage.local.set({enabled: true});
    });
};
BG.init();

chrome.storage.onChanged.addListener(BG.init);

