import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server-admin";
import { sendPurchaseConfirmationEmail } from "@/lib/email";
import { getItineraryPdfAttachmentForEmail } from "@/lib/itinerary-purchase-pdf";
import {
  subscriptionEndsAtForUserSettings,
  unixSecondsToIso,
} from "@/lib/stripe-subscription-utils";

// Prevent static analysis during build
export const dynamic = 'force-dynamic'
/** Vercel / long-running webhooks (cart path generates PDFs + email). */
export const maxDuration = 60

// Map Stripe price IDs to plan names
const PRICE_TO_PLAN: Record<string, string> = {
  'price_1SvjvNCFWq8paBje7Q1Q13mG': 'standard',
  'price_1SvjvgCFWq8paBje5goZvdZk': 'premium',
};

const SUBSCRIPTION_WEBHOOK_RETRIEVE: Stripe.SubscriptionRetrieveParams = {
  expand: ["items.data.price"],
};

async function updateUserSubscription(
  userId: string,
  subscriptionData: {
    stripe_customer_id: string;
    stripe_subscription_id: string;
    stripe_subscription_status: string;
    stripe_subscription_created_date: string;
    /** Null = no scheduled end (active renewal) or not canceling. */
    stripe_subscription_ends_at?: string | null;
    plan: string;
  }
) {
  const supabase = createClient();

  const { stripe_subscription_ends_at: _unusedEnds, ...rest } = subscriptionData;
  void _unusedEnds;
  // Patch all columns except `stripe_subscription_ends_at`, then PATCH that column alone so
  // PostgREST applies JSON `null` and clears the DB column reliably.
  const { data, error } = await supabase
    .from("users_settings")
    .update(rest)
    .eq("user_id", userId)
    .select();

  if (error) {
    console.error("Error updating user subscription:", error);
    throw error;
  }

  if (data && data.length > 0) {
    if (Object.prototype.hasOwnProperty.call(subscriptionData, "stripe_subscription_ends_at")) {
      const ends = subscriptionData.stripe_subscription_ends_at ?? null;
      const { data: rowEnds, error: errEnds } = await supabase
        .from("users_settings")
        .update({ stripe_subscription_ends_at: ends })
        .eq("user_id", userId)
        .select();
      if (errEnds) {
        console.error("Error updating stripe_subscription_ends_at:", errEnds);
        throw errEnds;
      }
      console.log("Updated user subscription:", rowEnds);
      return rowEnds;
    }
    console.log("Updated user subscription:", data);
    return data;
  }

  // Some accounts never got a users_settings row; update matched 0 rows.
  const { data: inserted, error: insertError } = await supabase
    .from('users_settings')
    .insert({
      user_id: userId,
      is_private: false,
      email_notifications: true,
      ...subscriptionData,
    })
    .select();

  if (insertError) {
    console.error('Error inserting user subscription (no prior settings row):', insertError);
    throw insertError;
  }

  console.log('Inserted user subscription settings:', inserted);
  return inserted;
}

async function getUserIdFromCustomer(stripe: Stripe, customerId: string): Promise<string | null> {
  // First, try to get the user ID from the customer metadata
  const customer = await stripe.customers.retrieve(customerId);
  
  // Check if customer was deleted
  if ('deleted' in customer && customer.deleted) return null;
  
  // Now TypeScript knows this is a Customer (not DeletedCustomer)
  const activeCustomer = customer as Stripe.Customer;
  
  if (activeCustomer.metadata?.supabase_user_id) {
    return activeCustomer.metadata.supabase_user_id;
  }
  
  // Fallback: look up by email in Supabase
  if (activeCustomer.email) {
    const supabase = createClient();
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('email', activeCustomer.email)
      .single();
    
    return data?.id || null;
  }
  
  return null;
}

