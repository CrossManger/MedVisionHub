import React from 'react';
import { Layout, Dropdown, Avatar, Badge, Button, Tag } from 'antd';
import { UserOutlined, BellOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';

const { Header } = Layout;

const getRoleTag = (roleName?: string) => {
  switch (roleName?.toLowerCase()) {
    case 'admin':
      return <Tag color="red">Admin</Tag>;
    case 'doctor':
      return <Tag color="blue">Bác sĩ</Tag>;
    case 'patient':
      return <Tag color="green">Bệnh nhân</Tag>;
    default:
      return <Tag color="default">{roleName || 'User'}</Tag>;
  }
};

const AppHeader: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'user-info',
      label: (
        <div className="py-1">
          <div className="font-semibold text-gray-800">{user?.full_name || user?.username}</div>
          <div className="text-xs text-gray-500">{user?.email}</div>
        </div>
      ),
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: 'profile',
      label: 'Hồ sơ cá nhân',
      icon: <UserOutlined />,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Header className="bg-white px-6 flex justify-between items-center shadow-sm z-10">
      <div className="flex-1"></div>
      <div className="flex items-center gap-4">
        <Badge count={0} size="small">
          <Button type="text" icon={<BellOutlined className="text-xl" />} />
        </Badge>
        
        <Dropdown menu={{ items: userMenuItems as any }} placement="bottomRight" trigger={['click']}>
          <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-gray-200">
            <Avatar style={{ backgroundColor: '#1677ff' }} icon={<UserOutlined />} />
            <div className="flex flex-col items-start leading-tight">
              <span className="font-medium text-gray-700">{user?.full_name || user?.username || 'Người dùng'}</span>
              <div className="mt-0.5">{getRoleTag(user?.role)}</div>
            </div>
          </div>
        </Dropdown>
      </div>
    </Header>
  );
};

export default AppHeader;
