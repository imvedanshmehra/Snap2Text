chrome?.action?.onClicked.addListener((tab) => {
  if (tab?.id) {
    chrome?.scripting?.executeScript({
      target: { tabId: tab.id },
      files: ['contentScript.bundle.js'],
    });

    chrome.runtime.onMessage.addListener(function (
      request,
      sender,
      sendResponse
    ) {
      if (request.message === 'takeScreenshot') {
        chrome?.tabs
          ?.captureVisibleTab()
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
