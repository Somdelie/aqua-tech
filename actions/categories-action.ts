"use server"

import { revalidatePath } from "next/cache"
import db from "@/prisma/db"
import { generateSlug } from "../lib/generateSlug"

export async function getCategories() {
  try {
    const categories = await db.productCategory.findMany({
      include: {
        parent: true,
        children: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
    console.log("Fetched categories:", categories)
    return {
      categories,
      error: null,
    }
  } catch (error) {
    console.error("Error fetching categories:", error)
    return {
      categories: [],
      error: "Failed to fetch categories",
    }
  }
}

export async function createCategory(data: {
  name: string
  description?: string | null
  image?: string | null
  parentId?: string | null
}) {
  const slug = generateSlug(data.name)

  try {
    // Check if a category with the same slug already exists
    const existingCategory = await db.productCategory.findFirst({
      where: { slug },
    })

    if (existingCategory) {
      return {
        data: null,
        error: "Category with this name already exists",
      }
    }

    // Convert "none" to null for parentId
    const parentId = data.parentId === "none" || data.parentId === "" ? null : data.parentId

    // If parentId is provided and not null, verify it exists
    if (parentId) {
      const parentExists = await db.productCategory.findUnique({
        where: { id: parentId },
      })

      if (!parentExists) {
        return {
          data: null,
          error: "Selected parent category does not exist",
        }
      }
    }

    const category = await db.productCategory.create({
      data: {
        name: data.name,
        description: data.description,
        image: data.image,
        parentId, // Use the cleaned parentId
        slug, // Use the generated slug
      },
      include: {
        parent: true,
        children: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    })
console.log("Created category:", category)
    revalidatePath("/dashboard/categories")
    return {
      data: category,
      status: 201,
      error: null,
      message: "Category created successfully",
    }
  } catch (error) {
    console.error("Error creating category:", error)
    return {
      data: null,
      error: "Failed to create category",
      status: 500,
    }
  }
}

export async function updateCategory(
  id: string,
  data: {
    name: string
    slug: string
    description?: string | null
    image?: string | null
    parentId?: string | null
  },
) {
  try {
    // Convert "none" to null for parentId
    const parentId = data.parentId === "none" || data.parentId === "" ? null : data.parentId

    // If parentId is provided and not null, verify it exists
    if (parentId) {
      const parentExists = await db.productCategory.findUnique({
        where: { id: parentId },
      })

      if (!parentExists) {
        return {
          category: null,
          error: "Selected parent category does not exist",
        }
      }
    }

    const category = await db.productCategory.update({
      where: { id },
      data: {
        ...data,
        parentId, // Use the cleaned parentId
      },
      include: {
        parent: true,
        children: true,
        _count: {
          select: {
            products: true,
          },
        },
      },
    })

    revalidatePath("/dashboard/categories")
    return { category, error: null }
  } catch (error) {
    console.error("Error updating category:", error)
    return { category: null, error: "Failed to update category" }
  }
}

export async function deleteCategory(id: string) {
  try {
    // Check if category has products
    const category = await db.productCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    })

    if (!category) {
      return { success: false, error: "Category not found" }
    }

    if (category._count.products > 0) {
      return { success: false, error: "Cannot delete category with products" }
    }

    await db.productCategory.delete({
      where: { id },
    })

    revalidatePath("/dashboard/categories")
    return { success: true, error: null }
  } catch (error) {
    console.error("Error deleting category:", error)
    return { success: false, error: "Failed to delete category" }
  }
}
