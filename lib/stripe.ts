import 'server-only'

import Stripe from 'stripe'

// Lazy initialization to avoid build-time errors
let stripeInstance: Stripe | null = null

export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    if (!stripeInstance) {
      if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('STRIPE_SECRET_KEY is not set')
      }
      stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)
    }
    return stripeInstance[prop as keyof Stripe]
  }
})