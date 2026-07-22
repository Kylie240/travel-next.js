import { NextResponse } from "next/server";
import createClient from "@/utils/supabase/server";
import { getSellerStripeStatusForUser } from "@/lib/stripe-seller-status";
import { syncStripeConnectAccountById } from "@/lib/sync-stripe-connect-account";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const status = await getSellerStripeStatusForUser(user.id);

    // Keep DB cache warm when the seller polls their own status (dashboard / create)
    if (status.stripeAccountId) {
      void syncStripeConnectAccountById(status.stripeAccountId).catch((err) => {
        console.error("Failed to persist Connect status after poll:", err);
      });
    }

    return NextResponse.json(
      {
        stripeAccountId: status.stripeAccountId,
        sellerAccountReady: status.sellerAccountReady,
      },
      {
        headers: {
          "Cache-Control": "private, no-store, max-age=0",
        },
      }
    );
  } catch (e) {
    console.error("stripe-connect/status:", e);
    return NextResponse.json(
      { error: "Could not load Stripe account status" },
      { status: 500 }
    );
  }
}
