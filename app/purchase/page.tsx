"use client"

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import createClient from '@/utils/supabase/client'
import { FaRegQuestionCircle } from 'react-icons/fa'

export default function PurchasePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isGuest = searchParams.get('isGuest')
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.replace('/')
      }
    })
    return () => subscription.unsubscribe()
  }, [router])

  // Backup if the Stripe webhook missed DB writes / emails
  useEffect(() => {
    if (!sessionId) return
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/sync-purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId }),
        })
        if (!res.ok && !cancelled) {
          console.error('Purchase sync failed', await res.text())
        }
      } catch (e) {
        if (!cancelled) console.error('Purchase sync error', e)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [sessionId])

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-16 md:py-24">
        <div className="max-w-2xl mx-auto">
          
          {/* Canceled Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 border border-gray-200 text-center">
            
            {/* Canceled Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-400" />
              </div>
            </div>

            {/* Heading */}
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-3">
              Payment Successful
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              You will receive an email shortly with a download link for your purchase.
            </p>

            {/* Info Box */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8 border border-gray-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <FaRegQuestionCircle size={24} className="text-gray-500" />
                  </div>
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    How to access your purchase
                  </h3>
                  <p className="text-gray-600 text-sm mt-2">
                    A PDF copy of your purchase will be attached to the email. Journli account holders can also access their purchases from the <Link href="/purchased" className="text-blue-600 hover:text-blue-700 font-medium">Purchased Itineraries</Link> page.
                  </p>
                </div>
              </div>
            </div>

            {isGuest === 'true' && (
              <p className="text-gray-600 text-sm mt-2">
                Don't have an account? Sign up now to link your purchase <br /> to your account and access your itineraries later.
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isGuest === 'false' ? (
                <Link href="/purchased">
                <Button variant="outline" className="w-full sm:w-auto px-6">
                  My Purchases
                </Button>
              </Link>
              ) : (
                <Link href="/login?mode=signup">
                  <Button variant="outline" className="w-full sm:w-auto px-6 mt-4">
                    Sign Up
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Have questions?{' '}
              <Link href="/about" className="text-gray-900 hover:underline font-medium">
                Learn more about Journli
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

