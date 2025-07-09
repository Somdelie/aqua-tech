"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { updateProductPartial } from "@/actions/products-action"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface PricingTabProps {
  product: any
}

export function PricingTab({ product }: PricingTabProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    price: product.price || 0,
    originalPrice: product.originalPrice || 0,
    costPrice: product.costPrice || 0,
    stock: product.stock || 0,
    lowStockThreshold: product.lowStockThreshold || 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Convert string values to numbers
      const numericData = {
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
        costPrice: formData.costPrice ? Number(formData.costPrice) : null,
        stock: Number(formData.stock),
        lowStockThreshold: Number(formData.lowStockThreshold),
      }

      const result = await updateProductPartial(product.id, numericData)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Pricing updated successfully")
        router.refresh()
      }
    } catch (error) {
      toast.error("Failed to update pricing")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="price">Price *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number.parseFloat(e.target.value) || 0 })}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="originalPrice">Original Price</Label>
            <Input
              id="originalPrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.originalPrice}
              onChange={(e) => setFormData({ ...formData, originalPrice: Number.parseFloat(e.target.value) || 0 })}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="costPrice">Cost Price</Label>
            <Input
              id="costPrice"
              type="number"
              step="0.01"
              min="0"
              value={formData.costPrice}
              onChange={(e) => setFormData({ ...formData, costPrice: Number.parseFloat(e.target.value) || 0 })}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="stock">Stock Quantity *</Label>
            <Input
              id="stock"
              type="number"
              min="0"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: Number.parseInt(e.target.value) || 0 })}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
            <Input
              id="lowStockThreshold"
              type="number"
              min="0"
              value={formData.lowStockThreshold}
              onChange={(e) => setFormData({ ...formData, lowStockThreshold: Number.parseInt(e.target.value) || 0 })}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Updating..." : "Update Pricing"}
        </Button>
      </div>
    </form>
  )
}
