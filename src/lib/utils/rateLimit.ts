interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export function rateLimit(
  key: string,
  limit: number = 100,
  windowMs: number = 60 * 1000 // 1 minute
): boolean {
  const now = Date.now();
  const windowKey = `${key}:${Math.floor(now / windowMs)}`;

  if (!store[windowKey]) {
    store[windowKey] = {
      count: 0,
      resetTime: now + windowMs
    };
  }

  // Clean up expired entries
  Object.keys(store).forEach((k) => {
    if (store[k].resetTime < now) {
      delete store[k];
    }
  });

  // Check if rate limit exceeded
  if (store[windowKey].count >= limit) {
    return false;
  }

  // Increment counter
  store[windowKey].count++;
  return true;
}

export function getRateLimitHeaders(key: string, limit: number, windowMs: number): Headers {
  const now = Date.now();
  const windowKey = `${key}:${Math.floor(now / windowMs)}`;
  const remaining = store[windowKey] ? limit - store[windowKey].count : limit;
  const reset = store[windowKey] ? store[windowKey].resetTime : now + windowMs;

  return new Headers({
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': reset.toString()
  });
} 