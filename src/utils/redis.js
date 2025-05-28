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

export const setEmailCode = async (email, code) => {
  await redis.set(`emailCode:${email}`, code, "EX", 180); // 3분 유효
};

export const getEmailCode = async (email) => {
  return await redis.get(`emailCode:${email}`);
};

export const deleteEmailCode = async (email) => {
  await redis.del(`emailCode:${email}`);
};

export default redis;
