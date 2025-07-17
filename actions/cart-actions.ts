"use server"

import { revalidatePath } from "next/cache"
import db from '@/prisma/db';

export async function addToCart(userId: string, productId: string, quantity = 1) {
  try {
    // Get or create cart for user
    let cart = await db.cart.findUnique({
      where: { userId },
    })

    if (!cart) {
      cart = await db.cart.create({
        data: { userId },
      })
    }

    // Check if item already exists in cart
    const existingItem = await db.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    })

    if (existingItem) {
      // Update quantity
      await db.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
      })
    } else {
      // Create new cart item
      await db.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
        },
      })
    }

    revalidatePath("/cart")
    return { success: true, message: "Item added to cart" }
  } catch (error) {
    console.error("Error adding to cart:", error)
    return { success: false, message: "Failed to add item to cart" }
  }
}

export async function removeFromCart(userId: string, productId: string) {
  try {
    const cart = await db.cart.findUnique({
      where: { userId },
    })

    if (!cart) {
      return { success: false, message: "Cart not found" }
    }

    await db.cartItem.delete({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    })

    revalidatePath("/cart")
    return { success: true, message: "Item removed from cart" }
  } catch (error) {
    console.error("Error removing from cart:", error)
    return { success: false, message: "Failed to remove item from cart" }
  }
}

export async function updateCartItemQuantity(userId: string, productId: string, quantity: number) {
  try {
    const cart = await db.cart.findUnique({
      where: { userId },
    })

    if (!cart) {
      return { success: false, message: "Cart not found" }
    }

    if (quantity <= 0) {
      return await removeFromCart(userId, productId)
    }

    await db.cartItem.update({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
      data: { quantity },
    })

    revalidatePath("/cart")
    return { success: true, message: "Cart updated" }
  } catch (error) {
    console.error("Error updating cart:", error)
    return { success: false, message: "Failed to update cart" }
  }
}

export async function getCartItems(userId: string) {
  try {
    const cart = await db.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                brand: true,
                category: true,
              },
            },
          },
        },
      },
    })

    return { success: true, data: cart?.items || [] }
  } catch (error) {
    console.error("Error fetching cart items:", error)
    return { success: false, data: [] }
  }
}

export async function clearCart(userId: string) {
  try {
    const cart = await db.cart.findUnique({
      where: { userId },
    })

    if (!cart) {
      return { success: false, message: "Cart not found" }
    }

    await db.cartItem.deleteMany({
      where: { cartId: cart.id },
    })

    revalidatePath("/cart")
    return { success: true, message: "Cart cleared" }
  } catch (error) {
    console.error("Error clearing cart:", error)
    return { success: false, message: "Failed to clear cart" }
  }
}
