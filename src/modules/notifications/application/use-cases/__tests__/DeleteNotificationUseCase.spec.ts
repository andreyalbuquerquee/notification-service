import { setEntityIdGenerator } from '../../../../../core/domain/Entity';
import type { DomainError } from '../../../../../core/domain/errors/DomainError';
import type { INotificationRepo } from '../../../domain/INotificationRepo';
import { Notification } from '../../../domain/Notification';
import type { UnreadNotificationsCounter } from '../../services/UnreadNotificationsCounter';
import { DeleteNotificationUseCase } from '../DeleteNotificationUseCase';

function createIdGenerator() {
  let counter = 0;
  return {
    generate: () => `notification-delete-id-${++counter}`,
  };
}

beforeAll(() => {
  setEntityIdGenerator(createIdGenerator());
});

function createDependencies() {
  const notificationRepo: jest.Mocked<INotificationRepo> = {
    create: jest.fn(),
    findByIdAndUser: jest.fn(),
    listByUser: jest.fn(),
    save: jest.fn(),
    countUnreadByUser: jest.fn(),
  };

  const unreadCounter: jest.Mocked<UnreadNotificationsCounter> = {
    increment: jest.fn(),
    decrement: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    reset: jest.fn(),
  };

  return { notificationRepo, unreadCounter };
}

describe('DeleteNotificationUseCase', () => {
  it('soft deletes unread notifications and decrements the counter', async () => {
    const { notificationRepo, unreadCounter } = createDependencies();
    const useCase = new DeleteNotificationUseCase(
      notificationRepo,
      unreadCounter,
    );

    const notification = Notification.create({
      userId: 'user-delete',
      title: 'Temporary',
      content: 'Will be removed',
    });

    notificationRepo.findByIdAndUser.mockResolvedValue(notification);

    await useCase.execute({
      userId: 'user-delete',
      notificationId: notification.id,
    });

    expect(notification.isDeleted).toBe(true);
    expect(notificationRepo.save).toHaveBeenCalledWith(notification);
    expect(unreadCounter.decrement).toHaveBeenCalledWith('user-delete');
  });

  it('does not decrement unread counter when notification was already read', async () => {
    const { notificationRepo, unreadCounter } = createDependencies();
    const useCase = new DeleteNotificationUseCase(
      notificationRepo,
      unreadCounter,
    );

    const notification = Notification.create({
      userId: 'user-delete',
      title: 'Already read',
      content: 'Nothing to count',
    });
    notification.markAsRead(new Date('2024-03-01T00:00:00Z'));

    notificationRepo.findByIdAndUser.mockResolvedValue(notification);

    await useCase.execute({
      userId: 'user-delete',
      notificationId: notification.id,
    });

    expect(notificationRepo.save).toHaveBeenCalledWith(notification);
    expect(unreadCounter.decrement).not.toHaveBeenCalled();
  });

  it('throws not found when the notification does not exist', async () => {
    const { notificationRepo, unreadCounter } = createDependencies();
    const useCase = new DeleteNotificationUseCase(
      notificationRepo,
      unreadCounter,
    );

    notificationRepo.findByIdAndUser.mockResolvedValue(null);

    await expect(
      useCase.execute({
        userId: 'ghost',
        notificationId: 'missing',
      }),
    ).rejects.toMatchObject({
      code: 'not_found' satisfies DomainError['code'],
    });
  });

  it('throws not found when the notification is already deleted', async () => {
    const { notificationRepo, unreadCounter } = createDependencies();
    const useCase = new DeleteNotificationUseCase(
      notificationRepo,
      unreadCounter,
    );

    const notification = Notification.create({
      userId: 'user-delete',
      title: 'Removed',
      content: 'Already removed',
    });
    notification.softDelete();

    notificationRepo.findByIdAndUser.mockResolvedValue(notification);

    await expect(
      useCase.execute({
        userId: 'user-delete',
        notificationId: notification.id,
      }),
    ).rejects.toMatchObject({
      code: 'not_found' satisfies DomainError['code'],
    });
  });
});
