import React, { useState, useEffect, useCallback } from 'react';
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
  Breadcrumb,
  Badge,
  Divider,
  type TableProps,
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  UserOutlined,
  CalendarOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  MedicineBoxOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { useParams, useNavigate, Link } from 'react-router-dom';
import type { PatientDetail } from '../types/patient';
import type { ScanSession } from '../types/scan';
import { patientService } from '../services/patientService';
import { scanService } from '../services/scanService';
import PatientForm from '../components/common/PatientForm';
import ScanForm from '../components/common/ScanForm';
import RequirePermission from '../components/common/RequirePermission';

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

const PatientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ── State ──────────────────────────────────────────────────────────────────
  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [scans, setScans] = useState<ScanSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const [scanFormOpen, setScanFormOpen] = useState(false);

  // ── Data Fetching ──────────────────────────────────────────────────────────
  const fetchPatient = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const patientId = Number(id);
      const data = await patientService.getById(patientId);
      setPatient(data);
      
      // Fetch scan sessions for patient
      try {
        const scanData = await scanService.getByPatientId(patientId);
        setScans(scanData);
      } catch {
        setScans([]);
      }
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      setError(
        status === 404
          ? 'Không tìm thấy hồ sơ bệnh nhân này.'
          : 'Đã có lỗi khi tải thông tin. Vui lòng thử lại.'
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPatient();
  }, [fetchPatient]);

  // ── Helpers ────────────────────────────────────────────────────────────────
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

  // ── Scan Sessions Table ────────────────────────────────────────────────────
  const scanColumns: TableProps<ScanSession>['columns'] = [
    {
      title: 'ID Ca chụp',
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
          type="link"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/scans/${record.id}`);
          }}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div>
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div>
        <Alert
          type="error"
          message={error ?? 'Không tìm thấy bệnh nhân'}
          action={
            <Button size="small" onClick={() => navigate('/patients')}>
              Quay lại danh sách
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <Breadcrumb
        className="mb-4"
        items={[
          { title: <Link to="/patients">Quản lý Bệnh nhân</Link> },
          { title: patient.full_name },
        ]}
      />

      {/* Page title row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
          <Title level={3} className="!mb-0">
            Hồ sơ Bệnh nhân: {patient.full_name}
          </Title>
        </Space>

        {/* Edit Patient Button (Requires can_edit_patient permission) */}
        <RequirePermission permission="can_edit_patient">
          <Button
            type="primary"
            onClick={() => setEditFormOpen(true)}
            id="btn-edit-patient"
          >
            Chỉnh sửa
          </Button>
        </RequirePermission>
      </div>

      {/* Patient info card */}
      <Card
        title={
          <Space>
            <UserOutlined />
            Thông tin cá nhân
          </Space>
        }
        className="mb-6 shadow-sm"
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
            <Text strong>{patient.full_name}</Text>
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
                Tiền sử bệnh
              </Space>
            }
            span={3}
          >
            {patient.medical_history ? (
              <Text className="whitespace-pre-wrap">{patient.medical_history}</Text>
            ) : (
              <Text type="secondary">Chưa có thông tin</Text>
            )}
          </Descriptions.Item>

          <Descriptions.Item label="Ngày tạo hồ sơ">
            {formatDateTime(patient.created_at)}
          </Descriptions.Item>
          <Descriptions.Item label="Cập nhật lần cuối">
            {formatDateTime(patient.updated_at)}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Scan sessions */}
      <Card
        title={
          <div className="flex items-center justify-between">
            <Space>
              <MedicineBoxOutlined />
              Lịch sử ca chụp
              <Badge
                count={scans.length}
                showZero
                color="#1677ff"
                overflowCount={999}
              />
            </Space>

            {/* Create Scan Button (Requires can_create_scan permission) */}
            <RequirePermission permission="can_create_scan">
              <Button
                type="primary"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => setScanFormOpen(true)}
              >
                Tạo ca chụp mới
              </Button>
            </RequirePermission>
          </div>
        }
        className="shadow-sm"
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
                <MedicineBoxOutlined style={{ fontSize: 32, marginBottom: 8 }} />
                <p>Bệnh nhân chưa có ca chụp nào.</p>
                <RequirePermission permission="can_create_scan">
                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    onClick={() => setScanFormOpen(true)}
                    className="mt-2"
                  >
                    Tạo ca chụp đầu tiên
                  </Button>
                </RequirePermission>
              </div>
            ),
          }}
        />
      </Card>

      {/* Edit Patient Modal */}
      <PatientForm
        open={editFormOpen}
        editingPatient={patient}
        onSuccess={() => {
          setEditFormOpen(false);
          fetchPatient();
        }}
        onCancel={() => setEditFormOpen(false)}
      />

      {/* Create Scan Modal */}
      <ScanForm
        patientId={patient.id}
        open={scanFormOpen}
        onSuccess={() => {
          setScanFormOpen(false);
          fetchPatient();
        }}
        onCancel={() => setScanFormOpen(false)}
      />
    </div>
  );
};

export default PatientDetailPage;
