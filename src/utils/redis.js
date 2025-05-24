import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
});

export const setRefreshToken = async (userId, refreshToken, expiresInSec = 7 * 24 * 60 * 60) => {
  await redis.set(`refresh:${userId}`, refreshToken, "EX", expiresInSec);
};

export const getRefreshToken = async (userId) => {
  return await redis.get(`refresh:${userId}`);
};

export const deleteRefreshToken = async (userId) => {
  await redis.del(`refresh:${userId}`);
};

export default redis;
