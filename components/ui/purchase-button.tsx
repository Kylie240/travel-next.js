"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function PurchaseButton({
  itinerary,
  purchasesEnabled = true,
}: {
  itinerary: {
    id: string
    title: string
    priceCents: number
    mainImage: string | null
    creatorName: string
    creatorUsername: string
    creatorId: string
  }
  /** False when the seller's Stripe Connect account is not ready for sales */
  purchasesEnabled?: boolean
}) {
  const [isLoading, setIsLoading] = useState(false)

  const handlePurchase = async () => {
    if (!purchasesEnabled) {
      toast.error("Purchases temporarily unavailable", {
        description:
          "This seller's payout account needs attention. Please check back later.",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/cart-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: [itinerary] }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session")
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error: any) {
      console.error("Checkout error:", error)
      toast.error("Checkout failed", {
        description: error.message || "Please try again later.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!purchasesEnabled) {
    return (
      <div className="flex flex-col items-center gap-2 max-w-sm">
        <Button
          className="bg-gray-400 hover:bg-gray-400 text-white px-8 py-2 cursor-not-allowed"
          disabled
        >
          Purchases unavailable
        </Button>
        <p className="text-sm text-gray-500">
          This seller&apos;s payout account needs attention. Existing purchases
          are unaffected.
        </p>
      </div>
    )
  }

  return (
    <Button
      className="bg-black hover:bg-gray-800 text-white px-8 py-2"
      onClick={handlePurchase}
      disabled={isLoading}
    >
      {isLoading ? "Redirecting to checkout…" : "Purchase Itinerary"}
    </Button>
  )
}
