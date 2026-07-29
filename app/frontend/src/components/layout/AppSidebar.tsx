import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { DashboardOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../stores/authStore';

const { Sider } = Layout;

const AppSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const userRole = user?.role?.toLowerCase();

  const allMenuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      roles: ['admin', 'doctor', 'patient'],
    },
    {
      key: '/patients',
      icon: <UserOutlined />,
      label: 'Quản lý Bệnh nhân',
      roles: ['admin', 'doctor'],
    },
    {
      key: '/roles',
      icon: <SettingOutlined />,
      label: 'Quản lý Quyền',
      roles: ['admin'],
    },
  ];

  const filteredMenuItems = allMenuItems
    .filter((item) => !userRole || item.roles.includes(userRole))
    .map(({ roles, ...item }) => item);

  return (
    <Sider
      breakpoint="lg"
      collapsedWidth="0"
      className="bg-[#001529]"
      theme="dark"
    >
      <div className="h-16 flex items-center justify-center text-white font-bold text-lg border-b border-gray-700">
        MedVision Hub
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={filteredMenuItems}
        onClick={({ key }) => navigate(key)}
        className="mt-4"
      />
    </Sider>
  );
};

export default AppSidebar;
