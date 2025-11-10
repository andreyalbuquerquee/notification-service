import type { INotificationRepo } from '../../domain/INotificationRepo';
import type { Notification } from '../../domain/Notification';
import type {
  NotificationDTO,
  NotificationPageDTO,
} from '../dtos/NotificationDTO';

interface Input {
  userId: string;
  page: number;
  pageSize: number;
}

type Output = NotificationPageDTO;

export class ListUserNotificationsUseCase {
  constructor(private readonly notificationRepo: INotificationRepo) {}

  async execute(input: Input): Promise<Output> {
    const page = await this.notificationRepo.listByUser(input.userId, {
      page: input.page,
      pageSize: input.pageSize,
    });

    return {
      notifications: page.notifications.map(this.toDTO),
      page: page.page,
      pageSize: page.pageSize,
      total: page.total,
    };
  }

  private toDTO(notification: Notification): NotificationDTO {
    return {
      id: notification.id,
      userId: notification.userId,
      title: notification.title.value,
      content: notification.content.value,
      isRead: notification.isRead,
      readAt: notification.readAt ?? null,
      createdAt: notification.createdAt,
    };
  }
}
