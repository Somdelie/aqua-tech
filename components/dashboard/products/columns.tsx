"use client"

import { Package, DollarSign, CheckCircle, XCircle } from "lucide-react"
import { format } from "date-fns"
import type { Product, ProductCondition } from "@prisma/client"

// Utility functions
const truncatedText = (text: string, length: number) => {
  if (text.length > length) {
    return text.slice(0, length) + "..."
  }
  return text
}

const formatDate = (date: Date | string) => {
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date
    return format(dateObj, "MMM dd, yyyy")
  } catch (error) {
    return "Invalid date"
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 0,
  }).format(amount)
}

const getStockStatus = (product: Product) => {
  if (product.stock === 0) return "Out of Stock"
  if (product.stock <= product.lowStockThreshold) return "Low Stock"
  return "In Stock"
}

const getStockStatusColor = (product: Product) => {
  if (product.stock === 0) return "text-red-600"
  if (product.stock <= product.lowStockThreshold) return "text-orange-600"
  return "text-green-600"
}

const getConditionBadgeColor = (condition: ProductCondition) => {
  switch (condition) {
    case "NEW":
      return "bg-green-100 text-green-800"
    case "EXCELLENT":
      return "bg-blue-100 text-blue-800"
    case "GOOD":
      return "bg-yellow-100 text-yellow-800"
    case "FAIR":
      return "bg-orange-100 text-orange-800"
    case "POOR":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

// Column definitions that work with your custom DataTable
export const createProductColumns = (
  categoryMap: Record<string, { id: string; name: string; parentId?: string; parent?: { name: string } }>,
  onEdit: (product: Product) => void,
  onDelete: (product: Product) => void,
) => [
  {
    accessorKey: "thumbnail",
    header: "Image",
    cell: (product: Product) => {
      const hasValidImage = Boolean(product.thumbnail && product.thumbnail !== "")
      const imgSrc = hasValidImage ? product.thumbnail : "/placeholder.svg?height=40&width=40"

      return (
        <div className="flex items-center justify-center w-12 h-12 bg-gray-50 rounded-lg overflow-hidden">
          {hasValidImage ? (
            <img
              src={imgSrc || "/placeholder.svg"}
              alt={product.name || "Product image"}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none"
                const nextElement = e.currentTarget.nextElementSibling as HTMLElement
                nextElement?.classList.remove("hidden")
              }}
            />
          ) : null}
          <Package className={`h-5 w-5 text-gray-400 ${hasValidImage ? "hidden" : ""}`} />
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: "name",
    header: "Product",
    cell: (product: Product) => {
      const category = categoryMap[product.categoryId]
      const categoryName = category ? category.name : "Unknown"

      return (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-medium line-clamp-1">{truncatedText(product.name, 40)}</span>
            {product.isFeatured && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Featured
              </span>
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {categoryName} • {product.type.replace("_", " ")}
          </div>
          {product.shortDescription && (
            <div className="text-xs text-muted-foreground truncate mt-1">
              {truncatedText(product.shortDescription, 60)}
            </div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: (product: Product) => {
      const hasOriginalPrice = product.originalPrice && Number(product.originalPrice) > Number(product.price)

      return (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="font-semibold">{formatCurrency(Number(product.price))}</span>
          </div>
          {hasOriginalPrice && (
            <div className="text-xs text-muted-foreground line-through">
              {formatCurrency(Number(product.originalPrice))}
            </div>
          )}
          {product.discount > 0 && <div className="text-xs text-green-600 font-medium">{product.discount}% off</div>}
        </div>
      )
    },
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: (product: Product) => {
      const status = getStockStatus(product)
      const colorClass = getStockStatusColor(product)

      return (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{product.stock}</span>
          </div>
          <div className={`text-xs font-medium ${colorClass}`}>{status}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "condition",
    header: "Condition",
    cell: (product: Product) => {
      const badgeColor = getConditionBadgeColor(product.condition)

      return (
        <div className="flex flex-col gap-1">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badgeColor}`}>
            {product.condition}
          </span>
          {product.isPreOwned && <span className="text-xs text-orange-600 font-medium">Pre-owned</span>}
        </div>
      )
    },
  },
  {
    accessorKey: "isAvailable",
    header: "Status",
    cell: (product: Product) => {
      return (
        <div className="flex items-center gap-2">
          {product.isAvailable ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600 font-medium">Available</span>
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-600 font-medium">Unavailable</span>
            </>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date Added",
    cell: (product: Product) => {
      return <div className="text-sm">{formatDate(product.createdAt)}</div>
    },
  },
]
