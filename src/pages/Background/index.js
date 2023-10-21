chrome?.action?.onClicked.addListener((tab) => {
  chrome?.scripting?.executeScript({
    target: { tabId: tab.id },
    files: ['contentScript.bundle.js'],
  });
});

chrome.runtime.onMessage.addListener((request, _, sendResponse) => {
  if (request.message === 'takeScreenshot') {
    chrome?.tabs
      ?.captureVisibleTab({ format: 'png' })
      ?.then((dataUrl) => {
        sendResponse({ screenshotUrl: dataUrl });
      })
      .catch((err) => console.error(err));
  }
  if (request.message === 'translateWithGoogleTranslate') {
    const encodedText = encodeURIComponent(request?.options?.text ?? '');
    if (!!encodedText) {
      chrome.tabs.create({
        url: 'https://translate.google.com/?text=' + encodedText,
      });
    }
  }
  return true;
});
