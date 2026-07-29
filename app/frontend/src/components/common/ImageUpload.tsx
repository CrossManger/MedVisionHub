import React, { useState } from 'react';
import { Upload, message, Progress } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { imageService } from '../../services/imageService';
import type { MedicalImage } from '../../types/image';

const { Dragger } = Upload;

interface ImageUploadProps {
  scanId: number;
  onUploadSuccess?: (newImage: MedicalImage) => void;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'application/dicom', 'image/dicom'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.dcm', '.dicom'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const ImageUpload: React.FC<ImageUploadProps> = ({ scanId, onUploadSuccess }) => {
  const [uploading, setUploading] = useState(false);
  const [percent, setPercent] = useState(0);

  const isAllowedFile = (file: File): boolean => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    const typeValid = ALLOWED_TYPES.includes(file.type) || ALLOWED_EXTENSIONS.includes(ext);
    return typeValid;
  };

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    showUploadList: false,
    beforeUpload: (file) => {
      if (!isAllowedFile(file)) {
        message.error(`File ${file.name} không đúng định dạng. Chỉ chấp nhận JPG, PNG, DICOM.`);
        return Upload.LIST_IGNORE;
      }

      if (file.size > MAX_FILE_SIZE) {
        message.error(`File ${file.name} vượt quá dung lượng tối đa 10MB.`);
        return Upload.LIST_IGNORE;
      }

      return true;
    },
    customRequest: async (options) => {
      const { file } = options;
      const targetFile = file as File;

      setUploading(true);
      setPercent(0);

      try {
        const res = await imageService.upload(scanId, targetFile, (progressEvent) => {
          if (progressEvent.total) {
            const currentPercent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setPercent(currentPercent);
          }
        });

        message.success(`Upload file "${targetFile.name}" thành công!`);
        if (onUploadSuccess && res.image) {
          onUploadSuccess(res.image);
        }
      } catch (err: any) {
        const errMsg = err?.response?.data?.error || 'Lỗi không xác định khi upload file';
        message.error(`Upload file "${targetFile.name}" thất bại: ${errMsg}`);
      } finally {
        setUploading(false);
        setPercent(0);
      }
    },
  };

  return (
    <div className="w-full my-4">
      <Dragger {...uploadProps} disabled={uploading} className="bg-slate-50 hover:bg-slate-100 transition-colors p-4 rounded-lg border-2 border-dashed border-sky-300">
        <p className="ant-upload-drag-icon text-sky-500 text-4xl mb-2">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text text-slate-800 font-medium text-base">
          Kéo thả file hình ảnh y tế vào đây, hoặc click để chọn file
        </p>
        <p className="ant-upload-hint text-slate-500 text-sm mt-1">
          Hỗ trợ upload ảnh JPG, PNG, DICOM. Dung lượng tối đa: 10MB / file.
        </p>
      </Dragger>

      {uploading && (
        <div className="mt-3">
          <Progress percent={percent} status="active" strokeColor={{ '0%': '#10b981', '100%': '#0284c7' }} />
          <p className="text-xs text-slate-500 text-center mt-1">Đang tải file lên máy chủ...</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
