import apiClient from './api';
import type { NotificationListResponse } from '../types/notification';

export const notificationService = {
  /**
   * Fetch list of notifications for currently logged in user
   */
  getNotifications: async (unreadOnly = false): Promise<NotificationListResponse> => {
    const response = await apiClient.get<NotificationListResponse>('/notifications', {
      params: { unread_only: unreadOnly },
    });
    return response.data;
  },

  /**
   * Mark a notification as read
   */
  markAsRead: async (id: number): Promise<void> => {
    await apiClient.put(`/notifications/${id}/read`);
  },
};
