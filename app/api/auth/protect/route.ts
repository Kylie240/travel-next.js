import { NextResponse, type NextRequest } from "next/server"
import {
  checkRateLimit,
  pruneRateLimitBuckets,
} from "@/lib/auth/rate-limit"

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown"
  return request.headers.get("x-real-ip")?.trim() || "unknown"
}

/** Rate-limit gate for password reset / resend confirmation. */
export async function POST(request: NextRequest) {
  pruneRateLimitBuckets()
  const ip = clientIp(request)

  const ipLimit = await checkRateLimit({
    key: `auth-protect:ip:${ip}`,
    limit: 10,
    windowMs: 60 * 60 * 1000,
  })
  if (!ipLimit.allowed) {
    return NextResponse.json(
      {
        error: "Too many attempts. Please try again later.",
        retryAfterSec: ipLimit.retryAfterSec,
      },
      {
        status: 429,
        headers: { "Retry-After": String(ipLimit.retryAfterSec) },
      }
    )
  }

  return NextResponse.json({ ok: true })
}
