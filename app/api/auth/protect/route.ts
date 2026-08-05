import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import {
  checkRateLimit,
  pruneRateLimitBuckets,
} from "@/lib/auth/rate-limit"
import { verifyTurnstileToken } from "@/lib/auth/verify-turnstile"

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown"
  return request.headers.get("x-real-ip")?.trim() || "unknown"
}

/** Rate-limit + captcha gate for password reset / resend confirmation. */
export async function POST(request: NextRequest) {
  pruneRateLimitBuckets()
  const ip = clientIp(request)

  const ipLimit = checkRateLimit({
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

  let body: { captchaToken?: string } = {}
  try {
    body = await request.json()
  } catch {
    body = {}
  }

  const captcha = await verifyTurnstileToken(body.captchaToken, ip)
  if (!captcha.ok) {
    return NextResponse.json(
      { error: captcha.error || "Captcha verification failed." },
      { status: 400 }
    )
  }

  return NextResponse.json({ ok: true })
}
