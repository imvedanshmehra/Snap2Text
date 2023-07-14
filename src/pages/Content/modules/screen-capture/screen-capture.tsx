import React, { MouseEvent, useState } from 'react';
import '../../content.styles.css';
import { Button, Modal, Spin, Tag, Tooltip } from 'antd';
import {
  CheckOutlined,
  CopyOutlined,
  LoadingOutlined,
  ReloadOutlined,
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
            className={!isMouseUp ? `absolute z-[999999]` : ''}
            style={
              !isMouseUp && {
                border: '2px solid white',
                ...selection,
              }
            }
          />
        )}
      </div>
      <Modal
        open={showPopover}
        title={
          <div className="flex items-center">
            <h3 className="mr-2 mt-0 mb-0">Snap2Text</h3>
            <Tag>Free</Tag>
          </div>
        }
        footer={null}
        onCancel={onModalClose}
        destroyOnClose
        getContainer="#snap2TextContainer"
        className="absolute right-0 top-auto bottom-0"
      >
        {!isLoading && ocr?.text ? (
          <>
            <div className="flex">
              <textarea
                rows={4}
                className="block p-2.5 w-full rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 min-h-fit bg-white"
                value={ocr?.text}
                onChange={(e) => setOCR({ ...ocr, text: e?.target?.value })}
              />
              <div className="flex flex-col ml-1">
                <Tooltip title={'Copy'} placement="bottom" className="mb-1">
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
          </>
        ) : (
          <div className="mt-4">
            <Spin indicator={loadingIcon} />
          </div>
        )}
      </Modal>
    </>
  );
};

export { ScreenCapture };
