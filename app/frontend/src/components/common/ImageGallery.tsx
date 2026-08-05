import React, { useState } from 'react';
import { Card, Popconfirm, message, Empty, Tooltip } from 'antd';
import { EyeOutlined, DeleteOutlined, FileImageOutlined } from '@ant-design/icons';
import type { MedicalImage } from '../../types/image';
import { imageService } from '../../services/imageService';
import ImageViewer from './ImageViewer';

interface ImageGalleryProps {
  images: MedicalImage[];
  onDeleteSuccess?: (deletedImageId: number) => void;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, onDeleteSuccess }) => {
  const [selectedImage, setSelectedImage] = useState<MedicalImage | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const baseUrl = import.meta.env.VITE_API_BASE_URL
      ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/v1\/?$/, '')
      : '';
    return `${baseUrl}${url}`;
  };

  const handleOpenViewer = (img: MedicalImage) => {
    setSelectedImage(img);
    setViewerOpen(true);
  };

  const handleDelete = async (imageId: number) => {
    setDeletingId(imageId);
    try {
      await imageService.delete(imageId);
      message.success('Đã xóa hình ảnh thành công');
      if (onDeleteSuccess) {
        onDeleteSuccess(imageId);
      }
    } catch (err: any) {
      const errMsg = err?.response?.data?.error || 'Không thể xóa hình ảnh';
      message.error(errMsg);
    } finally {
      setDeletingId(null);
    }
  };

  if (!images || images.length === 0) {
    return (
      <div className="py-8">
        <Empty description="Chưa có hình ảnh y tế nào trong ca chụp này" />
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 my-4">
        {images.map((img) => (
          <Card
            key={img.id}
            hoverable
            className="overflow-hidden shadow-sm border border-slate-200 rounded-lg group transition-all duration-200 hover:shadow-md"
            cover={
              <div
                className="relative h-48 bg-slate-900 overflow-hidden flex items-center justify-center cursor-pointer"
                onClick={() => handleOpenViewer(img)}
              >
                <img
                  src={getImageUrl(img.file_url)}
                  alt={img.file_name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    // Fallback thumbnail placeholder if DICOM or broken image link
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <span className="p-2 bg-white/90 rounded-full text-slate-800 hover:bg-white shadow">
                    <EyeOutlined className="text-lg" />
                  </span>
                </div>
              </div>
            }
            actions={[
              <Tooltip key="view" title="Xem chi tiết">
                <EyeOutlined key="eye" onClick={() => handleOpenViewer(img)} className="text-sky-600 hover:text-sky-700" />
              </Tooltip>,
              <Popconfirm
                key="delete"
                title="Xóa hình ảnh"
                description="Bạn có chắc chắn muốn xóa hình ảnh y tế này khỏi ca chụp?"
                onConfirm={() => handleDelete(img.id)}
                okText="Xóa"
                cancelText="Hủy"
                okButtonProps={{ danger: true, loading: deletingId === img.id }}
              >
                <Tooltip title="Xóa ảnh">
                  <DeleteOutlined className="text-red-500 hover:text-red-700" />
                </Tooltip>
              </Popconfirm>,
            ]}
          >
            <Card.Meta
              avatar={<FileImageOutlined className="text-sky-500 text-xl" />}
              title={<span className="text-sm font-medium text-slate-800 truncate block" title={img.file_name}>{img.file_name}</span>}
              description={
                <div className="text-xs text-slate-500 space-y-0.5">
                  <p>{img.file_size ? `${(img.file_size / 1024).toFixed(1)} KB` : 'N/A'}</p>
                  <p className="text-[11px] text-slate-400">{new Date(img.created_at).toLocaleDateString('vi-VN')}</p>
                </div>
              }
            />
          </Card>
        ))}
      </div>

      <ImageViewer
        image={selectedImage}
        open={viewerOpen}
        onClose={() => {
          setViewerOpen(false);
          setSelectedImage(null);
        }}
      />
    </>
  );
};

export default ImageGallery;
