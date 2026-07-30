import React, { useState, useCallback, useRef } from 'react';
import {
  Table,
  Input,
  Button,
  Space,
  Popconfirm,
  Tag,
  Typography,
  Tooltip,
  message,
  type TableProps,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  EyeOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { Patient, Pagination } from '../types/patient';
import { patientService } from '../services/patientService';
import PatientForm from '../components/common/PatientForm';

const { Title } = Typography;

const GENDER_MAP: Record<string, { label: string; color: string }> = {
  male: { label: 'Nam', color: 'blue' },
  female: { label: 'Nữ', color: 'pink' },
  other: { label: 'Khác', color: 'default' },
};

const PatientListPage: React.FC = () => {
  const navigate = useNavigate();

  // ── State ──────────────────────────────────────────────────────────────────
  const [patients, setPatients] = useState<Patient[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0,
  });
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  // Debounce ref
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Data Fetching ──────────────────────────────────────────────────────────
  const fetchPatients = useCallback(
    async (page: number, limit: number, search: string) => {
      setLoading(true);
      try {
        const res = await patientService.getAll(page, limit, search);
        setPatients(res.data);
        setPagination(res.pagination);
      } catch {
        message.error('Không thể tải danh sách bệnh nhân. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Initial load
  React.useEffect(() => {
    fetchPatients(1, pagination.limit, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchPatients(1, pagination.limit, value);
    }, 300);
  };

  const handleTableChange: TableProps<Patient>['onChange'] = (pag) => {
    fetchPatients(pag.current ?? 1, pag.pageSize ?? 10, searchText);
  };

  const handleAddNew = () => {
    setEditingPatient(null);
    setFormOpen(true);
  };

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await patientService.delete(id);
      message.success('Đã xóa hồ sơ bệnh nhân thành công.');
      fetchPatients(pagination.page, pagination.limit, searchText);
    } catch (error: unknown) {
      const errMsg =
        (error as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        'Xóa thất bại. Vui lòng thử lại.';
      message.error(errMsg);
    }
  };

  const handleFormSuccess = () => {
    setFormOpen(false);
    setEditingPatient(null);
    fetchPatients(pagination.page, pagination.limit, searchText);
  };

  const handleFormCancel = () => {
    setFormOpen(false);
    setEditingPatient(null);
  };

  // ── Table Columns ──────────────────────────────────────────────────────────
  const columns: TableProps<Patient>['columns'] = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: 'Họ và tên',
      dataIndex: 'full_name',
      key: 'full_name',
      render: (name: string, record: Patient) => (
        <Button
          type="link"
          className="!p-0 !font-medium"
          onClick={() => navigate(`/patients/${record.id}`)}
        >
          {name}
        </Button>
      ),
    },
    {
      title: 'Ngày sinh',
      dataIndex: 'date_of_birth',
      key: 'date_of_birth',
      width: 130,
      render: (dob: string | null) =>
        dob
          ? new Date(dob).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })
          : '—',
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
      width: 100,
      render: (gender: string | null) => {
        if (!gender) return '—';
        const g = GENDER_MAP[gender];
        return g ? <Tag color={g.color}>{g.label}</Tag> : <Tag>{gender}</Tag>;
      },
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      width: 140,
      render: (phone: string | null) => phone ?? '—',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 130,
      render: (date: string) =>
        new Date(date).toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 120,
      fixed: 'right' as const,
      render: (_: unknown, record: Patient) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/patients/${record.id}`)}
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Popconfirm
              title="Xác nhận xóa bệnh nhân"
              description={`Bạn có chắc chắn muốn xóa hồ sơ của "${record.full_name}"?`}
              okText="Xóa"
              cancelText="Hủy"
              okType="danger"
              onConfirm={() => handleDelete(record.id)}
            >
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <Title level={3} className="!mb-0">
            Quản lý Bệnh nhân
          </Title>
          <p className="text-gray-500 mt-1">
            Tổng cộng{' '}
            <strong className="text-gray-700">{pagination.total}</strong> hồ sơ bệnh nhân
          </p>
        </div>

        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={handleAddNew}
          id="btn-add-patient"
        >
          Thêm bệnh nhân
        </Button>
      </div>

      {/* Search toolbar */}
      <div className="mb-4">
        <Input
          id="input-search-patient"
          placeholder="Tìm kiếm bệnh nhân..."
          prefix={<SearchOutlined className="text-gray-400" />}
          value={searchText}
          onChange={handleSearchChange}
          allowClear
          onClear={() => {
            setSearchText('');
            fetchPatients(1, pagination.limit, '');
          }}
          style={{ maxWidth: 400 }}
          size="large"
        />
      </div>

      {/* Table */}
      <Table<Patient>
        rowKey="id"
        columns={columns}
        dataSource={patients}
        loading={loading}
        scroll={{ x: 800 }}
        pagination={{
          current: pagination.page,
          pageSize: pagination.limit,
          total: pagination.total,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          showTotal: (total, range) => `${range[0]}-${range[1]} / ${total} bệnh nhân`,
        }}
        onChange={handleTableChange}
        locale={{
          emptyText: (
            <div className="py-10 text-center text-gray-400">
              <UserAddOutlined style={{ fontSize: 40, marginBottom: 8 }} />
              <p>Không tìm thấy bệnh nhân nào.</p>
            </div>
          ),
        }}
      />

      {/* Create / Edit Modal */}
      <PatientForm
        open={formOpen}
        editingPatient={editingPatient}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    </div>
  );
};

export default PatientListPage;
