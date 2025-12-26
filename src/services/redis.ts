import { createClient } from 'redis';
import { logger } from '../utils/logger';

let redisClient: ReturnType<typeof createClient>;

export const initRedis = async () => {
  redisClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
  redisClient.on('error', (err) => logger.error(err, 'Redis error'));
  await redisClient.connect();
  logger.info('Redis connected');
};

export const getRedis = () => redisClient;

export const cacheGet = async (key: string) => redisClient.get(key);
export const cacheSet = async (key: string, value: string, ttl = 3600) => {
  await redisClient.setEx(key, ttl, value);
};
export const cacheDel = async (key: string) => redisClient.del(key);
export const cachePublish = async (channel: string, message: string) => {
  await redisClient.publish(channel, message);
};
export const cacheSubscribe = async (channel: string, callback: (msg: string) => void) => {
  const subscriber = redisClient.duplicate();
  await subscriber.connect();
  await subscriber.subscribe(channel, callback);
  return subscriber;
};
