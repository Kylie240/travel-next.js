import { NextResponse } from "next/server";
import createClient from "@/utils/supabase/server";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

/**
 * Creates a single-use Account Session for Connect embedded components (e.g. payments list).
 * @see https://docs.stripe.com/api/account_sessions/create
 */
export async function POST() {
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

    const accountId = settings?.stripe_account_id as string | null | undefined;
    if (!accountId) {
      return NextResponse.json(
        { error: "No Stripe Connect account on file." },
        { status: 400 }
      );
    }

    const session = await stripe.accountSessions.create({
      account: accountId,
      components: {
        notification_banner: { enabled: true },
        balances: { enabled: true },
        payouts: { enabled: true },
        payments: { enabled: true },
      },
    });

    if (!session.client_secret) {
      return NextResponse.json(
        { error: "Stripe did not return a client secret." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { client_secret: session.client_secret },
      {
        headers: { "Cache-Control": "private, no-store, max-age=0" },
      }
    );
  } catch (e) {
    console.error("stripe-connect/account-session:", e);
    const message =
      e instanceof Error ? e.message : "Failed to create account session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
