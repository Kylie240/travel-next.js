"use client"

import { ShoppingCart, Check } from "lucide-react"
import { useCart, CartItem } from "@/context/cart"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { toast } from "sonner"

type AddToCartButtonProps = {
  itinerary: {
    id: string
    title: string
    priceCents: number
    mainImage: string | null
    creatorName: string
    creatorUsername: string
  }
  className?: string
}

export function AddToCartButton({ itinerary, className }: AddToCartButtonProps) {
  const { addToCart, isInCart } = useCart()
  const inCart = isInCart(itinerary.id)

  const handleAddToCart = () => {
    if (inCart) return

    addToCart({
      id: itinerary.id,
      title: itinerary.title,
      priceCents: itinerary.priceCents,
      mainImage: itinerary.mainImage,
      creatorName: itinerary.creatorName,
      creatorUsername: itinerary.creatorUsername,
    })

    toast.success("Added to cart", {
      description: `${itinerary.title} has been added to your cart.`,
    })
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={handleAddToCart}
        disabled={inCart}
        className={`${className} ${inCart ? "bg-green-50 border-green-200 text-green-700" : "hover:bg-gray-100"}`}
      >
        {inCart ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            Added to Cart
          </>
        ) : (
          <>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </>
        )}
      </Button>
    </>
  )
}
