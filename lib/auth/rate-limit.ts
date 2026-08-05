type Bucket = {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

/** Best-effort in-memory limiter (per server instance). */
export function checkRateLimit(options: {
  key: string
  limit: number
  windowMs: number
}): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now()
  const existing = buckets.get(options.key)

  if (!existing || existing.resetAt <= now) {
    buckets.set(options.key, {
      count: 1,
      resetAt: now + options.windowMs,
    })
    return { allowed: true, retryAfterSec: 0 }
  }

  if (existing.count >= options.limit) {
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    }
  }

  existing.count += 1
  buckets.set(options.key, existing)
  return { allowed: true, retryAfterSec: 0 }
}

/** Periodically drop expired buckets to avoid unbounded growth. */
export function pruneRateLimitBuckets() {
  const now = Date.now()
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}
