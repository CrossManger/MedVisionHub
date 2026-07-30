import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { DashboardOutlined, UserOutlined, SettingOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../stores/authStore';

const { Sider } = Layout;

interface MenuItemDef {
  key: string;
  icon: React.ReactNode;
  label: string;
  permission?: string;
}

const AppSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const hasPermission = useAuthStore((state) => state.hasPermission);

  const allMenuItems: MenuItemDef[] = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/my-scans',
      icon: <MedicineBoxOutlined />,
      label: 'Hồ sơ Y tế của tôi',
      permission: 'can_view_image',
    },
    {
      key: '/patients',
      icon: <UserOutlined />,
      label: 'Quản lý Bệnh nhân',
      permission: 'can_view_patient',
    },
    {
      key: '/admin/permissions',
      icon: <SettingOutlined />,
      label: 'Quản lý Quyền',
      permission: 'can_manage_permissions',
    },
  ];

  const filteredMenuItems = allMenuItems
    .filter((item) => !item.permission || hasPermission(item.permission))
    .map(({ permission, ...item }) => item);

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
