import "server-only"

import type Stripe from "stripe"
import { createClient } from "@/utils/supabase/server-admin"
import {
  subscriptionEndsAtForUserSettings,
} from "@/lib/stripe-subscription-utils"

function getPriceToPlanMap(): Record<string, string> {
  const map: Record<string, string> = {}
  if (process.env.STANDARD_PRICE_ID) {
    map[process.env.STANDARD_PRICE_ID] = "standard"
  }
  if (process.env.PREMIUM_PRICE_ID) {
    map[process.env.PREMIUM_PRICE_ID] = "premium"
  }
  return map
}

export async function updateUserSubscriptionSettings(
  userId: string,
  subscriptionData: {
    stripe_customer_id: string
    stripe_subscription_id: string
    stripe_subscription_status: string
    stripe_subscription_created_date: string
    stripe_subscription_ends_at?: string | null
    plan: string
  }
) {
  const supabase = createClient()

  const { stripe_subscription_ends_at: _unusedEnds, ...rest } = subscriptionData
  void _unusedEnds

  const { data, error } = await supabase
    .from("users_settings")
    .update(rest)
    .eq("user_id", userId)
    .select()

  if (error) {
    console.error("Error updating user subscription:", error)
    throw error
  }

  if (data && data.length > 0) {
    if (
      Object.prototype.hasOwnProperty.call(
        subscriptionData,
        "stripe_subscription_ends_at"
      )
    ) {
      const ends = subscriptionData.stripe_subscription_ends_at ?? null
      const { data: rowEnds, error: errEnds } = await supabase
        .from("users_settings")
        .update({ stripe_subscription_ends_at: ends })
        .eq("user_id", userId)
        .select()
      if (errEnds) {
        console.error("Error updating stripe_subscription_ends_at:", errEnds)
        throw errEnds
      }
      return rowEnds
    }
    return data
  }

  const { data: inserted, error: insertError } = await supabase
    .from("users_settings")
    .insert({
      user_id: userId,
      is_private: false,
      email_notifications: true,
      ...subscriptionData,
    })
    .select()

  if (insertError) {
    console.error(
      "Error inserting user subscription (no prior settings row):",
      insertError
    )
    throw insertError
  }

  return inserted
}

/**
 * Sync subscription fields from a completed Checkout Session into users_settings.
 * Safe to call from webhooks and from the success page (idempotent upsert).
 */
export async function syncSubscriptionFromCheckoutSession(
  stripe: Stripe,
  session: Stripe.Checkout.Session
): Promise<{ ok: boolean; userId?: string; plan?: string; reason?: string }> {
  if (session.mode !== "subscription") {
    return { ok: false, reason: "not_subscription" }
  }

  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id

  if (!subscriptionId) {
    return { ok: false, reason: "missing_subscription" }
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["items.data.price"],
  })

  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer &&
          typeof session.customer === "object" &&
          "id" in session.customer &&
          !("deleted" in session.customer && (session.customer as { deleted?: boolean }).deleted)
        ? (session.customer as Stripe.Customer).id
        : typeof subscription.customer === "string"
          ? subscription.customer
          : subscription.customer &&
              typeof subscription.customer === "object" &&
              "id" in subscription.customer
            ? (subscription.customer as Stripe.Customer).id
            : null

  const userId =
    session.metadata?.supabase_user_id ||
    subscription.metadata?.supabase_user_id ||
    session.client_reference_id ||
    null

  if (!userId) {
    return { ok: false, reason: "missing_user_id" }
  }

  if (!customerId) {
    return { ok: false, reason: "missing_customer_id" }
  }

  const priceId = subscription.items.data[0]?.price.id
  const plan = getPriceToPlanMap()[priceId] || "standard"

  await stripe.customers.update(customerId, {
    metadata: { supabase_user_id: userId },
  })

  await updateUserSubscriptionSettings(userId, {
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    stripe_subscription_status: subscription.status,
    stripe_subscription_created_date: new Date(
      subscription.created * 1000
    ).toISOString(),
    plan,
    stripe_subscription_ends_at: subscriptionEndsAtForUserSettings(subscription),
  })

  console.log(
    `Synced subscription for user ${userId}: plan=${plan}, status=${subscription.status}, price=${priceId}`
  )

  return { ok: true, userId, plan }
}
