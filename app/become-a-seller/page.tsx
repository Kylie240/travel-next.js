"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  DollarSign,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { StripeAccountButton } from "@/components/ui/stripe-account-button"
import createClient from "@/utils/supabase/client"
import {
  isFoundingProActive,
  resolveEffectivePlan,
} from "@/lib/founding-creator/plan"
import { SELLER_PLATFORM_FEE_RATE } from "@/lib/seller-fees"

export default function BecomeASellerPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [isFoundingCreator, setIsFoundingCreator] = useState(false)
  const [hasPro, setHasPro] = useState(false)

  useEffect(() => {
    const check = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace("/login?mode=login")
        return
      }

      const { data: settings } = await supabase
        .from("users_settings")
        .select(
          "stripe_account_id, plan, stripe_subscription_status, founding_creator_status, founding_creator_expires_at"
        )
        .eq("user_id", user.id)
        .maybeSingle()

      if (settings?.stripe_account_id) {
        router.replace("/seller-dashboard")
        return
      }

      const founding = isFoundingProActive({
        founding_creator_status: settings?.founding_creator_status,
        founding_creator_expires_at: settings?.founding_creator_expires_at,
      })
      const pro =
        resolveEffectivePlan({
          plan: settings?.plan,
          stripe_subscription_status: settings?.stripe_subscription_status,
          founding_creator_status: settings?.founding_creator_status,
          founding_creator_expires_at: settings?.founding_creator_expires_at,
        }) === "pro"

      setIsFoundingCreator(founding)
      setHasPro(pro)
      setChecking(false)
    }

    void check()
  }, [router])

  if (checking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  const proFeePercent = Math.round(SELLER_PLATFORM_FEE_RATE.pro * 100)

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20 max-w-3xl">
        <div className="text-center mb-10 md:mb-14">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
            {isFoundingCreator ? "Founding creator" : "Sell on Journli"}
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {isFoundingCreator ? "Start selling your itineraries" : "Become a seller"}
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-xl mx-auto">
            {isFoundingCreator ? (
              <>
                Your founding Pro is already active — including the lower{" "}
                {proFeePercent}% selling fee. Connect Stripe to receive payouts,
                then price and publish from your create flow.
              </>
            ) : (
              <>
                Share itineraries you&apos;ve crafted and earn when travelers buy
                them. Connect Stripe to receive payouts, then price and publish
                from your create flow.
              </>
            )}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 mb-10">
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <DollarSign className="h-6 w-6 text-gray-800 mb-3" />
            <h2 className="font-semibold text-gray-900 mb-1">Get paid</h2>
            <p className="text-sm text-gray-600">
              Buyers pay through Stripe. Earnings go to your connected payout
              account.
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <Sparkles className="h-6 w-6 text-gray-800 mb-3" />
            <h2 className="font-semibold text-gray-900 mb-1">
              {isFoundingCreator || hasPro
                ? "Pro selling fees"
                : "Sell on Free or Pro"}
            </h2>
            <p className="text-sm text-gray-600">
              {isFoundingCreator ? (
                <>
                  As a founding creator you already get Pro rates — a{" "}
                  {proFeePercent}% platform fee on sales while your grant is
                  active.
                </>
              ) : hasPro ? (
                <>
                  Your Pro plan includes a lower {proFeePercent}% platform fee
                  and advanced publishing tools.
                </>
              ) : (
                <>
                  Anyone can sell. Pro lowers your platform fee and unlocks more
                  publishing tools.
                </>
              )}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <ShieldCheck className="h-6 w-6 text-gray-800 mb-3" />
            <h2 className="font-semibold text-gray-900 mb-1">Secure payouts</h2>
            <p className="text-sm text-gray-600">
              Stripe handles identity and bank details so you can focus on great
              itineraries.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            How to get started
          </h2>
          {isFoundingCreator || hasPro ? (
            <ol className="list-decimal list-inside space-y-2 text-gray-600 text-sm md:text-base mb-6">
              <li>Connect your Stripe account (required to receive payouts).</li>
              <li>
                Open an itinerary in Create, enable paid access, set a price, and
                publish.
              </li>
              <li>
                Track sales and payouts from your Seller Dashboard once Stripe is
                connected.
              </li>
            </ol>
          ) : (
            <ol className="list-decimal list-inside space-y-2 text-gray-600 text-sm md:text-base mb-6">
              <li>Connect your Stripe account (required to receive payouts).</li>
              <li>
                Optionally upgrade to{" "}
                <Link href="/plans" className="text-blue-600 hover:underline">
                  Pro
                </Link>{" "}
                for a lower service fee and advanced features.
              </li>
              <li>
                Open an itinerary in Create, enable paid access, set a price, and
                publish.
              </li>
            </ol>
          )}

          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <StripeAccountButton label="Sign up with Stripe" variant="default" />
            {isFoundingCreator || hasPro ? (
              <Button asChild variant="outline">
                <Link href="/create" className="inline-flex items-center gap-2">
                  Create an itinerary
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button asChild variant="outline">
                <Link href="/plans" className="inline-flex items-center gap-2">
                  View plans
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>

        <p className="text-center text-sm text-gray-500">
          Already connected Stripe?{" "}
          <Link
            href="/seller-dashboard"
            className="text-blue-600 hover:underline"
          >
            Go to Seller Dashboard
          </Link>
        </p>
      </div>
    </div>
  )
}
