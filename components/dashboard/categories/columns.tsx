"use client"

import { FolderTree, Package } from "lucide-react"
import { format } from "date-fns"

// Category interface
interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  parentId: string | null
  parent: { id: string; name: string } | null
  children: Array<{ id: string; name: string }>
  _count: { products: number }
  createdAt: Date
  updatedAt: Date
}

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

// Column definitions that work with your custom DataTable
export const createCategoryColumns = (onEdit: (category: Category) => void, onDelete: (category: Category) => void) => [
  {
    accessorKey: "image",
    header: "Image",
    cell: (category: Category) => {
      const hasValidImage = Boolean(category.image && category.image !== "")
      const imgSrc = hasValidImage ? category.image : "/placeholder.svg?height=40&width=40"

      return (
        <div className="flex items-center justify-center w-10 h-10 bg-blue-50 rounded-lg">
          {hasValidImage ? (
            <img
              src={imgSrc || "/placeholder.svg"}
              alt={category.name || "Category image"}
              className="w-10 h-10 object-cover rounded-lg"
              onError={(e) => {
                e.currentTarget.style.display = "none"
                const nextElement = e.currentTarget.nextElementSibling as HTMLElement
                nextElement?.classList.remove("hidden")
              }}
            />
          ) : null}
          <FolderTree className={`h-4 w-4 text-blue-600 ${hasValidImage ? "hidden" : ""}`} />
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: "name",
    header: "Category",
    cell: (category: Category) => {
      const isSubcategory = category.parent !== null

      return (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            {isSubcategory && <span className="text-muted-foreground flex-shrink-0">└</span>}
            <span className="font-medium line-clamp-1">{truncatedText(category.name, 30)}</span>
          </div>
          {category.parent && (
            <div className="text-sm text-muted-foreground truncate">Parent: {category.parent.name}</div>
          )}
          {category.description && (
            <div className="text-sm text-muted-foreground truncate">{truncatedText(category.description, 50)}</div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "slug",
    header: "Slug",
    cell: (category: Category) => {
      return (
        <code className="text-sm bg-gray-100 px-2 py-1 rounded truncate block max-w-[150px]" title={category.slug}>
          {category.slug}
        </code>
      )
    },
  },
  {
    accessorKey: "_count.products",
    header: "Products",
    cell: (category: Category) => {
      const count = category._count.products

      return (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{count}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "children",
    header: "Subcategories",
    cell: (category: Category) => {
      const count = category.children.length

      return (
        <div className="flex items-center gap-2">
          <FolderTree className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{count}</span>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: "createdAt",
    header: "Date Created",
    cell: (category: Category) => {
      return <div className="text-sm">{formatDate(category.createdAt)}</div>
    },
  },
]
