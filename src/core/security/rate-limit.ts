export interface RateLimitResult {
  success: boolean; // true if rate limit exceeded (blocked)
  limit: number;
  remaining: number;
  resetAt: Date;
}

export interface RateLimiter {
  isRateLimited(key: string, limit: number, windowMs: number): Promise<RateLimitResult>;
}

/**
 * Sliding window rate limiter in-memory.
 * Used for local development and as an automatic fallback if distributed cache is unreachable.
 */
export class MemoryRateLimiter implements RateLimiter {
  private cache = new Map<string, number[]>();

  async isRateLimited(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
    const now = Date.now();
    const threshold = now - windowMs;

    // Retrieve active timestamps
    let timestamps = this.cache.get(key) || [];

    // Filter out expired timestamps
    timestamps = timestamps.filter((time) => time > threshold);

    if (timestamps.length >= limit) {
      const oldestActive = timestamps[0] || now;
      const resetTime = new Date(oldestActive + windowMs);

      return {
        success: true,
        limit,
        remaining: 0,
        resetAt: resetTime,
      };
    }

    // Record request
    timestamps.push(now);
    this.cache.set(key, timestamps);

    const oldestActive = timestamps[0] || now;
    const resetTime = new Date(oldestActive + windowMs);

    return {
      success: false,
      limit,
      remaining: Math.max(0, limit - timestamps.length),
      resetAt: resetTime,
    };
  }
}

/**
 * Distributed Serverless Rate Limiter powered by Upstash Redis REST API.
 * Uses atomic HTTP pipeline to coordinate rate limits across multiple Vercel/Lambda serverless instances.
 */
export class UpstashRedisRateLimiter implements RateLimiter {
  constructor(
    private url: string,
    private token: string,
    private fallback: MemoryRateLimiter
  ) {}

  async isRateLimited(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
    const now = Date.now();
    const windowSeconds = Math.max(1, Math.ceil(windowMs / 1000));
    const windowBucket = Math.floor(now / windowMs);
    const redisKey = `ratelimit:${key}:${windowBucket}`;

    try {
      const response = await fetch(`${this.url}/pipeline`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          ['INCR', redisKey],
          ['EXPIRE', redisKey, windowSeconds * 2],
        ]),
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Upstash returned HTTP ${response.status}`);
      }

      const results = await response.json();
      const currentCount = typeof results?.[0]?.result === 'number' ? results[0].result : 1;
      const resetAt = new Date(now + windowMs);

      return {
        success: currentCount > limit,
        limit,
        remaining: Math.max(0, limit - currentCount),
        resetAt,
      };
    } catch (err) {
      console.warn('[RATE LIMIT] Upstash pipeline call failed, falling back to local memory window:', err);
      return this.fallback.isRateLimited(key, limit, windowMs);
    }
  }
}

/**
 * Production Adaptive Rate Limiter.
 * If UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set, uses distributed edge cache.
 * Otherwise uses resilient in-memory sliding window.
 */
class AdaptiveRateLimiter implements RateLimiter {
  private memoryLimiter = new MemoryRateLimiter();
  private upstashLimiter: UpstashRedisRateLimiter | null = null;

  private getLimiter(): RateLimiter {
    const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
    const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

    if (url && token) {
      if (!this.upstashLimiter) {
        this.upstashLimiter = new UpstashRedisRateLimiter(url, token, this.memoryLimiter);
      }
      return this.upstashLimiter;
    }

    return this.memoryLimiter;
  }

  async isRateLimited(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
    return this.getLimiter().isRateLimited(key, limit, windowMs);
  }
}

// Global default rate limiter instance
export const rateLimiter: RateLimiter = new AdaptiveRateLimiter();
export default rateLimiter;
