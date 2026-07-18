import { NextResponse } from "next/server";
import Stripe from "stripe";
import createClient from "@/utils/supabase/server";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

/**
 * After Connect onboarding, capability flags often lag a few seconds (worse on mobile return).
 * Treat pending/active transfers or applied recipient config as ready; dashboard also polls on return.
 */
function v2RecipientReadyForDashboard(account: Stripe.V2.Core.Account): boolean {
  const recipient = account.configuration?.recipient;
  const transfers =
    recipient?.capabilities?.stripe_balance?.stripe_transfers;
  const status = transfers?.status;
  if (status === "restricted" || status === "unsupported") return false;
  if (status === "active" || status === "pending") return true;
  // Applied but capability status not present yet (Stripe still wiring after onboarding)
  if (recipient?.applied) return true;
  return false;
}

/** Hosted onboarding finished; payouts/charges can still flip on shortly after. */
function v1SellerReady(account: Stripe.Account): boolean {
  if (account.requirements?.disabled_reason) return false;
  if (account.details_submitted) return true;
  // Just after return, currently_due can already be empty before details_submitted flips
  const currentlyDue = account.requirements?.currently_due ?? [];
  const pastDue = account.requirements?.past_due ?? [];
  return currentlyDue.length === 0 && pastDue.length === 0;
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: settings } = await supabase
      .from("users_settings")
      .select("stripe_account_id")
      .eq("user_id", user.id)
      .maybeSingle();

    const stripeAccountId =
      (settings?.stripe_account_id as string | null | undefined) ?? null;

    if (!stripeAccountId) {
      return NextResponse.json(
        {
          stripeAccountId: null,
          sellerAccountReady: false,
        },
        {
          headers: {
            "Cache-Control": "private, no-store, max-age=0",
          },
        }
      );
    }

    try {
      const v2 = await stripe.v2.core.accounts.retrieve(stripeAccountId, {
        include: ["configuration.recipient", "requirements"],
      });
      return NextResponse.json(
        {
          stripeAccountId,
          sellerAccountReady: v2RecipientReadyForDashboard(v2),
        },
        {
          headers: {
            "Cache-Control": "private, no-store, max-age=0",
          },
        }
      );
    } catch (v2Err) {
      try {
        const v1 = await stripe.accounts.retrieve(stripeAccountId);
        return NextResponse.json(
          {
            stripeAccountId,
            sellerAccountReady: v1SellerReady(v1),
          },
          {
            headers: {
              "Cache-Control": "private, no-store, max-age=0",
            },
          }
        );
      } catch (v1Err) {
        console.error("stripe-connect/status retrieve:", v2Err, v1Err);
        return NextResponse.json(
          { error: "Could not load Stripe account" },
          { status: 500 }
        );
      }
    }
  } catch (e) {
    console.error("stripe-connect/status:", e);
    return NextResponse.json(
      { error: "Could not load Stripe account status" },
      { status: 500 }
    );
  }
}
