"use server";

import createClient from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@/utils/supabase/server-admin";

export type SellerTransactionRow = {
  id: string;
  itinerary_id: string;
  itinerary_title: string;
  purchase_id: string;
  gross_amount_cents: number;
  platform_fee_cents: number;
  stripe_fee_cents: number | null;
  seller_earnings_cents: number;
  payout_status: string;
  created_at: string;
};

export type SellerDashboardData = {
  transactions: SellerTransactionRow[];
  totalEarningsCents: number;
  totalPendingCents: number;
  totalPaidCents: number;
  transactionCount: number;
};

/** Journli itinerary sales summary from your database (not Stripe’s payments UI). */
export async function getSellerDashboardSummary(): Promise<SellerDashboardData | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Use service role so row-level security on seller_transactions does not block
  // reads; scope is strictly seller_id = authenticated user id.
  const admin = createAdminClient();
  const { data: rows, error } = await admin
    .from("seller_transactions")
    .select("*")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getSellerDashboardSummary error:", error);
    return null;
  }

  const transactions = (rows || []) as SellerTransactionRow[];
  const totalEarningsCents = transactions.reduce(
    (sum, t) => sum + (t.seller_earnings_cents ?? 0),
    0
  );
  const totalPendingCents = transactions
    .filter((t) => t.payout_status === "pending")
    .reduce((sum, t) => sum + (t.seller_earnings_cents ?? 0), 0);
  const totalPaidCents = transactions
    .filter((t) => t.payout_status === "paid")
    .reduce((sum, t) => sum + (t.seller_earnings_cents ?? 0), 0);

  return {
    transactions,
    totalEarningsCents,
    totalPendingCents,
    totalPaidCents,
    transactionCount: transactions.length,
  };
}
