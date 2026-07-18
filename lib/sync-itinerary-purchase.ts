import "server-only";

import type Stripe from "stripe";
import { createClient } from "@/utils/supabase/server-admin";
import {
  sendPurchaseConfirmationEmail,
  sendCreatorPurchaseNotificationEmail,
} from "@/lib/email";
import { getItineraryPdfAttachmentForEmail } from "@/lib/itinerary-purchase-pdf";

function stripeId(
  value: string | Stripe.PaymentIntent | null | undefined
): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  return value.id ?? null;
}

function isMissingColumnError(error: { message?: string; code?: string }, column: string) {
  const msg = (error.message || "").toLowerCase();
  return (
    error.code === "PGRST204" ||
    (msg.includes(column.toLowerCase()) &&
      (msg.includes("schema cache") || msg.includes("could not find")))
  );
}

function appBaseUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://www.journli.com");
  return base.replace(/\/$/, "");
}

type PurchaseRow = { id: string; itinerary_id: string };

/**
 * Records itinerary cart purchases + seller_transactions and sends emails.
 * Idempotent on stripe_checkout_session_id so webhook retries and success-page
 * backup sync are safe.
 */
export async function syncItineraryCartPurchase(
  session: Stripe.Checkout.Session
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (session.mode !== "payment") {
    return { ok: false, reason: "not_payment_mode" };
  }
  if (session.metadata?.purchase_type !== "itinerary_cart") {
    return { ok: false, reason: "not_itinerary_cart" };
  }

  const itineraryIds =
    session.metadata?.itinerary_ids
      ?.split(",")
      .map((id) => id.trim())
      .filter(Boolean) || [];
  const itineraryTitles =
    session.metadata?.itinerary_titles?.split("|") || [];

  if (itineraryIds.length === 0) {
    return { ok: false, reason: "missing_itinerary_ids" };
  }

  const supabase = createClient();
  const customerEmail =
    session.customer_details?.email || session.customer_email || null;
  const paymentIntentId = stripeId(
    session.payment_intent as string | Stripe.PaymentIntent | null
  );

  let userId = session.metadata?.supabase_user_id || null;
  if (!userId && customerEmail) {
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", customerEmail)
      .maybeSingle();
    if (existingUser?.id) {
      userId = existingUser.id;
      console.log(
        `Found existing user ${userId} for email ${customerEmail}`
      );
    }
  }

  // Idempotent: already recorded for this Checkout Session?
  const { data: existingPurchases, error: existingError } = await supabase
    .from("itinerary_purchases")
    .select("id, itinerary_id")
    .eq("stripe_checkout_session_id", session.id);

  if (existingError) {
    console.error(
      "syncItineraryCartPurchase: lookup existing purchases failed",
      existingError
    );
    return { ok: false, reason: existingError.message };
  }

  let insertedPurchases: PurchaseRow[] =
    (existingPurchases as PurchaseRow[] | null) || [];
  let createdPurchasesThisRun = false;

  if (insertedPurchases.length === 0) {
    const amountPerItem = Math.round(
      (session.amount_total || 0) / itineraryIds.length
    );
    const purchasedAt = new Date().toISOString();

    const baseRecord = (itineraryId: string, index: number) => ({
      user_id: userId || null,
      itinerary_id: itineraryId,
      stripe_payment_intent_id: paymentIntentId,
      stripe_checkout_session_id: session.id,
      amount_cents: amountPerItem,
      purchased_at: purchasedAt,
      itinerary_title: itineraryTitles[index] ?? "Itinerary",
    });

    // Production schemas have used either buyer_email or customer_email.
    const tryInsert = async (
      emailColumn: "buyer_email" | "customer_email",
      includeTitle: boolean
    ) => {
      const records = itineraryIds.map((itineraryId, index) => {
        const row: Record<string, unknown> = {
          ...baseRecord(itineraryId, index),
          [emailColumn]: userId ? null : customerEmail,
        };
        if (!includeTitle) delete row.itinerary_title;
        return row;
      });
      return supabase
        .from("itinerary_purchases")
        .insert(records)
        .select("id, itinerary_id");
    };

    let { data, error: purchaseError } = await tryInsert("buyer_email", true);

    if (
      purchaseError &&
      isMissingColumnError(purchaseError, "buyer_email")
    ) {
      console.warn(
        "itinerary_purchases.buyer_email missing; retrying with customer_email"
      );
      ({ data, error: purchaseError } = await tryInsert("customer_email", true));
    }

    if (
      purchaseError &&
      isMissingColumnError(purchaseError, "itinerary_title")
    ) {
      console.warn(
        "itinerary_purchases.itinerary_title missing; retrying without it"
      );
      ({ data, error: purchaseError } = await tryInsert("buyer_email", false));
      if (
        purchaseError &&
        isMissingColumnError(purchaseError, "buyer_email")
      ) {
        ({ data, error: purchaseError } = await tryInsert(
          "customer_email",
          false
        ));
      }
    }

    if (purchaseError) {
      // Unique violation: another delivery won the race — re-read rows
      if (purchaseError.code === "23505") {
        const { data: raced } = await supabase
          .from("itinerary_purchases")
          .select("id, itinerary_id")
          .eq("stripe_checkout_session_id", session.id);
        insertedPurchases = (raced as PurchaseRow[] | null) || [];
      } else {
        console.error(
          "Error creating itinerary_purchases records:",
          purchaseError,
          "session:",
          session.id,
          "itinerary_ids:",
          itineraryIds
        );
        return { ok: false, reason: purchaseError.message };
      }
    } else {
      insertedPurchases = (data as PurchaseRow[] | null) || [];
      createdPurchasesThisRun = insertedPurchases.length > 0;
      const userInfo = userId
        ? `user ${userId}`
        : `guest (${customerEmail})`;
      console.log(
        `Created ${insertedPurchases.length} purchase records for ${userInfo}`
      );
    }
  } else {
    console.log(
      `Purchases already exist for session ${session.id} (${insertedPurchases.length}); ensuring seller_transactions + emails`
    );
  }

  if (insertedPurchases.length === 0) {
    return { ok: false, reason: "no_purchase_rows" };
  }

  const { data: itineraryRowsForSellers } = await supabase
    .from("itineraries")
    .select("id, creator_id, title, slug")
    .in("id", itineraryIds);

  const sellerIdByItineraryId = Object.fromEntries(
    (itineraryRowsForSellers || []).map((r) => [r.id, r.creator_id as string])
  );

  const missingSeller = insertedPurchases.find(
    (p) => !sellerIdByItineraryId[p.itinerary_id]
  );
  if (missingSeller) {
    console.error(
      "Missing creator_id for itinerary:",
      missingSeller.itinerary_id
    );
    return {
      ok: false,
      reason: `missing_seller:${missingSeller.itinerary_id}`,
    };
  }

  // seller_transactions (skip rows that already exist for these purchases)
  const purchaseIds = insertedPurchases.map((p) => p.id);
  const { data: existingTx } = await supabase
    .from("seller_transactions")
    .select("purchase_id")
    .in("purchase_id", purchaseIds);
  const existingTxPurchaseIds = new Set(
    (existingTx || []).map((t) => t.purchase_id as string)
  );

  const purchasesNeedingTx = insertedPurchases.filter(
    (p) => !existingTxPurchaseIds.has(p.id)
  );

  if (purchasesNeedingTx.length > 0) {
    const payoutStatus =
      session.payment_status === "paid" ? "pending" : "unpaid";
    const amountPerItem = Math.round(
      (session.amount_total || 0) / insertedPurchases.length
    );
    const stripeFee = Math.round(amountPerItem * 0.029 + 30);
    const platformFee = Math.round((amountPerItem - stripeFee) * 0.1);
    const netAmount = amountPerItem - platformFee - stripeFee;
    const titleByItineraryId = Object.fromEntries(
      itineraryIds.map((id, i) => [id, itineraryTitles[i] ?? "Itinerary"])
    );

    const sellerTransactionRecords = purchasesNeedingTx.map((purchase) => ({
      seller_id: sellerIdByItineraryId[purchase.itinerary_id],
      buyer_id: userId || null,
      itinerary_id: purchase.itinerary_id,
      itinerary_title:
        titleByItineraryId[purchase.itinerary_id] ?? "Itinerary",
      purchase_id: purchase.id,
      gross_amount_cents: amountPerItem,
      platform_fee_cents: platformFee,
      stripe_fee_cents: stripeFee,
      seller_earnings_cents: netAmount,
      stripe_payment_intent_id: paymentIntentId,
      payout_status: payoutStatus,
      created_at: new Date().toISOString(),
    }));

    const { error: insertError } = await supabase
      .from("seller_transactions")
      .insert(sellerTransactionRecords);

    if (insertError) {
      console.error(
        "Error inserting seller_transactions records:",
        insertError
      );
      return { ok: false, reason: insertError.message };
    }
  }

  // Emails — only on first fulfillment (avoid spam on Stripe retries)
  if (
    customerEmail &&
    (createdPurchasesThisRun || purchasesNeedingTx.length > 0)
  ) {
    try {
      await sendPurchaseEmails({
        customerEmail,
        userId,
        session,
        itineraryRows: itineraryRowsForSellers || [],
        sellerIdByItineraryId,
        amountPerItem: Math.round(
          (session.amount_total || 0) / itineraryIds.length
        ),
      });
    } catch (e) {
      console.error("Purchase email step threw:", e);
    }
  } else if (!customerEmail) {
    console.warn(
      "No customer email on session; skipping purchase emails",
      session.id
    );
  }

  return { ok: true };
}

