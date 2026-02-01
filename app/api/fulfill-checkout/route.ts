import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

import { stripe } from '../../../lib/stripe'

export async function POST(sessionId: string) {
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId,{
        expand: ['line_items']
    })

    if (checkoutSession.payment_status !== 'unpaid') {
        return NextResponse.json({ error: 'Payment not successful' }, { status: 400 })
    }

    // TODO: Perform fulfillment of the line items
    // TODO: Record/save fulfillment status for this Checkout Session
    return NextResponse.json({ message: 'Fulfillment successful' }, { status: 200 })
}
