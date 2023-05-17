import React, { useState } from 'react';
import '../content.styles.css';
import { Popover, Progress } from 'antd';
import html2canvas from 'html2canvas';
import Tesseract from 'tesseract.js';
import TextArea from 'antd/es/input/TextArea';

const ScreenCapture = ({ children }) => {
  const [selection, setSelection] = useState(null);
  const [imageURL, setImageURL] = useState('');
  const [ocr, setOCR] = useState({});

  const handleMouseDown = (event) => {
    const startX = event.clientX;
    const startY = event.clientY;
    setSelection({ startX, startY });
  };

  const handleMouseMove = (event) => {
    if (!selection) return;

    const currentX = event.clientX;
    const currentY = event.clientY;

    const width = Math.abs(currentX - selection.startX);
    const height = Math.abs(currentY - selection.startY);

    const left = Math.min(currentX, selection.startX);
    const top = Math.min(currentY, selection.startY);

    setSelection({
      startX: selection.startX,
      startY: selection.startY,
      width,
      height,
      left,
      top,
    });
  };

  const handleMouseUp = () => {
    const body = document.querySelector('body');
    if (body) {
      html2canvas(document.body, {
        x: selection.left,
        y: selection.top,
        width: selection.width,
        height: selection.height,
      }).then((canvas) => {
        const image = canvas.toDataURL();
        setImageURL(image);
      });
    }

    setSelection(null);
  };

  const convertImageToText = async () => {
    if (!imageURL) return;

    const worker = await Tesseract.createWorker();
    await worker.loadLanguage('eng');
    await worker.initialize('eng');
    const {
      data: { text, confidence, lines },
    } = await worker.recognize(imageURL);
    setOCR({ text, lines, confidence });
    await worker.terminate();
  };

  convertImageToText();

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDragStart={(e) => e.preventDefault()}
      onSelect={(e) => e.preventDefault()}
    >
      {children}
      <div className={selection && `screen-capture-overlay`} />
      {selection && (
        <div
          className="screen-capture-highlighter"
          style={{
            ...selection,
          }}
        />
      )}
      <Popover
        open={!!imageURL}
        content={
          <>
            <Progress percent={30} />
            <TextArea value={ocr?.text} rows={ocr?.lines?.length} />
          </>
        }
        title={<h1>Copy Image to Text</h1>}
        arrow={false}
        placement="bottomRight"
        destroyTooltipOnHide
      />
    </div>
  );
};

export default ScreenCapture;
