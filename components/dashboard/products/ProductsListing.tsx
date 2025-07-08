"use client"

import { useState, useEffect, useCallback } from "react"
import { format } from "date-fns"
import * as XLSX from "xlsx"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { DollarSign, Package, Weight } from "lucide-react"
import { DataTable, TableActions, EntityForm, ConfirmationDialog } from "@/components/ui/data-table"
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { createProductColumns } from "./columns"

// Import types from Prisma client
import type { Product, ProductCondition } from "@/lib/generated/prisma"
import { useForm } from 'react-hook-form';

// Updated interfaces to use Prisma types
interface ProductsListingProps {
  products: Product[]
  categoryMap: Record<string, { id: string; name: string; parentId?: string; parent?: { name: string } }>
  brandMap: Record<string, { id: string; name: string }>
}

// Product types for the form - using the actual enum values
const PRODUCT_TYPES = [
  { value: "MOBILE_PHONE" as const, label: "Mobile Phone" },
  { value: "TABLET" as const, label: "Tablet" },
  { value: "LAPTOP" as const, label: "Laptop" },
  { value: "DESKTOP" as const, label: "Desktop" },
  { value: "MONITOR" as const, label: "Monitor" },
  { value: "TV" as const, label: "TV" },
  { value: "TV_BOX" as const, label: "TV Box" },
  { value: "SMARTWATCH" as const, label: "Smartwatch" },
  { value: "ROUTER" as const, label: "Router" },
  { value: "CHARGER" as const, label: "Charger" },
  { value: "MOUSE" as const, label: "Mouse" },
  { value: "KEYBOARD" as const, label: "Keyboard" },
  { value: "HEADPHONES" as const, label: "Headphones" },
  { value: "SPEAKERS" as const, label: "Speakers" },
  { value: "CAMERA" as const, label: "Camera" },
  { value: "GAMING_CONSOLE" as const, label: "Gaming Console" },
  { value: "ACCESSORY" as const, label: "Accessory" },
  { value: "OTHER" as const, label: "Other" },
]

const PRODUCT_CONDITIONS = [
  { value: "NEW" as const, label: "New" },
  { value: "EXCELLENT" as const, label: "Excellent" },
  { value: "GOOD" as const, label: "Good" },
  { value: "FAIR" as const, label: "Fair" },
  { value: "POOR" as const, label: "Poor" },
]

// Updated form schema to use Prisma enum values
const productFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  type: z.enum([
    "MOBILE_PHONE",
    "TABLET",
    "LAPTOP",
    "DESKTOP",
    "MONITOR",
    "TV",
    "TV_BOX",
    "SMARTWATCH",
    "ROUTER",
    "CHARGER",
    "MOUSE",
    "KEYBOARD",
    "HEADPHONES",
    "SPEAKERS",
    "CAMERA",
    "GAMING_CONSOLE",
    "ACCESSORY",
    "OTHER",
  ]),
  categoryId: z.string().min(1, "Category is required"),
  brandId: z.string().min(1, "Brand is required"),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  originalPrice: z.coerce.number().optional().nullable(),
  costPrice: z.coerce.number().optional().nullable(),
  stock: z.coerce.number().min(0, "Stock cannot be negative"),
  lowStockThreshold: z.coerce.number().min(0, "Low stock threshold cannot be negative"),
  discount: z.coerce.number().min(0).max(100, "Discount cannot exceed 100%"),
  weight: z.coerce.number().optional().nullable(),
  dimensions: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  condition: z.enum(["NEW", "EXCELLENT", "GOOD", "FAIR", "POOR"]),
  warrantyMonths: z.coerce.number().min(0, "Warranty months cannot be negative"),
  isAvailable: z.boolean(),
  isFeatured: z.boolean(),
  isPreOwned: z.boolean(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
})

type ProductFormData = z.infer<typeof productFormSchema>

