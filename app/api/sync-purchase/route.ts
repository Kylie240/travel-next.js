import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { syncItineraryCartPurchase } from "@/lib/sync-itinerary-purchase";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Backup for Stripe webhooks: after Checkout redirect, fulfill the cart purchase
 * if DB rows / emails were not created yet (idempotent).
 */
export async function POST(request: NextRequest) {
  try {
    const { session_id: sessionId } = (await request.json()) as {
      session_id?: string;
    };

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json(
        { error: "session_id is required" },
        { status: 400 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid" && session.status !== "complete") {
      return NextResponse.json(
        { error: "Checkout session is not paid", status: session.payment_status },
        { status: 400 }
      );
    }

    if (session.metadata?.purchase_type !== "itinerary_cart") {
      return NextResponse.json(
        { error: "Not an itinerary cart session" },
        { status: 400 }
      );
    }

    const result = await syncItineraryCartPurchase(session);
    if (!result.ok) {
      console.error("sync-purchase failed", sessionId, result.reason);
      return NextResponse.json(
        { error: "Failed to sync purchase", reason: result.reason },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("sync-purchase:", e);
    const message = e instanceof Error ? e.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
