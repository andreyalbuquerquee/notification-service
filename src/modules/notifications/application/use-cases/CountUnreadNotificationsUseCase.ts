import type { INotificationRepo } from '../../domain/INotificationRepo';
import type { UnreadNotificationsCounter } from '../services/UnreadNotificationsCounter';

interface Input {
  userId: string;
}

interface Output {
  count: number;
}

export class CountUnreadNotificationsUseCase {
  constructor(
    private readonly notificationRepo: INotificationRepo,
    private readonly unreadCounter: UnreadNotificationsCounter,
  ) {}

  async execute({ userId }: Input): Promise<Output> {
    const cached = await this.unreadCounter.get(userId);

    if (cached !== null) {
      return { count: cached };
    }

    const count = await this.notificationRepo.countUnreadByUser(userId);
    await this.unreadCounter.set(userId, count);

    return { count };
  }
}
