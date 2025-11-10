import { setEntityIdGenerator } from '../../../../../core/domain/Entity';
import type { DomainError } from '../../../../../core/domain/errors/DomainError';
import type { INotificationRepo } from '../../../domain/INotificationRepo';
import { Notification } from '../../../domain/Notification';
import type { UnreadNotificationsCounter } from '../../services/UnreadNotificationsCounter';
import { MarkNotificationAsReadUseCase } from '../MarkNotificationAsReadUseCase';

function createIdGenerator() {
  let counter = 0;
  return {
    generate: () => `notification-read-id-${++counter}`,
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

describe('MarkNotificationAsReadUseCase', () => {
  it('marks the notification as read and updates the unread counter', async () => {
    const { notificationRepo, unreadCounter } = createDependencies();
    const useCase = new MarkNotificationAsReadUseCase(
      notificationRepo,
      unreadCounter,
    );

    const notification = Notification.create({
      userId: 'user-read',
      title: 'Ping',
      content: 'Check me',
    });

    notificationRepo.findByIdAndUser.mockResolvedValue(notification);

    await useCase.execute({
      userId: 'user-read',
      notificationId: notification.id,
    });

    expect(notification.isRead).toBe(true);
    expect(notificationRepo.save).toHaveBeenCalledWith(notification);
    expect(unreadCounter.decrement).toHaveBeenCalledWith('user-read');
  });

  it('exits early when the notification is already read', async () => {
    const { notificationRepo, unreadCounter } = createDependencies();
    const useCase = new MarkNotificationAsReadUseCase(
      notificationRepo,
      unreadCounter,
    );

    const notification = Notification.create({
      userId: 'user-read',
      title: 'Already read',
      content: 'cached',
    });
    notification.markAsRead(new Date('2024-01-01T00:00:00Z'));

    notificationRepo.findByIdAndUser.mockResolvedValue(notification);

    await useCase.execute({
      userId: 'user-read',
      notificationId: notification.id,
    });

    expect(notificationRepo.save).not.toHaveBeenCalled();
    expect(unreadCounter.decrement).not.toHaveBeenCalled();
  });

  it('throws not found when the notification does not exist or is deleted', async () => {
    const { notificationRepo, unreadCounter } = createDependencies();
    const useCase = new MarkNotificationAsReadUseCase(
      notificationRepo,
      unreadCounter,
    );

    notificationRepo.findByIdAndUser.mockResolvedValue(null);

    await expect(
      useCase.execute({
        userId: 'missing-user',
        notificationId: 'missing-id',
      }),
    ).rejects.toMatchObject({
      code: 'not_found' satisfies DomainError['code'],
    });
  });

  it('throws not found when the notification was soft deleted', async () => {
    const { notificationRepo, unreadCounter } = createDependencies();
    const useCase = new MarkNotificationAsReadUseCase(
      notificationRepo,
      unreadCounter,
    );

    const notification = Notification.create({
      userId: 'user-read',
      title: 'Removed',
      content: 'No longer available',
    });
    notification.softDelete();

    notificationRepo.findByIdAndUser.mockResolvedValue(notification);

    await expect(
      useCase.execute({
        userId: 'user-read',
        notificationId: notification.id,
      }),
    ).rejects.toMatchObject({
      code: 'not_found' satisfies DomainError['code'],
    });
  });
});
