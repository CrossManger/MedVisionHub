import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Skeleton,
  Alert,
  Typography,
  Space,
  Breadcrumb,
  Divider,
} from 'antd';
import {
  ArrowLeftOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  UserOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import type { ScanSession } from '../types/scan';
import type { MedicalImage } from '../types/image';
import { scanService } from '../services/scanService';
import { imageService } from '../services/imageService';
import ImageUpload from '../components/common/ImageUpload';
import ImageGallery from '../components/common/ImageGallery';

const { Title, Text } = Typography;

const SCAN_STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: 'Chờ xử lý', color: 'orange' },
  in_progress: { label: 'Đang thực hiện', color: 'blue' },
  completed: { label: 'Hoàn tất', color: 'green' },
};

const SCAN_TYPE_LABEL: Record<string, string> = {
  xray: 'X-Ray (Chụp X-quang)',
  mri: 'MRI (Chụp Cộng hưởng từ)',
  ct_scan: 'CT Scan (Chụp Cắt lớp vi tính)',
  ultrasound: 'Siêu âm',
};

const ScanDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [scan, setScan] = useState<ScanSession | null>(null);
  const [images, setImages] = useState<MedicalImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchScanAndImages = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const scanId = Number(id);
      const scanData = await scanService.getById(scanId);
      setScan(scanData);

      try {
        const imageData = await imageService.getByScanId(scanId);
        setImages(imageData.data || []);
      } catch {
        setImages([]);
      }
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      setError(
        status === 404
          ? 'Không tìm thấy ca chụp này.'
          : 'Đã có lỗi khi tải thông tin ca chụp.'
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchScanAndImages();
  }, [fetchScanAndImages]);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <Skeleton active paragraph={{ rows: 6 }} />;
  }

  if (error || !scan) {
    return (
      <Alert
        type="error"
        message={error || 'Không tìm thấy ca chụp'}
        action={
          <Button size="small" onClick={() => navigate('/patients')}>
            Quay lại danh sách bệnh nhân
          </Button>
        }
      />
    );
  }

  const statusInfo = SCAN_STATUS_MAP[scan.status] || { label: scan.status, color: 'default' };

  return (
    <div>
      <Breadcrumb
        className="mb-4"
        items={[
          { title: <Link to="/patients">Quản lý Bệnh nhân</Link> },
          { title: <Link to={`/patients/${scan.patient_id}`}>Hồ sơ bệnh nhân #{scan.patient_id}</Link> },
          { title: `Ca chụp #${scan.id}` },
        ]}
      />

      <div className="flex items-center justify-between mb-6">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/patients/${scan.patient_id}`)} />
          <Title level={3} className="!mb-0">
            Chi tiết Ca chụp #{scan.id}
          </Title>
        </Space>
      </div>

      {/* Overview Card */}
      <Card
        title={
          <Space>
            <MedicineBoxOutlined />
            Thông tin ca chụp
          </Space>
        }
        className="mb-6 shadow-sm"
      >
        <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered size="small">
          <Descriptions.Item label="Loại ca chụp">
            <Text strong>{SCAN_TYPE_LABEL[scan.scan_type] || scan.scan_type}</Text>
          </Descriptions.Item>

          <Descriptions.Item label="Trạng thái">
            <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Mã Bệnh nhân">
            <Link to={`/patients/${scan.patient_id}`}>Bệnh nhân #{scan.patient_id}</Link>
          </Descriptions.Item>

          <Descriptions.Item label="Bác sĩ chỉ định">
            <Space>
              <UserOutlined />
              Bác sĩ #{scan.doctor_id}
            </Space>
          </Descriptions.Item>

          <Descriptions.Item label="Thời gian tạo">
            <Space>
              <CalendarOutlined />
              {formatDate(scan.created_at)}
            </Space>
          </Descriptions.Item>

          <Descriptions.Item label="Số lượng hình ảnh">
            <Text>{images.length} tệp ảnh</Text>
          </Descriptions.Item>

          <Descriptions.Item label="Ghi chú chỉ định" span={3}>
            {scan.notes ? (
              <Text className="whitespace-pre-wrap">{scan.notes}</Text>
            ) : (
              <Text type="secondary">Chưa có ghi chú chỉ định</Text>
            )}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Image Upload & Gallery Container */}
      <Card
        title={
          <Space>
            <PictureOutlined />
            Danh sách hình ảnh y tế ({images.length})
          </Space>
        }
        className="shadow-sm"
      >
        <Divider className="!mt-0" />
        
        {/* Upload Component */}
        <ImageUpload
          scanId={scan.id}
          onUploadSuccess={(newImg) => {
            setImages((prev) => [newImg, ...prev]);
            fetchScanAndImages(); // Automatically refresh status and scan details
          }}
        />

        {/* Gallery Component */}
        <ImageGallery
          images={images}
          onDeleteSuccess={(deletedId) => {
            setImages((prev) => prev.filter((img) => img.id !== deletedId));
            fetchScanAndImages(); // Refresh scan info on deletion
          }}
        />
      </Card>
    </div>
  );
};

export default ScanDetailPage;
