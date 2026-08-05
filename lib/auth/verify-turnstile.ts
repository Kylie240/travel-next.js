/**
 * Verifies a Cloudflare Turnstile token server-side.
 * Returns true when verification succeeds, or when Turnstile is not configured
 * (so local/dev without keys is not hard-blocked).
 */
export async function verifyTurnstileToken(
  token: string | undefined | null,
  ip?: string | null
): Promise<{ ok: boolean; error?: string }> {
  const secret = process.env.TURNSTILE_SECRET_KEY?.trim()

  if (!secret) {
    // Not configured yet — skip server verify (Supabase may still enforce captcha).
    return { ok: true }
  }

  if (!token?.trim()) {
    return { ok: false, error: "Please complete the captcha challenge." }
  }

  const body = new URLSearchParams()
  body.set("secret", secret)
  body.set("response", token.trim())
  if (ip) body.set("remoteip", ip)

  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body,
      }
    )

    if (!res.ok) {
      return { ok: false, error: "Captcha verification failed. Please try again." }
    }

    const data = (await res.json()) as {
      success?: boolean
      "error-codes"?: string[]
    }

    if (!data.success) {
      return { ok: false, error: "Captcha verification failed. Please try again." }
    }

    return { ok: true }
  } catch {
    return { ok: false, error: "Captcha verification failed. Please try again." }
  }
}

export function isTurnstileConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() &&
      process.env.TURNSTILE_SECRET_KEY?.trim()
  )
}
