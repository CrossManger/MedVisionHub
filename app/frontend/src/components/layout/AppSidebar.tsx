import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { DashboardOutlined, UserOutlined, SettingOutlined, IdcardOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../stores/authStore';

const { Sider } = Layout;

interface MenuItemDef {
  key: string;
  icon: React.ReactNode;
  label: string;
  permission?: string;
  forRoles?: string[];
}

const AppSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, hasPermission } = useAuthStore();

  const allMenuItems: MenuItemDef[] = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      forRoles: ['admin', 'doctor'],
    },
    {
      key: '/my-profile',
      icon: <IdcardOutlined />,
      label: 'Hồ sơ Cá nhân',
      permission: 'can_view_image',
      forRoles: ['patient'],
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

  const userRole = user?.role?.toLowerCase() || '';

  const filteredMenuItems = allMenuItems
    .filter((item) => {
      // Filter out items not meant for this specific role
      if (item.forRoles && !item.forRoles.includes(userRole)) {
        return false;
      }
      // Filter out items missing required permission
      if (item.permission && !hasPermission(item.permission)) {
        return false;
      }
      return true;
    })
    .map(({ permission, forRoles, ...item }) => item);

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
