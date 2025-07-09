"use server"

import { revalidatePath } from "next/cache"
import db from "@/prisma/db"
import { generateSlug } from "../lib/generateSlug"
import type { ProductType, ProductCondition } from "@prisma/client"

export async function getAllProducts() {
  try {
    const products = await db.product.findMany({
      include: {
        category: true,
        brand: true,
        reviews: true,
        orderItems: true,
      },
      orderBy: { createdAt: "desc" },
    })

    console.log("Fetched products:", products)
    return {
      data: products,
      error: null,
    }
  } catch (error) {
    console.error("Error fetching products:", error)
    return {
      data: [],
      error: "Failed to fetch products",
    }
  }
}

export async function getProducts() {
  try {
    const products = await db.product.findMany({
      include: {
        brand: true,
        category: {
          include: {
            parent: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const categories = await db.productCategory.findMany({
      include: {
        parent: true,
      },
    })

    const brands = await db.brand.findMany()

    return { products, categories, brands }
  } catch (error) {
    console.error("Error fetching products data:", error)
    return { products: [], categories: [], brands: [] }
  }
}

export async function createProduct(data: {
  name: string
  description?: string | null
  shortDescription?: string | null
  type: ProductType
  categoryId: string
  brandId: string
  price: number
  originalPrice?: number | null
  costPrice?: number | null
  thumbnail?: string | null
  images?: string[]
  stock: number
  lowStockThreshold: number
  discount: number
  weight?: number | null
  dimensions?: string | null
  color?: string | null
  condition: ProductCondition
  warrantyMonths: number
  isAvailable: boolean
  isFeatured: boolean
  isPreOwned: boolean
  metaTitle?: string | null
  metaDescription?: string | null
}) {
  const slug = generateSlug(data.name)

  try {
    // Check if a product with the same slug already exists
    const existingProduct = await db.product.findFirst({
      where: { slug },
    })

    if (existingProduct) {
      return {
        data: null,
        error: "Product with this name already exists",
      }
    }

    // Verify category exists
    const categoryExists = await db.productCategory.findUnique({
      where: { id: data.categoryId },
    })

    if (!categoryExists) {
      return {
        data: null,
        error: "Selected category does not exist",
      }
    }

    // Verify brand exists
    const brandExists = await db.brand.findUnique({
      where: { id: data.brandId },
    })

    if (!brandExists) {
      return {
        data: null,
        error: "Selected brand does not exist",
      }
    }

    const product = await db.product.create({
      data: {
        ...data,
        slug,
        images: data.images || [],
      },
      include: {
        brand: true,
        category: {
          include: {
            parent: true,
          },
        },
      },
    })

    revalidatePath("/dashboard/products")
    return {
      data: product,
      status: 201,
      error: null,
      message: "Product created successfully",
    }
  } catch (error) {
    console.error("Error creating product:", error)
    return {
      data: null,
      error: "Failed to create product",
      status: 500,
    }
  }
}

export async function updateProduct(
  id: string,
  data: {
    name: string
    description?: string | null
    shortDescription?: string | null
    type: ProductType
    categoryId: string
    brandId: string
    price: number
    originalPrice?: number | null
    costPrice?: number | null
    thumbnail?: string | null
    images?: string[]
    stock: number
    lowStockThreshold: number
    discount: number
    weight?: number | null
    dimensions?: string | null
    color?: string | null
    condition: ProductCondition
    warrantyMonths: number
    isAvailable: boolean
    isFeatured: boolean
    isPreOwned: boolean
    metaTitle?: string | null
    metaDescription?: string | null
  },
) {
  try {
    const slug = generateSlug(data.name)

    const product = await db.product.update({
      where: { id },
      data: {
        ...data,
        slug,
        images: data.images || [],
      },
      include: {
        brand: true,
        category: {
          include: {
            parent: true,
          },
        },
      },
    })

    revalidatePath("/dashboard/products")
    return { product, error: null }
  } catch (error) {
    console.error("Error updating product:", error)
    return { product: null, error: "Failed to update product" }
  }
}

export async function deleteProduct(id: string) {
  try {
    // Check if product exists
    const product = await db.product.findUnique({
      where: { id },
      include: {
        orderItems: true,
        cartItems: true,
      },
    })

    if (!product) {
      return { success: false, error: "Product not found" }
    }

    // Check if product has orders
    if (product.orderItems.length > 0) {
      return { success: false, error: "Cannot delete product with existing orders" }
    }

    // Delete cart items first
    if (product.cartItems.length > 0) {
      await db.cartItem.deleteMany({
        where: { productId: id },
      })
    }

    await db.product.delete({
      where: { id },
    })

    revalidatePath("/dashboard/products")
    return { success: true, error: null }
  } catch (error) {
    console.error("Error deleting product:", error)
    return { success: false, error: "Failed to delete product" }
  }
}
