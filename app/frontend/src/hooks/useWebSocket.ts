import { useEffect, useRef } from 'react';
import { notification } from 'antd';
import { useAuthStore } from '../stores/authStore';
import { useNotificationStore } from '../stores/notificationStore';
import type { NotificationItem } from '../types/notification';

export const useWebSocket = () => {
  const token = useAuthStore((state) => state.token);
  const addNotification = useNotificationStore((state) => state.addNotification);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!token) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      return;
    }

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    // Backend WS endpoint
    const wsUrl = `${wsProtocol}//localhost:8080/ws/notifications?token=${token}`;

    let socket: WebSocket | null = null;
    let reconnectTimer: NodeJS.Timeout | null = null;

    const connect = () => {
      try {
        socket = new WebSocket(wsUrl);
        wsRef.current = socket;

        socket.onopen = () => {
          console.log('[WebSocket] Connection established');
        };

        socket.onmessage = (event) => {
          try {
            const data: NotificationItem = JSON.parse(event.data);
            if (data && data.title) {
              addNotification(data);

              // Display Ant Design Toast Popup
              const notifType = data.type || 'info';
              const popupFunc = notification[notifType as 'info' | 'success' | 'warning' | 'error'] || notification.info;
              popupFunc({
                message: data.title,
                description: data.message,
                duration: 6,
                placement: 'topRight',
              });
            }
          } catch (e) {
            console.error('[WebSocket] Error parsing incoming message:', e);
          }
        };

        socket.onerror = (err) => {
          console.error('[WebSocket] Error:', err);
        };

        socket.onclose = () => {
          console.log('[WebSocket] Connection closed. Reconnecting in 5s...');
          reconnectTimer = setTimeout(() => {
            if (useAuthStore.getState().token) {
              connect();
            }
          }, 5000);
        };
      } catch (err) {
        console.error('[WebSocket] Connection exception:', err);
      }
    };

    connect();

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (socket) {
        socket.onclose = null; // Prevent reconnect on unmount
        socket.close();
      }
      wsRef.current = null;
    };
  }, [token, addNotification]);
};
