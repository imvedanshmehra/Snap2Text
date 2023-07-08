chrome?.action?.onClicked.addListener((tab) => {
  if (tab?.id) {
    chrome?.scripting?.executeScript({
      target: { tabId: tab.id },
      files: ['contentScript.bundle.js'],
    });

    chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
      if (request.message === 'takeScreenshot') {
        chrome?.tabs
          ?.captureVisibleTab({ format: 'png' })
          ?.then((dataUrl) => {
            console.log('called');
            sendResponse({ screenshotUrl: dataUrl });
          })
          .catch((err) => console.error(err));
      }
      return true;
    });
  }
});
