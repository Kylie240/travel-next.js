import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import createClient from '@/utils/supabase/server'

import { stripe } from '../../../lib/stripe'

// Prevent static analysis during build
export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const headersList = await headers()
    const origin = headersList.get('origin')

    const standardPriceId = process.env.STANDARD_PRICE_ID
    if (!standardPriceId) {
      return NextResponse.json(
        { error: 'STANDARD_PRICE_ID is not configured' },
        { status: 500 }
      )
    }

    // Get the current user from Supabase
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'You must be logged in to subscribe' },
        { status: 401 }
      )
    }

    // Create Checkout Sessions from body params.
    const session = await stripe.checkout.sessions.create({
      customer_email: user.email,
      client_reference_id: user.id,
      line_items: [
        {
          price: standardPriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/canceled`,
      // Pass user metadata so we can link Stripe customer to Supabase user
      metadata: {
        supabase_user_id: user.id,
      },
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
        },
      },
    });
    return NextResponse.redirect(session.url!, 303)
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: err.statusCode || 500 }
    )
  }
}
