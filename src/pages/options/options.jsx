import { Button } from 'antd';
import React, { useEffect, useState } from 'react';
import ExtPay from 'extpay';
import '../index.styles.css';

const extpay = ExtPay('snap2text-prod');

const Options = () => {
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    extpay
      ?.getUser()
      ?.then((user) => {
        if (user?.paid) {
          setIsPaid(true);
        } else {
          setIsPaid(false);
        }
      })
      ?.catch((err) => console.log(err));
  }, []);

  return (
    <div className="s2t-bg-neutral-300 s2t-m-0 s2t-min-h-screen s2t-p-4">
      <h1 className="s2t-text-center">Snap2Text Options</h1>
      <div className="s2t-w-3/5 s2t-ml-auto s2t-mr-auto s2t-bg-white s2t-shadow-md s2t-rounded-md s2t-p-4">
        <div className="s2t-flex s2t-items-center">
          <p className="s2t-mr-3 s2t-text-base">
            Subscription Status:{' '}
            <span
              className={`s2t-font-bold ${
                isPaid ? 's2t-text-lime-700' : 's2t-text-red-700'
              }`}
            >
              {isPaid ? 'Paid' : 'Free'}
            </span>
          </p>
          <Button onClick={() => extpay.openPaymentPage()} type="primary">
            {isPaid ? 'Manage Subscription' : 'Get Pro'}
          </Button>
        </div>
        <footer>
          <p className="s2t-text-sm">
            Facing Issues?{' '}
            <Button
              type="link"
              size="sm"
              onClick={() => window?.open('mailto:vedanshofficial@gmail.com')}
            >
              Contact Us
            </Button>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Options;
