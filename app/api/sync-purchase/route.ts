import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import createClient from "@/utils/supabase/server";
import { syncItineraryCartPurchase } from "@/lib/sync-itinerary-purchase";
import {
  checkRateLimit,
  pruneRateLimitBuckets,
} from "@/lib/auth/rate-limit";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

/**
 * Backup for Stripe webhooks: after Checkout redirect, fulfill the cart purchase
 * if DB rows / emails were not created yet (idempotent).
 *
 * Security:
 * - Rate limited by IP
 * - Session must be paid/complete (retrieved from Stripe)
 * - If checkout was for a logged-in user, caller must be that user
 */
export async function POST(request: NextRequest) {
  try {
    pruneRateLimitBuckets();
    const ip = clientIp(request);
    const ipLimit = await checkRateLimit({
      key: `sync-purchase:ip:${ip}`,
      limit: 20,
      windowMs: 60 * 60 * 1000,
    });
    if (!ipLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(ipLimit.retryAfterSec) },
        }
      );
    }

    const { session_id: sessionId } = (await request.json()) as {
      session_id?: string;
    };

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json(
        { error: "session_id is required" },
        { status: 400 }
      );
    }

    // Basic shape check — Stripe Checkout session IDs start with cs_
    if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(sessionId)) {
      return NextResponse.json(
        { error: "Invalid session_id" },
        { status: 400 }
      );
    }

    const sessionLimit = await checkRateLimit({
      key: `sync-purchase:session:${sessionId}`,
      limit: 10,
      windowMs: 60 * 60 * 1000,
    });
    if (!sessionLimit.allowed) {
      return NextResponse.json(
        { error: "Too many requests for this session." },
        {
          status: 429,
          headers: { "Retry-After": String(sessionLimit.retryAfterSec) },
        }
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

    const expectedUserId = session.metadata?.supabase_user_id?.trim() || "";
    if (expectedUserId) {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      if (user.id !== expectedUserId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const result = await syncItineraryCartPurchase(session);
    if (result.ok === false) {
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
