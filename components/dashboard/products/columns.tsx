"use client"
import { Checkbox } from "@/components/ui/checkbox"
import DateColumn from "@/components/DataTableColumns/DateColumn"
import SortableColumn from "@/components/DataTableColumns/SortableColumn"
import { ActionColumn } from "@/components/DataTableColumns/ActionColumn"
import { formatPrice } from "@/lib/formatPrice"
import type { Product, ProductCondition } from "@/lib/generated/prisma"
import type { Column } from "@/components/ui/data-table/data-table"

// Utility functions
const truncatedText = (text: string, length: number) => {
  if (text.length > length) {
    return text.slice(0, length) + "..."
  }
  return text
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

const getCategoryDisplayName = (
  categoryId: string,
  categoryMap: Record<string, { id: string; name: string; parentId?: string; parent?: { name: string } }>,
) => {
  const category = categoryMap[categoryId]
  if (!category) return "Unknown"
  if (category.parentId && category.parent) {
    return `${category.parent.name} → ${category.name}`
  }
  return category.name
}

// Column definitions that match your DataTable's expected Column interface
export const createProductColumns = (
  categoryMap: Record<string, { id: string; name: string; parentId?: string; parent?: { name: string } }>,
  onEdit: (product: Product) => void,
  onDelete: (product: Product) => void,
): Column<Product>[] => [
  {
    accessorKey: "select",
    header: ({ table }: any) => (
      <Checkbox
        checked={table?.getIsAllPageRowsSelected() || (table?.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table?.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: (row: Product) => (
      <Checkbox
        checked={(row as any).getIsSelected?.()}
        onCheckedChange={(value) => (row as any).toggleSelected?.(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "thumbnail",
    header: "Image",
    cell: (product: Product) => {
      const hasValidThumbnail = Boolean(product.thumbnail && product.thumbnail !== "")
      const imgSrc = hasValidThumbnail ? product.thumbnail : "/placeholder.svg?height=40&width=40"
      return (
        <img
          src={imgSrc || "/placeholder.svg"}
          alt={product.name || "Product image"}
          className="w-10 h-10 object-cover rounded-md"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg?height=40&width=40"
          }}
        />
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: "name",
    header: ({ column }: any) => <SortableColumn column={column} title="Product" />,
    cell: (product: Product) => {
      return (
        <div className="flex flex-col">
          <span className="font-medium line-clamp-1">{truncatedText(product.name, 25)}</span>
          <span className="text-xs text-muted-foreground">{product.brandId || "Unknown Brand"}</span>
          {product.isPreOwned && (
            <span className="text-xs bg-orange-100 text-orange-800 px-1 rounded mt-1 w-fit">Pre-owned</span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "type",
    header: ({ column }: any) => <SortableColumn column={column} title="Type" />,
    cell: (product: Product) => {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {product.type.replace("_", " ")}
        </span>
      )
    },
  },
  {
    accessorKey: "categoryId",
    header: "Category",
    cell: (product: Product) => {
      return (
        <span className="font-medium line-clamp-1">
          {truncatedText(getCategoryDisplayName(product.categoryId, categoryMap), 25)}
        </span>
      )
    },
  },
  {
    accessorKey: "condition",
    header: ({ column }: any) => <SortableColumn column={column} title="Condition" />,
    cell: (product: Product) => {
      return (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getConditionBadgeColor(product.condition)}`}
        >
          {product.condition}
        </span>
      )
    },
  },
  {
    accessorKey: "price",
    header: ({ column }: any) => <SortableColumn column={column} title="Price" />,
    cell: (product: Product) => {
      return (
        <div className="flex flex-col">
          <span className="text-primary font-medium">{formatPrice(Number(product.price))}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-xs text-muted-foreground line-through">
              {formatPrice(Number(product.originalPrice))}
            </span>
          )}
          {product.discount > 0 && <span className="text-xs text-green-600">{product.discount}% off</span>}
        </div>
      )
    },
  },
  {
    accessorKey: "stock",
    header: ({ column }: any) => <SortableColumn column={column} title="Stock" />,
    cell: (product: Product) => {
      return (
        <div className="flex items-center space-x-2">
          <span className="font-medium">{product.stock}</span>
          <span className={`text-xs ${getStockStatusColor(product)}`}>{getStockStatus(product)}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "isAvailable",
    header: "Status",
    cell: (product: Product) => {
      return (
        <div className="flex flex-col space-y-1">
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              product.isAvailable ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            }`}
          >
            {product.isAvailable ? "Available" : "Unavailable"}
          </span>
          {product.isFeatured && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Featured
            </span>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }: any) => <SortableColumn column={column} title="Date Created" />,
    cell: (product: Product) => <DateColumn row={{ original: product }} accessorKey="createdAt" />,
  },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: (product: Product) => {
      return (
        <ActionColumn
          row={{ original: product }}
          model="product"
          id={product.id}
          onEdit={() => onEdit(product)}
          onDelete={() => onDelete(product)}
        />
      )
    },
    enableSorting: false,
  },
]
