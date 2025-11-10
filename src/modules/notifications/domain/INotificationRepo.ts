import type { Notification } from './Notification';

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface NotificationPage {
  notifications: Notification[];
  page: number;
  pageSize: number;
  total: number;
}

export interface INotificationRepo {
  create(notification: Notification): Promise<void>;
  findByIdAndUser(
    notificationId: string,
    userId: string,
  ): Promise<Notification | null>;
  listByUser(
    userId: string,
    params: PaginationParams,
  ): Promise<NotificationPage>;
  save(notification: Notification): Promise<void>;
  countUnreadByUser(userId: string): Promise<number>;
}
