import { Redis } from '@upstash/redis';

interface RateLimitConfig {
  maxRequests: number;
  windowSeconds: number;
}

interface RateLimitResult {
  allowed: boolean;
  headers: Record<string, string>;
}

const rateLimits: Record<string, RateLimitConfig> = {
  leaderboard: { maxRequests: 100, windowSeconds: 60 },
  stats: { maxRequests: 50, windowSeconds: 60 },
  cron: { maxRequests: 10, windowSeconds: 3600 }
};

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || ''
});

export async function checkRateLimit(
  endpoint: string,
  ip: string
): Promise<RateLimitResult> {
  try {
    const config = rateLimits[endpoint] || rateLimits.leaderboard;
    const key = `ratelimit:${endpoint}:${ip}`;
    
    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, config.windowSeconds);
    }

    const remaining = Math.max(0, config.maxRequests - current);
    const reset = Math.floor(Date.now() / 1000) + config.windowSeconds;

    return {
      allowed: current <= config.maxRequests,
      headers: {
        'X-RateLimit-Limit': config.maxRequests.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString()
      }
    };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // Fail open - allow the request if rate limiting fails
    return {
      allowed: true,
      headers: {}
    };
  }
} 