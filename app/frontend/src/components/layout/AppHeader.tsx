import React, { useEffect } from 'react';
import { Layout, Dropdown, Avatar, Badge, Button, Tag, List, Typography, Space, Empty } from 'antd';
import { UserOutlined, BellOutlined, LogoutOutlined, CheckCircleOutlined, InfoCircleOutlined, WarningOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../stores/authStore';
import { useNotificationStore } from '../../stores/notificationStore';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useNavigate } from 'react-router-dom';
import type { NotificationItem } from '../../types/notification';

const { Header } = Layout;
const { Text } = Typography;

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

const getTypeIcon = (type?: string) => {
  switch (type) {
    case 'success':
      return <CheckCircleOutlined className="text-green-500 text-base" />;
    case 'warning':
      return <WarningOutlined className="text-orange-500 text-base" />;
    case 'error':
      return <CloseCircleOutlined className="text-red-500 text-base" />;
    default:
      return <InfoCircleOutlined className="text-blue-500 text-base" />;
  }
};

const AppHeader: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  // Initialize WebSocket connection for real-time notifications
  useWebSocket();

  const { notifications, unreadCount, fetchNotifications, markAsRead } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    if (!notif.is_read) {
      await markAsRead(notif.id);
    }
    if (notif.related_entity === 'scan_session' && notif.related_id) {
      navigate(`/scans/${notif.related_id}`);
    } else if (user?.role === 'patient') {
      navigate('/my-scans');
    }
  };

  const notificationMenuContent = (
    <div className="bg-white rounded-lg shadow-xl border border-gray-100 w-80 max-h-96 overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <Text strong>Thông báo ({unreadCount} chưa đọc)</Text>
      </div>

      <div className="overflow-y-auto flex-1 p-2">
        {notifications.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có thông báo nào" className="my-6" />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item
                className={`cursor-pointer p-2.5 rounded-lg transition-colors hover:bg-blue-50 mb-1 ${
                  !item.is_read ? 'bg-blue-50/50 font-medium' : 'bg-white'
                }`}
                onClick={() => handleNotificationClick(item)}
              >
                <List.Item.Meta
                  avatar={getTypeIcon(item.type)}
                  title={
                    <div className="flex justify-between items-start">
                      <span className={`text-xs ${!item.is_read ? 'text-blue-600 font-bold' : 'text-gray-700'}`}>
                        {item.title}
                      </span>
                      {!item.is_read && <span className="w-2 h-2 rounded-full bg-blue-500 mt-1"></span>}
                    </div>
                  }
                  description={
                    <div>
                      <p className="text-xs text-gray-500 line-clamp-2 my-0.5">{item.message}</p>
                      <span className="text-[10px] text-gray-400">
                        {new Date(item.created_at).toLocaleTimeString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>
    </div>
  );

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
        {/* Real-time Notification Bell */}
        <Dropdown dropdownRender={() => notificationMenuContent} trigger={['click']} placement="bottomRight">
          <Badge count={unreadCount} overflowCount={99} size="small">
            <Button type="text" icon={<BellOutlined className="text-xl text-gray-600 hover:text-blue-600" />} />
          </Badge>
        </Dropdown>

        {/* User Account Dropdown */}
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
