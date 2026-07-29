import React, { useState } from 'react';
import { Modal, Button, Tooltip, Space } from 'antd';
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  RotateRightOutlined,
  RotateLeftOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import type { MedicalImage } from '../../types/image';

interface ImageViewerProps {
  image: MedicalImage | null;
  open: boolean;
  onClose: () => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({ image, open, onClose }) => {
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  if (!image) return null;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 4));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotateRight = () => setRotation((prev) => (prev + 90) % 360);
  const handleRotateLeft = () => setRotation((prev) => (prev - 90 + 360) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };
  const toggleFullscreen = () => setIsFullscreen((prev) => !prev);

  // Helper to convert relative URL to full backend URL if needed
  const getImageUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    const baseUrl = import.meta.env.VITE_API_BASE_URL
      ? import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '')
      : 'http://localhost:8080';
    return `${baseUrl}${url}`;
  };

  return (
    <Modal
      open={open}
      onCancel={() => {
        handleReset();
        setIsFullscreen(false);
        onClose();
      }}
      footer={null}
      width={isFullscreen ? '100vw' : '85vw'}
      style={{ top: isFullscreen ? 0 : 20, padding: 0 }}
      styles={{ body: { padding: 16, backgroundColor: '#0f172a' } }}
      destroyOnClose
      centered={!isFullscreen}
    >
      <div className="flex flex-col h-full text-slate-100">
        {/* Header Bar */}
        <div className="flex flex-wrap justify-between items-center pb-3 border-b border-slate-700 gap-2">
          <div>
            <h3 className="text-lg font-semibold text-white truncate max-w-md">
              {image.file_name}
            </h3>
            <p className="text-xs text-slate-400">
              {image.mime_type || 'image'} • {image.file_size ? `${(image.file_size / 1024).toFixed(1)} KB` : 'N/A'} • Tải lên bởi: {image.uploader_name || 'N/A'}
            </p>
          </div>

          {/* Control Toolbar */}
          <Space wrap className="bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
            <Tooltip title="Thu nhỏ">
              <Button icon={<ZoomOutOutlined />} onClick={handleZoomOut} type="text" className="text-slate-200 hover:text-white" />
            </Tooltip>
            <span className="text-xs font-mono text-slate-300 w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Tooltip title="Phóng to">
              <Button icon={<ZoomInOutlined />} onClick={handleZoomIn} type="text" className="text-slate-200 hover:text-white" />
            </Tooltip>

            <div className="w-px h-4 bg-slate-700 my-auto mx-1" />

            <Tooltip title="Xoay trái">
              <Button icon={<RotateLeftOutlined />} onClick={handleRotateLeft} type="text" className="text-slate-200 hover:text-white" />
            </Tooltip>
            <Tooltip title="Xoay phải">
              <Button icon={<RotateRightOutlined />} onClick={handleRotateRight} type="text" className="text-slate-200 hover:text-white" />
            </Tooltip>

            <div className="w-px h-4 bg-slate-700 my-auto mx-1" />

            <Tooltip title="Đặt lại (Reset)">
              <Button icon={<UndoOutlined />} onClick={handleReset} type="text" className="text-slate-200 hover:text-white" />
            </Tooltip>

            <Tooltip title={isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}>
              <Button
                icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                onClick={toggleFullscreen}
                type="text"
                className="text-slate-200 hover:text-white"
              />
            </Tooltip>
          </Space>
        </div>

        {/* Main Viewing Canvas */}
        <div className="relative flex items-center justify-center min-h-[60vh] max-h-[75vh] overflow-hidden my-4 bg-slate-950 rounded-lg border border-slate-800">
          <img
            src={getImageUrl(image.file_url)}
            alt={image.file_name}
            className="transition-transform duration-200 ease-out max-h-[70vh] object-contain select-none cursor-grab active:cursor-grabbing"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
            }}
          />
        </div>

        {/* Diagnostic Notes Footer if present */}
        {image.diagnostic_result && (
          <div className="bg-slate-800 p-3 rounded border border-slate-700 text-sm">
            <span className="font-medium text-amber-400">Kết quả chẩn đoán / Ghi chú: </span>
            <span className="text-slate-200">{image.diagnostic_result}</span>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ImageViewer;
