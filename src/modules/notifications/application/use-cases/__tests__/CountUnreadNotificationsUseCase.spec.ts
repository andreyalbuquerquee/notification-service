import type { INotificationRepo } from '../../../domain/INotificationRepo';
import type { UnreadNotificationsCounter } from '../../services/UnreadNotificationsCounter';
import { CountUnreadNotificationsUseCase } from '../CountUnreadNotificationsUseCase';

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

describe('CountUnreadNotificationsUseCase', () => {
  it('returns the cached count when available', async () => {
    const { notificationRepo, unreadCounter } = createDependencies();
    const useCase = new CountUnreadNotificationsUseCase(
      notificationRepo,
      unreadCounter,
    );

    unreadCounter.get.mockResolvedValue(3);

    const result = await useCase.execute({ userId: 'user-cache' });

    expect(result).toEqual({ count: 3 });
    expect(notificationRepo.countUnreadByUser).not.toHaveBeenCalled();
    expect(unreadCounter.set).not.toHaveBeenCalled();
  });

  it('queries the repository and stores the result when cache misses', async () => {
    const { notificationRepo, unreadCounter } = createDependencies();
    const useCase = new CountUnreadNotificationsUseCase(
      notificationRepo,
      unreadCounter,
    );

    unreadCounter.get.mockResolvedValue(null);
    notificationRepo.countUnreadByUser.mockResolvedValue(7);

    const result = await useCase.execute({ userId: 'user-db' });

    expect(notificationRepo.countUnreadByUser).toHaveBeenCalledWith('user-db');
    expect(unreadCounter.set).toHaveBeenCalledWith('user-db', 7);
    expect(result).toEqual({ count: 7 });
  });
});
