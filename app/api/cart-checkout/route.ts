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
    const lineItems = itineraries.map(itinerary => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: itinerary.title,
          metadata: {
            itinerary_id: itinerary.id,
          },
        },
        unit_amount: itinerary.price_cents,
      },
      quantity: 1,
    }))

    // Create Checkout Session - allow email input for guest users
    const sessionConfig: any = {
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/purchases?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/canceled?type=cart`,
      metadata: {
        itinerary_ids: itineraryIds.join(','),
        purchase_type: 'itinerary_cart',
      },
    }

    // If user is logged in, pre-fill their email and store their ID
    if (user) {
      sessionConfig.customer_email = user.email
      sessionConfig.metadata.supabase_user_id = user.id
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
