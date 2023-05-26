import { createRoot } from 'react-dom/client';
import { ScreenCapture } from './modules/screen-capture';
import React from 'react';

const container = document.createElement('div');
container.setAttribute('id', 'copy-text-to-img-container');

const copyTextToImgContainer = document.getElementById(
  'copy-text-to-img-container'
);

if (copyTextToImgContainer) {
  document?.body?.removeChild(copyTextToImgContainer);
} else {
  document?.body?.appendChild(container);
  const root = createRoot(container);
  root?.render(<ScreenCapture />);
}
