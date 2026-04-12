import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import createClient from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@/utils/supabase/server-admin'
import { stripe } from '@/lib/stripe'

// Prevent static analysis during build
export const dynamic = 'force-dynamic'

type CartItem = {
  id: string
  title: string
  priceCents: number
  mainImage: string | null
  creatorName: string
  creatorUsername: string
}

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers()
    const origin = headersList.get('origin')

    // Get the current user from Supabase (optional - guests can checkout too)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Get cart items from request body
    const { items } = await request.json() as { items: CartItem[] }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      )
    }

    // Use admin client for database queries (works for both logged in and guest users)
    const adminSupabase = createAdminClient()

    // Verify all itineraries exist and get their current prices from database
    const itineraryIds = items.map(item => item.id)
    const { data: itineraries, error: itineraryError } = await adminSupabase
      .from('itineraries')
      .select('id, title, price_cents, creator_id, main_image')
      .in('id', itineraryIds)

    if (itineraryError || !itineraries) {
      return NextResponse.json(
        { error: 'Failed to verify itineraries' },
        { status: 400 }
      )
    }

    const sellerIds = [
      ...new Set(itineraries.map((i) => i.creator_id).filter(Boolean)),
    ] as string[]
    if (sellerIds.length > 1) {
      return NextResponse.json(
        {
          error:
            'Your cart can only include itineraries from one seller per checkout. Remove items from other creators or complete separate purchases.',
        },
        { status: 400 }
      )
    }

    const sellerUserId = sellerIds[0]
    let sellerStripeAccountId: string | null = null
    if (sellerUserId) {
      const { data: sellerSettings } = await adminSupabase
        .from('users_settings')
        .select('stripe_account_id')
        .eq('user_id', sellerUserId)
        .maybeSingle()
      sellerStripeAccountId =
        (sellerSettings?.stripe_account_id as string | null | undefined) ?? null
    }

    // If user is logged in, check they haven't already purchased any of these
    if (user) {
      const { data: existingPurchases } = await adminSupabase
        .from('itinerary_purchases')
        .select('itinerary_id')
        .eq('user_id', user.id)
        .in('itinerary_id', itineraryIds)

      if (existingPurchases && existingPurchases.length > 0) {
        const alreadyPurchased = existingPurchases.map(p => p.itinerary_id)
        return NextResponse.json(
          { error: 'You have already purchased some of these itineraries', alreadyPurchased },
          { status: 400 }
        )
      }
    }

    // Build line items from verified database data
    const lineItems = itineraries.map((itinerary) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: itinerary.title,
          metadata: {
            itinerary_id: itinerary.id,
            seller_id: itinerary.creator_id,
          },
        },
        // Stripe amounts must be whole cents (integers)
        unit_amount: Math.round(Number(itinerary.price_cents)),
      },
      quantity: 1,
    }))

    // Create Checkout Session - allow email input for guest users
    const isGuest = !user

    // Platform application fee in cents — always integers (Stripe rejects floats)
    const applicationFeeTotalCents = itineraries.reduce((sum, it) => {
      const p = Math.round(Number(it.price_cents))
      const stripeFee = Math.round(p * 0.029 + 30)
      return sum + Math.round(stripeFee + ((p - stripeFee) * 0.1))
    }, 0)

    const sessionConfig: any = {
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/purchase?success=true&session_id={CHECKOUT_SESSION_ID}&isGuest=${isGuest}`,
      cancel_url: `${origin}/canceled?type=cart`,
      metadata: {
        itinerary_ids: itineraryIds.join(','),
        itinerary_titles: itineraries
          .map((i) => (i.title ?? 'Itinerary').replace(/\|/g, ' '))
          .join('|'),
        purchase_type: 'itinerary_cart',
      },
    }

    // If user is logged in, pre-fill their email and store their ID
    if (user) {
      sessionConfig.customer_email = user.email
      sessionConfig.metadata.supabase_user_id = user.id
    }

    if (sellerStripeAccountId) {
      sessionConfig.payment_intent_data = {
        application_fee_amount: Math.max(0, applicationFeeTotalCents),
        transfer_data: {
          destination: sellerStripeAccountId,
        },
      }
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Cart checkout error:', err)
    return NextResponse.json(
      { error: err.message },
      { status: err.statusCode || 500 }
    )
  }
}
