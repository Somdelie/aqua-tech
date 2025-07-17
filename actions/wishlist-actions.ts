"use server"

import db  from "@/prisma/db"
import { revalidatePath } from "next/cache"

export async function addToWishlist(userId: string, productId: string) {
  try {
    // Check if already in wishlist
    const existing = await db.wishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    })

    if (existing) {
      return { success: false, message: "Item already in wishlist" }
    }

    await db.wishlist.create({
      data: {
        userId,
        productId,
      },
    })

    revalidatePath("/wishlist")
    return { success: true, message: "Item added to wishlist" }
  } catch (error) {
    console.error("Error adding to wishlist:", error)
    return { success: false, message: "Failed to add item to wishlist" }
  }
}

export async function removeFromWishlist(userId: string, productId: string) {
  try {
    await db.wishlist.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    })

    revalidatePath("/wishlist")
    return { success: true, message: "Item removed from wishlist" }
  } catch (error) {
    console.error("Error removing from wishlist:", error)
    return { success: false, message: "Failed to remove item from wishlist" }
  }
}

export async function getWishlistItems(userId: string) {
  try {
    const items = await db.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            brand: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return { success: true, data: items }
  } catch (error) {
    console.error("Error fetching wishlist items:", error)
    return { success: false, data: [] }
  }
}

export async function isInWishlist(userId: string, productId: string) {
  try {
    const item = await db.wishlist.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    })

    return { success: true, data: !!item }
  } catch (error) {
    console.error("Error checking wishlist:", error)
    return { success: false, data: false }
  }
}
