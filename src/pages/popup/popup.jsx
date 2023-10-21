import { Button } from 'antd';
import React from 'react';
import '../index.styles.css';

const Popup = () => {
  return (
    <div className="s2t-w-96">
      <h1>Snap2Text</h1>
      <p className="s2t-text-base">
        Hi 👋 Welcome to <b>Snap2Text!</b>
      </p>
      <Button type="primary">Start Converting Image to Text</Button>
    </div>
  );
};

export default Popup;
