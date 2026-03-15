"use server";

import createClient from "@/utils/supabase/server";

export type SellerTransactionRow = {
  id: string;
  itinerary_id: string;
  purchase_id: string;
  gross_amount_cents: number;
  platform_fee_cents: number;
  stripe_fee_cents: number | null;
  seller_earnings_cents: number;
  payout_status: string;
  created_at: string;
  itineraries: { id: string; title: string } | null;
};

export type SellerDashboardData = {
  transactions: SellerTransactionRow[];
  totalEarningsCents: number;
  totalPendingCents: number;
  totalPaidCents: number;
  transactionCount: number;
};

export async function getSellerTransactions(): Promise<SellerDashboardData | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // Get itinerary ids where current user is the creator (seller)
  const { data: myItineraryIds, error: idsError } = await supabase
    .from("itineraries")
    .select("id")
    .eq("creator_id", user.id);

  if (idsError || !myItineraryIds?.length) {
    return {
      transactions: [],
      totalEarningsCents: 0,
      totalPendingCents: 0,
      totalPaidCents: 0,
      transactionCount: 0,
    };
  }

  const ids = myItineraryIds.map((r) => r.id);

  const { data: rows, error } = await supabase
    .from("seller_transactions")
    .select(
      `
      id,
      itinerary_id,
      purchase_id,
      gross_amount_cents,
      platform_fee_cents,
      stripe_fee_cents,
      seller_earnings_cents,
      payout_status,
      created_at,
      itineraries ( id, title )
    `
    )
    .in("itinerary_id", ids)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getSellerTransactions error:", error);
    return {
      transactions: [],
      totalEarningsCents: 0,
      totalPendingCents: 0,
      totalPaidCents: 0,
      transactionCount: 0,
    };
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
