"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function PurchaseButton({ itinerary }: { itinerary: {
  id: string
  title: string
  priceCents: number
  mainImage: string | null
  creatorName: string
  creatorUsername: string
  creatorId: string
} }) {
  const [isLoading, setIsLoading] = useState(false)

  const handlePurchase = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/cart-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: [itinerary] }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error: any) {
      console.error('Checkout error:', error)
      toast.error('Checkout failed', {
        description: error.message || 'Please try again later.',
      })
    } finally {
      setIsLoading(false)
    }
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
