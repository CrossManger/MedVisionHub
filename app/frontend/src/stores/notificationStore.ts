import { create } from 'zustand';
import type { NotificationItem } from '../types/notification';
import { notificationService } from '../services/notificationService';

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  loading: boolean;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  addNotification: (notif: NotificationItem) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  loading: false,

  fetchNotifications: async () => {
    set({ loading: true });
    try {
      const res = await notificationService.getNotifications(false);
      set({
        notifications: res.data || [],
        unreadCount: res.unread_count || 0,
      });
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      set({ loading: false });
    }
  },

  markAsRead: async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      set((state) => {
        const updated = state.notifications.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        );
        const unread = updated.filter((n) => !n.is_read).length;
        return { notifications: updated, unreadCount: unread };
      });
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  },

  addNotification: (notif: NotificationItem) => {
    set((state) => {
      // Avoid duplicate notification IDs
      if (state.notifications.some((n) => n.id === notif.id)) {
        return state;
      }
      const updated = [notif, ...state.notifications];
      const unread = updated.filter((n) => !n.is_read).length;
      return { notifications: updated, unreadCount: unread };
    });
  },
}));
