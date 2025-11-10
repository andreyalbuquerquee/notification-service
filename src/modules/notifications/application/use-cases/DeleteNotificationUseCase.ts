import { DomainError } from '../../../../core/domain/errors/DomainError';
import type { INotificationRepo } from '../../domain/INotificationRepo';
import type { UnreadNotificationsCounter } from '../services/UnreadNotificationsCounter';

interface Input {
  userId: string;
  notificationId: string;
}

export class DeleteNotificationUseCase {
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

    const wasUnread = !notification.isRead;
    notification.softDelete();
    await this.notificationRepo.save(notification);

    if (wasUnread) {
      await this.unreadCounter.decrement(userId);
    }
  }
}
