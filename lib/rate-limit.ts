// ==================== Basit In-Memory Rate Limiter ====================
//
// IP bazlı sliding window rate limiter.
// Railway tek container çalıştırdığı için in-memory yeterli.
// 10K+ kullanıcı / çoklu instance durumunda Redis'e geçilmeli.

const windowMs = 60 * 1000; // 1 dakika
const maxRequests = 60; // 60 istek/dakika/IP

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

// Her 5 dakikada süresi dolmuş kayıtları temizle
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * IP bazlı rate limit kontrolü.
 * Limit aşılmışsa true döner.
 */
export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || entry.resetAt < now) {
    store.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }

  entry.count++;
  return entry.count > maxRequests;
}