async function sendPurchaseEmails(args: {
  customerEmail: string;
  userId: string | null;
  session: Stripe.Checkout.Session;
  itineraryRows: {
    id: string;
    creator_id: string | null;
    title: string | null;
    slug: string | null;
  }[];
  sellerIdByItineraryId: Record<string, string>;
  amountPerItem: number;
}) {
  const {
    customerEmail,
    userId,
    session,
    itineraryRows,
    sellerIdByItineraryId,
    amountPerItem,
  } = args;
  const supabase = createClient();
  const base = appBaseUrl();
  const buyerName = session.customer_details?.name?.trim() || null;

  const firstItineraryId = itineraryRows[0]?.id;
  const sellerId = firstItineraryId
    ? sellerIdByItineraryId[firstItineraryId]
    : null;

  const [sellerUserRes, buyerUserRes, sellerSettingsRes] = await Promise.all([
    sellerId
      ? supabase
          .from("users")
          .select("username")
          .eq("id", sellerId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    userId
      ? supabase
          .from("users")
          .select("username")
          .eq("id", userId)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    sellerId
      ? supabase
          .from("users_settings")
          .select("seller_message")
          .eq("user_id", sellerId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ]);

  if (sellerSettingsRes.error) {
    console.error(
      "Failed to load seller purchase message:",
      sellerSettingsRes.error,
      "seller_id:",
      sellerId
    );
  }

  const purchaseThankYou =
    (
      sellerSettingsRes.data as { seller_message?: string | null } | null
    )?.seller_message?.trim() || null;

  const emailContext = {
    creatorUsername: sellerUserRes.data?.username ?? null,
    buyerUsername: buyerUserRes.data?.username ?? null,
    buyerName,
    sellerMessage: purchaseThankYou,
    sellerThankYouMessage: null,
  };

  const uniqueSellerIds = [
    ...new Set(
      Object.values(sellerIdByItineraryId).filter((id): id is string => !!id)
    ),
  ];
  const { data: sellerUsers } =
    uniqueSellerIds.length > 0
      ? await supabase
          .from("users")
          .select("id, email, username")
          .in("id", uniqueSellerIds)
      : {
          data: [] as {
            id: string;
            email: string | null;
            username: string | null;
          }[],
        };
  const sellerById = Object.fromEntries(
    (sellerUsers || []).map((u) => [u.id, u])
  );

  const itineraries = itineraryRows.map((r) => ({
    id: r.id,
    title: r.title || "Itinerary",
    slug: r.slug ?? null,
  }));

  for (const it of itineraries) {
    const pdfAttachment = await getItineraryPdfAttachmentForEmail(
      it.id,
      it.title
    );
    const { success, error } = await sendPurchaseConfirmationEmail(
      customerEmail,
      it,
      base,
      emailContext,
      pdfAttachment
    );
    if (!success) {
      console.error(
        "Purchase confirmation email failed:",
        error,
        "itinerary_id:",
        it.id
      );
    }

    const itSellerId = sellerIdByItineraryId[it.id];
    const itSeller = itSellerId ? sellerById[itSellerId] : null;
    if (itSeller?.email && itSellerId !== userId) {
      const { success: creatorNotifyOk, error: creatorNotifyErr } =
        await sendCreatorPurchaseNotificationEmail(itSeller.email, base, {
          creatorUsername: itSeller.username,
          itineraryTitle: it.title,
          itineraryId: it.id,
          itinerarySlug: it.slug,
          buyerUsername: buyerUserRes.data?.username ?? null,
          buyerName,
          buyerEmail: customerEmail,
          amountCents: amountPerItem,
        });
      if (!creatorNotifyOk) {
        console.error(
          "Creator purchase notification failed:",
          creatorNotifyErr,
          "itinerary_id:",
          it.id,
          "seller_id:",
          itSellerId
        );
      }
    }
  }
}
