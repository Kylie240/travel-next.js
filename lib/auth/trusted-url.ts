/**
 * Trusted app origins for redirects, emails, and Stripe return URLs.
 * Never trust a raw client Origin / requestOrigin without allowlisting.
 */

function normalizeOrigin(value: string): string {
  return value.trim().replace(/\/$/, "")
}

function collectAllowedOrigins(): Set<string> {
  const allowed = new Set<string>()

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (siteUrl) allowed.add(normalizeOrigin(siteUrl))

  if (process.env.VERCEL_URL) {
    allowed.add(normalizeOrigin(`https://${process.env.VERCEL_URL}`))
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    allowed.add(
      normalizeOrigin(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`)
    )
  }

  // Known production hosts
  allowed.add("https://www.journli.com")
  allowed.add("https://journli.com")

  if (process.env.NODE_ENV === "development") {
    const port = process.env.PORT || "3000"
    allowed.add(`http://localhost:${port}`)
    allowed.add("http://localhost:3000")
    allowed.add("http://127.0.0.1:3000")
  }

  return allowed
}

/** Prefer configured site URL; never prefer an untrusted Origin. */
export function getTrustedAppBaseUrl(requestOrigin?: string | null): string {
  const allowed = collectAllowedOrigins()
  const candidate = requestOrigin ? normalizeOrigin(requestOrigin) : ""

  if (candidate && allowed.has(candidate)) {
    return candidate
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (siteUrl) return normalizeOrigin(siteUrl)

  if (process.env.NODE_ENV === "development") {
    return `http://localhost:${process.env.PORT || 3000}`
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return normalizeOrigin(
      `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    )
  }

  if (process.env.VERCEL_URL) {
    return normalizeOrigin(`https://${process.env.VERCEL_URL}`)
  }

  return "https://www.journli.com"
}

/**
 * Only allow same-origin relative paths (blocks //evil.com and absolute URLs).
 */
export function safeRelativePath(
  next: string | null | undefined,
  fallback = "/"
): string {
  if (!next) return fallback
  const trimmed = next.trim()
  if (!trimmed.startsWith("/")) return fallback
  if (trimmed.startsWith("//")) return fallback
  if (trimmed.includes("://")) return fallback
  if (trimmed.includes("\\")) return fallback
  return trimmed
}
