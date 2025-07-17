"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { addToCart, removeFromCart, updateCartItemQuantity, getCartItems, clearCart } from "@/actions/cart-actions"
import { toast } from "sonner"

interface CartItem {
  id: string
  cartId: string
  productId: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    thumbnail?: string | null
    slug: string
    brand: { name: string }
    category: { name: string }
  }
}

interface CartContextType {
  items: CartItem[]
  itemCount: number
  totalAmount: number
  isLoading: boolean
  addItem: (productId: string, quantity?: number) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  clearCartItems: () => Promise<void>
  refreshCart: () => Promise<void>
  isInCart: (productId: string) => boolean
  getCartItemQuantity: (productId: string) => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children, userId }: { children: ReactNode; userId?: string }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const itemCount = items.reduce((total, item) => total + item.quantity, 0)
  const totalAmount = items.reduce((total, item) => total + item.product.price * item.quantity, 0)

  const refreshCart = async () => {
    if (!userId) return

    setIsLoading(true)
    try {
      const result = await getCartItems(userId)
      if (result.success) {
        setItems(result.data)
      }
    } catch (error) {
      console.error("Error refreshing cart:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const addItem = async (productId: string, quantity = 1) => {
    if (!userId) {
      toast.error("Please login to add items to cart")
      return
    }

    setIsLoading(true)
    try {
      const result = await addToCart(userId, productId, quantity)
      if (result.success) {
        toast.success(result.message)
        await refreshCart()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Failed to add item to cart")
    } finally {
      setIsLoading(false)
    }
  }

  const removeItem = async (productId: string) => {
    if (!userId) return

    setIsLoading(true)
    try {
      const result = await removeFromCart(userId, productId)
      if (result.success) {
        toast.success(result.message)
        await refreshCart()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Failed to remove item from cart")
    } finally {
      setIsLoading(false)
    }
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!userId) return

    setIsLoading(true)
    try {
      const result = await updateCartItemQuantity(userId, productId, quantity)
      if (result.success) {
        await refreshCart()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Failed to update cart")
    } finally {
      setIsLoading(false)
    }
  }

  const clearCartItems = async () => {
    if (!userId) return

    setIsLoading(true)
    try {
      const result = await clearCart(userId)
      if (result.success) {
        toast.success(result.message)
        await refreshCart()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Failed to clear cart")
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to check if product is in cart
  const isInCart = (productId: string) => {
    return items.some((item) => item.productId === productId)
  }

  // Helper function to get cart item quantity
  const getCartItemQuantity = (productId: string) => {
    const item = items.find((item) => item.productId === productId)
    return item ? item.quantity : 0
  }

  useEffect(() => {
    if (userId) {
      refreshCart()
    }
  }, [userId])

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        totalAmount,
        isLoading,
        addItem,
        removeItem,
        updateQuantity,
        clearCartItems,
        refreshCart,
        isInCart,
        getCartItemQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
