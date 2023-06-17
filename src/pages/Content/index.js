import { createRoot } from 'react-dom/client';
import { ScreenCapture } from './modules/screen-capture';
import React from 'react';

const container = document.createElement('div');
container.setAttribute('id', 'snap2ImageContainer');

const copyTextToImgContainer = document.getElementById('snap2ImageContainer');

if (copyTextToImgContainer) {
  document?.body?.removeChild(copyTextToImgContainer);
} else {
  document?.body?.appendChild(container);
  const root = createRoot(container);
  root?.render(<ScreenCapture />);
}