export async function POST(request: NextRequest) {
  // Initialize Stripe lazily (at runtime, not build time)
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  const body = await request.text();
  const sig = request.headers.get("stripe-signature") || "";
  let event: Stripe.Event;

  // Debug: Check if webhook secret is loaded
  if (!endpointSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set!");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (error) {
    console.error("Error verifying webhook signature:", error);
    console.error("Signature received:", sig?.substring(0, 50) + "...");
    console.error("Secret starts with:", endpointSecret?.substring(0, 10) + "...");
    return NextResponse.json(
      { error: `Webhook Error: ${error}` },
      { status: 400 }
    );
  }

  console.log(`Received event: ${event.type}`);

  try {
    switch (event.type) {
      // When a checkout session is completed (subscription or one-time payment)
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Handle itinerary cart purchases (one-time payments)
        if (session.mode === 'payment' && session.metadata?.purchase_type === 'itinerary_cart') {
          const itineraryIds = session.metadata?.itinerary_ids?.split(',') || [];
          const itineraryTitles = session.metadata?.itinerary_titles?.split('|') || [];
          const customerEmail = session.customer_details?.email || session.customer_email;
          
          if (itineraryIds.length === 0) {
            console.error('Missing itinerary IDs in cart checkout metadata');
            break;
          }

          const supabase = createClient();
          
          // Try to get user ID from metadata, or look up by email
          let userId = session.metadata?.supabase_user_id;
          
          if (!userId && customerEmail) {
            // Try to find existing user by email
            const { data: existingUser } = await supabase
              .from('users')
              .select('id')
              .eq('email', customerEmail)
              .single();
            
            if (existingUser) {
              userId = existingUser.id;
              console.log(`Found existing user ${userId} for email ${customerEmail}`);
            }
          }
          
          // Create purchase records for each itinerary
          // Store user_id if logged in, otherwise store customer_email for guest purchases
          const purchaseRecords = itineraryIds.map((itineraryId, index) => ({
            user_id: userId || null,
            customer_email: userId ? null : customerEmail, // Only store email for guests
            itinerary_id: itineraryId,
            stripe_payment_intent_id: session.payment_intent as string,
            stripe_checkout_session_id: session.id,
            amount_cents: Math.round((session.amount_total || 0) / itineraryIds.length),
            purchased_at: new Date().toISOString(),
            itinerary_title: itineraryTitles[index] ?? 'Itinerary',
          }));

          const { data: insertedPurchases, error: purchaseError } = await supabase
            .from('itinerary_purchases')
            .insert(purchaseRecords)
            .select('id, itinerary_id');

          if (purchaseError) {
            console.error('Error creating itinerary_purchases records:', purchaseError);
            console.error('Session id:', session.id, 'itinerary_ids:', itineraryIds);
            // Return 500 so Stripe retries; duplicate key (23505) is ok - already recorded
            const isDuplicate = purchaseError.code === '23505';
            if (!isDuplicate) {
              return NextResponse.json(
                { error: 'Failed to create purchase records', details: purchaseError.message },
                { status: 500 }
              );
            }
          } else {
            const userInfo = userId ? `user ${userId}` : `guest (${customerEmail})`;
            console.log(`Created ${purchaseRecords.length} purchase records for ${userInfo}`);

            // Get creator_id (seller) per itinerary for seller_transactions
            const { data: itineraryRowsForSellers } = await supabase
              .from('itineraries')
              .select('id, creator_id')
              .in('id', itineraryIds);
            const sellerIdByItineraryId = Object.fromEntries(
              (itineraryRowsForSellers || []).map((r) => [r.id, r.creator_id])
            );
            const missingSeller = (insertedPurchases || []).find(
              (p) => !sellerIdByItineraryId[p.itinerary_id]
            );
            if (missingSeller) {
              console.error('Missing creator_id for itinerary:', missingSeller.itinerary_id);
              return NextResponse.json(
                { error: 'Missing seller for itinerary', itinerary_id: missingSeller.itinerary_id },
                { status: 500 }
              );
            }

            // Send purchase confirmation email with download links
            if (customerEmail) {
              const { data: itineraryRows } = await supabase
                .from("itineraries")
                .select("id, title")
                .in("id", itineraryIds);
              const itineraries = (itineraryRows || []).map((r) => ({
                id: r.id,
                title: r.title || "Itinerary",
              }));
              const baseUrl =
                process.env.NEXT_PUBLIC_SITE_URL ||
                (process.env.VERCEL_URL
                  ? `https://${process.env.VERCEL_URL}`
                  : "https://www.journli.com");

              const firstItineraryId = itineraryIds[0];
              const sellerId = firstItineraryId
                ? sellerIdByItineraryId[firstItineraryId]
                : null;
              const buyerName =
                session.customer_details?.name?.trim() || null;

              const [sellerUserRes, buyerUserRes, sellerSettingsRes] =
                await Promise.all([
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
                        .select("purchase_thank_you_message")
                        .eq("user_id", sellerId)
                        .maybeSingle()
                    : Promise.resolve({ data: null }),
                ]);

              const sellerThankYouRaw =
                (
                  sellerSettingsRes.data as {
                    purchase_thank_you_message?: string | null;
                  } | null
                )?.purchase_thank_you_message ?? null;

              const emailContext = {
                creatorUsername: sellerUserRes.data?.username ?? null,
                buyerUsername: buyerUserRes.data?.username ?? null,
                buyerName,
                sellerThankYouMessage: sellerThankYouRaw,
              };
              const base = baseUrl.replace(/\/$/, "");

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
              }
            }

            // Use inserted itinerary_purchases ids for purchase_id (one seller_transaction per purchase)
            // Set payout_status from session: 'paid' => funds captured, seller payout pending; otherwise unpaid
            const payoutStatus =
              session.payment_status === 'paid' ? 'pending' : 'unpaid';
            const amountPerItem = Math.round((session.amount_total || 0) / (insertedPurchases?.length ?? 1));
            const stripeFee = Math.round(amountPerItem * 0.029 + 30);
            const platformFee = Math.round((amountPerItem - stripeFee) * 0.1);
            const netAmount = amountPerItem - platformFee - stripeFee;
            
            console.log('test', payoutStatus, amountPerItem);
            const titleByItineraryId = Object.fromEntries(
              itineraryIds.map((id, i) => [id, itineraryTitles[i] ?? 'Itinerary'])
            );
            const sellerTransactionRecords = (insertedPurchases || []).map((purchase) => ({
              seller_id: sellerIdByItineraryId[purchase.itinerary_id],
              itinerary_id: purchase.itinerary_id,
              itinerary_title: titleByItineraryId[purchase.itinerary_id] ?? 'Itinerary',
              purchase_id: purchase.id,
              gross_amount_cents: amountPerItem,
              platform_fee_cents: platformFee,
              stripe_fee_cents: stripeFee,
              seller_earnings_cents: netAmount,
              stripe_payment_intent_id: session.payment_intent as string,
              payout_status: payoutStatus,
              created_at: new Date().toISOString(),
            }));

            const { error: insertError } = await supabase
              .from('seller_transactions')
              .insert(sellerTransactionRecords);

            if (insertError) {
              console.error('Error inserting seller_transactions records:', insertError);
              return NextResponse.json(
                { error: 'Failed to insert seller_transactions', details: insertError.message },
                { status: 500 }
              );
            }
          }

          break;
        }
        
        // Handle subscription checkouts
        if (session.mode !== 'subscription') {
          console.log('Not a subscription checkout, skipping');
          break;
        }

        if (!session.subscription) {
          console.error('checkout.session.completed subscription mode but no session.subscription', session.id);
          break;
        }

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string,
          SUBSCRIPTION_WEBHOOK_RETRIEVE
        );

        const customerId =
          typeof session.customer === 'string'
            ? session.customer
            : session.customer &&
                typeof session.customer === 'object' &&
                'id' in session.customer &&
                !('deleted' in session.customer && (session.customer as { deleted?: boolean }).deleted)
              ? (session.customer as Stripe.Customer).id
              : typeof subscription.customer === 'string'
                ? subscription.customer
                : subscription.customer &&
                    typeof subscription.customer === 'object' &&
                    'id' in subscription.customer
                  ? (subscription.customer as Stripe.Customer).id
                  : null;

        const userId =
          session.metadata?.supabase_user_id ||
          subscription.metadata?.supabase_user_id ||
          (customerId ? await getUserIdFromCustomer(stripe, customerId) : null);

        if (!userId) {
          console.error(
            'No user id for subscription checkout (session + subscription metadata empty, customer lookup failed)',
            session.id
          );
          break;
        }

        if (!customerId) {
          console.error('No Stripe customer id on subscription checkout', session.id, subscription.id);
          break;
        }

        const priceId = subscription.items.data[0]?.price.id;
        const plan = PRICE_TO_PLAN[priceId] || 'standard';

        await stripe.customers.update(customerId, {
          metadata: { supabase_user_id: userId },
        });

        const subscriptionPayload: Parameters<typeof updateUserSubscription>[1] = {
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
          stripe_subscription_status: subscription.status,
          stripe_subscription_created_date: new Date(subscription.created * 1000).toISOString(),
          plan,
          stripe_subscription_ends_at:
            subscriptionEndsAtForUserSettings(subscription),
        };

        await updateUserSubscription(userId, subscriptionPayload);

        break;
      }

      // When a subscription is updated (plan change, renewal, etc.)
      case "customer.subscription.updated": {
        const fromEvent = event.data.object as Stripe.Subscription;
        // Webhook JSON can omit or lag `items` / `cancel_at_period_end` vs the live API.
        const subscription = await stripe.subscriptions.retrieve(
          fromEvent.id,
          SUBSCRIPTION_WEBHOOK_RETRIEVE
        );

        const userId =
          subscription.metadata?.supabase_user_id ||
          (await getUserIdFromCustomer(
            stripe,
            subscription.customer as string
          ));

        if (!userId) {
          console.error("Could not find user for subscription:", subscription.id);
          break;
        }

        const priceId = subscription.items.data[0]?.price.id;
        const plan = PRICE_TO_PLAN[priceId] || "standard";

        const subscriptionPayload: Parameters<typeof updateUserSubscription>[1] = {
          stripe_customer_id: subscription.customer as string,
          stripe_subscription_id: subscription.id,
          stripe_subscription_status: subscription.status,
          stripe_subscription_created_date: unixSecondsToIso(subscription.created),
          plan: plan,
          stripe_subscription_ends_at:
            subscriptionEndsAtForUserSettings(subscription),
        };

        await updateUserSubscription(userId, subscriptionPayload);

        console.log(
          `Subscription updated for user ${userId}: status=${subscription.status}, plan=${plan}, cancel_at_period_end=${subscription.cancel_at_period_end}, ends_at=${subscriptionPayload.stripe_subscription_ends_at ?? "null"}`
        );
        break;
      }

      // When a subscription is deleted/cancelled
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        
        const userId = subscription.metadata?.supabase_user_id || 
                       await getUserIdFromCustomer(stripe, subscription.customer as string);

        if (!userId) {
          console.error('Could not find user for subscription:', subscription.id);
          break;
        }

        // Downgrade to free plan when subscription is cancelled
        await updateUserSubscription(userId, {
          stripe_customer_id: subscription.customer as string,
          stripe_subscription_id: subscription.id,
          stripe_subscription_status: 'canceled',
          stripe_subscription_created_date: new Date(subscription.created * 1000).toISOString(),
          plan: 'free',
          stripe_subscription_ends_at:
            subscriptionEndsAtForUserSettings(subscription),
        });

        console.log(`Subscription cancelled for user ${userId}, downgraded to free`);
        break;
      }

      // Handle successful payment (subscription renewal)
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        
        // Only process subscription invoices - get subscription ID from parent or lines
        const subscriptionRef = invoice.parent?.subscription_details?.subscription || 
                               (invoice.lines?.data?.[0]?.parent?.subscription_item_details as any)?.subscription;
        if (!subscriptionRef) break;
        
        // Handle both string ID and expanded Subscription object
        const subscriptionId = typeof subscriptionRef === 'string' ? subscriptionRef : subscriptionRef.id;
        const subscription = await stripe.subscriptions.retrieve(
          subscriptionId,
          SUBSCRIPTION_WEBHOOK_RETRIEVE
        );

        const userId = subscription.metadata?.supabase_user_id ||
                       await getUserIdFromCustomer(stripe, invoice.customer as string);

        if (!userId) {
          console.error('Could not find user for invoice:', invoice.id);
          break;
        }

        const priceId = subscription.items.data[0]?.price.id;
        const plan = PRICE_TO_PLAN[priceId] || 'standard';

        // Re-sync `stripe_subscription_ends_at` from a live subscription read (covers missed
        // or thin `customer.subscription.updated` webhooks, e.g. local CLI). Same helper as
        // subscription.updated; `cancel_at_period_end` comes from the API, not the event.
        await updateUserSubscription(userId, {
          stripe_customer_id: invoice.customer as string,
          stripe_subscription_id: subscription.id,
          stripe_subscription_status: subscription.status,
          stripe_subscription_created_date: new Date(
            subscription.created * 1000
          ).toISOString(),
          plan: plan,
          stripe_subscription_ends_at:
            subscriptionEndsAtForUserSettings(subscription),
        });

        console.log(`Payment succeeded for user ${userId}, subscription renewed`);
        break;
      }

      // Handle failed payment
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        
        // Get subscription from parent or lines
        const failedSubscriptionRef = invoice.parent?.subscription_details?.subscription ||
                                      (invoice.lines?.data?.[0]?.parent?.subscription_item_details as any)?.subscription;
        if (!failedSubscriptionRef) break;
        
        // Handle both string ID and expanded Subscription object
        const failedSubscriptionId = typeof failedSubscriptionRef === 'string' ? failedSubscriptionRef : failedSubscriptionRef.id;
        const subscription = await stripe.subscriptions.retrieve(failedSubscriptionId);

        const userId = subscription.metadata?.supabase_user_id ||
                       await getUserIdFromCustomer(stripe, invoice.customer as string);

        if (!userId) {
          console.error('Could not find user for failed invoice:', invoice.id);
          break;
        }

        // Update status to past_due
        const supabase = createClient();
        await supabase
          .from('users_settings')
          .update({ stripe_subscription_status: 'past_due' })
          .eq('user_id', userId);

        console.log(`Payment failed for user ${userId}, subscription past_due`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error(`Error processing ${event.type}:`, error);
    // Return 200 to acknowledge receipt even if processing failed
    // Stripe will retry if we return an error status
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
