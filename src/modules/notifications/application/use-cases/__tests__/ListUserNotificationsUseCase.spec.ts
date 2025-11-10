import { setEntityIdGenerator } from '../../../../../core/domain/Entity';
import type { INotificationRepo } from '../../../domain/INotificationRepo';
import { Notification } from '../../../domain/Notification';
import { ListUserNotificationsUseCase } from '../ListUserNotificationsUseCase';

function createIdGenerator() {
  let counter = 0;
  return {
    generate: () => `notification-list-id-${++counter}`,
  };
}

beforeAll(() => {
  setEntityIdGenerator(createIdGenerator());
});

function createNotificationRepo(): jest.Mocked<INotificationRepo> {
  return {
    create: jest.fn(),
    findByIdAndUser: jest.fn(),
    listByUser: jest.fn(),
    save: jest.fn(),
    countUnreadByUser: jest.fn(),
  };
}

describe('ListUserNotificationsUseCase', () => {
  it('returns a notification page mapped into DTOs', async () => {
    const notificationRepo = createNotificationRepo();
    const useCase = new ListUserNotificationsUseCase(notificationRepo);

    const notificationA = Notification.create({
      userId: 'user-list',
      title: 'Unread',
      content: 'Still unread',
    });
    const notificationB = Notification.create({
      userId: 'user-list',
      title: 'Read',
      content: 'Already read',
    });
    const readAt = new Date('2024-02-01T00:00:00Z');
    notificationB.markAsRead(readAt);

    notificationRepo.listByUser.mockResolvedValue({
      notifications: [notificationA, notificationB],
      page: 2,
      pageSize: 10,
      total: 25,
    });

    const result = await useCase.execute({
      userId: 'user-list',
      page: 2,
      pageSize: 10,
    });

    expect(notificationRepo.listByUser).toHaveBeenCalledWith('user-list', {
      page: 2,
      pageSize: 10,
    });
    expect(result).toEqual({
      page: 2,
      pageSize: 10,
      total: 25,
      notifications: [
        {
          id: notificationA.id,
          userId: 'user-list',
          title: 'Unread',
          content: 'Still unread',
          isRead: false,
          readAt: null,
          createdAt: notificationA.createdAt,
        },
        {
          id: notificationB.id,
          userId: 'user-list',
          title: 'Read',
          content: 'Already read',
          isRead: true,
          readAt,
          createdAt: notificationB.createdAt,
        },
      ],
    });
  });
});
