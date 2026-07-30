import React, { useEffect } from 'react';
import { Layout, Dropdown, Avatar, Badge, List, Typography, Empty } from 'antd';
import { BellOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../stores/authStore';
import { useNotificationStore } from '../../stores/notificationStore';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useNavigate } from 'react-router-dom';
import type { NotificationItem } from '../../types/notification';

const { Header } = Layout;
const { Text } = Typography;

const ROLE_LABELS: Record<string, string> = {
  admin: 'Quản trị viên',
  doctor: 'Bác sĩ',
  patient: 'Bệnh nhân',
};

const ROLE_COLORS: Record<string, string> = {
  admin: '#dc2626',
  doctor: '#0c5da5',
  patient: '#0d9f6e',
};

const AppHeader: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

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
      navigate('/my-profile');
    }
  };

  const roleName = user?.role?.toLowerCase() || '';
  const roleLabel = ROLE_LABELS[roleName] || roleName;
  const roleColor = ROLE_COLORS[roleName] || '#64748b';

  const notificationMenuContent = (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 w-80 max-h-[420px] overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
        <Text strong className="text-sm text-gray-800">Thông báo</Text>
        {unreadCount > 0 && (
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            {unreadCount} mới
          </span>
        )}
      </div>

      <div className="overflow-y-auto flex-1 notif-dropdown">
        {notifications.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có thông báo" className="my-8" />
        ) : (
          <List
            dataSource={notifications}
            renderItem={(item) => (
              <div
                className={`px-4 py-3 cursor-pointer transition-colors border-b border-gray-50 last:border-b-0 ${
                  !item.is_read ? 'bg-blue-50/60 hover:bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => handleNotificationClick(item)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm mb-0.5 leading-snug ${!item.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-1">{item.message}</p>
                    <span className="text-[11px] text-gray-400">
                      {new Date(item.created_at).toLocaleString('vi-VN', {
                        day: '2-digit', month: '2-digit',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>
                  {!item.is_read && (
                    <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                  )}
                </div>
              </div>
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
          <div className="text-xs text-gray-500 mt-0.5">{user?.email}</div>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Header className="app-header px-4 sm:px-6 flex justify-between items-center" style={{ height: 56, lineHeight: '56px', padding: '0 16px' }}>
      {/* Left side – empty or breadcrumb area */}
      <div className="flex-1" />

      {/* Right side – notifications and user */}
      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        <Dropdown dropdownRender={() => notificationMenuContent} trigger={['click']} placement="bottomRight">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
            <Badge count={unreadCount} overflowCount={99} size="small" offset={[-2, 2]}>
              <BellOutlined style={{ fontSize: 18, color: '#4a5568' }} />
            </Badge>
          </div>
        </Dropdown>

        {/* Vertical Divider */}
        <div className="w-px h-7 bg-gray-200 mx-1" />

        {/* User Account */}
        <Dropdown menu={{ items: userMenuItems as any }} placement="bottomRight" trigger={['click']}>
          <div className="flex items-center gap-2.5 cursor-pointer hover:bg-gray-50 pl-2 pr-3 py-1.5 rounded-lg transition-colors">
            <Avatar size={32} style={{ backgroundColor: roleColor, fontSize: 14 }}>
              {(user?.full_name || user?.username || 'U').charAt(0).toUpperCase()}
            </Avatar>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="text-sm font-medium text-gray-800">
                {user?.full_name || user?.username || 'Người dùng'}
              </span>
              <span className="text-[11px] mt-0.5" style={{ color: roleColor }}>
                {roleLabel}
              </span>
            </div>
          </div>
        </Dropdown>
      </div>
    </Header>
  );
};

export default AppHeader;
