import "server-only"

import type Stripe from "stripe"
import { createClient as createAdminClient } from "@/utils/supabase/server-admin"
import { stripe } from "@/lib/stripe"
import { resolveEffectivePlan } from "@/lib/founding-creator/plan"

/**
 * After Connect onboarding, capability flags often lag a few seconds.
 * Treat pending/active transfers or applied recipient config as ready.
 */
export function v2RecipientReadyForDashboard(
  account: Stripe.V2.Core.Account
): boolean {
  const recipient = account.configuration?.recipient
  const transfers = recipient?.capabilities?.stripe_balance?.stripe_transfers
  const status = transfers?.status
  if (status === "restricted" || status === "unsupported") return false
  if (status === "active" || status === "pending") return true
  if (recipient?.applied) return true
  return false
}

/** Hosted onboarding finished; payouts/charges can still flip on shortly after. */
export function v1SellerReady(account: Stripe.Account): boolean {
  if (account.requirements?.disabled_reason) return false
  if (account.details_submitted) return true
  const currentlyDue = account.requirements?.currently_due ?? []
  const pastDue = account.requirements?.past_due ?? []
  return currentlyDue.length === 0 && pastDue.length === 0
}

export type SellerStripeStatus = {
  stripeAccountId: string | null
  sellerAccountReady: boolean
  plan: string | null
}

/**
 * Live Stripe check: can this Connect account receive destination charges?
 */
export async function isStripeAccountReadyForSales(
  stripeAccountId: string
): Promise<boolean> {
  try {
    const v2 = await stripe.v2.core.accounts.retrieve(stripeAccountId, {
      include: ["configuration.recipient", "requirements"],
    })
    return v2RecipientReadyForDashboard(v2)
  } catch {
    try {
      const v1 = await stripe.accounts.retrieve(stripeAccountId)
      return v1SellerReady(v1)
    } catch (err) {
      console.error("isStripeAccountReadyForSales:", err)
      return false
    }
  }
}

/**
 * Look up seller settings + live Connect readiness for marketplace sales.
 */
export async function getSellerStripeStatusForUser(
  userId: string
): Promise<SellerStripeStatus> {
  const supabase = createAdminClient()
  const { data: settings } = await supabase
    .from("users_settings")
    .select(
      "stripe_account_id, plan, stripe_subscription_status, founding_creator_status, founding_creator_expires_at"
    )
    .eq("user_id", userId)
    .maybeSingle()

  const stripeAccountId =
    (settings?.stripe_account_id as string | null | undefined) ?? null
  const plan = resolveEffectivePlan({
    plan: settings?.plan as string | null,
    stripe_subscription_status: settings?.stripe_subscription_status as
      | string
      | null,
    founding_creator_status: settings?.founding_creator_status as string | null,
    founding_creator_expires_at: settings?.founding_creator_expires_at as
      | string
      | null,
  })

  if (!stripeAccountId) {
    return { stripeAccountId: null, sellerAccountReady: false, plan }
  }

  const sellerAccountReady = await isStripeAccountReadyForSales(stripeAccountId)
  return { stripeAccountId, sellerAccountReady, plan }
}
