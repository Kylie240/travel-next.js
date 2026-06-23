import type Stripe from "stripe";

/** Stripe API v20+ exposes `current_period_end` on subscription items, not the root subscription. */
export function subscriptionCurrentPeriodEndUnix(
  subscription: Stripe.Subscription
): number | null {
  const ends =
    subscription.items?.data
      ?.map((item) => item.current_period_end)
      .filter((n): n is number => typeof n === "number" && Number.isFinite(n)) ??
    [];
  if (ends.length === 0) return null;
  return Math.max(...ends);
}

export function unixSecondsToIso(seconds: number): string {
  return new Date(seconds * 1000).toISOString();
}

/**
 * Value for `users_settings.stripe_subscription_ends_at`:
 * - When a cancel is scheduled (cancel at end of current period) or the subscription has ended, an ISO time
 * - When the sub is active/trialing and *not* canceling at period end, `null` (resume, or normal renewal)
 *
 * We only use `cancel_at_period_end` + current period end for “scheduled” ends. A standalone future
 * `cancel_at` without that flag is ignored so we don’t keep a stale date after the customer **resumes**
 * (Stripe sometimes lags `cancel_at` for a request or two, which previously blocked clearing this column).
 */
export function subscriptionEndsAtForUserSettings(
  subscription: Stripe.Subscription
): string | null {
  const st = subscription.status;
  if (st === "canceled" && subscription.ended_at) {
    return unixSecondsToIso(subscription.ended_at);
  }
  if (st === "active" || st === "trialing") {
    if (subscription.cancel_at_period_end) {
      const t = subscriptionCurrentPeriodEndUnix(subscription);
      return t != null ? unixSecondsToIso(t) : null;
    }
    return null;
  }
  return null;
}
