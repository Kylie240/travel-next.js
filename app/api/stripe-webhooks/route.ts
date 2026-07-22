import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server-admin";
import {
  subscriptionEndsAtForUserSettings,
  unixSecondsToIso,
} from "@/lib/stripe-subscription-utils";
import {
  syncSubscriptionFromCheckoutSession,
  updateUserSubscriptionSettings,
} from "@/lib/sync-subscription";
import { syncItineraryCartPurchase } from "@/lib/sync-itinerary-purchase";
import {
  recordStripePayoutFailure,
  syncStripeConnectAccountById,
} from "@/lib/sync-stripe-connect-account";

// Prevent static analysis during build
export const dynamic = 'force-dynamic'
/** Vercel / long-running webhooks (cart path generates PDFs + email). */
export const maxDuration = 60

const SUBSCRIPTION_WEBHOOK_RETRIEVE: Stripe.SubscriptionRetrieveParams = {
  expand: ["items.data.price"],
};

function getPriceToPlanMap(): Record<string, string> {
  const map: Record<string, string> = {}
  if (process.env.STANDARD_PRICE_ID) {
    map[process.env.STANDARD_PRICE_ID] = 'standard'
  }
  if (process.env.PREMIUM_PRICE_ID) {
    map[process.env.PREMIUM_PRICE_ID] = 'premium'
  }
  return map
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
          const result = await syncItineraryCartPurchase(session);
          if (result.ok === false) {
            console.error(
              "Failed to sync itinerary cart purchase",
              session.id,
              result.reason
            );
            return NextResponse.json(
              {
                error: "Failed to sync itinerary purchase",
                reason: result.reason,
              },
              { status: 500 }
            );
          }
          break;
        }
        
        // Handle subscription checkouts
        if (session.mode !== 'subscription') {
          console.log('Not a subscription checkout, skipping', {
            mode: session.mode,
            purchase_type: session.metadata?.purchase_type,
            session_id: session.id,
          });
          break;
        }

        const syncResult = await syncSubscriptionFromCheckoutSession(stripe, session);
        if (!syncResult.ok) {
          console.error(
            'Failed to sync subscription from checkout session',
            session.id,
            syncResult.reason
          );
          return NextResponse.json(
            { error: 'Failed to sync subscription', reason: syncResult.reason },
            { status: 400 }
          );
        }

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
        const plan = getPriceToPlanMap()[priceId] || "pro";

        const subscriptionPayload: Parameters<typeof updateUserSubscriptionSettings>[1] = {
          stripe_customer_id: subscription.customer as string,
          stripe_subscription_id: subscription.id,
          stripe_subscription_status: subscription.status,
          stripe_subscription_created_date: unixSecondsToIso(subscription.created),
          plan: plan,
          stripe_subscription_ends_at:
            subscriptionEndsAtForUserSettings(subscription),
        };

        await updateUserSubscriptionSettings(userId, subscriptionPayload);

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
        await updateUserSubscriptionSettings(userId, {
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
        const plan = getPriceToPlanMap()[priceId] || 'standard';

        // Re-sync `stripe_subscription_ends_at` from a live subscription read (covers missed
        // or thin `customer.subscription.updated` webhooks, e.g. local CLI). Same helper as
        // subscription.updated; `cancel_at_period_end` comes from the API, not the event.
        await updateUserSubscriptionSettings(userId, {
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

      // Connected account status changes (marketplace sellers)
      case "account.updated":
      case "capability.updated":
      case "account.external_account.updated": {
        const connectedAccountId =
          (typeof event.account === "string" && event.account) ||
          (event.type === "account.updated"
            ? (event.data.object as Stripe.Account).id
            : null) ||
          (event.type === "capability.updated"
            ? ((event.data.object as Stripe.Capability).account as string)
            : null) ||
          (event.type === "account.external_account.updated"
            ? ((event.data.object as Stripe.BankAccount | Stripe.Card)
                .account as string | undefined) || null
            : null);

        if (!connectedAccountId) {
          console.error(`No connected account id for ${event.type}`);
          break;
        }

        const syncResult = await syncStripeConnectAccountById(connectedAccountId);
        if (!syncResult.ok) {
          console.error(
            `Failed to sync Connect account after ${event.type}:`,
            connectedAccountId,
            syncResult.reason
          );
          // Don't 500 on unknown accounts (e.g. test noise); retry only on real write errors
          if (syncResult.reason !== "user_not_found") {
            return NextResponse.json(
              { error: "Failed to sync Connect account" },
              { status: 500 }
            );
          }
        } else {
          console.log(
            `Connect account synced (${event.type}) user=${syncResult.userId} status=${syncResult.status} sales=${syncResult.salesEnabled}`
          );
        }
        break;
      }

      case "person.updated": {
        const person = event.data.object as Stripe.Person;
        const connectedAccountId =
          (typeof event.account === "string" && event.account) ||
          (typeof person.account === "string" ? person.account : null);

        if (!connectedAccountId) {
          console.error("person.updated missing account id");
          break;
        }

        const syncResult = await syncStripeConnectAccountById(connectedAccountId);
        if (!syncResult.ok && syncResult.reason !== "user_not_found") {
          return NextResponse.json(
            { error: "Failed to sync Connect account from person.updated" },
            { status: 500 }
          );
        }
        break;
      }

      case "payout.failed": {
        const payout = event.data.object as Stripe.Payout;
        const connectedAccountId =
          (typeof event.account === "string" && event.account) || null;

        if (!connectedAccountId) {
          console.error("payout.failed missing connected account id");
          break;
        }

        const payoutResult = await recordStripePayoutFailure(
          connectedAccountId,
          payout
        );
        if (!payoutResult.ok && payoutResult.reason !== "user_not_found") {
          return NextResponse.json(
            { error: "Failed to record payout failure" },
            { status: 500 }
          );
        }
        console.log(
          `Recorded payout.failed for Connect account ${connectedAccountId}`
        );
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error(`Error processing ${event.type}:`, error);
    // Return 500 so Stripe retries — returning 200 hides failed plan syncs.
    return NextResponse.json(
      { error: `Failed to process ${event.type}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