export default function ProductsListing({ products, categoryMap, brandMap }: ProductsListingProps) {
  const [productsData, setProductsData] = useState<Product[]>(products)
  const [imageUrl, setImageUrl] = useState("")
  const [previousImageUrl, setPreviousImageUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const router = useRouter()

  useEffect(() => {
    setProductsData(products)
  }, [products])

  // Form setup
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      shortDescription: "",
      type: "OTHER",
      categoryId: "",
      brandId: "",
      price: 0,
      originalPrice: null,
      costPrice: null,
      stock: 0,
      lowStockThreshold: 5,
      discount: 0,
      weight: null,
      dimensions: "",
      color: "",
      condition: "NEW",
      warrantyMonths: 12,
      isAvailable: true,
      isFeatured: false,
      isPreOwned: false,
      metaTitle: "",
      metaDescription: "",
    },
  })

  // Form reset effect
  useEffect(() => {
    if (currentProduct) {
      form.reset({
        name: currentProduct.name,
        description: currentProduct.description || "",
        shortDescription: currentProduct.shortDescription || "",
        type: currentProduct.type,
        categoryId: currentProduct.categoryId,
        brandId: currentProduct.brandId,
        price: Number(currentProduct.price),
        originalPrice: currentProduct.originalPrice ? Number(currentProduct.originalPrice) : undefined,
        costPrice: currentProduct.costPrice ? Number(currentProduct.costPrice) : undefined,
        stock: currentProduct.stock,
        lowStockThreshold: currentProduct.lowStockThreshold,
        discount: currentProduct.discount,
        weight: currentProduct.weight ? Number(currentProduct.weight) : undefined,
        dimensions: currentProduct.dimensions || "",
        color: currentProduct.color || "",
        condition: currentProduct.condition,
        warrantyMonths: currentProduct.warrantyMonths,
        isAvailable: currentProduct.isAvailable,
        isFeatured: currentProduct.isFeatured,
        isPreOwned: currentProduct.isPreOwned,
        metaTitle: currentProduct.metaTitle || "",
        metaDescription: currentProduct.metaDescription || "",
      })
      if (currentProduct.thumbnail) {
        setImageUrl(currentProduct.thumbnail)
        setPreviousImageUrl(currentProduct.thumbnail)
      }
    } else {
      form.reset()
      setImageUrl("")
      setPreviousImageUrl("")
    }
  }, [currentProduct, form])

  const resetFormAndCloseModal = useCallback(() => {
    setCurrentProduct(null)
    setFormDialogOpen(false)
    setImageUrl("")
    setPreviousImageUrl("")
    form.reset()
  }, [form])

  const handleProductClick = (product: Product) => {
    router.push(`/dashboard/products/${product.slug}`)
  }

  // Utility functions
  const formatDate = (date: Date | string | undefined | null) => {
    if (!date) return "N/A"
    try {
      const dateObj = typeof date === "string" ? new Date(date) : date
      if (isNaN(dateObj.getTime())) return "Invalid date"
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

  // Get category display name with hierarchy
  const getCategoryDisplayName = (categoryId: string) => {
    const category = categoryMap[categoryId]
    if (!category) return "Unknown"
    if (category.parentId && category.parent) {
      return `${category.parent.name} → ${category.name}`
    }
    return category.name
  }

  // Export to Excel
  const handleExport = async (filteredProducts: Product[]) => {
    setIsExporting(true)
    try {
      const exportData = filteredProducts.map((product) => ({
        Name: product.name,
        Brand: brandMap[product.brandId]?.name || "Unknown",
        Type: product.type.replace("_", " "),
        Category: getCategoryDisplayName(product.categoryId),
        Price: product.price,
        "Original Price": product.originalPrice || "",
        "Stock Quantity": product.stock,
        Condition: product.condition,
        Status: getStockStatus(product),
        "Date Added": formatDate(product.createdAt),
      }))

      const worksheet = XLSX.utils.json_to_sheet(exportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Products")
      const fileName = `Products_${format(new Date(), "yyyy-MM-dd")}.xlsx`
      XLSX.writeFile(workbook, fileName)
      toast.success("Export successful", {
        description: `Products exported to ${fileName}`,
      })
    } catch (error) {
      toast.error("Export failed", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      })
    } finally {
      setIsExporting(false)
    }
  }

  // Event handlers
  const handleAddClick = () => {
    setCurrentProduct(null)
    setFormDialogOpen(true)
  }

  const handleEditClick = (product: Product) => {
    setCurrentProduct(product)
    setFormDialogOpen(true)
  }

  const handleDeleteClick = (product: Product) => {
    setCurrentProduct(product)
    setProductToDelete(product)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (productToDelete?.id) {
      try {
        // Add your delete mutation here
        // await deleteProductMutation.mutateAsync(productToDelete.id)
        setDeleteDialogOpen(false)
        toast.success("Product deleted successfully")
      } catch (error) {
        console.error("Error deleting product:", error)
        toast.error("Failed to delete product")
      }
    }
  }

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true)
    try {
      if (!currentProduct) {
        // Create new product logic here
        console.log("Creating product:", data)
        toast.success("Product created successfully")
      } else {
        // Update existing product logic here
        console.log("Updating product:", data)
        toast.success("Product updated successfully")
      }
      resetFormAndCloseModal()
    } catch (error) {
      console.error(error)
      const errorMessage = error instanceof Error ? error.message : "Something went wrong. Please try again."
      toast.error("Error", { description: errorMessage })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate total products value
  const getTotalValue = (products: Product[]) => {
    return products.reduce((total, product) => {
      const price = Number(product.price) || 0
      const quantity = product.stock || 0
      return total + price * quantity
    }, 0)
  }

  const truncatedText = (text: string, length: number) => {
    if (text.length > length) {
      return text.slice(0, length) + "..."
    }
    return text
  }

  // Define columns for the data table
  const columns = createProductColumns(categoryMap, handleEditClick, handleDeleteClick)

  // Generate subtitle with total value
  const getSubtitle = (productCount: number, totalValue: number) => {
    return `${productCount} ${productCount === 1 ? "product" : "products"} | Total Value: ${formatCurrency(totalValue)}`
  }

  return (
    <div>
      <DataTable<Product>
        title="Products"
        buttonTitle="Product"
        emptyStateModalTitle="Your Products List is Empty"
        emptyStateModalDescription="Create your first product to get started with your catalog."
        subtitle={productsData?.length > 0 ? getSubtitle(productsData.length, getTotalValue(productsData)) : undefined}
        data={productsData}
        columns={columns}
        keyField="id"
        isLoading={false}
        onRefresh={() => window.location.reload()}
        onRowClick={handleProductClick}
        actions={{
          onAdd: handleAddClick,
          onExport: handleExport,
        }}
        filters={{
          searchFields: ["name"],
          enableDateFilter: true,
          getItemDate: (item) => {
            const date = item.createdAt
            if (typeof date === "string") {
              return new Date(date)
            }
            return date instanceof Date ? date : new Date()
          },
        }}
        renderRowActions={(product) => (
          <div onClick={(e) => e.stopPropagation()}>
            <TableActions.RowActions
              onEdit={() => handleEditClick(product)}
              onDelete={() => handleDeleteClick(product)}
            />
          </div>
        )}
      />

      {/* Product Form Dialog */}
      <EntityForm
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        title={currentProduct ? "Edit Product" : "Add New Product"}
        form={form}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        submitLabel={currentProduct ? "Save Changes" : "Add Product"}
        size="xl"
      >
        <div className="col-span-1 md:col-span-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Product Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    {PRODUCT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    {Object.values(categoryMap).map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="brandId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Brand</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Brand" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    {Object.values(brandMap).map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="condition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Condition</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Condition" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    {PRODUCT_CONDITIONS.map((condition) => (
                      <SelectItem key={condition.value} value={condition.value}>
                        {condition.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <div className="relative">
                  <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="0.00" className="pl-8" {...field} value={field.value ?? ""} />
                </div>
              </FormControl>
              <FormDescription>Enter the selling price in ZAR</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="originalPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Original Price (Optional)</FormLabel>
              <FormControl>
                <div className="relative">
                  <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="0.00" className="pl-8" {...field} value={field.value ?? ""} />
                </div>
              </FormControl>
              <FormDescription>Original/RRP price for comparison</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="costPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cost Price (Optional)</FormLabel>
              <FormControl>
                <div className="relative">
                  <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="0.00" className="pl-8" {...field} value={field.value ?? ""} />
                </div>
              </FormControl>
              {/* <FormDescription>Your cost price for profit calculations</FormDescription> */}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="stock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stock Quantity</FormLabel>
              <FormControl>
                <div className="relative">
                  <Package className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="number" placeholder="0" className="pl-8" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lowStockThreshold"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Low Stock Threshold</FormLabel>
              <FormControl>
                <Input type="number" placeholder="5" {...field} />
              </FormControl>
              <FormDescription className="text-xs truncate">Alert when stock falls below this number</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="discount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Discount (%)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="0" min="0" max="100" {...field} />
              </FormControl>
              <FormDescription className="text-xs">Discount percentage (0-100)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="warrantyMonths"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Warranty (Months)</FormLabel>
              <FormControl>
                <Input type="number" placeholder="12" {...field} />
              </FormControl>
              {/* <FormDescription>Warranty period in months</FormDescription> */}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="weight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weight (kg)</FormLabel>
              <FormControl>
                <div className="relative">
                  <Weight className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-8"
                    {...field}
                    value={field.value ?? ""}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dimensions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dimensions</FormLabel>
              <FormControl>
                <Input placeholder="L x W x H (e.g., 10 x 5 x 2 cm)" {...field} value={field.value ?? ""} />
              </FormControl>
              {/* <FormDescription>Product dimensions in any format</FormDescription> */}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Black, White, Silver" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="col-span-1 md:col-span-2">
          <FormField
            control={form.control}
            name="shortDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Short Description</FormLabel>
                <FormControl>
                  <Input placeholder="Brief description for listings" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="col-span-1 md:col-span-2">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Detailed product description" rows={3} {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="col-span-1 md:col-span-2">
          <FormField
            control={form.control}
            name="metaTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SEO Title (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="SEO optimized title" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormDescription>Title for search engines</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="col-span-1 md:col-span-2">
          <FormField
            control={form.control}
            name="metaDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SEO Description (Optional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="SEO meta description" rows={2} {...field} value={field.value ?? ""} />
                </FormControl>
                <FormDescription>Description for search engines (max 160 characters)</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="col-span-1 md:col-span-2 space-y-4">
          <div className="flex items-center space-x-6">
            <FormField
              control={form.control}
              name="isAvailable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Available for Sale</FormLabel>
                    <FormDescription>Product is available for purchase</FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Featured Product</FormLabel>
                    <FormDescription>Show in featured products section</FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isPreOwned"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Pre-owned</FormLabel>
                    <FormDescription>This is a pre-owned/used product</FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>
      </EntityForm>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Product"
        description={
          productToDelete ? (
            <>
              Are you sure you want to delete <strong className="text-primary">{productToDelete.name}</strong> from your
              catalog?
              <br />
              This action cannot be undone.
            </>
          ) : (
            "Are you sure you want to delete this product?"
          )
        }
        onConfirm={handleConfirmDelete}
        isConfirming={false}
        confirmLabel="Delete"
        variant="destructive"
      />
    </div>
  )
}
