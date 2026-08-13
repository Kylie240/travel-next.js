"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  TrendingUp,
  Loader2,
  FileText,
  DollarSign,
  Clock,
  Receipt,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  getSellerDashboardSummary,
  SellerDashboardData,
  SellerTransactionRow,
} from "@/lib/actions/seller.actions";
import createClient from "@/utils/supabase/client";
import { StripeAccountButton } from "@/components/ui/stripe-account-button";
import { SellerConnectEmbedded } from "@/components/connect/seller-connect-embedded";

function formatCents(cents: number | null | undefined): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format((cents ?? 0) / 100);
}

function formatSaleDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function payoutStatusLabel(status: string): string {
  const s = (status || "").trim().toLowerCase();
  if (s === "paid") return "Paid out";
  if (s === "pending") return "Pending";
  if (s === "unpaid") return "Unpaid";
  return status || "—";
}

function SaleRowMobile({ row }: { row: SellerTransactionRow }) {
  return (
    <li className="border-b border-gray-100 px-4 py-4 last:border-b-0 sm:hidden">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-gray-900 truncate">
            {row.itinerary_title || "Itinerary"}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {formatSaleDate(row.created_at)} · {payoutStatusLabel(row.payout_status)}
          </p>
        </div>
        <p className="shrink-0 font-semibold text-emerald-700">
          {formatCents(row.seller_earnings_cents)}
        </p>
      </div>
      <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <div>
          <dt className="text-gray-500">Sale</dt>
          <dd className="text-gray-900">{formatCents(row.gross_amount_cents)}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Journli fee</dt>
          <dd className="text-gray-900">−{formatCents(row.platform_fee_cents)}</dd>
        </div>
        <div>
          <dt className="text-gray-500">Stripe fee</dt>
          <dd className="text-gray-900">
            −{formatCents(row.stripe_fee_cents)}
          </dd>
        </div>
      </dl>
    </li>
  );
}

