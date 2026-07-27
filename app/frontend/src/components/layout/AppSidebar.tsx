import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { DashboardOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons';

const { Sider } = Layout;

const AppSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/patients',
      icon: <UserOutlined />,
      label: 'Quản lý Bệnh nhân',
    },
    {
      key: '/roles',
      icon: <SettingOutlined />,
      label: 'Quản lý Quyền',
    },
  ];

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
        items={menuItems}
        onClick={({ key }) => navigate(key)}
        className="mt-4"
      />
    </Sider>
  );
};

export default AppSidebar;
