import React, { useState } from 'react';
import '../content.styles.css';
import { Popover, Progress } from 'antd';
import html2canvas from 'html2canvas';
import { createWorker } from 'tesseract.js';
import TextArea from 'antd/es/input/TextArea';

const ScreenCapture = () => {
  const [selection, setSelection] = useState(null);
  const [isMouseUp, setIsMouseUp] = useState(false);
  const [ocr, setOCR] = useState({});
  const [progress, setProgress] = useState(0);

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

  const convertImageToText = async (image) => {
    if (!image || ocr.text) return;

    const worker = await createWorker({
      logger: (m) => {
        if (m.status === 'recognizing text') {
          setProgress(m.progress);
        }
      },
    });

    (async () => {
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      const {
        data: { text },
      } = await worker.recognize(image);
      setOCR({ ...ocr, text });
      await worker.terminate();
    })();
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
        convertImageToText(image);
        setIsMouseUp(true);
      });
    }

    setSelection(null);
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onDragStart={(e) => e.preventDefault()}
      onSelect={(e) => e.preventDefault()}
    >
      <div className={!isMouseUp && `screen-capture-overlay`} />
      {selection && (
        <div
          className={!isMouseUp && `screen-capture-highlighter`}
          style={{
            ...selection,
          }}
        />
      )}
      <Popover
        open={isMouseUp}
        content={
          <>
            <Progress
              percent={Math.round(progress * 100)}
              status={progress !== 1 && 'active'}
              strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
              className="progress-bar"
            />
            <TextArea
              value={ocr?.text}
              rows={ocr?.lines?.length}
              autoSize
              readOnly
            />
          </>
        }
        title={<h1>Copy Image to Text</h1>}
        arrow={false}
        placement="rightBottom"
        destroyTooltipOnHide
      />
    </div>
  );
};

export default ScreenCapture;
