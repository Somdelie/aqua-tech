"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { Product } from "@prisma/client"
import { toast } from "sonner"
import { useProductUpdate } from "@/hooks/useProductQueries"
import { FormCard } from "./form-card"

interface InventoryTabProps {
  product: Product
}

export function InventoryTab({ product }: InventoryTabProps) {
  // Use React Query mutation
  const updateProductMutation = useProductUpdate(product.id)

  // Consolidated state matching your Prisma schema
  const [formState, setFormState] = useState({
    price: product.price || 0,
    originalPrice: product.originalPrice || 0,
    costPrice: product.costPrice || 0,
    stock: product.stock || 0,
    lowStockThreshold: product.lowStockThreshold || 5,
    isAvailable: product.isAvailable ?? true,
    isFeatured: product.isFeatured ?? false,
  })

  // Update form state when product changes (from optimistic updates)
  useEffect(() => {
    setFormState({
      price: product.price || 0,
      originalPrice: product.originalPrice || 0,
      costPrice: product.costPrice || 0,
      stock: product.stock || 0,
      lowStockThreshold: product.lowStockThreshold || 5,
      isAvailable: product.isAvailable ?? true,
      isFeatured: product.isFeatured ?? false,
    })
  }, [product])

  // Generic state update handler
  const updateField = (field: string, value: string | number | boolean) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  // Update handlers using React Query
  const updatePricing = async () => {
    if (formState.price <= 0) {
      toast.error("Price must be greater than 0")
      return
    }
    await updateProductMutation.mutateAsync({
      price: formState.price,
      originalPrice: formState.originalPrice || null,
      costPrice: formState.costPrice || null,
    })
  }

  const updateInventory = async () => {
    if (formState.stock < 0) {
      toast.error("Stock quantity cannot be negative")
      return
    }
    await updateProductMutation.mutateAsync({
      stock: formState.stock,
      lowStockThreshold: formState.lowStockThreshold,
      isAvailable: formState.isAvailable,
    })
  }

  const updateProductSettings = async () => {
    await updateProductMutation.mutateAsync({
      isAvailable: formState.isAvailable,
      isFeatured: formState.isFeatured,
    })
  }

  return (
    <div className="grid gap-6">
      {/* Pricing Card */}
      <FormCard
        title="Product Pricing"
        onSubmit={updatePricing}
        buttonText="Update Pricing"
      >
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="price">Selling Price (R)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formState.price}
              onChange={(e) => updateField("price", Number.parseFloat(e.target.value) || 0)}
              disabled={updateProductMutation.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="originalPrice">Original Price (R)</Label>
            <Input
              id="originalPrice"
              type="number"
              step="0.01"
              min="0"
              value={formState.originalPrice}
              onChange={(e) => updateField("originalPrice", Number.parseFloat(e.target.value) || 0)}
              placeholder="Original price for sales"
              disabled={updateProductMutation.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="costPrice">Cost Price (R)</Label>
            <Input
              id="costPrice"
              type="number"
              step="0.01"
              min="0"
              value={formState.costPrice}
              onChange={(e) => updateField("costPrice", Number.parseFloat(e.target.value) || 0)}
              placeholder="Your cost"
              disabled={updateProductMutation.isPending}
            />
          </div>
        </div>
      </FormCard>

      {/* Inventory Card */}
      <FormCard
        title="Inventory Management"
        onSubmit={updateInventory}
        buttonText="Update Inventory"
      >
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formState.stock}
                onChange={(e) => updateField("stock", Number.parseInt(e.target.value) || 0)}
                disabled={updateProductMutation.isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
              <Input
                id="lowStockThreshold"
                type="number"
                min="0"
                value={formState.lowStockThreshold}
                onChange={(e) => updateField("lowStockThreshold", Number.parseInt(e.target.value) || 0)}
                placeholder="Alert when stock is below this number"
                disabled={updateProductMutation.isPending}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="isAvailable"
              checked={formState.isAvailable}
              onCheckedChange={(checked) => updateField("isAvailable", checked)}
              disabled={updateProductMutation.isPending}
            />
            <Label htmlFor="isAvailable">Product Available for Sale</Label>
          </div>
        </div>
      </FormCard>

      {/* Product Settings Card */}
      <FormCard
        title="Product Settings"
        onSubmit={updateProductSettings}
        buttonText="Update Settings"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="isAvailable"
              checked={formState.isAvailable}
              onCheckedChange={(checked) => updateField("isAvailable", checked)}
              disabled={updateProductMutation.isPending}
            />
            <Label htmlFor="isAvailable">Available for Purchase</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="isFeatured"
              checked={formState.isFeatured}
              onCheckedChange={(checked) => updateField("isFeatured", checked)}
              disabled={updateProductMutation.isPending}
            />
            <Label htmlFor="isFeatured">Featured Product</Label>
          </div>
        </div>
      </FormCard>
    </div>
  )
}
