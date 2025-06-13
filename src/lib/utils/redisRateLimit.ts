import { Redis } from '@upstash/redis';

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || ''
});

interface RateLimitConfig {
  limit: number;
  windowMs: number;
  keyPrefix: string;
}

// Different rate limits for different endpoints
export const rateLimits: Record<string, RateLimitConfig> = {
  leaderboard: {
    limit: 100,
    windowMs: 60 * 1000, // 1 minute
    keyPrefix: 'rate:leaderboard:'
  },
  stats: {
    limit: 30,
    windowMs: 60 * 1000, // 1 minute
    keyPrefix: 'rate:stats:'
  },
  cron: {
    limit: 1,
    windowMs: 60 * 1000, // 1 minute
    keyPrefix: 'rate:cron:'
  }
};

export async function checkRateLimit(
  endpoint: keyof typeof rateLimits,
  identifier: string
): Promise<{ allowed: boolean; headers: Headers }> {
  const config = rateLimits[endpoint];
  const key = `${config.keyPrefix}${identifier}`;
  const now = Date.now();
  const windowKey = `${key}:${Math.floor(now / config.windowMs)}`;

  try {
    // Get current count
    const count = await redis.incr(windowKey);
    
    // Set expiry if this is the first request in the window
    if (count === 1) {
      await redis.expire(windowKey, Math.ceil(config.windowMs / 1000));
    }

    const remaining = Math.max(0, config.limit - count);
    const reset = Math.ceil(now / config.windowMs) * config.windowMs;

    const headers = new Headers({
      'X-RateLimit-Limit': config.limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': reset.toString()
    });

    return {
      allowed: count <= config.limit,
      headers
    };
  } catch (error) {
    console.error('Rate limit error:', error);
    // Fail open if Redis is down
    return {
      allowed: true,
      headers: new Headers()
    };
  }
} 