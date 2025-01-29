import { Redis } from "@upstash/redis";

let redis: Redis;

export const getRedis = () => {
  if (redis) {
    return redis;
  }

  redis = new Redis({
    url: process.env.UPSTASH_REDIS_URL!,
    token: process.env.UPSTASH_REDIS_TOKEN!,
  });
  return redis;
};
