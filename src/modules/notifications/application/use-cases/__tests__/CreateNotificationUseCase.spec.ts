import { setEntityIdGenerator } from '../../../../../core/domain/Entity';
import type { INotificationRepo } from '../../../domain/INotificationRepo';
import type { UnreadNotificationsCounter } from '../../services/UnreadNotificationsCounter';
import { CreateNotificationUseCase } from '../CreateNotificationUseCase';

function createIdGenerator() {
  let counter = 0;
  return {
    generate: () => `notification-id-${++counter}`,
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

describe('CreateNotificationUseCase', () => {
  it('persists the notification and increments the unread counter', async () => {
    const { notificationRepo, unreadCounter } = createDependencies();
    const useCase = new CreateNotificationUseCase(
      notificationRepo,
      unreadCounter,
    );

    unreadCounter.increment.mockResolvedValue(1);

    const result = await useCase.execute({
      userId: 'user-123',
      title: 'Welcome',
      content: 'Hello from tests',
    });

    expect(notificationRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'user-123' }),
    );
    expect(unreadCounter.increment).toHaveBeenCalledWith('user-123');
    expect(result.notification).toMatchObject({
      userId: 'user-123',
      title: 'Welcome',
      content: 'Hello from tests',
      isRead: false,
      readAt: null,
    });
    expect(result.notification.id).toMatch(/^notification-id-/);
    expect(result.notification.createdAt).toBeInstanceOf(Date);
  });
});
