"use server"

import { revalidatePath } from "next/cache"
import db from "@/prisma/db"
import { generateSlug } from "@/lib/generateSlug"
import type { ProductCreateData, ProductMutationData } from "@/types/product"

// Standardized response types
type ActionResponse<T> = {
  data: T | null
  error: string | null
  success?: boolean
  status?: number
  message?: string
}

type DeleteResponse = {
  success: boolean
  error: string | null
  status?: number
  message?: string
}

// Update the updateProduct function to accept ProductMutationData
export async function updateProduct(id: string, data: ProductMutationData): Promise<ActionResponse<any>> {
  try {
    // If name is being updated, generate new slug
    const updateData: any = { ...data }
    if (data.name) {
      updateData.slug = generateSlug(data.name)
    }

    const product = await db.product.update({
      where: { id },
      data: updateData,
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
    revalidatePath(`/dashboard/products/${product.slug}/edit`)

    return {
      data: product,
      error: null,
      success: true,
      message: "Product updated successfully",
    }
  } catch (error) {
    console.error("Error updating product:", error)
    return {
      data: null,
      error: "Failed to update product",
      success: false,
    }
  }
}

// Add a partial update function for individual sections
export async function updateProductPartial(id: string, data: ProductMutationData): Promise<ActionResponse<any>> {
  try {
    // If name is being updated, generate new slug
    const updateData: any = { ...data }
    if (data.name) {
      updateData.slug = generateSlug(data.name)
    }

    const product = await db.product.update({
      where: { id },
      data: updateData,
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
      error: null,
      message: "Product updated successfully",
    }
  } catch (error) {
    console.error("Error updating product:", error)
    return {
      data: null,
      error: "Failed to update product",
    }
  }
}

export async function getAllProducts(): Promise<ActionResponse<any[]>> {
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

    return {
      data: products,
      error: null,
      success: true,
    }
  } catch (error) {
    console.error("Error fetching products:", error)
    return {
      data: null,
      error: "Failed to fetch products",
      success: false,
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

    return {
      data: { products, categories, brands },
      error: null,
    }
  } catch (error) {
    console.error("Error fetching products data:", error)
    return {
      data: null,
      error: "Failed to fetch products data",
    }
  }
}

export async function createProduct(data: ProductCreateData): Promise<ActionResponse<any>> {
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
        success: false,
        status: 400,
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
        success: false,
        status: 400,
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
        success: false,
        status: 400,
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
      status: 200,
      error: null,
      success: true,
      message: "Product created successfully",
    }
  } catch (error) {
    console.error("Error creating product:", error)
    return {
      data: null,
      error: "Failed to create product",
      success: false,
      status: 500,
    }
  }
}

export async function deleteProduct(id: string): Promise<DeleteResponse> {
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
      return {
        success: false,
        error: "Product not found",
        status: 404,
        message: "Product not found",
      }
    }

    // Check if product has orders
    if (product.orderItems.length > 0) {
      return {
        success: false,
        error: "Cannot delete product with existing orders",
        status: 400,
        message: "Cannot delete product with existing orders",
      }
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
    return {
      success: true,
      error: null,
      status: 200,
      message: "Product deleted successfully",
    }
  } catch (error) {
    console.error("Error deleting product:", error)
    return {
      success: false,
      error: "Failed to delete product",
      status: 500,
      message: "Failed to delete product",
    }
  }
}

export async function getProductBySlug(slug: string): Promise<ActionResponse<any>> {
  try {
    const product = await db.product.findUnique({
      where: { slug },
      include: {
        category: true,
        brand: true,
        reviews: {
          include: {
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
        orderItems: true,
      },
    })

    if (!product) {
      return {
        data: null,
        error: "Product not found",
      }
    }

    return {
      data: product,
      error: null,
    }
  } catch (error) {
    console.error("Error fetching product by slug:", error)
    return {
      data: null,
      error: "Failed to fetch product",
    }
  }
}

export async function getProductById(id: string): Promise<any> {
  try {
    const product = await db.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        reviews: {
          include: {
            user: {
              select: {
                name: true,
                image: true,
              },
            },
          },
        },
        orderItems: true,
      },
    })

    return product
  } catch (error) {
    console.error("Error fetching product by ID:", error)
    return null
  }
}
