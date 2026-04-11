import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import type Stripe from "stripe";
import createClient from "@/utils/supabase/server";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

/**
 * Connected account payload aligned with Stripe marketplace Accounts v2 create:
 * Express dashboard, platform pays fees / covers losses, recipient + stripe_transfers.
 * @see https://docs.stripe.com/connect/marketplace/tasks/create
 */
function marketplaceConnectedAccountParams(
  input: {
    contactEmail: string;
    displayName: string;
    country: string;
    supabaseUserId: string;
  }
): Stripe.V2.Core.AccountCreateParams {
  const country = input.country.trim().toLowerCase();
  return {
    contact_email: input.contactEmail,
    display_name: input.displayName,
    dashboard: "express",
    identity: { country },
    defaults: {
      responsibilities: {
        fees_collector: "application",
        losses_collector: "application",
      },
    },
    configuration: {
      recipient: {
        capabilities: {
          stripe_balance: {
            stripe_transfers: { requested: true },
          },
        },
      },
    },
    include: [
      "configuration.recipient",
      "identity",
      "requirements",
    ],
    metadata: { supabase_user_id: input.supabaseUserId },
  };
}

export async function POST(_request: NextRequest) {
  try {
    const headersList = await headers();
    const origin =
      headersList.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");
    const base = origin.replace(/\/$/, "");

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json(
        { error: "You must be signed in to connect Stripe." },
        { status: 401 }
      );
    }

    const { data: settings } = await supabase
      .from("users_settings")
      .select("stripe_account_id")
      .eq("user_id", user.id)
      .maybeSingle();

    let accountId = settings?.stripe_account_id as string | null | undefined;

    if (!accountId) {
      const displayName =
        (typeof user.user_metadata?.full_name === "string" &&
          user.user_metadata.full_name.trim()) ||
        user.email.split("@")[0] ||
        "Seller";

      const country =
        process.env.STRIPE_CONNECT_DEFAULT_COUNTRY?.trim() || "US";

      const account = await stripe.v2.core.accounts.create(
        marketplaceConnectedAccountParams({
          contactEmail: user.email,
          displayName,
          country,
          supabaseUserId: user.id,
        })
      );

      accountId = account.id;

      const { error: updateError } = await supabase
        .from("users_settings")
        .upsert(
          { user_id: user.id, stripe_account_id: accountId },
          { onConflict: "user_id" }
        );

      if (updateError) {
        console.error("stripe-connect: failed to save account id", updateError);
        return NextResponse.json(
          { error: "Could not save Stripe account. Try again." },
          { status: 500 }
        );
      }
    }

    const accountLink = await stripe.v2.core.accountLinks.create({
      account: accountId,
      use_case: {
        type: "account_onboarding",
        account_onboarding: {
          configurations: ["recipient"],
          refresh_url: `${base}/seller-dashboard?stripe_refresh=1`,
          return_url: `${base}/seller-dashboard?stripe_return=1`,
        },
      },
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (e) {
    console.error("stripe-connect:", e);
    const message =
      e instanceof Error ? e.message : "Stripe Connect setup failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
