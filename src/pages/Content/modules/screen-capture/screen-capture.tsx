import React, { MouseEvent, useState } from 'react';
import '../../content.styles.css';
import { Button, Card, Popover, Progress } from 'antd';
import html2canvas from 'html2canvas';
import { createWorker } from 'tesseract.js';

const ScreenCapture = () => {
  const [selection, setSelection] = useState<any>(null);
  const [currentMousePosition, setCurrentMousePosition] = useState({ left: 0, top: 0 })
  const [isMouseUp, setIsMouseUp] = useState(false);
  const [ocr, setOCR] = useState<{ text: string } | null>(null);
  const [progress, setProgress] = useState(0);
  const [showPopover, setShowPopover] = useState(false);

  const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    const startX = event.clientX;
    const startY = event.clientY;
    setSelection({ startX, startY });
  };

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    setCurrentMousePosition({ left: event.clientX, top: event.clientY })
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

  const convertImageToText = async (image: string) => {
    if (!image || ocr?.text) return;

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
      setShowPopover(true);
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
    <>
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDragStart={(e) => e.preventDefault()}
        onSelect={(e) => e.preventDefault()}
      >
        <div className={!isMouseUp ? `fixed top-0 left-0 w-full h-full bg-black/[.5] z-[999999] cursor-crosshair` : ''} />
        {currentMousePosition && !isMouseUp && <div className='absolute text-black cursor-crosshair z-[999999] text-shadow-sm shadow-white' style={{ ...currentMousePosition }}>{`${currentMousePosition.left}/${currentMousePosition.top}`}</div>}
        {selection && (
          <div
            className={!isMouseUp ? `absolute border-2 border-white border-dotted z-[999999]` : ''}
            style={{
              ...selection,
            }}
          />
        )}
      </div>
      <Popover
        open={showPopover}
        title={
          <div className="flex align-center justify-between">
            <h1>Copy Image to Text</h1>
            <Button type="link">Close</Button>
          </div>
        }
        content={
          <>
            <Progress
              percent={Math.round(progress * 100)}
              status={progress !== 1 ? 'active' : "normal"}
              strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
              className="min-w-[400px]"
            />
            <Card>
              <p>{ocr?.text}</p>
            </Card>
          </>
        }
        arrow={false}
        destroyTooltipOnHide={true}
      />
    </>
  );
};

export { ScreenCapture }
