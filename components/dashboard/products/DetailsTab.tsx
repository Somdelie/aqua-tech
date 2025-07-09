"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import Image from "next/image"
import { ImageIcon, Loader2, X } from "lucide-react"
import type { Product, ProductType } from "@prisma/client"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useProductUpdate } from "@/hooks/useProductQueries"
import { FormCard } from './form-card';
import MultipleImageInput from '../../forms/MultipleImageInput';
import { ImageInput } from '../../forms/ImageInput';

interface DetailsTabProps {
  product: Product
}

export function DetailsTab({ product }: DetailsTabProps) {
  // Enable built-in toasts by removing showToast: false
  const updateProductMutation = useProductUpdate(product.id)

  // Consolidated state matching the actual schema
  const [formState, setFormState] = useState({
    type: product.type || "MOBILE_PHONE",
    weight: product.weight || 0,
    dimensions: product.dimensions || "",
    color: product.color || "",
    thumbnail: product.thumbnail || "",
    images: product.images || [],
  })

  const [imageUrl, setImageUrl] = useState(product.thumbnail || "")
  const [images, setImages] = useState(product.images || [])
  const [showPreview, setShowPreview] = useState(false)
  const [newUploadUrl, setNewUploadUrl] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  // Check if there's a new image different from the current thumbnail
  useEffect(() => {
    if (imageUrl && imageUrl !== product.thumbnail) {
      setShowPreview(true)
      if (imageUrl !== newUploadUrl) {
        setNewUploadUrl(imageUrl)
      }
    } else {
      setShowPreview(false)
    }
  }, [imageUrl, product.thumbnail, newUploadUrl])

  // Generic state update handler
  const updateField = (field: string, value: any) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  // Simplified update handlers - let React Query handle toasts
  const updateProductType = async () => {
    await updateProductMutation.mutateAsync({
      type: formState.type as ProductType,
    })
  }

  const updatePhysicalAttributes = async () => {
    await updateProductMutation.mutateAsync({
      weight: formState.weight,
      dimensions: formState.dimensions,
      color: formState.color,
    })
  }

  const updateThumbnail = async () => {
    // No changes to make if the thumbnail hasn't changed
    if (imageUrl === product.thumbnail) {
      return
    }
    await updateProductMutation.mutateAsync({
      thumbnail: imageUrl,
    })
    // Reset preview state after successful update
    setShowPreview(false)
    setNewUploadUrl("")
  }

  const handleMultipleImageUpload = async () => {
    await updateProductMutation.mutateAsync({
      images: images,
    })
    // Reset preview state after successful update
    setShowPreview(false)
    setNewUploadUrl("")
  }

  // Cancel preview with file deletion
  const cancelImagePreview = async () => {
    setIsDeleting(true)
    try {
      setImageUrl(product.thumbnail || "")
      setShowPreview(false)
      setNewUploadUrl("")
    } catch (error) {
      console.error("Failed to cancel preview:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  // Custom handler for the image URL change
  const handleImageUrlChange = (url: string) => {
    console.log("New image URL received:", url)
    setImageUrl(url)
  }

  return (
    <div className="grid gap-6">
      {/* Product Type Card */}
      <FormCard
        title="Product Type"
        onSubmit={updateProductType}
        buttonText="Update Product Type"
      >
        <div className="space-y-2">
          <Label htmlFor="type">Product Type</Label>
          <Select
            value={formState.type}
            onValueChange={(value) => updateField("type", value)}
            disabled={updateProductMutation.isPending}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select product type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Product Types</SelectLabel>
                <SelectItem value="MOBILE_PHONE">Mobile Phone</SelectItem>
                <SelectItem value="TABLET">Tablet</SelectItem>
                <SelectItem value="LAPTOP">Laptop</SelectItem>
                <SelectItem value="DESKTOP">Desktop</SelectItem>
                <SelectItem value="MONITOR">Monitor</SelectItem>
                <SelectItem value="TV">TV</SelectItem>
                <SelectItem value="TV_BOX">TV Box</SelectItem>
                <SelectItem value="SMARTWATCH">Smartwatch</SelectItem>
                <SelectItem value="ROUTER">Router</SelectItem>
                <SelectItem value="CHARGER">Charger</SelectItem>
                <SelectItem value="MOUSE">Mouse</SelectItem>
                <SelectItem value="KEYBOARD">Keyboard</SelectItem>
                <SelectItem value="HEADPHONES">Headphones</SelectItem>
                <SelectItem value="SPEAKERS">Speakers</SelectItem>
                <SelectItem value="CAMERA">Camera</SelectItem>
                <SelectItem value="GAMING_CONSOLE">Gaming Console</SelectItem>
                <SelectItem value="ACCESSORY">Accessory</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </FormCard>

      {/* Physical Attributes Card */}
      <FormCard
        title="Physical Attributes"
        onSubmit={updatePhysicalAttributes}
        buttonText="Update Physical Attributes"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              step="0.01"
              min="0"
              value={formState.weight || ""}
              onChange={(e) => updateField("weight", Number.parseFloat(e.target.value) || 0)}
              placeholder="e.g., 0.5"
              disabled={updateProductMutation.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <Input
              id="color"
              type="text"
              value={formState.color || ""}
              onChange={(e) => updateField("color", e.target.value)}
              placeholder="e.g., Black, Silver, Blue"
              disabled={updateProductMutation.isPending}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="dimensions">Dimensions</Label>
          <Textarea
            id="dimensions"
            value={formState.dimensions || ""}
            onChange={(e) => updateField("dimensions", e.target.value)}
            placeholder="e.g., 150mm x 75mm x 8mm or Length: 1200mm, Width: 800mm, Height: 1000mm"
            disabled={updateProductMutation.isPending}
            rows={3}
          />
        </div>
      </FormCard>

      {/* Thumbnail Card */}
      <FormCard
        title="Item Thumbnail"
        onSubmit={updateThumbnail}
        buttonText="Update Thumbnail"
      >
        <div className="grid md:flex gap-6 items-start">
          {/* Current thumbnail */}
          <div className="">
            <h3 className="text-sm font-medium mb-2">Current Thumbnail</h3>
            {product?.thumbnail ? (
              <div className="relative">
                <Image
                  width={100}
                  height={100}
                  src={product?.thumbnail || "/placeholder.svg"}
                  alt="Item thumbnail"
                  className="w-24 h-24 md:w-56 md:h-56 object-cover rounded border shadow-sm"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.jpg"
                    console.error("Failed to load thumbnail image")
                  }}
                />
              </div>
            ) : (
              <div className="border-2 border-dashed border-primary/20 rounded-lg p-8 flex flex-col items-center justify-center">
                <div className="bg-primary/10 p-4 rounded-full mb-4">
                  <ImageIcon className="h-10 w-10 text-primary" />
                </div>
                <p className="text-base font-medium text-center mb-1">Upload an image</p>
              </div>
            )}
          </div>
          {/* Upload + Preview section */}
          <div className="">
            <h3 className="text-sm font-medium mb-2">Upload New Image</h3>
            {/* Image uploader */}
            <ImageInput title="" imageUrl={imageUrl} setImageUrl={handleImageUrlChange} endpoint="itemImage" />
            {/* Preview appears below the uploader */}
            {showPreview && (
              <div className="mt-2">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-amber-600">Preview - Thumbnail will change to:</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={cancelImagePreview}
                    className="h-6 w-6 p-0 rounded-full bg-primary text-white hover:opacity-80 hover:bg-primary ml-1"
                    disabled={updateProductMutation.isPending}
                  >
                    {isDeleting ? <Loader2 className="animate-spin h-4 w-4" /> : <X className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="border border-dashed border-amber-400 rounded p-2 bg-amber-50">
                  <Image
                    width={100}
                    height={100}
                    src={imageUrl || "/placeholder.svg"}
                    alt="New thumbnail preview"
                    className="w-20 h-20 object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.jpg"
                      console.error("Failed to load preview image")
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </FormCard>

      {/* Multiple Images Card */}
      <FormCard
        title="Current Product Images"
        onSubmit={handleMultipleImageUpload}
        buttonText="Update Additional Images"
      >
        <MultipleImageInput
          title=""
          imageUrls={images}
          setImageUrls={setImages}
          endpoint="itemImages"
          productId={product.id}
        />
      </FormCard>
    </div>
  )
}
