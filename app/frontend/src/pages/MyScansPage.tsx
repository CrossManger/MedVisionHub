import React, { useState, useEffect } from 'react';
import { Table, Card, Tag, Button, Typography, Space, message, type TableProps } from 'antd';
import { MedicineBoxOutlined, EyeOutlined, PictureOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ScanSession } from '../types/scan';
import { scanService } from '../services/scanService';

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

const MyScansPage: React.FC = () => {
  const navigate = useNavigate();
  const [scans, setScans] = useState<ScanSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyScans = async () => {
      setLoading(true);
      try {
        const data = await scanService.getMyScans();
        setScans(data || []);
      } catch {
        message.error('Không thể tải danh sách ca chụp cá nhân.');
      } finally {
        setLoading(false);
      }
    };

    fetchMyScans();
  }, []);

  const columns: TableProps<ScanSession>['columns'] = [
    {
      title: 'Mã Ca chụp',
      dataIndex: 'id',
      key: 'id',
      render: (id: number) => <Text strong>#{id}</Text>,
    },
    {
      title: 'Loại Y tế',
      dataIndex: 'scan_type',
      key: 'scan_type',
      render: (type: string) => SCAN_TYPE_LABEL[type] || type,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const info = SCAN_STATUS_MAP[status] || { label: status, color: 'default' };
        return <Tag color={info.color}>{info.label}</Tag>;
      },
    },
    {
      title: 'Số lượng ảnh',
      dataIndex: 'image_count',
      key: 'image_count',
      render: (count: number) => (
        <Space>
          <PictureOutlined />
          <Text>{count || 0} ảnh</Text>
        </Space>
      ),
    },
    {
      title: 'Thời gian tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (dateStr: string) =>
        new Date(dateStr).toLocaleString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: unknown, record: ScanSession) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => navigate(`/scans/${record.id}`)}
        >
          Xem hình ảnh
        </Button>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <Title level={3} className="!mb-1">
          Hồ sơ Y tế của tôi
        </Title>
        <Text type="secondary">
          Danh sách các phiên chụp y khoa và kết quả hình ảnh thuộc hồ sơ cá nhân của bạn.
        </Text>
      </div>

      <Card
        title={
          <Space>
            <MedicineBoxOutlined />
            Danh sách ca chụp y tế ({scans.length})
          </Space>
        }
        className="shadow-sm"
      >
        <Table<ScanSession>
          rowKey="id"
          columns={columns}
          dataSource={scans}
          loading={loading}
          pagination={{ pageSize: 10 }}
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
    </div>
  );
};

export default MyScansPage;
