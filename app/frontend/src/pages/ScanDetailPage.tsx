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
  Modal,
  Form,
  Input,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  UserOutlined,
  PictureOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  SolutionOutlined,
} from '@ant-design/icons';
import type { ScanSession } from '../types/scan';
import type { MedicalImage } from '../types/image';
import { scanService } from '../services/scanService';
import { imageService } from '../services/imageService';
import ImageUpload from '../components/common/ImageUpload';
import ImageGallery from '../components/common/ImageGallery';
import RequirePermission from '../components/common/RequirePermission';
import { useAuthStore } from '../stores/authStore';

const { Title, Text } = Typography;
const { TextArea } = Input;

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
  const { user, hasPermission } = useAuthStore();

  const [scan, setScan] = useState<ScanSession | null>(null);
  const [images, setImages] = useState<MedicalImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Complete Scan Modal state
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [submittingComplete, setSubmittingComplete] = useState(false);
  const [form] = Form.useForm();

  const isPatientRole = user?.role === 'patient' || !hasPermission('can_view_patient');

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

  const handleCompleteSubmit = async () => {
    if (!scan) return;
    try {
      const values = await form.validateFields();
      setSubmittingComplete(true);
      await scanService.complete(scan.id, { diagnostic_result: values.diagnostic_result });
      message.success('Đã hoàn tất ca chụp và gửi kết quả chẩn đoán thành công!');
      setCompleteModalOpen(false);
      form.resetFields();
      fetchScanAndImages();
    } catch (err: unknown) {
      const errMsg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      if (errMsg) {
        message.error(errMsg);
      }
    } finally {
      setSubmittingComplete(false);
    }
  };

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
          <Button size="small" onClick={() => navigate(isPatientRole ? '/my-profile' : '/patients')}>
            {isPatientRole ? 'Quay lại Hồ sơ cá nhân' : 'Quay lại danh sách bệnh nhân'}
          </Button>
        }
      />
    );
  }

  const statusInfo = SCAN_STATUS_MAP[scan.status] || { label: scan.status, color: 'default' };
  const isCompleted = scan.status === 'completed';

  // Dynamic Breadcrumb based on User Role
  const breadcrumbItems = isPatientRole
    ? [
        { title: <Link to="/my-profile">Hồ sơ Cá nhân</Link> },
        { title: `Chi tiết Ca chụp #${scan.id}` },
      ]
    : [
        { title: <Link to="/patients">Quản lý Bệnh nhân</Link> },
        { title: <Link to={`/patients/${scan.patient_id}`}>Hồ sơ bệnh nhân #{scan.patient_id}</Link> },
        { title: `Ca chụp #${scan.id}` },
      ];

  const handleBackNavigation = () => {
    if (isPatientRole) {
      navigate('/my-profile');
    } else {
      navigate(`/patients/${scan.patient_id}`);
    }
  };

  return (
    <div>
      {/* Dynamic Role-Based Breadcrumb */}
      <Breadcrumb className="mb-4" items={breadcrumbItems} />

      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={handleBackNavigation} />
          <Title level={3} className="!mb-0">
            Chi tiết Ca chụp #{scan.id}
          </Title>
        </Space>

        {/* Complete Scan Action Button for Doctors */}
        <RequirePermission permission="can_create_scan">
          {!isCompleted && (
            <Button
              type="primary"
              style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              icon={<CheckCircleOutlined />}
              onClick={() => setCompleteModalOpen(true)}
            >
              Hoàn tất chẩn đoán
            </Button>
          )}
        </RequirePermission>
      </div>

      {/* Diagnostic Result Banner if completed */}
      {isCompleted && scan.diagnostic_result && (
        <Alert
          type="success"
          showIcon
          icon={<CheckCircleOutlined className="text-xl" />}
          message={<Text strong className="text-base">Kết quả chẩn đoán y tế</Text>}
          description={
            <div className="mt-1">
              <Text className="whitespace-pre-wrap">{scan.diagnostic_result}</Text>
            </div>
          }
          className="mb-6 rounded-xl border-green-200 bg-green-50/80"
        />
      )}

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

          <Descriptions.Item label="Bệnh nhân sở hữu">
            <Space>
              <SolutionOutlined className="text-indigo-500" />
              <Text strong>
                {scan.patient_name ? `${scan.patient_name} (#${scan.patient_id})` : `Bệnh nhân #${scan.patient_id}`}
              </Text>
            </Space>
          </Descriptions.Item>

          <Descriptions.Item label="Bác sĩ chỉ định">
            <Space>
              <UserOutlined className="text-blue-500" />
              <Text strong>
                {scan.doctor_name ? `${scan.doctor_name} (#${scan.doctor_id})` : `Bác sĩ #${scan.doctor_id}`}
              </Text>
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
        
        {/* Upload Component (Only if scan not completed) */}
        {!isCompleted && (
          <RequirePermission permission="can_upload_image">
            <ImageUpload
              scanId={scan.id}
              onUploadSuccess={(newImg) => {
                setImages((prev) => [newImg, ...prev]);
                fetchScanAndImages(); // Refresh scan details
              }}
            />
          </RequirePermission>
        )}

        {/* Gallery Component */}
        <ImageGallery
          images={images}
          onDeleteSuccess={(deletedId) => {
            setImages((prev) => prev.filter((img) => img.id !== deletedId));
            fetchScanAndImages(); // Refresh scan info on deletion
          }}
        />
      </Card>

      {/* Complete Scan Modal */}
      <Modal
        title={
          <Space>
            <FileTextOutlined className="text-green-600" />
            <span>Hoàn tất chẩn đoán ca chụp #{scan.id}</span>
          </Space>
        }
        open={completeModalOpen}
        onCancel={() => setCompleteModalOpen(false)}
        onOk={handleCompleteSubmit}
        confirmLoading={submittingComplete}
        okText="Xác nhận hoàn tất"
        cancelText="Hủy"
        okButtonProps={{ style: { backgroundColor: '#52c41a', borderColor: '#52c41a' } }}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="diagnostic_result"
            label="Kết quả chẩn đoán y tế"
            rules={[{ required: true, message: 'Vui lòng nhập kết quả chẩn đoán cho bệnh nhân!' }]}
          >
            <TextArea
              rows={4}
              placeholder="Nhập nhận xét, chẩn đoán chi tiết của bác sĩ (ví dụ: Hình ảnh X-quang tim phổi bình thường, không thấy vôi hóa bất thường...)"
              maxLength={2000}
              showCount
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ScanDetailPage;
