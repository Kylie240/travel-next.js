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
 *    Must match exactly; redeploy after changing Vercel env vars.
 */
function normalizeHookSecret(raw: string): string {
  // Dashboard / docs format: v1,whsec_<base64>
  // standardwebhooks expects the base64 key (it also accepts a whsec_ prefix).
  let secret = raw.trim()
  if (
    (secret.startsWith('"') && secret.endsWith('"')) ||
    (secret.startsWith("'") && secret.endsWith("'"))
  ) {
    secret = secret.slice(1, -1).trim()
  }
  if (secret.startsWith("v1,whsec_")) {
    return secret.slice("v1,whsec_".length)
  }
  if (secret.startsWith("v1,")) {
    return secret.slice("v1,".length)
  }
  if (secret.startsWith("whsec_")) {
    return secret.slice("whsec_".length)
  }
  return secret
}

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

  const secret = normalizeHookSecret(secretRaw)
  if (!secret) {
    console.error("SUPABASE_AUTH_HOOK_SECRET is empty after normalization")
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

  const payload = await request.text()
  const headers = Object.fromEntries(request.headers.entries())

  let parsed: BeforeUserCreatedPayload
  try {
    const wh = new Webhook(secret)
    parsed = wh.verify(payload, headers) as BeforeUserCreatedPayload
  } catch (err) {
    console.error("Auth hook signature verification failed:", err)
    console.error(
      "Hook secret debug (no secret value):",
      JSON.stringify({
        rawLength: secretRaw.length,
        normalizedLength: secret.length,
        rawStartsWithV1: secretRaw.startsWith("v1,"),
        rawHasWhsec: secretRaw.includes("whsec_"),
        hasWebhookId: Boolean(headers["webhook-id"]),
        hasWebhookSignature: Boolean(headers["webhook-signature"]),
        hasWebhookTimestamp: Boolean(headers["webhook-timestamp"]),
      })
    )
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

  // Editorial seed accounts used by scripts/seed-explore
  if (email.toLowerCase().endsWith("@seed.journli.com")) {
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
