import type { NotificationDTO } from '../application/dtos/NotificationDTO';

export function presentNotification(notification: NotificationDTO) {
  return {
    id: notification.id,
    userId: notification.userId,
    title: notification.title,
    content: notification.content,
    isRead: notification.isRead,
    readAt: notification.readAt,
    createdAt: notification.createdAt,
  };
}
