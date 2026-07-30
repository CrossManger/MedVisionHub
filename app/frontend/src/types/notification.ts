export interface NotificationItem {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  related_entity?: string;
  related_id?: number;
  created_at: string;
}

export interface NotificationListResponse {
  data: NotificationItem[];
  unread_count: number;
}
