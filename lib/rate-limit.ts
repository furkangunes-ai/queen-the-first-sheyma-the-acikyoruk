// ==================== Rate Limiter (Upstash Redis + In-Memory Fallback) ====================
//
// Upstash Redis varsa distributed rate limiting kullanır (çoklu instance uyumlu).
// UPSTASH_REDIS_REST_URL ve UPSTASH_REDIS_REST_TOKEN yoksa in-memory fallback çalışır.
// 10K+ kullanıcı senaryosunda Redis önerilir.

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const WINDOW_MS = 60 * 1000; // 1 dakika
const MAX_REQUESTS = 60; // 60 istek/dakika/IP

// ---------------------------------------------------------------------------
// Redis-backed rate limiter (Upstash)
// ---------------------------------------------------------------------------

let redisRatelimit: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  redisRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(MAX_REQUESTS, "60 s"),
    prefix: "rl:",
    analytics: true,
  });
}

// ---------------------------------------------------------------------------
// In-memory fallback (tek instance için)
// ---------------------------------------------------------------------------

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

function isRateLimitedInMemory(ip: string): boolean {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || entry.resetAt < now) {
    store.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > MAX_REQUESTS;
}

// ---------------------------------------------------------------------------
// Public API — Redis varsa Redis, yoksa in-memory
// ---------------------------------------------------------------------------

/**
 * IP bazlı rate limit kontrolü.
 * Redis bağlantısı varsa Upstash sliding window kullanır.
 * Yoksa in-memory fallback çalışır.
 * Limit aşılmışsa true döner.
 */
export async function isRateLimited(ip: string): Promise<boolean> {
  if (redisRatelimit) {
    try {
      const { success } = await redisRatelimit.limit(ip);
      return !success; // success=false → rate limited
    } catch {
      // Redis hatası → in-memory fallback
      return isRateLimitedInMemory(ip);
    }
  }
  return isRateLimitedInMemory(ip);
}

/**
 * Rate limiter durumu: Redis mi yoksa in-memory mi kullanılıyor?
 */
export function getRateLimitMode(): "redis" | "memory" {
  return redisRatelimit ? "redis" : "memory";
}
