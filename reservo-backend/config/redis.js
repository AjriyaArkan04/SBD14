const { createClient } = require('redis');
require('dotenv').config();

let redisClient;

const connectRedis = async () => {
  const config = process.env.REDIS_URL
    ? { url: process.env.REDIS_URL }
    : {
        socket: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT) || 6379,
        },
        ...(process.env.REDIS_PASSWORD && { password: process.env.REDIS_PASSWORD }),
      };

  redisClient = createClient(config);

  redisClient.on('error', (err) => console.error('❌ Redis error:', err));
  redisClient.on('connect', () => console.log('✅ Redis connected successfully.'));

  await redisClient.connect();
  return redisClient;
};

const getRedis = () => {
  if (!redisClient) throw new Error('Redis not initialized. Call connectRedis() first.');
  return redisClient;
};

// ── Session helpers ────────────────────────────────────────────────────────────
const SESSION_TTL = parseInt(process.env.SESSION_TTL) || 604800; // 7 days

/**
 * Simpan JWT session ke Redis.
 * Key: session:<userId>  →  token string
 */
const setSession = async (userId, token) => {
  const client = getRedis();
  await client.setEx(`session:${userId}`, SESSION_TTL, token);
};

/**
 * Ambil session dari Redis berdasarkan userId.
 */
const getSession = async (userId) => {
  const client = getRedis();
  return client.get(`session:${userId}`);
};

/**
 * Hapus session (logout).
 */
const deleteSession = async (userId) => {
  const client = getRedis();
  await client.del(`session:${userId}`);
};

/**
 * Blacklist token (paksa invalidasi token tertentu, misalnya password reset).
 * Key: blacklist:<token>  →  '1'
 */
const blacklistToken = async (token, ttlSeconds = SESSION_TTL) => {
  const client = getRedis();
  await client.setEx(`blacklist:${token}`, ttlSeconds, '1');
};

const isTokenBlacklisted = async (token) => {
  const client = getRedis();
  const val = await client.get(`blacklist:${token}`);
  return val === '1';
};

module.exports = {
  connectRedis,
  getRedis,
  setSession,
  getSession,
  deleteSession,
  blacklistToken,
  isTokenBlacklisted,
};