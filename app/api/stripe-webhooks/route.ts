import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/utils/supabase/server-admin";

// Prevent static analysis during build
export const dynamic = 'force-dynamic'

// Map Stripe price IDs to plan names
const PRICE_TO_PLAN: Record<string, string> = {
  'price_1SvjvNCFWq8paBje7Q1Q13mG': 'standard',
  'price_1SvjvgCFWq8paBje5goZvdZk': 'premium',
};

async function updateUserSubscription(
  userId: string,
  subscriptionData: {
    stripe_customer_id: string;
    stripe_subscription_id: string;
    stripe_subscription_status: string;
    stripe_subscription_created_date: string;
    stripe_subscription_ends_at?: string;
    plan: string;
  }
) {
  const supabase = createClient();
  
  const { data, error } = await supabase
    .from('users_settings')
    .update(subscriptionData)
    .eq('user_id', userId)
    .select();

  if (error) {
    console.error('Error updating user subscription:', error);
    throw error;
  }

  console.log('Updated user subscription:', data);
  return data;
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
          const purchaseRecords = itineraryIds.map(itineraryId => ({
            user_id: userId || null,
            customer_email: userId ? null : customerEmail, // Only store email for guests
            itinerary_id: itineraryId,
            stripe_payment_intent_id: session.payment_intent as string,
            stripe_checkout_session_id: session.id,
            amount_cents: Math.round((session.amount_total || 0) / itineraryIds.length),
            purchased_at: new Date().toISOString(),
          }));

          const { error: purchaseError } = await supabase
            .from('itinerary_purchases')
            .insert(purchaseRecords);

          if (purchaseError) {
            console.error('Error creating purchase records:', purchaseError);
          } else {
            const userInfo = userId ? `user ${userId}` : `guest (${customerEmail})`;
            console.log(`Created ${purchaseRecords.length} purchase records for ${userInfo}`);
          }

          break;
        }
        
        // Handle subscription checkouts
        if (session.mode !== 'subscription') {
          console.log('Not a subscription checkout, skipping');
          break;
        }

        const userId = session.metadata?.supabase_user_id;
        
        if (!userId) {
          console.error('No supabase_user_id in session metadata');
          break;
        }

        // Retrieve the subscription to get full details
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        const priceId = subscription.items.data[0]?.price.id;
        const plan = PRICE_TO_PLAN[priceId] || 'standard';

        // Update customer metadata with Supabase user ID for future lookups
        await stripe.customers.update(session.customer as string, {
          metadata: { supabase_user_id: userId },
        });

        await updateUserSubscription(userId, {
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subscription.id,
          stripe_subscription_status: subscription.status,
          stripe_subscription_created_date: new Date(subscription.created * 1000).toISOString(),
          plan: plan,
        });

        break;
      }

      // When a subscription is updated (plan change, renewal, etc.)
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        
        const userId = subscription.metadata?.supabase_user_id || 
                       await getUserIdFromCustomer(stripe, subscription.customer as string);

        if (!userId) {
          console.error('Could not find user for subscription:', subscription.id);
          break;
        }

        const priceId = subscription.items.data[0]?.price.id;
        const plan = PRICE_TO_PLAN[priceId] || 'standard';

        await updateUserSubscription(userId, {
          stripe_customer_id: subscription.customer as string,
          stripe_subscription_id: subscription.id,
          stripe_subscription_status: subscription.status,
          stripe_subscription_created_date: new Date(subscription.created * 1000).toISOString(),
          stripe_subscription_ends_at: new Date((subscription as any).current_period_end * 1000).toISOString(),
          plan: plan,
        });

        console.log(`Subscription updated for user ${userId}: status=${subscription.status}, plan=${plan}`);
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
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        const userId = subscription.metadata?.supabase_user_id ||
                       await getUserIdFromCustomer(stripe, invoice.customer as string);

        if (!userId) {
          console.error('Could not find user for invoice:', invoice.id);
          break;
        }

        const priceId = subscription.items.data[0]?.price.id;
        const plan = PRICE_TO_PLAN[priceId] || 'standard';

        // Update subscription status to active after successful payment
        await updateUserSubscription(userId, {
          stripe_customer_id: invoice.customer as string,
          stripe_subscription_id: subscription.id,
          stripe_subscription_status: 'active',
          stripe_subscription_created_date: new Date(subscription.created * 1000).toISOString(),
          plan: plan,
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
