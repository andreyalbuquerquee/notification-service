import type Redis from 'ioredis';

import type { UnreadNotificationsCounter } from '../../application/services/UnreadNotificationsCounter';

function unreadKey(userId: string) {
  return `notifications:unread:${userId}`;
}

export class RedisUnreadNotificationCounter
  implements UnreadNotificationsCounter
{
  constructor(private readonly redis: Redis) {}

  increment(userId: string, amount = 1): Promise<number> {
    return this.redis.incrby(unreadKey(userId), amount);
  }

  async decrement(userId: string, amount = 1): Promise<number> {
    const value = await this.redis.decrby(unreadKey(userId), amount);

    if (value < 0) {
      await this.redis.set(unreadKey(userId), '0');
      return 0;
    }

    return value;
  }

  async get(userId: string): Promise<number | null> {
    const raw = await this.redis.get(unreadKey(userId));
    return raw === null ? null : Number(raw);
  }

  async set(userId: string, value: number): Promise<void> {
    await this.redis.set(unreadKey(userId), value.toString());
  }

  async reset(userId: string): Promise<void> {
    await this.redis.del(unreadKey(userId));
  }
}
