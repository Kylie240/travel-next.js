"use client"

import { useState } from "react"
import { ShoppingCart, X, Trash2 } from "lucide-react"
import { useCart, CartItem } from "@/context/cart"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import * as Dialog from "@radix-ui/react-dialog"

export function CartButton() {
  const { items, itemCount, totalCents, removeFromCart } = useCart()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Trigger asChild>
        <button className="relative flex cursor-pointer items-center justify-center rounded-full bg-white/90 p-2 hover:bg-white/100 transition-colors">
          <ShoppingCart className="h-5 w-5 text-gray-700" />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black text-xs text-white font-medium">
              {itemCount}
            </span>
          )}
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-[100]" />
        <Dialog.Content className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-[101] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <Dialog.Title className="text-lg font-semibold">
              Your Cart ({itemCount})
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <ShoppingCart className="h-12 w-12 mb-4 text-gray-300" />
                <p className="text-lg font-medium">Your cart is empty</p>
                <p className="text-sm mt-1">Add itineraries to your cart to purchase them</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <CartItemCard
                    key={item.id}
                    item={item}
                    onRemove={() => removeFromCart(item.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Total</span>
                <span className="text-xl font-bold">${(totalCents / 100).toFixed(2)}</span>
              </div>
              <Button className="w-full bg-black hover:bg-gray-800 text-white py-3">
                Checkout
              </Button>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function CartItemCard({ item, onRemove }: { item: CartItem; onRemove: () => void }) {
  return (
    <div className="flex gap-3 p-3 border rounded-lg">
      <div className="relative h-16 w-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
        {item.mainImage ? (
          <Image
            src={item.mainImage}
            alt={item.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <ShoppingCart className="h-6 w-6" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm truncate">{item.title}</h4>
        <p className="text-xs text-gray-500">by @{item.creatorUsername}</p>
        <p className="text-sm font-semibold mt-1">${(item.priceCents / 100).toFixed(2)}</p>
      </div>
      <button
        onClick={onRemove}
        className="p-2 hover:bg-red-50 rounded-full transition-colors self-start"
        aria-label="Remove from cart"
      >
        <Trash2 className="h-4 w-4 text-red-500" />
      </button>
    </div>
  )
}
