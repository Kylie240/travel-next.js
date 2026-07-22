import "server-only"

import type Stripe from "stripe"
import { createClient as createAdminClient } from "@/utils/supabase/server-admin"
import { stripe } from "@/lib/stripe"
import {
  v1SellerReady,
  v2RecipientReadyForDashboard,
} from "@/lib/stripe-seller-status"

export type StripeConnectStatusLabel =
  | "ready"
  | "pending"
  | "restricted"
  | "incomplete"
  | "not_connected"

export type SyncedConnectAccountFields = {
  stripe_connect_sales_enabled: boolean
  stripe_connect_payouts_enabled: boolean
  stripe_connect_details_submitted: boolean
  stripe_connect_disabled_reason: string | null
  stripe_connect_requirements_currently_due: string[]
  stripe_connect_status: StripeConnectStatusLabel
  stripe_connect_synced_at: string
}

function deriveStatusLabel(input: {
  salesEnabled: boolean
  disabledReason: string | null
  currentlyDue: string[]
  detailsSubmitted: boolean
}): StripeConnectStatusLabel {
  if (input.disabledReason) return "restricted"
  if (input.salesEnabled) return "ready"
  if (!input.detailsSubmitted) return "incomplete"
  if (input.currentlyDue.length > 0) return "pending"
  return "pending"
}

function fieldsFromV1Account(account: Stripe.Account): SyncedConnectAccountFields {
  const currentlyDue = account.requirements?.currently_due ?? []
  const disabledReason = account.requirements?.disabled_reason ?? null
  const salesEnabled = v1SellerReady(account)
  const detailsSubmitted = Boolean(account.details_submitted)
  return {
    stripe_connect_sales_enabled: salesEnabled,
    stripe_connect_payouts_enabled: Boolean(account.payouts_enabled),
    stripe_connect_details_submitted: detailsSubmitted,
    stripe_connect_disabled_reason: disabledReason,
    stripe_connect_requirements_currently_due: currentlyDue,
    stripe_connect_status: deriveStatusLabel({
      salesEnabled,
      disabledReason,
      currentlyDue,
      detailsSubmitted,
    }),
    stripe_connect_synced_at: new Date().toISOString(),
  }
}

function fieldsFromV2Account(
  account: Stripe.V2.Core.Account,
  salesEnabled: boolean
): SyncedConnectAccountFields {
  const detailsSubmitted = Boolean(account.configuration?.recipient?.applied)
  return {
    stripe_connect_sales_enabled: salesEnabled,
    stripe_connect_payouts_enabled: salesEnabled,
    stripe_connect_details_submitted: detailsSubmitted,
    stripe_connect_disabled_reason: salesEnabled ? null : null,
    stripe_connect_requirements_currently_due: [],
    stripe_connect_status: deriveStatusLabel({
      salesEnabled,
      disabledReason: null,
      currentlyDue: [],
      detailsSubmitted,
    }),
    stripe_connect_synced_at: new Date().toISOString(),
  }
}

/**
 * Retrieve Connect account from Stripe and persist status onto users_settings.
 */
export async function syncStripeConnectAccountById(
  stripeAccountId: string
): Promise<
  | { ok: true; userId: string; salesEnabled: boolean; status: StripeConnectStatusLabel }
  | { ok: false; reason: string }
> {
  const supabase = createAdminClient()
  const { data: settings, error: lookupError } = await supabase
    .from("users_settings")
    .select("user_id")
    .eq("stripe_account_id", stripeAccountId)
    .maybeSingle()

  if (lookupError) {
    console.error("syncStripeConnectAccountById lookup:", lookupError)
    return { ok: false, reason: lookupError.message }
  }
  if (!settings?.user_id) {
    return { ok: false, reason: "user_not_found" }
  }

  let fields: SyncedConnectAccountFields
  try {
    const v2 = await stripe.v2.core.accounts.retrieve(stripeAccountId, {
      include: ["configuration.recipient", "requirements"],
    })
    const salesEnabled = v2RecipientReadyForDashboard(v2)
    fields = fieldsFromV2Account(v2, salesEnabled)
  } catch {
    try {
      const v1 = await stripe.accounts.retrieve(stripeAccountId)
      fields = fieldsFromV1Account(v1)
    } catch (err) {
      console.error("syncStripeConnectAccountById retrieve:", err)
      return { ok: false, reason: "stripe_retrieve_failed" }
    }
  }

  const { error: updateError } = await supabase
    .from("users_settings")
    .update(fields)
    .eq("user_id", settings.user_id)

  if (updateError) {
    console.error("syncStripeConnectAccountById update:", updateError)
    return { ok: false, reason: updateError.message }
  }

  return {
    ok: true,
    userId: settings.user_id,
    salesEnabled: fields.stripe_connect_sales_enabled,
    status: fields.stripe_connect_status,
  }
}

export async function recordStripePayoutFailure(
  stripeAccountId: string,
  payout: Stripe.Payout
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const supabase = createAdminClient()
  const { data: settings } = await supabase
    .from("users_settings")
    .select("user_id")
    .eq("stripe_account_id", stripeAccountId)
    .maybeSingle()

  if (!settings?.user_id) {
    return { ok: false, reason: "user_not_found" }
  }

  const { error } = await supabase
    .from("users_settings")
    .update({
      stripe_connect_last_payout_failed_at: new Date().toISOString(),
      stripe_connect_last_payout_failure_code: payout.failure_code ?? null,
      stripe_connect_last_payout_failure_message:
        payout.failure_message ?? null,
    })
    .eq("user_id", settings.user_id)

  if (error) {
    console.error("recordStripePayoutFailure:", error)
    return { ok: false, reason: error.message }
  }

  // Re-sync full account status in case payout failure coincides with restrictions
  await syncStripeConnectAccountById(stripeAccountId)
  return { ok: true }
}

/** Fast UI check from DB cache (no Stripe API call). */
export async function getCachedSellerSalesEnabled(
  userId: string
): Promise<boolean> {
  const supabase = createAdminClient()
  const { data } = await supabase
    .from("users_settings")
    .select("stripe_account_id, stripe_connect_sales_enabled")
    .eq("user_id", userId)
    .maybeSingle()

  if (!data?.stripe_account_id) return false
  return Boolean(data.stripe_connect_sales_enabled)
}
