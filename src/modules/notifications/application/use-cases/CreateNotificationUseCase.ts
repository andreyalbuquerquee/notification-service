import type { INotificationRepo } from '../../domain/INotificationRepo';
import { Notification } from '../../domain/Notification';
import type { NotificationDTO } from '../dtos/NotificationDTO';
import type { UnreadNotificationsCounter } from '../services/UnreadNotificationsCounter';

interface Input {
  userId: string;
  title: string;
  content: string;
}

interface Output {
  notification: NotificationDTO;
}

export class CreateNotificationUseCase {
  constructor(
    private readonly notificationRepo: INotificationRepo,
    private readonly unreadCounter: UnreadNotificationsCounter,
  ) {}

  async execute(input: Input): Promise<Output> {
    const notification = Notification.create({
      userId: input.userId,
      title: input.title,
      content: input.content,
    });

    await this.notificationRepo.create(notification);
    await this.unreadCounter.increment(input.userId);

    return {
      notification: this.toDTO(notification),
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
