import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Settings, ArrowRight, Sparkles } from 'lucide-react'
import { stripe } from '../../lib/stripe'
import { Button } from '@/components/ui/button'
import { Metadata } from 'next'

// Prevent static analysis during build
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Payment Successful - Journli",
  description: "Your subscription has been activated. Welcome to Journli!",
}

interface SuccessPageProps {
  searchParams: { session_id?: string }
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const { session_id } = await searchParams

  if (!session_id) {
    redirect('/plans')
  }

  const session = await stripe.checkout.sessions.retrieve(session_id, {
    expand: ['line_items', 'payment_intent', 'subscription']
  })

  const lineItems = session.line_items?.data || []
  const products = lineItems.map((item) => {
    const product = item.price?.product as { name: string }
    const price = item.price?.unit_amount
    const interval = item.price?.recurring?.interval
    return { 
      name: product?.name || 'Subscription', 
      price: price,
      interval: interval
    }
  })

  const customerEmail = session.customer_details?.email
  const customerName = session.customer_details?.name || ''

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-6 py-16 md:py-24">
        <div className="max-w-2xl mx-auto">
          
          {/* Success Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 border border-gray-200 text-center">
            
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-green-600" />
                </div>
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="w-6 h-6 text-yellow-500" />
                </div>
              </div>
            </div>

            {/* Heading */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Payment Successful!
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Thank you {customerName} for upgrading your Journli account. Your subscription is now active!
            </p>

            {/* Purchase Summary */}
            {products.length > 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-8 border border-blue-100">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                  Your Purchase
                </h2>
                <div className="space-y-3">
                  {products.map((product, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-lg font-medium text-gray-900">{product.name}</span>
                      <span className="text-lg font-bold text-gray-900">
                        ${product.price ? (product.price / 100).toFixed(2) : '0.00'}
                        {product.interval && (
                          <span className="text-sm font-normal text-gray-500">/{product.interval}</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
                {customerEmail && (
                  <p className="text-sm text-gray-500 mt-4 pt-4 border-t border-blue-200">
                    Confirmation sent to <span className="font-medium">{customerEmail}</span>
                  </p>
                )}
              </div>
            )}

            {/* Account Settings Info */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <Settings className="w-5 h-5 text-gray-600" />
                  </div>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Manage Your Subscription
                  </h3>
                  <p className="text-gray-600 text-sm">
                    You can view, update, or cancel your subscription anytime from your 
                    <Link href="/account-settings" className="text-blue-600 hover:text-blue-700 font-medium ml-1">
                      Account Settings
                    </Link>
                    . We'll also send you reminders before your subscription renews.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/account-settings?tab=Your Plan">
                <Button className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white px-6">
                  <Settings className="w-4 h-4 mr-2" />
                  Account Settings
                </Button>
              </Link>
              <Link href="/itineraries">
                <Button variant="outline" className="w-full sm:w-auto px-6">
                  Start Creating
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Questions about your subscription?{' '}
              <Link href="/contact" className="text-blue-600 hover:text-blue-700 font-medium">
                Contact Us
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

