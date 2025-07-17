"use client"

import type React from "react"
import { CartProvider } from './cart-context';
import { WishlistProvider } from './wishlist-context';

interface EcommerceProvidersProps {
  children: React.ReactNode
  userId?: string
}

export function EcommerceProviders({ children, userId }: EcommerceProvidersProps) {
  return (
    <CartProvider userId={userId}>
      <WishlistProvider userId={userId}>{children}</WishlistProvider>
    </CartProvider>
  )
}
