import Link from 'next/link'
import { XCircle, ArrowLeft, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Payment Canceled - Journli",
  description: "Your payment was canceled. No charges have been made.",
}

export default function CanceledPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-6 py-16 md:py-24">
        <div className="max-w-2xl mx-auto">
          
          {/* Canceled Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 border border-gray-200 text-center">
            
            {/* Canceled Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                <XCircle className="w-12 h-12 text-gray-500" />
              </div>
            </div>

            {/* Heading */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              Payment Canceled
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              No worries! Your payment was canceled and no charges have been made to your account.
            </p>

            {/* Info Box */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-gray-600" />
                  </div>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    Changed Your Mind?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    That's okay! You can continue using Journli for free, or come back anytime 
                    to upgrade your plan when you're ready.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/plans">
                <Button className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white px-6">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Plans
                </Button>
              </Link>
              <Link href="/itineraries">
                <Button variant="outline" className="w-full sm:w-auto px-6">
                  Continue Free
                </Button>
              </Link>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Have questions about our plans?{' '}
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

