import { createRoot } from 'react-dom/client';
import { ScreenCapture } from './modules/screen-capture';
import React from 'react';

const container = document.createElement('div');
container.setAttribute('id', 'copy-text-to-img-container');

document.body.appendChild(container);
const root = createRoot(container);
root.render(<ScreenCapture />);
