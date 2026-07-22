/**
 * Platform service fee on itinerary sales (applied after estimated Stripe processing).
 * Must stay in sync with create-page net profit display.
 */
export const SELLER_PLATFORM_FEE_RATE = {
  pro: 0.05,
  free: 0.15,
} as const

export type SellerFeePlan = keyof typeof SELLER_PLATFORM_FEE_RATE

export function normalizeSellerPlan(plan: string | null | undefined): SellerFeePlan {
  const normalized = (plan || "free").trim().toLowerCase()
  if (normalized === "pro" || normalized === "premium" || normalized === "standard") {
    // "premium"/"standard" are legacy plan names; treat as pro-tier fees.
    return "pro"
  }
  return "free"
}

export function getPlatformFeeRateForPlan(
  plan: string | null | undefined
): number {
  return SELLER_PLATFORM_FEE_RATE[normalizeSellerPlan(plan)]
}

/** Estimate Stripe card processing: 2.9% + $0.30 */
export function estimateStripeFeeCents(priceCents: number): number {
  const p = Math.max(0, Math.round(Number(priceCents) || 0))
  return Math.round(p * 0.029 + 30)
}

/**
 * Platform application fee in cents for a single itinerary sale.
 * Includes estimated Stripe processing + platform cut of the remainder.
 */
export function calculateApplicationFeeCents(
  priceCents: number,
  platformFeeRate: number
): number {
  const p = Math.max(0, Math.round(Number(priceCents) || 0))
  const stripeFee = estimateStripeFeeCents(p)
  const platformFee = Math.round((p - stripeFee) * platformFeeRate)
  return Math.max(0, stripeFee + platformFee)
}

export function calculatePlatformFeeCents(
  priceCents: number,
  platformFeeRate: number
): number {
  const p = Math.max(0, Math.round(Number(priceCents) || 0))
  const stripeFee = estimateStripeFeeCents(p)
  return Math.max(0, Math.round((p - stripeFee) * platformFeeRate))
}

export function parsePlatformFeeRateFromMetadata(
  value: string | null | undefined
): number | null {
  if (value == null || value === "") return null
  const rate = Number(value)
  if (!Number.isFinite(rate) || rate < 0 || rate > 1) return null
  return rate
}
