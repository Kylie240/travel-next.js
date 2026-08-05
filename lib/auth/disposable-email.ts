import disposableDomains from "disposable-email-domains"

/** Extra domains seen in abuse campaigns (not always in public lists yet). */
const EXTRA_DISPOSABLE_DOMAINS = [
  "kavio.org",
  "glaud.biz",
  "rudox.biz",
]

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

export function getEmailDomain(email: string): string | null {
  const normalized = email.trim().toLowerCase()
  const at = normalized.lastIndexOf("@")
  if (at < 0) return null
  const domain = normalized.slice(at + 1).replace(/\.+$/, "")
  return domain || null
}
