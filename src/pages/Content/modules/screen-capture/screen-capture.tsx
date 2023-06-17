import React, { MouseEvent, useState } from 'react';
import '../../content.styles.css';
import { Button, Input, Modal, Progress, Tooltip, Typography } from 'antd';
import { createWorker } from 'tesseract.js';
import { CheckOutlined, CopyOutlined, ReloadOutlined } from '@ant-design/icons';

const ScreenCapture = () => {
  const [selection, setSelection] = useState<any>(null);
  const [currentMousePosition, setCurrentMousePosition] = useState({
    left: 0,
    top: 0,
  });
  const [isMouseUp, setIsMouseUp] = useState(false);
  const [ocr, setOCR] = useState<{ text: string; confidence: number } | null>(
    null
  );
  const [progress, setProgress] = useState(0);
  const [showPopover, setShowPopover] = useState(false);
  const [isTextCopied, setIsTextCopied] = useState(false);

  const { Text } = Typography;

  const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    const startX = event.clientX;
    const startY = event.clientY;
    setSelection({ startX, startY });
  };

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    setCurrentMousePosition({ left: event.clientX, top: event.clientY });
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
      chrome.runtime.sendMessage(
        { message: 'takeScreenshot' },
        async (response) => {
          const screenshotUrl = await response?.screenshotUrl;
          const image = new Image();

          image.onload = () => {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = selection.width;
            canvas.height = selection.height;

            context?.drawImage(
              image,
              selection?.startX + selection?.startX,
              selection?.startY + selection?.startY,
              selection?.width + selection?.width,
              selection?.height + selection?.height,
              0,
              0,
              selection?.width,
              selection?.height
            );
            const copiedImage = canvas?.toDataURL('image/png');
            convertImageToText(copiedImage);
            setIsMouseUp(true);
          };
          image.src = await screenshotUrl;
        }
      );
    }

    setSelection(null);
  };

  const onModalClose = () => {
    const copyTextToImgContainer = document.getElementById(
      'copy-text-to-img-container'
    );
    setShowPopover(false);
    setOCR(null);
    if (copyTextToImgContainer) {
      document?.body?.removeChild(copyTextToImgContainer);
    }
  };

  const copyTextToClipboard = async (text: string) => {
    if ('clipboard' in navigator) {
      return await navigator.clipboard.writeText(text);
    } else {
      return document.execCommand('copy', true, text);
    }
  };

  const handleCopyClick = (text: string) => {
    copyTextToClipboard(text)
      .then(() => {
        setIsTextCopied(true);
        setTimeout(() => {
          setIsTextCopied(false);
        }, 1500);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const onRecapture = (e: MouseEvent<HTMLDivElement>) => {
    setShowPopover(false);
    setIsMouseUp(false);
    setOCR(null);
    setProgress(0);
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
        <div
          className={
            !isMouseUp
              ? `fixed top-0 left-0 w-full h-full bg-black/[.5] z-[999999] cursor-crosshair`
              : ''
          }
        />
        {currentMousePosition && !isMouseUp && (
          <div
            className="absolute text-black cursor-crosshair z-[999999] text-shadow-sm shadow-white"
            style={{ ...currentMousePosition }}
          >{`${currentMousePosition.left}/${currentMousePosition.top}`}</div>
        )}
        {selection && (
          <div
            className={
              !isMouseUp
                ? `absolute border-2 border-white border-dotted z-[999999]`
                : ''
            }
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
        getContainer="#copy-text-to-img-container"
        className="absolute right-0 top-auto bottom-0"
      >
        {ocr?.text ? (
          <>
            <div className="flex">
              <textarea
                rows={4}
                className="block p-2.5 w-full rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 min-h-fit"
                value={ocr?.text}
                onChange={(e) => setOCR({ ...ocr, text: e?.target?.value })}
              />
              <div className="flex flex-col ml-1">
                <Tooltip title={'Copy'} placement="bottom">
                  <Button
                    type="default"
                    icon={isTextCopied ? <CheckOutlined /> : <CopyOutlined />}
                    onClick={() => handleCopyClick(ocr?.text)}
                  />
                </Tooltip>
                <Tooltip title={'Re-Capture'} placement="bottom">
                  <Button
                    type="default"
                    icon={<ReloadOutlined onClick={onRecapture} />}
                  />
                </Tooltip>
              </div>
            </div>
            <div className="flex mt-2 items-center">
              <Text strong className="mr-1">
                Accuracy:
              </Text>
              <Progress
                percent={ocr?.confidence}
                steps={10}
                strokeColor={[
                  '#d32f2f',
                  '#d32f2f',
                  '#d32f2f',
                  '#d32f2f',
                  '#ed6c02',
                  '#ed6c02',
                  '#ed6c02',
                  '#2e7d32',
                  '#2e7d32',
                ]}
              />
            </div>
          </>
        ) : (
          <Progress
            type="circle"
            percent={Math.round(progress * 100)}
            status={progress !== 1 ? 'active' : 'normal'}
            strokeColor={{ '0%': '#108ee9', '100%': '#87d068' }}
            className="min-w-[400px]"
          />
        )}
      </Modal>
    </>
  );
};

export { ScreenCapture };
