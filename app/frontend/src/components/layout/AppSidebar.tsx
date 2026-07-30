import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { DashboardOutlined, TeamOutlined, SafetyOutlined, IdcardOutlined } from '@ant-design/icons';
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
      label: 'Tổng quan',
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
      icon: <TeamOutlined />,
      label: 'Bệnh nhân',
      permission: 'can_view_patient',
    },
    {
      key: '/admin/permissions',
      icon: <SafetyOutlined />,
      label: 'Phân quyền',
      permission: 'can_manage_permissions',
    },
  ];

  const userRole = user?.role?.toLowerCase() || '';

  const filteredMenuItems = allMenuItems
    .filter((item) => {
      if (item.forRoles && !item.forRoles.includes(userRole)) {
        return false;
      }
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
      width={220}
      theme="dark"
      style={{ background: '#0a1628' }}
    >
      {/* Logo / Brand */}
      <div className="h-14 flex items-center justify-center border-b border-white/10">
        <span className="text-white font-bold text-base tracking-wide">MedVision Hub</span>
      </div>

      {/* Navigation */}
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={filteredMenuItems}
        onClick={({ key }) => navigate(key)}
        style={{ marginTop: 8, border: 'none', background: 'transparent' }}
      />
    </Sider>
  );
};

export default AppSidebar;
