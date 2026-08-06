import disposableDomains from "disposable-email-domains"

/** Extra domains seen in abuse campaigns (not always in public lists yet). */
const EXTRA_DISPOSABLE_DOMAINS = [
  "kavio.org",
  "glaud.biz",
  "rudox.biz",
  // Common abuse / throwaway patterns — extend as new campaigns appear
  "mailinator.com",
  "guerrillamail.com",
  "tempmail.com",
  "throwaway.email",
  "yopmail.com",
  "sharklasers.com",
  "guerrillamailblock.com",
  "grr.la",
  "pokemail.net",
  "spam4.me",
  "trashmail.com",
  "fakeinbox.com",
  "maildrop.cc",
  "temp-mail.org",
  "10minutemail.com",
  "moakt.com",
  "emailondeck.com",
]

/** TLDs heavily used by disposable providers in recent campaigns. */
const SUSPICIOUS_TLDS = new Set(["biz", "top", "xyz", "click", "icu", "rest", "sbs"])

const DISPOSABLE_SET = new Set(
  [...disposableDomains, ...EXTRA_DISPOSABLE_DOMAINS].map((d) =>
    d.trim().toLowerCase()
  )
)

/**
 * Returns true when the email uses a known disposable / throwaway domain.
 * Checks the full domain and parent domains (e.g. mail.temp.com → temp.com).
 */
export function isDisposableEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase()
  const at = normalized.lastIndexOf("@")
  if (at < 0) return false

  let domain = normalized.slice(at + 1)
  if (!domain || domain.includes(" ")) return false

  // Strip trailing dots
  domain = domain.replace(/\.+$/, "")

  const parts = domain.split(".")
  for (let i = 0; i < parts.length - 1; i++) {
    const candidate = parts.slice(i).join(".")
    if (DISPOSABLE_SET.has(candidate)) return true
  }

  return false
}

/**
 * Heuristic blocks for spam campaigns that rotate unknown domains.
 * Keep conservative to avoid blocking real users.
 */
export function isSuspiciousSignupEmail(email: string): boolean {
  if (isDisposableEmail(email)) return true

  const normalized = email.trim().toLowerCase()
  const at = normalized.lastIndexOf("@")
  if (at < 0) return true

  const local = normalized.slice(0, at)
  const domain = normalized.slice(at + 1).replace(/\.+$/, "")
  if (!local || !domain) return true

  const tld = domain.split(".").pop() || ""
  // Short random-looking domains on abuse-heavy TLDs (e.g. glaud.biz)
  if (SUSPICIOUS_TLDS.has(tld)) {
    const label = domain.slice(0, -(tld.length + 1))
    if (/^[a-z0-9-]{3,12}$/.test(label) && !label.includes("-")) {
      return true
    }
  }

  // Very random local parts: long alphanumeric with almost no vowels
  if (local.length >= 12) {
    const letters = local.replace(/[^a-z]/g, "")
    const vowels = (letters.match(/[aeiou]/g) || []).length
    if (letters.length >= 10 && vowels / letters.length < 0.15) {
      return true
    }
  }

  return false
}

export function getEmailDomain(email: string): string | null {
  const normalized = email.trim().toLowerCase()
  const at = normalized.lastIndexOf("@")
  if (at < 0) return null
  const domain = normalized.slice(at + 1).replace(/\.+$/, "")
  return domain || null
}

/** Add domains discovered in live attacks (also used by Auth Hook). */
export function registerBlockedDomains(domains: string[]) {
  for (const d of domains) {
    const key = d.trim().toLowerCase()
    if (key) DISPOSABLE_SET.add(key)
  }
}
