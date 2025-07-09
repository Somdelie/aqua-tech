import type { Prisma, ProductType, ProductCondition } from "@prisma/client"
import { calculateDiscountPercentage, calculateSavingsAmount } from "@/lib/calculateDiscount"

// Use Prisma's generated types for better type safety
export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    brand: {
      select: {
        id: true
        name: true
      }
    }
    category: {
      select: {
        id: true
        name: true
      }
    }
  }
}>

// Base product interface that matches what we get from database
export interface BaseProduct {
  id: string
  slug: string
  name: string
  description: string | null
  shortDescription: string | null
  price: number
  originalPrice: number | null
  costPrice: number | null
  thumbnail: string | null
  images: string[]
  stock: number
  lowStockThreshold: number
  isAvailable: boolean
  isFeatured: boolean
  isPreOwned: boolean
  specifications: Record<string, any> | null
  weight: number | null
  dimensions: string | null
  color: string | null
  condition: ProductCondition
  warrantyMonths: number
  metaTitle: string | null
  metaDescription: string | null
  type: ProductType
  category: { id: string; name: string }
  brand: { id: string; name: string }
  createdAt: Date
}

// Extended product type with calculated fields for frontend use
export interface Product extends BaseProduct {
  discount: number // Calculated discount percentage
  savings: number // Calculated savings amount
}

// Utility function to transform database product to frontend product
export function transformProduct(dbProduct: ProductWithRelations): Product {
  return {
    id: dbProduct.id,
    slug: dbProduct.slug,
    name: dbProduct.name,
    description: dbProduct.description,
    shortDescription: dbProduct.shortDescription,
    price: dbProduct.price,
    originalPrice: dbProduct.originalPrice,
    costPrice: dbProduct.costPrice,
    thumbnail: dbProduct.thumbnail,
    images: dbProduct.images,
    stock: dbProduct.stock,
    lowStockThreshold: dbProduct.lowStockThreshold,
    isAvailable: dbProduct.isAvailable,
    isFeatured: dbProduct.isFeatured,
    isPreOwned: dbProduct.isPreOwned,
    specifications:
      typeof dbProduct.specifications === "string"
        ? JSON.parse(dbProduct.specifications)
        : (dbProduct.specifications as Record<string, any> | null),
    weight: dbProduct.weight,
    dimensions: dbProduct.dimensions,
    color: dbProduct.color,
    condition: dbProduct.condition,
    warrantyMonths: dbProduct.warrantyMonths,
    metaTitle: dbProduct.metaTitle,
    metaDescription: dbProduct.metaDescription,
    type: dbProduct.type,
    category: dbProduct.category,
    brand: dbProduct.brand,
    createdAt: dbProduct.createdAt,
    discount: calculateDiscountPercentage(dbProduct.originalPrice, dbProduct.price),
    savings: calculateSavingsAmount(dbProduct.originalPrice, dbProduct.price),
  }
}

export type CategorySelect = {
  id: string
  name: string
}

export type BrandSelect = {
  id: string
  name: string
}

export interface ProductsData {
  products: Product[]
  categories: CategorySelect[]
  brands: BrandSelect[]
}

export interface ProductsPageData {
  products: ProductWithRelations[]
  categories: CategorySelect[]
  brands: BrandSelect[]
}

// Types for mutations - using Prisma generated types
export type ProductCreateData = {
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
}

// For partial updates - all fields are optional except id
export type ProductMutationData = Partial<{
  name: string
  description: string | null
  shortDescription: string | null
  type: ProductType
  categoryId: string
  brandId: string
  price: number
  originalPrice: number | null
  costPrice: number | null
  thumbnail: string | null
  images: string[]
  stock: number
  lowStockThreshold: number
  weight: number | null
  dimensions: string | null
  color: string | null
  condition: ProductCondition
  warrantyMonths: number
  isAvailable: boolean
  isFeatured: boolean
  isPreOwned: boolean
  metaTitle: string | null
  metaDescription: string | null
  slug: string
}>

// Export Prisma enums for use in components
export type { ProductType, ProductCondition }
