"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { addToWishlist, removeFromWishlist, getWishlistItems } from "@/actions/wishlist-actions"
import { toast } from "sonner"

interface WishlistItem {
  id: string
  userId: string
  productId: string
  createdAt: Date
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

interface WishlistContextType {
  items: WishlistItem[]
  itemCount: number
  isLoading: boolean
  addItem: (productId: string) => Promise<void>
  removeItem: (productId: string) => Promise<void>
  isInWishlist: (productId: string) => boolean
  refreshWishlist: () => Promise<void>
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children, userId }: { children: ReactNode; userId?: string }) {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const itemCount = items.length

  const refreshWishlist = async () => {
    if (!userId) return

    setIsLoading(true)
    try {
      const result = await getWishlistItems(userId)
      if (result.success) {
        setItems(result.data)
      }
    } catch (error) {
      console.error("Error refreshing wishlist:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const addItem = async (productId: string) => {
    if (!userId) {
      toast.error("Please login to add items to wishlist")
      return
    }

    setIsLoading(true)
    try {
      const result = await addToWishlist(userId, productId)
      if (result.success) {
        toast.success(result.message)
        await refreshWishlist()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Failed to add item to wishlist")
    } finally {
      setIsLoading(false)
    }
  }

  const removeItem = async (productId: string) => {
    if (!userId) return

    setIsLoading(true)
    try {
      const result = await removeFromWishlist(userId, productId)
      if (result.success) {
        toast.success(result.message)
        await refreshWishlist()
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      toast.error("Failed to remove item from wishlist")
    } finally {
      setIsLoading(false)
    }
  }

  const isItemInWishlist = (productId: string) => {
    return items.some((item) => item.productId === productId)
  }

  useEffect(() => {
    if (userId) {
      refreshWishlist()
    }
  }, [userId])

  return (
    <WishlistContext.Provider
      value={{
        items,
        itemCount,
        isLoading,
        addItem,
        removeItem,
        isInWishlist: isItemInWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}
