import { NextResponse, type NextRequest } from "next/server"
import { Webhook } from "standardwebhooks"
import { isSuspiciousSignupEmail } from "@/lib/auth/disposable-email"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

type BeforeUserCreatedPayload = {
  user?: {
    email?: string
    is_anonymous?: boolean
    app_metadata?: { provider?: string }
  }
  metadata?: {
    name?: string
    ip_address?: string
  }
}

/**
 * Supabase Auth Hook: Before User Created
 *
 * Blocks disposable / suspicious emails even when bots call Auth directly
 * with the public anon key (bypassing /api/auth/signup).
 *
 * Setup:
 * 1. Supabase → Authentication → Hooks → Before User Created → HTTPS
 * 2. URL: https://YOUR_DOMAIN/api/auth/hooks/before-user-created
 * 3. Copy the hook secret into SUPABASE_AUTH_HOOK_SECRET (v1,whsec_...)
 */
export async function POST(request: NextRequest) {
  const secretRaw = process.env.SUPABASE_AUTH_HOOK_SECRET?.trim()
  if (!secretRaw) {
    console.error("SUPABASE_AUTH_HOOK_SECRET is not configured")
    return NextResponse.json(
      {
        error: {
          http_code: 500,
          message: "Signup protection is temporarily unavailable.",
        },
      },
      { status: 500 }
    )
  }

  // Secrets from the dashboard look like: v1,whsec_xxxxx
  const secret = secretRaw.replace(/^v1,/, "")

  const payload = await request.text()
  const headers = Object.fromEntries(request.headers.entries())

  let parsed: BeforeUserCreatedPayload
  try {
    const wh = new Webhook(secret)
    parsed = wh.verify(payload, headers) as BeforeUserCreatedPayload
  } catch (err) {
    console.error("Auth hook signature verification failed:", err)
    return NextResponse.json(
      {
        error: {
          http_code: 401,
          message: "Invalid hook signature.",
        },
      },
      { status: 401 }
    )
  }

  const email = parsed.user?.email?.trim() || ""
  const provider = parsed.user?.app_metadata?.provider || "email"

  // Allow anonymous / phone edge cases through; email signups must pass checks.
  if (!email) {
    return NextResponse.json({}, { status: 200 })
  }

  // OAuth (Google) already verified the mailbox — still block known disposables.
  if (isSuspiciousSignupEmail(email)) {
    console.warn("Blocked signup via auth hook", {
      email,
      provider,
      ip: parsed.metadata?.ip_address,
    })
    return NextResponse.json(
      {
        error: {
          http_code: 400,
          message:
            "Disposable or temporary email addresses are not allowed. Please use a permanent email.",
        },
      },
      { status: 400 }
    )
  }

  return NextResponse.json({}, { status: 200 })
}