export default function SellerDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [data, setData] = useState<SellerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [stripeAccountId, setStripeAccountId] = useState<string | null>(null);
  const [completeStripeAccountSetup, setCompleteStripeAccountSetup] =
    useState<boolean>(false);
  const [purchaseThankYouDraft, setPurchaseThankYouDraft] = useState("");
  const [purchaseThankYouStatus, setPurchaseThankYouStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  const loadDashboard = useCallback(async (opts?: { pollIfReturning?: boolean }) => {
    setLoading(true);
    const supabase = createClient();

    const {
      data: { user: u },
    } = await supabase.auth.getUser();
    if (!u) {
      router.replace("/");
      setLoading(false);
      return;
    }
    setUser(u);

    const { data: thankRow } = await supabase
      .from("users_settings")
      .select("seller_message")
      .eq("user_id", u.id)
      .maybeSingle();
    setPurchaseThankYouDraft(
      (thankRow?.seller_message as string | null) ?? ""
    );
    setPurchaseThankYouStatus("idle");

    const isReturningFromStripe =
      typeof window !== "undefined" &&
      (new URL(window.location.href).searchParams.has("stripe_return") ||
        new URL(window.location.href).searchParams.has("stripe_refresh"));

    const fetchStatus = async () => {
      const statusRes = await fetch(
        `/api/stripe-connect/status?t=${Date.now()}`,
        {
          credentials: "same-origin",
          cache: "no-store",
        }
      );
      if (statusRes.status === 401) {
        return { unauthorized: true as const };
      }
      if (!statusRes.ok) {
        return { ok: false as const };
      }
      const body = (await statusRes.json()) as {
        stripeAccountId?: string | null;
        sellerAccountReady?: boolean;
      };
      return {
        ok: true as const,
        stripeAccountId: body.stripeAccountId ?? null,
        sellerAccountReady: Boolean(body.sellerAccountReady),
      };
    };

    // Mobile/Safari often returns from Stripe before account status has settled.
    // Poll briefly when coming back from onboarding.
    let status = await fetchStatus();
    if (status.unauthorized) {
      router.replace("/");
      setLoading(false);
      return;
    }

    if (
      opts?.pollIfReturning !== false &&
      isReturningFromStripe &&
      status.ok &&
      (!status.stripeAccountId || !status.sellerAccountReady)
    ) {
      for (let i = 0; i < 8; i++) {
        await new Promise((r) => setTimeout(r, 1250));
        status = await fetchStatus();
        if (status.unauthorized) {
          router.replace("/");
          setLoading(false);
          return;
        }
        if (status.ok && status.stripeAccountId && status.sellerAccountReady) {
          break;
        }
      }
    }

    if (!status.ok) {
      setLoading(false);
      return;
    }

    setStripeAccountId(status.stripeAccountId);
    setCompleteStripeAccountSetup(status.sellerAccountReady);

    // Summary cards are Journli DB data — load whenever signed in, not only when
    // Stripe Connect reports "ready" (those states can diverge).
    const result = await getSellerDashboardSummary();
    setData(result ?? null);

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (
        url.searchParams.has("stripe_return") ||
        url.searchParams.has("stripe_refresh")
      ) {
        url.searchParams.delete("stripe_return");
        url.searchParams.delete("stripe_refresh");
        const qs = url.searchParams.toString();
        window.history.replaceState(
          null,
          "",
          qs ? `${url.pathname}?${qs}` : url.pathname
        );
      }
    }

    setLoading(false);
  }, [router]);

  useEffect(() => {
    void loadDashboard({ pollIfReturning: true });

    const onPageShow = (e: PageTransitionEvent) => {
      // bfcache / mobile back-forward after Stripe onboarding
      if (e.persisted) void loadDashboard({ pollIfReturning: true });
    };
    const onFocus = () => {
      // Returning from Stripe's in-app browser often restores the tab without a full remount
      if (
        typeof window !== "undefined" &&
        (window.location.search.includes("stripe_return") ||
          window.location.search.includes("stripe_refresh"))
      ) {
        void loadDashboard({ pollIfReturning: true });
      }
    };
    window.addEventListener("pageshow", onPageShow);
    window.addEventListener("focus", onFocus);

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.replace("/");
      }
    });

    return () => {
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("focus", onFocus);
      subscription.unsubscribe();
    };
  }, [loadDashboard, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
      </div>
    );
  }

  if (!user) return null;

  const transactions = data?.transactions ?? [];

  return (
    <div className="min-h-screen bg-gray-50/80 py-8 sm:pt-[4rem]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">
            Seller Dashboard
          </h1>
          <p className="mt-1 text-gray-600">
            Earnings and sales from your itineraries
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-100 p-2.5">
                  <DollarSign className="h-5 w-5 text-emerald-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Your earnings
                  </p>
                  <p className="text-xl font-semibold text-gray-900">
                    {formatCents(data?.totalEarningsCents ?? 0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {data?.summarySource === "stripe"
                      ? "Net from Stripe transfers"
                      : "From recorded Journli sales"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-amber-100 p-2.5">
                  <Clock className="h-5 w-5 text-amber-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    In Stripe balance
                  </p>
                  <p className="text-xl font-semibold text-gray-900">
                    {formatCents(data?.totalPendingCents ?? 0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {data?.summarySource === "stripe"
                      ? "Available + pending on Stripe"
                      : "Pending in Journli records"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-slate-100 p-2.5">
                  <Receipt className="h-5 w-5 text-slate-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Sales</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {data?.transactionCount ?? 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {data?.summarySource === "stripe"
                      ? "Stripe transfers to you"
                      : "Recorded on Journli"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {data?.summarySource === "stripe" &&
          (data.transactionCount ?? 0) > (data.transactions?.length ?? 0) && (
            <p className="mb-6 text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-4 py-3">
              Stripe shows more sales than Journli has recorded with fee
              details. Balances above are from Stripe; the table below only
              lists sales saved in our database.
            </p>
          )}

        <Card className="mb-6">
          <CardContent className="p-0">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-medium text-gray-900">
                Itinerary sales
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Sale price minus Journli platform fee and estimated Stripe
                processing, from Journli records. Summary cards prefer live
                Stripe data when your Connect account is linked.
              </p>
            </div>

            {transactions.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-gray-600">
                <p className="mb-4 max-w-md mx-auto">
                  No paid itinerary sales yet. When buyers purchase your
                  itineraries, each sale and fee breakdown will appear here.
                </p>
                <Link
                  href="/my-itineraries"
                  className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                >
                  <FileText className="h-4 w-4" />
                  My itineraries
                </Link>
              </div>
            ) : (
              <>
                <ul className="sm:hidden">
                  {transactions.map((row) => (
                    <SaleRowMobile key={row.id} row={row} />
                  ))}
                </ul>

                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full min-w-[720px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 bg-gray-50/80 text-xs font-medium uppercase tracking-wide text-gray-500">
                        <th className="px-4 sm:px-6 py-3 font-medium">Date</th>
                        <th className="px-4 py-3 font-medium">Itinerary</th>
                        <th className="px-4 py-3 font-medium text-right">
                          Sale
                        </th>
                        <th className="px-4 py-3 font-medium text-right">
                          Journli fee
                        </th>
                        <th className="px-4 py-3 font-medium text-right">
                          Stripe fee
                        </th>
                        <th className="px-4 py-3 font-medium text-right">
                          Your earnings
                        </th>
                        <th className="px-4 sm:px-6 py-3 font-medium text-right">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((row) => (
                        <tr
                          key={row.id}
                          className="border-b border-gray-100 last:border-b-0"
                        >
                          <td className="px-4 sm:px-6 py-3 text-gray-600 whitespace-nowrap">
                            {formatSaleDate(row.created_at)}
                          </td>
                          <td className="px-4 py-3 text-gray-900 max-w-[200px] truncate">
                            {row.itinerary_title || "Itinerary"}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-900 tabular-nums">
                            {formatCents(row.gross_amount_cents)}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-600 tabular-nums">
                            −{formatCents(row.platform_fee_cents)}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-600 tabular-nums">
                            −{formatCents(row.stripe_fee_cents)}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-emerald-700 tabular-nums">
                            {formatCents(row.seller_earnings_cents)}
                          </td>
                          <td className="px-4 sm:px-6 py-3 text-right text-gray-600 whitespace-nowrap">
                            {payoutStatusLabel(row.payout_status)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {stripeAccountId && completeStripeAccountSetup && (
          <Card className="mb-6">
            <CardContent className="p-0">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-medium text-gray-900">
                  Custom thank you message
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Optional message for buyers after they purchase your itineraries.
                  Your Journli username is included automatically.
                </p>
              </div>
              <div className="px-4 sm:px-6 py-4 space-y-3">
                <textarea
                  className="w-full min-h-[120px] rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                  maxLength={2000}
                  placeholder="e.g. Thanks for supporting my work — enjoy the trip!"
                  value={purchaseThankYouDraft}
                  onChange={(e) => {
                    setPurchaseThankYouDraft(e.target.value);
                    setPurchaseThankYouStatus("idle");
                  }}
                />
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    disabled={purchaseThankYouStatus === "saving"}
                    className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
                    onClick={async () => {
                      if (!user) return;
                      setPurchaseThankYouStatus("saving");
                      const sb = createClient();
                      const trimmed = purchaseThankYouDraft.trim();
                      const { error } = await sb
                        .from("users_settings")
                        .upsert(
                          {
                            user_id: user.id,
                            seller_message:
                              trimmed.length > 0 ? trimmed : null,
                          },
                          { onConflict: "user_id" }
                        );
                      if (error) {
                        console.error(error);
                        setPurchaseThankYouStatus("error");
                        return;
                      }
                      setPurchaseThankYouStatus("saved");
                    }}
                  >
                    {purchaseThankYouStatus === "saving"
                      ? "Saving…"
                      : "Save message"}
                  </button>
                  {purchaseThankYouStatus === "saved" && (
                    <span className="text-sm text-emerald-600">Saved</span>
                  )}
                  {purchaseThankYouStatus === "error" && (
                    <span className="text-sm text-red-600">
                      Could not save. Try again.
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-0">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-medium text-gray-900">
                Stripe balances &amp; payouts
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Available balance and payout history from your connected Stripe
                account. Sale-by-sale fees are listed in Itinerary sales above.
              </p>
            </div>

            {!stripeAccountId ? (
              <div className="py-16 px-4 text-center">
                <TrendingUp className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  Setup your seller account
                </h3>
                <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                  Looks like you&apos;re new here! Before you start selling, you&apos;ll need to setup your Stripe account.
                </p>
                <StripeAccountButton />
              </div>
            ) : !completeStripeAccountSetup ? (
              <>
                <div className="px-4 sm:px-6 py-6 border-b border-gray-100 text-center sm:text-left">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    Finishing Stripe setup
                  </h3>
                  <p className="text-gray-600 mb-4 max-w-lg text-sm">
                    Your Stripe account is connected. If you just completed
                    onboarding, status can take a few seconds to update —
                    especially on mobile. Refresh, or continue setup if Stripe
                    still needs information.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center sm:justify-start items-center">
                    <button
                      type="button"
                      className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                      onClick={() =>
                        void loadDashboard({ pollIfReturning: true })
                      }
                    >
                      Refresh status
                    </button>
                    <StripeAccountButton />
                  </div>
                </div>
                <SellerConnectEmbedded />
              </>
            ) : (
              <SellerConnectEmbedded />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
