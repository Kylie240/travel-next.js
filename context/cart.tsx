"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"

export type CartItem = {
  id: string
  title: string
  priceCents: number
  mainImage: string | null
  creatorName: string
  creatorUsername: string
}

type CartContextType = {
  items: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (itemId: string) => void
  clearCart: () => void
  isInCart: (itemId: string) => boolean
  itemCount: number
  totalCents: number
}

const CartContext = createContext<CartContextType | null>(null)

const CART_STORAGE_KEY = "journli_cart"

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY)
      if (stored) {
        const parsedItems = JSON.parse(stored)
        setItems(parsedItems)
      }
    } catch (error) {
      console.error("Failed to load cart from localStorage:", error)
    }
    setIsInitialized(true)
  }, [])

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (isInitialized) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
      } catch (error) {
        console.error("Failed to save cart to localStorage:", error)
      }
    }
  }, [items, isInitialized])

  const addToCart = useCallback((item: CartItem) => {
    setItems((prev) => {
      // Don't add if already in cart
      if (prev.some((i) => i.id === item.id)) {
        return prev
      }
      return [...prev, item]
    })
  }, [])

  const removeFromCart = useCallback((itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId))
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const isInCart = useCallback((itemId: string) => {
    return items.some((item) => item.id === itemId)
  }, [items])

  const itemCount = items.length

  const totalCents = items.reduce((sum, item) => sum + item.priceCents, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        clearCart,
        isInCart,
        itemCount,
        totalCents,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
