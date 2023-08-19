import { Button } from 'antd';
import React from 'react';
import ExtPay from 'extpay';
import '../index.styles.css';

const extpay = ExtPay('snap2text-prod');

const Popup = () => {
  return (
    <div className="w-96">
      <h1>Snap2Text</h1>
      <p className="text-base">
        Hi 👋 Welcome to <b>Snap2Text!</b>
      </p>
      <Button
        type="primary"
        onClick={() => {
          chrome?.action?.setPopup({ popup: '' });
          extpay.openTrialPage('3 Days');
        }}
      >
        Start your Free 3 days Trial
      </Button>
    </div>
  );
};

export default Popup;
