import React, { MouseEvent, useState } from 'react';
import '../../content.styles.css';
import { Button, Input, Modal, Progress, Tooltip, Typography } from 'antd';
import html2canvas from 'html2canvas';
import { createWorker } from 'tesseract.js';
import { CopyOutlined, } from '@ant-design/icons';

const ScreenCapture = () => {

  const [selection, setSelection] = useState<any>(null);
  const [currentMousePosition, setCurrentMousePosition] = useState({ left: 0, top: 0 })
  const [isMouseUp, setIsMouseUp] = useState(false);
  const [ocr, setOCR] = useState<{ text: string, confidence: number } | null>(null);
  const [progress, setProgress] = useState(0);
  const [showPopover, setShowPopover] = useState(false);

  const { Text } = Typography

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
        data: { text, confidence },
      } = await worker.recognize(image);
      setOCR({ ...ocr, text, confidence });
      await worker.terminate();
    })();
  };

  const handleMouseUp = async () => {
    const body = document.querySelector('body');
    if (body) {
      setShowPopover(true);

      html2canvas(document.body, {
        x: selection.left,
        y: selection.top,
        width: selection.width,
        height: selection.height,
        scrollY: - window.scrollY,
        allowTaint: true,
      }).then(async (canvas) => {
        const image = await canvas.toDataURL();
        convertImageToText(image);
        setIsMouseUp(true);
      });
    }

    setSelection(null);
  };

  const onModalClose = () => {
    const copyTextToImgContainer = document.getElementById(
      'copy-text-to-img-container'
    );
    setShowPopover(false)
    setOCR(null)
    if (copyTextToImgContainer) {
      document?.body?.removeChild(copyTextToImgContainer);
    }
  }

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
      <Modal
        open={showPopover}
        title="Copy Image to Text"
        footer={null}
        onCancel={onModalClose}
        destroyOnClose
        className='absolute right-0 top-auto bottom-0'>
        <Progress
          percent={Math.round(progress * 100)}
          status={progress !== 1 ? 'active' : "normal"}
          strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
          className="min-w-[400px]"
        />
        <div className="flex">
          <Input.TextArea value={ocr?.text || 'Loading...'} readOnly autoSize />
          {ocr?.text && (
            <Tooltip title={'Copy'} placement='bottom'>
              <Button type="default" icon={<CopyOutlined />} className='ml-1' onClick={() => {
                navigator.clipboard.writeText(ocr?.text || '')
              }
              } />
            </Tooltip>
          )}
        </div>
        <div className="flex mt-2 items-center">
          <Text strong className='mr-1'>Accuracy:</Text>
          <Progress percent={ocr?.confidence} steps={10} strokeColor={['#d32f2f', '#d32f2f', '#d32f2f', '#d32f2f', '#ed6c02', '#ed6c02', '#ed6c02', '#2e7d32', '#2e7d32']} />
        </div>
      </Modal>
    </>
  );
};

export { ScreenCapture }
