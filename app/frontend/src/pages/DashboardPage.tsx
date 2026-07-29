import React from 'react';
import { Row, Col, Card, Statistic, Typography } from 'antd';
import { TeamOutlined, FileTextOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useAuthStore } from '../stores/authStore';

const { Title } = Typography;

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <div>
      <div className="mb-6">
        <Title level={3}>Xin chào, {user?.full_name || user?.username || 'Bác sĩ'}!</Title>
        <p className="text-gray-500">Chào mừng bạn quay trở lại MedVision Hub.</p>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Tổng số Bệnh nhân"
              value={124}
              prefix={<TeamOutlined className="text-[#1677ff]" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Hồ sơ bệnh án"
              value={854}
              prefix={<FileTextOutlined className="text-green-500" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Phiên chẩn đoán"
              value={42}
              prefix={<SafetyCertificateOutlined className="text-purple-500" />}
            />
          </Card>
        </Col>
      </Row>
      
      <div className="mt-8 p-12 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-center">
        <Title level={4} className="!text-gray-400">Khu vực hiển thị biểu đồ và thống kê (Đang phát triển)</Title>
      </div>
    </div>
  );
};

export default DashboardPage;
