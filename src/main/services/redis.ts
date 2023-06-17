import { adapters } from "../adapters";

const redisService = {
  getRedisClient: () => adapters().cache.primary.getPrimary(),
  setInRedis: async (key: string, value: string) => {
    const redis = redisService.getRedisClient();
    const set = await redis.set(key, value);
    return set;
  },
  getFromRedis: async (key: string) => {
    const redis = redisService.getRedisClient();
    const set = await redis.get(key);
    return set;
  },
  deleteInRedis: async (key: string) => {
    const redis = redisService.getRedisClient();
    const set = await redis.del(key);
    return set;
  },
};

export default redisService;
