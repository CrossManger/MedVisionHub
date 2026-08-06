import React, { useState, useEffect } from 'react';
import {
  Card,
  Descriptions,
  Table,
  Tag,
  Button,
  Skeleton,
  Alert,
  Typography,
  Space,
  Badge,
  Divider,
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  message,
  type TableProps,
} from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import type { PatientDetail } from '../types/patient';
import type { ScanSession } from '../types/scan';
import { patientService } from '../services/patientService';
import { scanService } from '../services/scanService';

const { Title, Text } = Typography;

const GENDER_LABEL: Record<string, string> = {
  male: 'Nam',
  female: 'Nữ',
  other: 'Khác',
};

const SCAN_STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: 'Chờ xử lý', color: 'orange' },
  in_progress: { label: 'Đang thực hiện', color: 'blue' },
  completed: { label: 'Hoàn tất', color: 'green' },
};

const SCAN_TYPE_LABEL: Record<string, string> = {
  xray: 'X-Ray',
  mri: 'MRI',
  ct_scan: 'CT Scan',
  ultrasound: 'Siêu âm',
};

const MyProfilePage: React.FC = () => {
  const navigate = useNavigate();

  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [scans, setScans] = useState<ScanSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  const fetchMyProfileData = async () => {
    setLoading(true);
    setError(null);
    try {
      const patientData = await patientService.getMyPatient();
      setPatient(patientData);

      try {
        const scanData = await scanService.getMyScans();
        setScans(scanData || []);
      } catch {
        setScans([]);
      }
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      setError(
        status === 404
          ? 'Chưa tìm thấy hồ sơ cá nhân của bạn. Vui lòng liên hệ bác sĩ.'
          : 'Đã có lỗi khi tải hồ sơ cá nhân. Vui lòng thử lại sau.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProfileData();
  }, []);

  const handleOpenEditModal = () => {
    if (!patient) return;
    form.setFieldsValue({
      full_name: patient.full_name,
      date_of_birth: patient.date_of_birth ? dayjs(patient.date_of_birth) : null,
      gender: patient.gender || undefined,
      phone: patient.phone || '',
      address: patient.address || '',
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const payload = {
        full_name: values.full_name,
        date_of_birth: values.date_of_birth ? values.date_of_birth.format('YYYY-MM-DD') : undefined,
        gender: values.gender,
        phone: values.phone,
        address: values.address,
      };

      await patientService.updateMyPatient(payload);
      message.success('Cập nhật thông tin cá nhân thành công!');
      setEditModalOpen(false);
      fetchMyProfileData();
    } catch (err: unknown) {
      const errMsg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      if (errMsg) {
        message.error(errMsg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const scanColumns: TableProps<ScanSession>['columns'] = [
    {
      title: 'Mã Ca chụp',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (val: number) => <Text strong>#{val}</Text>,
    },
    {
      title: 'Loại chụp',
      dataIndex: 'scan_type',
      key: 'scan_type',
      render: (type: string) => SCAN_TYPE_LABEL[type] ?? type,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const s = SCAN_STATUS_MAP[status];
        return s ? <Tag color={s.color}>{s.label}</Tag> : <Tag>{status}</Tag>;
      },
    },
    {
      title: 'Số ảnh',
      dataIndex: 'image_count',
      key: 'image_count',
      width: 100,
      render: (count?: number) => (
        <Badge count={count ?? 0} showZero color={(count ?? 0) > 0 ? '#1677ff' : '#aaa'} />
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => formatDateTime(date),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/scans/${record.id}`);
          }}
        >
          Xem ảnh
        </Button>
      ),
    },
  ];

  if (loading) {
    return <Skeleton active paragraph={{ rows: 8 }} />;
  }

  if (error || !patient) {
    return (
      <Alert
        type="warning"
        message={error ?? 'Chưa tìm thấy hồ sơ bệnh nhân cá nhân.'}
        className="my-4"
      />
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <Title level={3} className="!mb-1">
            Hồ sơ Cá nhân của tôi
          </Title>
          <Text type="secondary">
            Thông tin hành chính và lịch sử khám chữa bệnh của bạn tại hệ thống MedVision Hub.
          </Text>
        </div>

        <Button
          type="primary"
          onClick={handleOpenEditModal}
        >
          Cập nhật thông tin
        </Button>
      </div>

      {/* Patient Personal Info Card (Read-Only Medical History, Self-Editable Info) */}
      <Card
        title={
          <Space>
            <UserOutlined className="text-blue-500" />
            <span>Thông tin cá nhân</span>
            <Tag color="blue">Bệnh nhân</Tag>
          </Space>
        }
        className="mb-6 shadow-sm rounded-xl"
      >
        <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered size="small">
          <Descriptions.Item
            label={
              <Space>
                <UserOutlined />
                Họ và tên
              </Space>
            }
          >
            <Text strong className="text-base text-gray-800">{patient.full_name}</Text>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <Space>
                <CalendarOutlined />
                Ngày sinh
              </Space>
            }
          >
            {formatDate(patient.date_of_birth)}
          </Descriptions.Item>

          <Descriptions.Item label="Giới tính">
            {patient.gender ? (
              <Tag
                color={
                  patient.gender === 'male'
                    ? 'blue'
                    : patient.gender === 'female'
                    ? 'pink'
                    : 'default'
                }
              >
                {GENDER_LABEL[patient.gender] ?? patient.gender}
              </Tag>
            ) : (
              '—'
            )}
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <Space>
                <PhoneOutlined />
                Điện thoại
              </Space>
            }
          >
            {patient.phone ?? '—'}
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <Space>
                <EnvironmentOutlined />
                Địa chỉ
              </Space>
            }
            span={2}
          >
            {patient.address ?? '—'}
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <Space>
                <FileTextOutlined />
                Tiền sử bệnh án (Bác sĩ ghi nhận)
              </Space>
            }
            span={3}
          >
            {patient.medical_history ? (
              <Text className="whitespace-pre-wrap">{patient.medical_history}</Text>
            ) : (
              <Text type="secondary">Chưa có ghi nhận tiền sử bệnh</Text>
            )}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Patient Scan Sessions (Read-Only) */}
      <Card
        title={
          <Space>
            <MedicineBoxOutlined className="text-blue-500" />
            <span>Lịch sử ca chụp y tế ({scans.length})</span>
          </Space>
        }
        className="shadow-sm rounded-xl"
      >
        <Divider className="!mt-0" />
        <Table<ScanSession>
          rowKey="id"
          columns={scanColumns}
          dataSource={scans}
          pagination={false}
          scroll={{ x: 600 }}
          onRow={(record) => ({
            onClick: () => navigate(`/scans/${record.id}`),
            className: 'cursor-pointer hover:bg-blue-50/50 transition-colors',
          })}
          locale={{
            emptyText: (
              <div className="py-8 text-center text-gray-400">
                <MedicineBoxOutlined style={{ fontSize: 36, marginBottom: 8 }} />
                <p>Bạn chưa có ca chụp y tế nào trong hệ thống.</p>
              </div>
            ),
          }}
        />
      </Card>

      {/* Patient Self-Update Profile Modal */}
      <Modal
        title={
          <Space>
            <EditOutlined className="text-blue-600" />
            <span>Cập nhật Thông tin Cá nhân</span>
          </Space>
        }
        open={editModalOpen}
        onCancel={() => setEditModalOpen(false)}
        onOk={handleEditSubmit}
        confirmLoading={submitting}
        okText="Lưu thay đổi"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="full_name"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
          >
            <Input placeholder="Nhập họ và tên đầy đủ" />
          </Form.Item>

          <Form.Item name="date_of_birth" label="Ngày sinh">
            <DatePicker className="w-full" format="YYYY-MM-DD" placeholder="Chọn ngày sinh" />
          </Form.Item>

          <Form.Item name="gender" label="Giới tính">
            <Select placeholder="Chọn giới tính">
              <Select.Option value="male">Nam</Select.Option>
              <Select.Option value="female">Nữ</Select.Option>
              <Select.Option value="other">Khác</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="phone" label="Số điện thoại">
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item name="address" label="Địa chỉ">
            <Input.TextArea rows={2} placeholder="Nhập địa chỉ cư trú" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MyProfilePage;
