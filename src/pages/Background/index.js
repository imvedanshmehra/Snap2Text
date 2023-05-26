chrome?.browserAction?.onClicked.addListener((tab) => {
  if (tab?.id) {
    chrome?.scripting?.executeScript({
      target: { tabId: tab.id },
      files: ['contentScript.bundle.js'],
    });
  }
});
