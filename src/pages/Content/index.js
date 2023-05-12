import { createRoot } from 'react-dom/client';
import ScreenCapture from './modules/screen-capture';
import React from 'react';

const container = document.createElement('div');
const rootNode = document.createElement('div');
rootNode.setAttribute('id', 'root-img-to-text-container');
container.setAttribute('id', 'img-to-text-container');

const childElements = document.body.children;
for (let i = 0; i < childElements.length; i++) {
  const childElement = childElements[i];
  container.appendChild(childElement);
}

const htmlChildren = Array.from(container.children).map((childElement) => {
  return childElement.outerHTML;
});

document.body.appendChild(rootNode);
const root = createRoot(rootNode);
root.render(
  <ScreenCapture onEndCapture={(screenCapture) => console.log(screenCapture)}>
    <div dangerouslySetInnerHTML={{ __html: htmlChildren.join('') }} />
  </ScreenCapture>
);
