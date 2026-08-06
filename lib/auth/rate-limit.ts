type Bucket = {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

function memoryLimit(options: {
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

function isUpstashConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL?.trim() &&
      process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  )
}

/**
 * Shared rate limiter.
 * Uses Upstash Redis when configured (recommended on Vercel); otherwise
 * falls back to per-instance in-memory limits.
 */
export async function checkRateLimit(options: {
  key: string
  limit: number
  windowMs: number
}): Promise<{ allowed: boolean; retryAfterSec: number }> {
  if (!isUpstashConfigured()) {
    return memoryLimit(options)
  }

  try {
    const { Ratelimit } = await import("@upstash/ratelimit")
    const { Redis } = await import("@upstash/redis")

    const redis = Redis.fromEnv()
    // windowMs → sliding window duration in seconds (min 1)
    const windowSec = Math.max(1, Math.ceil(options.windowMs / 1000))
    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(options.limit, `${windowSec} s`),
      prefix: "journli-rl",
      analytics: false,
    })

    const result = await ratelimit.limit(options.key)
    if (result.success) {
      return { allowed: true, retryAfterSec: 0 }
    }

    const retryAfterSec = Math.max(
      1,
      Math.ceil((result.reset - Date.now()) / 1000)
    )
    return { allowed: false, retryAfterSec }
  } catch (err) {
    console.error("Upstash rate limit error; falling back to memory:", err)
    return memoryLimit(options)
  }
}

/** Periodically drop expired in-memory buckets to avoid unbounded growth. */
export function pruneRateLimitBuckets() {
  const now = Date.now()
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}
