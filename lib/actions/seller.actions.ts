"use server";

import createClient from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@/utils/supabase/server-admin";
import { stripe } from "@/lib/stripe";

export type SellerTransactionRow = {
  id: string;
  itinerary_id: string;
  itinerary_title: string;
  purchase_id: string;
  buyer_id: string | null;
  gross_amount_cents: number;
  platform_fee_cents: number;
  stripe_fee_cents: number | null;
  seller_earnings_cents: number;
  payout_status: string;
  created_at: string;
};

export type SellerDashboardData = {
  transactions: SellerTransactionRow[];
  /** Lifetime net transferred to the seller (Stripe) or sum of DB earnings. */
  totalEarningsCents: number;
  /** Funds currently in Stripe available + pending (or DB pending). */
  totalPendingCents: number;
  /** Lifetime paid-out to bank (Stripe) or DB paid rows. */
  totalPaidCents: number;
  transactionCount: number;
  /** Where the summary cards came from. */
  summarySource: "stripe" | "database" | "none";
};

function sumBalanceBuckets(
  buckets: Array<{ amount: number; currency: string }> | undefined,
  currency = "usd"
): number {
  return (buckets || [])
    .filter((b) => b.currency.toLowerCase() === currency)
    .reduce((sum, b) => sum + (b.amount || 0), 0);
}

/**
 * Live Stripe Connect totals for a connected account (destination charges).
 * Transfers = net amounts sent to the seller after application fees.
 */
async function getStripeSellerSummary(stripeAccountId: string): Promise<{
  totalEarningsCents: number;
  totalPendingCents: number;
  totalPaidCents: number;
  transactionCount: number;
} | null> {
  try {
    const [balance, transferPages, payoutPages] = await Promise.all([
      stripe.balance.retrieve({ stripeAccount: stripeAccountId }),
      (async () => {
        const transfers: Array<{ amount: number }> = [];
        let startingAfter: string | undefined;
        // Cap pages so a dashboard load can't hang on huge histories.
        for (let page = 0; page < 20; page++) {
          const batch = await stripe.transfers.list({
            destination: stripeAccountId,
            limit: 100,
            ...(startingAfter ? { starting_after: startingAfter } : {}),
          });
          for (const t of batch.data) {
            if (t.reversed) continue;
            // Net to seller after reversals
            const net = Math.max(0, (t.amount || 0) - (t.amount_reversed || 0));
            if (net > 0) transfers.push({ amount: net });
          }
          if (!batch.has_more || batch.data.length === 0) break;
          startingAfter = batch.data[batch.data.length - 1]?.id;
          if (!startingAfter) break;
        }
        return transfers;
      })(),
      (async () => {
        let paidOut = 0;
        let startingAfter: string | undefined;
        for (let page = 0; page < 20; page++) {
          const batch = await stripe.payouts.list(
            {
              limit: 100,
              status: "paid",
              ...(startingAfter ? { starting_after: startingAfter } : {}),
            },
            { stripeAccount: stripeAccountId }
          );
          for (const p of batch.data) {
            if ((p.currency || "").toLowerCase() === "usd") {
              paidOut += p.amount || 0;
            }
          }
          if (!batch.has_more || batch.data.length === 0) break;
          startingAfter = batch.data[batch.data.length - 1]?.id;
          if (!startingAfter) break;
        }
        return paidOut;
      })(),
    ]);

    const available = sumBalanceBuckets(balance.available);
    const pending = sumBalanceBuckets(balance.pending);
    const transferred = transferPages.reduce((s, t) => s + t.amount, 0);

    return {
      // Lifetime net credited to the connected account via destination transfers
      totalEarningsCents: transferred,
      // Still sitting on Stripe (not yet in the seller's bank)
      totalPendingCents: available + pending,
      totalPaidCents: payoutPages,
      transactionCount: transferPages.length,
    };
  } catch (error) {
    console.error("getStripeSellerSummary:", error);
    return null;
  }
}

/** Journli itinerary sales + Stripe-backed summary cards when Connect is linked. */
export async function getSellerDashboardSummary(): Promise<SellerDashboardData | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Use service role so row-level security on seller_transactions does not block
  // reads; scope is strictly seller_id = authenticated user id.
  const admin = createAdminClient();
  const [{ data: rows, error }, { data: settings }] = await Promise.all([
    admin
      .from("seller_transactions")
      .select(
        "id, itinerary_id, itinerary_title, purchase_id, buyer_id, gross_amount_cents, platform_fee_cents, stripe_fee_cents, seller_earnings_cents, payout_status, created_at"
      )
      .eq("seller_id", user.id)
      .order("created_at", { ascending: false }),
    admin
      .from("users_settings")
      .select("stripe_account_id")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  if (error) {
    console.error("getSellerDashboardSummary error:", error);
  }

  const transactions = (rows || []) as SellerTransactionRow[];
  const dbEarnings = transactions.reduce(
    (sum, t) => sum + (t.seller_earnings_cents ?? 0),
    0
  );
  const dbPending = transactions
    .filter((t) => t.payout_status === "pending")
    .reduce((sum, t) => sum + (t.seller_earnings_cents ?? 0), 0);
  const dbPaid = transactions
    .filter((t) => t.payout_status === "paid")
    .reduce((sum, t) => sum + (t.seller_earnings_cents ?? 0), 0);

  const stripeAccountId =
    (settings?.stripe_account_id as string | null | undefined)?.trim() || null;

  if (stripeAccountId) {
    const stripeSummary = await getStripeSellerSummary(stripeAccountId);
    if (stripeSummary) {
      return {
        transactions,
        totalEarningsCents: stripeSummary.totalEarningsCents,
        totalPendingCents: stripeSummary.totalPendingCents,
        totalPaidCents: stripeSummary.totalPaidCents,
        transactionCount: stripeSummary.transactionCount,
        summarySource: "stripe",
      };
    }
  }

  if (error && transactions.length === 0) {
    return {
      transactions: [],
      totalEarningsCents: 0,
      totalPendingCents: 0,
      totalPaidCents: 0,
      transactionCount: 0,
      summarySource: "none",
    };
  }

  return {
    transactions,
    totalEarningsCents: dbEarnings,
    totalPendingCents: dbPending,
    totalPaidCents: dbPaid,
    transactionCount: transactions.length,
    summarySource: transactions.length > 0 ? "database" : "none",
  };
}
