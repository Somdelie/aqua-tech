"use server"

import { revalidatePath } from "next/cache"
import db from "@/prisma/db"
import { generateSlug } from "../lib/generateSlug"

export async function getBrands() {
  try {
    const brands = await db.brand.findMany({
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })
    return {
      brands,
      error: null,
    }
  } catch (error) {
    console.error("Error fetching brands:", error)
    return {
      brands: [],
      error: "Failed to fetch brands",
    }
  }
}

export async function createBrand(data: {
  name: string
  description?: string | null
  logo?: string | null
  website?: string | null
}) {
  const slug = generateSlug(data.name)

  try {
    // Check if a brand with the same slug already exists
    const existingBrand = await db.brand.findFirst({
      where: { slug },
    })

    if (existingBrand) {
      return {
        data: null,
        error: "Brand with this name already exists",
      }
    }

    const brand = await db.brand.create({
      data: {
        name: data.name,
        description: data.description,
        logo: data.logo,
        website: data.website,
        slug,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    })

    revalidatePath("/dashboard/brands")
    return {
      data: brand,
      status: 201,
      error: null,
      message: "Brand created successfully",
    }
  } catch (error) {
    console.error("Error creating brand:", error)
    return {
      data: null,
      error: "Failed to create brand",
      status: 500,
    }
  }
}

export async function updateBrand(
  id: string,
  data: {
    name: string
    slug: string
    description?: string | null
    logo?: string | null
    website?: string | null
  },
) {
  try {
    const brand = await db.brand.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    })

    revalidatePath("/dashboard/brands")
    return { brand, error: null }
  } catch (error) {
    console.error("Error updating brand:", error)
    return { brand: null, error: "Failed to update brand" }
  }
}

export async function deleteBrand(id: string) {
  try {
    // Check if brand has products
    const brand = await db.brand.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    })

    if (!brand) {
      return { success: false, error: "Brand not found" }
    }

    if (brand._count.products > 0) {
      return { success: false, error: "Cannot delete brand with products" }
    }

    await db.brand.delete({
      where: { id },
    })

    revalidatePath("/dashboard/brands")
    return { success: true, error: null }
  } catch (error) {
    console.error("Error deleting brand:", error)
    return { success: false, error: "Failed to delete brand" }
  }
}
