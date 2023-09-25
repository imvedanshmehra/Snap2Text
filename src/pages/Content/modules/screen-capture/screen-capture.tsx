import React, { MouseEvent, useState } from 'react';
import '../../../index.styles.css';
import { Button, Modal, Spin, Tooltip } from 'antd';
import {
  CheckOutlined,
  CopyOutlined,
  LoadingOutlined,
  ReloadOutlined,
  TranslationOutlined,
} from '@ant-design/icons';
import axios from 'axios';
// @ts-ignore
import secrets from 'secrets';
// @ts-ignore
import endpoints from '../../../../helper/endpoints.js';

const ScreenCapture = () => {
  const [selection, setSelection] = useState<any>(null);
  const [currentMousePosition, setCurrentMousePosition] = useState({
    left: 0,
    top: 0,
  });
  const [isMouseUp, setIsMouseUp] = useState(false);
  const [ocr, setOCR] = useState<{ text: string } | null>(null);
  const [showPopover, setShowPopover] = useState(false);
  const [isTextCopied, setIsTextCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadingIcon = <LoadingOutlined style={{ fontSize: 32 }} spin />;

  const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    const startX = event.clientX + window.scrollX;
    const startY = event.clientY + window.scrollY;
    setSelection({ startX, startY });
  };

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    setCurrentMousePosition({
      left: event.clientX + window.scrollX,
      top: event.clientY + window.scrollY,
    });

    if (!selection) return;

    const currentX = event.clientX + window.scrollX;
    const currentY = event.clientY + window.scrollY;

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

  const convertImageToText = async (base64Image: string) => {
    if (!base64Image || ocr?.text) return;

    axios
      .post(
        endpoints?.OCR_SPACE_POST,
        {
          language: 'eng',
          isOverlayRequired: false,
          iscreatesearchablepdf: false,
          issearchablepdfhidetextlayer: false,
          scale: 'true',
          base64Image,
        },
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            apikey: secrets.OCR_API_KEY,
          },
        }
      )
      .then((res) => {
        setOCR({
          ...ocr,
          text:
            res?.data?.ParsedResults && res?.data?.ParsedResults[0]?.ParsedText,
        });
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  const handleMouseUp = async () => {
    const body = document.querySelector('body');
    if (body) {
      setShowPopover(true);
      setIsLoading(true);
      chrome.runtime.sendMessage(
        { message: 'takeScreenshot' },
        async (response) => {
          const screenshotUrl = await response?.screenshotUrl;
          const image = new Image();
          const devicePxRatio = devicePixelRatio;
          const scaleValue = 1 / devicePxRatio;

          // image.onload = () => {
          //   const canvas = document.createElement('canvas');
          //   const context = canvas.getContext('2d');
          //   canvas.width = selection.width;
          //   canvas.height = selection.height;

          //   context?.drawImage(
          //     image,
          //     selection?.startX * 2 - window.scrollX * 2,
          //     selection?.startY * 2 - window.scrollY * 2,
          //     selection?.width * 2,
          //     selection?.height * 2,
          //     0,
          //     0,
          //     selection?.width,
          //     selection?.height
          //   );
          image.onload = function () {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const wantedWidth = selection.width * scaleValue;
            const wantedHeight = selection.height * scaleValue;
            canvas.width = wantedWidth;
            canvas.height = wantedHeight;
            ctx?.drawImage(
              image,
              selection?.startX * 2 - window.scrollX * 2,
              selection?.startY * 2 - window.scrollY * 2,
              selection?.width * 2,
              selection?.height * 2,
              0,
              0,
              wantedWidth,
              wantedHeight
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
    const copyTextToImgContainer =
      document.getElementById('snap2TextContainer');
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
        {!isMouseUp && (
          <div
            className={`s2t-fixed s2t-top-0 s2t-left-0 s2t-w-full s2t-h-full s2t-bg-black/[.5] s2t-z-[999999] s2t-cursor-crosshair`}
          />
        )}
        {currentMousePosition && !isMouseUp && (
          <div
            className="s2t-absolute s2t-text-black s2t-cursor-crosshair s2t-z-[999999] s2t-text-shadow-sm s2t-shadow-white"
            style={{ ...currentMousePosition }}
          >{`${currentMousePosition.left}/${currentMousePosition.top}`}</div>
        )}
        {selection && !isMouseUp && (
          <div
            className={`s2t-absolute s2t-border-solid s2t-border-2 s2t-border-white s2t-z-[999999]`}
            style={{
              ...selection,
            }}
          />
        )}
      </div>

      <Modal
        open={showPopover}
        title={
          <div className="s2t-flex s2t-items-center">
            <h2 className="s2t-mr-2 s2t-mt-0 s2t-mb-0">Snap2Text</h2>
          </div>
        }
        footer={null}
        onCancel={onModalClose}
        destroyOnClose
        getContainer="#snap2TextContainer"
        width="650px"
        className="s2t-absolute s2t-right-0 s2t-top-auto s2t-bottom-0"
      >
        {!isLoading && ocr?.text ? (
          <>
            <div className="s2t-flex">
              <textarea
                rows={4}
                className="s2t-block s2t-p-2.5 s2t-w-full s2t-rounded-lg s2t-border s2t-border-gray-300 s2t-focus:ring-blue-500 s2t-focus:border-blue-500 s2t-bg-white s2t-text-black"
                value={ocr?.text}
                onChange={(e) => {
                  setOCR({ ...ocr, text: e?.target?.value });
                }}
              />
              <div className="s2t-flex s2t-flex-col s2t-ml-1">
                <Tooltip title={'Copy'} placement="bottom" className="s2t-mb-1">
                  <Button
                    type="default"
                    icon={isTextCopied ? <CheckOutlined /> : <CopyOutlined />}
                    onClick={() => handleCopyClick(ocr?.text)}
                  />
                </Tooltip>
                <Tooltip
                  title={'Re-Capture'}
                  placement="bottom"
                  className="s2t-mb-1"
                >
                  <Button
                    type="default"
                    icon={<ReloadOutlined onClick={onRecapture} />}
                  />
                </Tooltip>
                <Tooltip
                  title={'Translate with Google Translate'}
                  placement="bottom"
                >
                  <Button
                    type="default"
                    icon={<TranslationOutlined />}
                    onClick={() =>
                      chrome.runtime.sendMessage({
                        message: 'translateWithGoogleTranslate',
                        options: { text: ocr?.text },
                      })
                    }
                  />
                </Tooltip>
              </div>
            </div>
          </>
        ) : (
          <div className="s2t-mt-4">
            <Spin indicator={loadingIcon} />
          </div>
        )}
      </Modal>
    </>
  );
};

export { ScreenCapture };
