import type { Request, Response, NextFunction } from "express";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 60_000;
const DEFAULT_LIMIT = 1000;
const MAX_BUCKETS = 10_000;

function getClientKey(req: Request): string {
  return req.ip || "unknown";
}

export function apiRateLimit(limit = DEFAULT_LIMIT) {
  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = getClientKey(req);
    const current = buckets.get(key);

    if (!current || now >= current.resetAt) {
      buckets.set(key, {
        count: 1,
        resetAt: now + WINDOW_MS,
      });

      res.setHeader("X-RateLimit-Limit", String(limit));
      res.setHeader("X-RateLimit-Remaining", String(Math.max(limit - 1, 0)));
      res.setHeader("X-RateLimit-Reset", String(Math.ceil((now + WINDOW_MS) / 1000)));
      return next();
    }

    current.count += 1;

    const remaining = Math.max(limit - current.count, 0);
    res.setHeader("X-RateLimit-Limit", String(limit));
    res.setHeader("X-RateLimit-Remaining", String(remaining));
    res.setHeader("X-RateLimit-Reset", String(Math.ceil(current.resetAt / 1000)));

    if (current.count > limit) {
      const retryAfter = Math.max(
        Math.ceil((current.resetAt - now) / 1000),
        1
      );

      res.setHeader("Retry-After", String(retryAfter));
      return res.status(429).json({
        success: false,
        error: "RATE_LIMIT_EXCEEDED",
        message: "Too many API requests. Please try again later.",
        retry_after: retryAfter,
      });
    }

    if (buckets.size > MAX_BUCKETS) {
      for (const [bucketKey, bucket] of buckets) {
        if (now >= bucket.resetAt) buckets.delete(bucketKey);
        if (buckets.size <= MAX_BUCKETS) break;
      }
    }

    next();
  };
}

export function clearRateLimitBuckets() {
  buckets.clear();
}
