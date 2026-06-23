import "server-only";

import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { subscriptionCurrentPeriodEndUnix } from "@/lib/stripe-subscription-utils";
import type { StripeBillingSummary } from "@/types/stripe-billing";

/**
 * Resolves the next billing / charge instant so it lines up with what Stripe
 * Customer Portal shows: prefer the *upcoming invoice* preview, not only the
 * subscription’s current period end (those can differ with tax, trials, or timing).
 */
function nextBillingTimestampMs(
  subscription: Stripe.Subscription,
  upcoming: Stripe.Invoice | null
): number | null {
  if (upcoming) {
    if (
      typeof upcoming.next_payment_attempt === "number" &&
      Number.isFinite(upcoming.next_payment_attempt)
    ) {
      return upcoming.next_payment_attempt * 1000;
    }
    if (typeof upcoming.period_end === "number" && Number.isFinite(upcoming.period_end)) {
      return upcoming.period_end * 1000;
    }
  }
  const periodEndUnix = subscriptionCurrentPeriodEndUnix(subscription);
  return periodEndUnix != null ? periodEndUnix * 1000 : null;
}

/**
 * Live subscription + customer fields from Stripe for account settings.
 * Call only with IDs that belong to the authenticated user (from users_settings).
 */
export async function getStripeBillingSummary(
  customerId: string,
  subscriptionId: string
): Promise<StripeBillingSummary | null> {
  try {
    const [customer, subscription, preview] = await Promise.all([
      stripe.customers.retrieve(customerId),
      stripe.subscriptions.retrieve(subscriptionId, {
        expand: ["items.data.price"],
      }),
      stripe.invoices
        .createPreview({
          customer: customerId,
          subscription: subscriptionId,
        })
        .catch((e: unknown) => {
          console.warn(
            "[getStripeBillingSummary] createPreview failed, using subscription only",
            e
          );
          return null;
        }),
    ]);

    if (typeof customer === "string") return null;
    if ("deleted" in customer && customer.deleted) return null;

    const activeCustomer = customer as Stripe.Customer;
    const price = subscription.items.data[0]?.price;
    const cents = price?.unit_amount ?? null;
    const cur = (price?.currency ?? "usd").toUpperCase();
    const interval = price?.recurring?.interval;

    let priceLabel: string | null = null;
    if (cents != null && interval) {
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: cur,
      }).format(cents / 100);
      priceLabel =
        interval === "month"
          ? `${formatted} per month`
          : interval === "year"
            ? `${formatted} per year`
            : `${formatted} / ${interval}`;
    }

    return {
      billingEmail: activeCustomer.email ?? null,
      currentPeriodEndMs: nextBillingTimestampMs(
        subscription,
        preview
      ),
      priceLabel,
    };
  } catch (e) {
    console.error("[getStripeBillingSummary]", e);
    return null;
  }
}
