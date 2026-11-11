export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: Date;
}

export interface RateLimiter {
  isRateLimited(key: string, limit: number, windowMs: number): Promise<RateLimitResult>;
}

/**
 * Sliding window rate limiter in-memory.
 * Intended for development use. Can be swapped for a Redis-backed or database-backed 
 * production rate limiter by adhering to the RateLimiter interface.
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
      const oldestActive = timestamps[0];
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

    const oldestActive = timestamps[0];
    const resetTime = new Date(oldestActive + windowMs);

    return {
      success: false,
      limit,
      remaining: limit - timestamps.length,
      resetAt: resetTime,
    };
  }
}

// Global default rate limiter instance
export const rateLimiter: RateLimiter = new MemoryRateLimiter();
export default rateLimiter;
