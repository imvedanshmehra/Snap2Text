import { createRoot } from 'react-dom/client';
import { ScreenCapture } from './modules/screen-capture';
import React from 'react';

const container = document.createElement('div');
container.setAttribute('id', 'snap2TextContainer');

const copyTextToImgContainer = document.getElementById('snap2TextContainer');

if (copyTextToImgContainer) {
  document?.body?.removeChild(copyTextToImgContainer);
} else {
  document?.body?.appendChild(container);
  const root = createRoot(container);
  root?.render(<ScreenCapture />);
}
