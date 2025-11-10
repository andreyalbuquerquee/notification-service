export interface NotificationDTO {
  id: string;
  userId: string;
  title: string;
  content: string;
  isRead: boolean;
  readAt: Date | null | undefined;
  createdAt: Date;
}

export interface NotificationPageDTO {
  notifications: NotificationDTO[];
  page: number;
  pageSize: number;
  total: number;
}
