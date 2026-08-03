import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Row, Col, Card, Typography, Table, Tag, Button, Progress, Spin } from 'antd';
import { ArrowRightOutlined } from '@ant-design/icons';
import { useAuthStore } from '../stores/authStore';
import { patientService } from '../services/patientService';
import type { Patient, DashboardStats } from '../types/patient';

const { Title, Text } = Typography;

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await patientService.getDashboardStats();
        if (isMounted) setStats(data);
      } catch (err) {
        console.error('Dashboard stats error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetch();
    return () => { isMounted = false; };
  }, []);

  if (user?.role === 'patient') {
    return <Navigate to="/my-profile" replace />;
  }

  const todayFormatted = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const totalScans = stats?.total_scans || 0;
  const xray = stats?.scans_by_type?.xray || 0;
  const mri = stats?.scans_by_type?.mri || 0;
  const ct = stats?.scans_by_type?.ct_scan || 0;
  const us = stats?.scans_by_type?.ultrasound || 0;
  const pct = (v: number) => totalScans > 0 ? Math.round((v / totalScans) * 100) : 0;

  const columns = [
    {
      title: 'Mã BN', dataIndex: 'id', key: 'id', width: 90,
      render: (id: number) => <span style={{ fontFamily: 'monospace', color: '#5a6d82' }}>#BN-{id}</span>,
    },
    {
      title: 'Họ và tên', dataIndex: 'full_name', key: 'full_name',
      render: (text: string, record: Patient) => (
        <a onClick={() => navigate(`/patients/${record.id}`)} style={{ color: '#0c5da5', fontWeight: 500, cursor: 'pointer' }}>
          {text}
        </a>
      ),
    },
    {
      title: 'Số điện thoại', dataIndex: 'phone', key: 'phone',
      render: (phone: string) => phone || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Chưa cập nhật</span>,
    },
    {
      title: 'Giới tính', dataIndex: 'gender', key: 'gender', width: 100,
      render: (g?: string) => {
        if (g === 'male') return <Tag color="blue">Nam</Tag>;
        if (g === 'female') return <Tag color="pink">Nữ</Tag>;
        return <Tag>{g || 'Khác'}</Tag>;
      },
    },
    {
      title: 'Ngày tiếp nhận', dataIndex: 'created_at', key: 'created_at', width: 130,
      render: (d: string) => d ? new Date(d).toLocaleDateString('vi-VN') : '-',
    },
  ];

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <Spin tip="Đang tải dữ liệu..." />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ marginBottom: 4, color: '#1a2b42' }}>
          Xin chào, {user?.full_name || user?.username || 'Bác sĩ'}
        </Title>
        <Text style={{ color: '#5a6d82', fontSize: 13 }}>{todayFormatted}</Text>
      </div>

      {/* KPI cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { label: 'Tổng bệnh nhân', value: stats?.total_patients ?? 0 },
          { label: 'Tổng ca chụp', value: totalScans },
          { label: 'Đã hoàn tất', value: stats?.completed_scans ?? 0 },
          { label: 'Chờ xử lý', value: (stats?.pending_scans ?? 0) + (stats?.in_progress_scans ?? 0) },
        ].map((item) => (
          <Col xs={12} lg={6} key={item.label}>
            <Card bordered={false} style={{ borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <Text style={{ fontSize: 12, color: '#5a6d82', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.03em' }}>
                {item.label}
              </Text>
              <div style={{ fontSize: 28, fontWeight: 700, color: '#1a2b42', marginTop: 4 }}>
                {item.value}
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Middle row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* Scan type breakdown */}
        <Col xs={24} lg={12}>
          <Card
            title={<span style={{ fontWeight: 600, color: '#1a2b42' }}>Phân bố loại ca chụp</span>}
            bordered={false}
            style={{ borderRadius: 12, border: '1px solid #e2e8f0', height: '100%' }}
          >
            {totalScans === 0 ? (
              <Text style={{ color: '#94a3b8' }}>Chưa có dữ liệu ca chụp</Text>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {[
                  { label: 'X-Ray', count: xray, color: '#0c5da5' },
                  { label: 'MRI', count: mri, color: '#6366f1' },
                  { label: 'CT Scan', count: ct, color: '#0d9f6e' },
                  { label: 'Siêu âm', count: us, color: '#d97706' },
                ].map((item) => (
                  <div key={item.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#1a2b42', marginBottom: 4 }}>
                      <span>{item.label}</span>
                      <span style={{ fontWeight: 600 }}>{item.count} ca ({pct(item.count)}%)</span>
                    </div>
                    <Progress percent={pct(item.count)} strokeColor={item.color} showInfo={false} size="small" />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>

        {/* Scan status breakdown */}
        <Col xs={24} lg={12}>
          <Card
            title={<span style={{ fontWeight: 600, color: '#1a2b42' }}>Trạng thái ca chụp</span>}
            bordered={false}
            style={{ borderRadius: 12, border: '1px solid #e2e8f0', height: '100%' }}
          >
            {totalScans === 0 ? (
              <Text style={{ color: '#94a3b8' }}>Chưa có dữ liệu ca chụp</Text>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { label: 'Đã hoàn thành', value: stats?.completed_scans ?? 0, tagColor: 'green' as const },
                  { label: 'Đang chẩn đoán', value: stats?.in_progress_scans ?? 0, tagColor: 'blue' as const },
                  { label: 'Chờ thực hiện', value: stats?.pending_scans ?? 0, tagColor: 'orange' as const },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #f1f5f9',
                    }}
                  >
                    <span style={{ fontSize: 13, color: '#1a2b42' }}>{item.label}</span>
                    <Tag color={item.tagColor} style={{ margin: 0 }}>{item.value} ca</Tag>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Recent patients table */}
      <Card
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600, color: '#1a2b42' }}>Bệnh nhân mới tiếp nhận</span>
            <Button type="link" onClick={() => navigate('/patients')} style={{ padding: 0, color: '#0c5da5', fontSize: 13 }}>
              Xem tất cả <ArrowRightOutlined />
            </Button>
          </div>
        }
        bordered={false}
        style={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
      >
        <Table
          columns={columns}
          dataSource={stats?.recent_patients || []}
          rowKey="id"
          pagination={false}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default DashboardPage;
