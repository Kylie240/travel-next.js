import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { z } from "zod"
import { isSuspiciousSignupEmail } from "@/lib/auth/disposable-email"
import {
  checkRateLimit,
  pruneRateLimitBuckets,
} from "@/lib/auth/rate-limit"

const signupSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be less than 50 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .refine((s) => !s.includes(" "), "No spaces allowed"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown"
  return request.headers.get("x-real-ip")?.trim() || "unknown"
}

function getAppOrigin(request: NextRequest): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "")
  if (configured) return configured
  return request.nextUrl.origin
}

export async function POST(request: NextRequest) {
  pruneRateLimitBuckets()

  const ip = clientIp(request)

  const ipLimit = await checkRateLimit({
    key: `signup:ip:${ip}`,
    limit: 5,
    windowMs: 60 * 60 * 1000,
  })
  if (!ipLimit.allowed) {
    return NextResponse.json(
      {
        error: "Too many signup attempts. Please try again later.",
        retryAfterSec: ipLimit.retryAfterSec,
      },
      {
        status: 429,
        headers: { "Retry-After": String(ipLimit.retryAfterSec) },
      }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const parsed = signupSchema.safeParse(body)
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message || "Invalid signup data"
    return NextResponse.json({ error: message }, { status: 400 })
  }

  const { name, username, email, password } = parsed.data
  const normalizedEmail = email.trim().toLowerCase()
  const normalizedUsername = username.trim().toLowerCase()

  const emailLimit = await checkRateLimit({
    key: `signup:email:${normalizedEmail}`,
    limit: 3,
    windowMs: 60 * 60 * 1000,
  })
  if (!emailLimit.allowed) {
    return NextResponse.json(
      {
        error: "Too many signup attempts for this email. Please try again later.",
        retryAfterSec: emailLimit.retryAfterSec,
      },
      {
        status: 429,
        headers: { "Retry-After": String(emailLimit.retryAfterSec) },
      }
    )
  }

  if (isSuspiciousSignupEmail(normalizedEmail)) {
    return NextResponse.json(
      {
        error:
          "Disposable or temporary email addresses are not allowed. Please use a permanent email.",
      },
      { status: 400 }
    )
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
  if (!url || !anonKey) {
    return NextResponse.json(
      { error: "Authentication is temporarily unavailable." },
      { status: 503 }
    )
  }

  const supabase = createClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  const origin = getAppOrigin(request)

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        name: name.trim(),
        username: normalizedUsername,
      },
    },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // Do not create profile rows here — wait until email is confirmed.
  const needsConfirmation = !data.session || !data.user?.email_confirmed_at

  return NextResponse.json({
    success: true,
    needsConfirmation,
    userId: data.user?.id ?? null,
  })
}
