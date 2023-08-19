import React from 'react';
import { createRoot } from 'react-dom/client';
import Options from './options';

const container = document.getElementById('snap2text-options-container');
const root = createRoot(container);
root.render(<Options />);
