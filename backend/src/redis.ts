import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const DEFAULT_TTL_SECONDS = parseInt(process.env.REDIS_TTL || "300", 10); // 5 minutes default
const redisHost = process.env.REDIS_HOST || "localhost";
const redisPort = parseInt(process.env.REDIS_PORT || "6379", 10);
const redisPassword = process.env.REDIS_PASSWORD || undefined;

let isRedisConnected = false;

// Initialize Redis client with resilient retry strategy
export const redis = new (Redis as any)({
  host: redisHost,
  port: redisPort,
  password: redisPassword,
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  retryStrategy(times: number) {
    if (times > 5) {
      return null;
    }
    return Math.min(times * 500, 2000);
  },
});

redis.on("connect", () => {
  isRedisConnected = true;
  console.log(`⚡️[redis]: Connected to Redis at ${redisHost}:${redisPort}`);
});

redis.on("ready", () => {
  isRedisConnected = true;
});

redis.on("error", (err: any) => {
  isRedisConnected = false;
  console.warn("⚠️ [redis]: Redis unavailable, continuing without cache:", err.message);
});

redis.on("close", () => {
  isRedisConnected = false;
});

export async function initRedis(): Promise<boolean> {
  try {
    await redis.connect();
    isRedisConnected = true;
    return true;
  } catch (err: any) {
    isRedisConnected = false;
    console.warn("⚠️ [redis]: Initial connection failed, continuing with direct DB fallback:", err.message);
    return false;
  }
}

export function isRedisHealthy(): boolean {
  return isRedisConnected;
}

export async function getCache<T>(key: string): Promise<T | null> {
  if (!isRedisConnected) return null;
  try {
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (err: any) {
    console.warn(`[redis]: Failed to get cache for key ${key}:`, err.message);
    return null;
  }
}

export async function setCache(key: string, data: any, ttlSeconds: number = DEFAULT_TTL_SECONDS): Promise<void> {
  if (!isRedisConnected) return;
  try {
    await redis.set(key, JSON.stringify(data), "EX", ttlSeconds);
  } catch (err: any) {
    console.warn(`[redis]: Failed to set cache for key ${key}:`, err.message);
  }
}

export async function invalidateCache(patternOrKey: string): Promise<void> {
  if (!isRedisConnected) return;
  try {
    if (patternOrKey.includes("*")) {
      const keys = await redis.keys(patternOrKey);
      if (keys.length > 0) {
        await redis.del(...keys);
        console.log(`🧹 [redis]: Cleared ${keys.length} cache keys matching ${patternOrKey}`);
      }
    } else {
      await redis.del(patternOrKey);
      console.log(`🧹 [redis]: Cleared cache key: ${patternOrKey}`);
    }
  } catch (err: any) {
    console.warn(`[redis]: Failed to invalidate cache for ${patternOrKey}:`, err.message);
  }
}
