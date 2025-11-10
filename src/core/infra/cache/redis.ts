import Redis from 'ioredis';

import { env } from '../../../main/env';

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis(env.REDIS_URL);

    redisClient.on('connect', () => {
      console.log('[redis] conectado');
    });

    redisClient.on('error', (error) => {
      console.error('[redis] erro', error);
    });
  }

  return redisClient;
}

export async function disconnectRedis() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}
