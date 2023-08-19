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
    <div className="bg-neutral-300 m-0 min-h-screen p-4">
      <h1 className="text-center">Snap2Text Options</h1>
      <div className="w-3/5 ml-auto mr-auto bg-white shadow-md rounded-md p-4">
        <div className="flex items-center">
          <p className="mr-3 text-base">
            Subscription Status:{' '}
            <span
              className={`font-bold ${
                isPaid ? 'text-lime-700' : 'text-red-700'
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
          <p className="text-sm">
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
