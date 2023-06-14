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
        chrome.tabs.captureVisibleTab(null, {}, function (dataUrl) {
          sendResponse({ screenshotUrl: dataUrl });
        });
      }
      return true;
    });
  }
});
