import ExtPay from 'extpay';

const extpay = ExtPay('snap2text-prod');
extpay.startBackground();

const now = new Date();
const threeDays = 1000 * 60 * 60 * 24 * 3; // Three days in milliseconds;

chrome?.action?.onClicked.addListener((tab) => {
  extpay?.getUser()?.then((user) => {
    if (
      user?.paid ||
      (user.trialStartedAt && now - user.trialStartedAt < threeDays)
    ) {
      chrome?.scripting?.executeScript({
        target: { tabId: tab.id },
        files: ['contentScript.bundle.js'],
      });
      chrome?.action?.setPopup({ popup: '' });
    } else {
      chrome?.action?.setPopup({ popup: 'popup.html' });
    }
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
