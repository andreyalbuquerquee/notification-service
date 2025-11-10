import { DomainError } from '../../../../core/domain/errors/DomainError';
import type { INotificationRepo } from '../../domain/INotificationRepo';
import type { UnreadNotificationsCounter } from '../services/UnreadNotificationsCounter';

interface Input {
  userId: string;
  notificationId: string;
}

export class MarkNotificationAsReadUseCase {
  constructor(
    private readonly notificationRepo: INotificationRepo,
    private readonly unreadCounter: UnreadNotificationsCounter,
  ) {}

  async execute({ userId, notificationId }: Input): Promise<void> {
    const notification = await this.notificationRepo.findByIdAndUser(
      notificationId,
      userId,
    );

    if (!notification || notification.isDeleted) {
      throw DomainError.notFound('Notification', { notificationId });
    }

    if (notification.isRead) {
      return;
    }

    notification.markAsRead();
    await this.notificationRepo.save(notification);
    await this.unreadCounter.decrement(userId);
  }
}
