"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  DollarSign,
  Clock,
  Receipt,
  TrendingUp,
  Loader2,
  FileText,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  getSellerDashboardSummary,
  SellerDashboardData,
} from "@/lib/actions/seller.actions";
import createClient from "@/utils/supabase/client";
import { StripeAccountButton } from "@/components/ui/stripe-account-button";
import { SellerConnectEmbedded } from "@/components/connect/seller-connect-embedded";

function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(cents / 100);
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

  const loadDashboard = useCallback(async () => {
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
      .select("purchase_thank_you_message")
      .eq("user_id", u.id)
      .maybeSingle();
    setPurchaseThankYouDraft(
      (thankRow?.purchase_thank_you_message as string | null) ?? ""
    );
    setPurchaseThankYouStatus("idle");

    const statusRes = await fetch(
      `/api/stripe-connect/status?t=${Date.now()}`,
      {
        credentials: "same-origin",
        cache: "no-store",
      }
    );
    if (statusRes.status === 401) {
      router.replace("/");
      setLoading(false);
      return;
    }
    if (!statusRes.ok) {
      setLoading(false);
      return;
    }
    const body = (await statusRes.json()) as {
      stripeAccountId?: string | null;
      sellerAccountReady?: boolean;
    };
    setStripeAccountId(body.stripeAccountId ?? null);
    setCompleteStripeAccountSetup(Boolean(body.sellerAccountReady));

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
    void loadDashboard();

    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) void loadDashboard();
    };
    window.addEventListener("pageshow", onPageShow);

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

        {/* Summary cards — Journli itinerary sales (your database) */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-emerald-100 p-2.5">
                  <DollarSign className="h-5 w-5 text-emerald-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total earnings
                  </p>
                  <p className="text-xl font-semibold text-gray-900">
                    {formatCents(data?.totalEarningsCents ?? 0)}
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
                    Pending payout
                  </p>
                  <p className="text-xl font-semibold text-gray-900">
                    {formatCents(data?.totalPendingCents ?? 0)}
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
                </div>
              </div>
            </CardContent>
          </Card>
        </div> */}

        {stripeAccountId && completeStripeAccountSetup && (
          <Card className="mb-6">
            <CardContent className="p-0">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-medium text-gray-900">
                  Purchase confirmation email
                </h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  Optional message for buyers after they purchase your itineraries
                  (plain text). Your Journli username is included automatically.
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
                        .update({
                          purchase_thank_you_message:
                            trimmed.length > 0 ? trimmed : null,
                        })
                        .eq("user_id", user.id);
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
                Stripe account activity
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Balances, payments, and payouts from your connected Stripe
                account (loaded with a fresh{" "}
                <a
                  className="text-gray-700 underline hover:text-gray-900"
                  href="https://docs.stripe.com/api/account_sessions"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Account Session
                </a>{" "}
                each visit). Summary cards above reflect itinerary sales
                recorded on Journli.
              </p>
            </div>

            {!stripeAccountId || !completeStripeAccountSetup ? (
              <div className="py-16 px-4 text-center">
                <TrendingUp className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {!stripeAccountId
                    ? "Setup your seller account"
                    : "Complete your seller account"}
                </h3>
                <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                  {!stripeAccountId
                    ? "Looks like you're new here! Before you start selling, you'll need to setup your Stripe account."
                    : "Looks like you're almost there! Before you start selling, you'll need to complete your Stripe account setup."}
                </p>
                <StripeAccountButton />
              </div>
            ) : (
              <>
                <SellerConnectEmbedded />
                {(data?.transactionCount ?? 0) === 0 && (
                  <div className="border-t border-gray-100 px-4 py-8 text-center text-sm text-gray-600">
                    <p className="mb-4 max-w-md mx-auto">
                      No paid itinerary sales on Journli yet. When buyers
                      purchase your itineraries, totals in the cards above will
                      update.
                    </p>
                    <Link
                      href="/my-itineraries"
                      className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
                    >
                      <FileText className="h-4 w-4" />
                      My itineraries
                    </Link>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
