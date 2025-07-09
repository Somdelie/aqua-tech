"use client"

import { useState } from "react"
import { updateProductPartial } from "@/actions/products-action"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { FormCard } from "./form-card"
import { ImageInput } from "../../forms/ImageInput"
import MultipleImageInput from "../../forms/MultipleImageInput"

interface ImagesTabProps {
  product: any
}

export function ImagesTab({ product }: ImagesTabProps) {
  const router = useRouter()
  const [thumbnail, setThumbnail] = useState(product.thumbnail || "")
  const [images, setImages] = useState(product.images || [])

  const handleThumbnailUpdate = async (): Promise<string | void> => {
    try {
      const result = await updateProductPartial(product.id, { thumbnail })
      if (result.error) {
        toast.error(result.error)
        throw new Error(result.error)
      } else {
        router.refresh()
        return "Thumbnail updated successfully"
      }
    } catch (error) {
      toast.error("Failed to update thumbnail")
      throw error
    }
  }

  const handleImagesUpdate = async (): Promise<string | void> => {
    try {
      const result = await updateProductPartial(product.id, { images })
      if (result.error) {
        toast.error(result.error)
        throw new Error(result.error)
      } else {
        router.refresh()
        return "Product images updated successfully"
      }
    } catch (error) {
      toast.error("Failed to update images")
      throw error
    }
  }

  return (
    <div className="space-y-6">
      <FormCard title="Product Thumbnail" onSubmit={handleThumbnailUpdate} buttonText="Update Thumbnail">
        <ImageInput
          title="Main Product Image"
          imageUrl={thumbnail}
          setImageUrl={setThumbnail}
          endpoint="productImage"
        />
      </FormCard>

      <FormCard title="Additional Images" onSubmit={handleImagesUpdate} buttonText="Update Images">
        <MultipleImageInput
          title="Product Gallery"
          imageUrls={images}
          setImageUrls={setImages}
          endpoint="productImages"
          productId={product.id}
        />
      </FormCard>
    </div>
  )
}
