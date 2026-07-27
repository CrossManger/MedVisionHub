import React from 'react';
import { Layout, Dropdown, Avatar, Badge, Button } from 'antd';
import { UserOutlined, BellOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';

const { Header } = Layout;

const AppHeader: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
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
      <div className="flex items-center gap-6">
        <Badge count={3} size="small">
          <Button type="text" icon={<BellOutlined className="text-xl" />} />
        </Badge>
        <Dropdown menu={{ items: userMenuItems as any }} placement="bottomRight">
          <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 px-3 py-1 rounded-md transition-colors">
            <Avatar style={{ backgroundColor: '#1677ff' }} icon={<UserOutlined />} />
            <span className="font-medium text-gray-700">{user?.fullName || 'Bác sĩ'}</span>
          </div>
        </Dropdown>
      </div>
    </Header>
  );
};

export default AppHeader;
