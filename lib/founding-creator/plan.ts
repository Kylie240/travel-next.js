/** Client-safe founding / billing plan helpers (no server-only imports). */

export function hasActiveStripePro(
  stripeStatus: string | null | undefined
): boolean {
  const s = (stripeStatus || "").toLowerCase()
  return s === "active" || s === "trialing"
}

export function isFoundingProActive(input: {
  founding_creator_status?: string | null
  founding_creator_expires_at?: string | Date | null
}): boolean {
  if (input.founding_creator_status !== "active") return false
  if (!input.founding_creator_expires_at) return false
  const expires =
    input.founding_creator_expires_at instanceof Date
      ? input.founding_creator_expires_at.getTime()
      : new Date(input.founding_creator_expires_at).getTime()
  return Number.isFinite(expires) && expires > Date.now()
}

/**
 * Entitlement plan at read time.
 * Prefer live Stripe; else unexpired founding grant.
 * Ignores a stale denormalized `plan` column so Pro ends when the grant expires
 * even if the expire cron has not run yet.
 */
export function resolveEffectivePlan(input: {
  plan?: string | null
  stripe_subscription_status?: string | null
  founding_creator_status?: string | null
  founding_creator_expires_at?: string | Date | null
}): "pro" | "free" {
  if (hasActiveStripePro(input.stripe_subscription_status)) {
    return "pro"
  }

  if (
    isFoundingProActive({
      founding_creator_status: input.founding_creator_status,
      founding_creator_expires_at: input.founding_creator_expires_at,
    })
  ) {
    return "pro"
  }

  return "free"
}

/** Normalize legacy Stripe price map values to the app plan key. */
export function normalizeStoredPlan(
  plan: string | null | undefined
): "pro" | "free" {
  const p = (plan || "").trim().toLowerCase()
  if (p === "pro" || p === "standard" || p === "premium") return "pro"
  return "free"
}
