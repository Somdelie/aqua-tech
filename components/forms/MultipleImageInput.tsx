"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UploadButton } from "@/lib/uploadthing"
import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, Trash2, Upload, ImageIcon } from "lucide-react"
import { toast } from "sonner"
import { updateProductPartial } from "@/actions/products-action"

type ImageInputProps = {
  title: string
  imageUrls: string[]
  setImageUrls: (urls: string[]) => void
  endpoint: any
  productId?: string
  item?: any
  maxImages?: number
}

export default function MultipleImageInput({
  title,
  imageUrls,
  setImageUrls,
  endpoint,
  productId,
  item,
  maxImages = 4,
}: ImageInputProps) {
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const remainingSlots = maxImages - imageUrls.length

  const getFileKeyFromUrl = (url: string) => {
    try {
      const urlParts = url.split("/")
      return urlParts[urlParts.length - 1]
    } catch (error) {
      console.error("Failed to extract file key:", error)
      return null
    }
  }

  const handleDeleteImage = async (imageUrl: string, index: number) => {
    try {
      setDeletingIndex(index)
      const fileKey = getFileKeyFromUrl(imageUrl)

      if (!fileKey) {
        toast.error("Could not identify file key for deletion")
        return
      }

      const response = await fetch("/api/uploadthing/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileKey }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete file")
      }

      const updatedUrls = imageUrls.filter((_, i) => i !== index)
      setImageUrls(updatedUrls)

      if (productId) {
        const result = await updateProductPartial(productId, {
          images: updatedUrls,
        })

        if (result.error) {
          toast.error(result.error)
          setImageUrls(imageUrls)
          return
        }
      }

      toast.success("Image deleted successfully")
    } catch (error) {
      console.error("Error deleting image:", error)
      toast.error("Failed to delete image")
      setImageUrls(imageUrls)
    } finally {
      setDeletingIndex(null)
    }
  }

  const getRemainingMessage = () => {
    if (remainingSlots === 0) {
      return "Maximum images reached"
    } else if (remainingSlots === 1) {
      return "Add 1 more image"
    } else {
      return `Add up to ${remainingSlots} more images`
    }
  }

  return (
    <Card className="overflow-hidden">
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {/* Image Grid */}
        {imageUrls.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {imageUrls.map((imageUrl: string, i: number) => (
              <div
                key={i}
                className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm group hover:shadow-md transition-all duration-200"
              >
                <Image
                  alt={`Product image ${i + 1}`}
                  className="object-cover transition-transform group-hover:scale-105"
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  src={imageUrl || "/placeholder.svg"}
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=200&width=200"
                  }}
                />

                {/* Delete button overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
                  <Button
                    variant="destructive"
                    size="icon"
                    type="button"
                    onClick={() => handleDeleteImage(imageUrl, i)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8"
                    disabled={deletingIndex === i}
                    aria-label={`Delete image ${i + 1}`}
                  >
                    {deletingIndex === i ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Image number indicator */}
                <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">{i + 1}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50/50">
            <div className="bg-gray-100 p-4 rounded-full mb-4">
              <ImageIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No images yet</h3>
            <p className="text-sm text-gray-500 text-center max-w-sm">
              Upload your first image to get started. You can add up to {maxImages} images.
            </p>
          </div>
        )}

        {/* Upload Section */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center">
            {/* Upload Icon */}
            <div className="bg-green-600 text-white p-2 rounded-l">
              <Upload className="h-6 w-6" />
            </div>

            {/* Upload Button or Disabled State */}
            {remainingSlots <= 0 ? (
              <Button disabled className="bg-gray-400 text-white">
                Maximum reached
              </Button>
            ) : (
              <div className="relative">
                <UploadButton
                  endpoint={endpoint}
                  onUploadBegin={() => {
                    setIsUploading(true)
                    toast.loading("Uploading images...")
                  }}
                  onClientUploadComplete={async (res) => {
                    setIsUploading(false)
                    toast.dismiss()

                    const newUrls = res.map((item) => item.url)
                    const combinedUrls = [...imageUrls, ...newUrls].slice(0, maxImages)
                    setImageUrls(combinedUrls)

                    if (productId) {
                      try {
                        const result = await updateProductPartial(productId, {
                          images: combinedUrls,
                        })

                        if (result.error) {
                          toast.error(result.error)
                          setImageUrls(imageUrls)
                        } else {
                          toast.success(`${newUrls.length} image(s) uploaded successfully`)
                        }
                      } catch (error) {
                        console.error("Error updating item:", error)
                        toast.error("Failed to update item with new images")
                        setImageUrls(imageUrls)
                      }
                    } else {
                      toast.success(`${newUrls.length} image(s) uploaded successfully`)
                    }
                  }}
                  onUploadError={(error: Error) => {
                    setIsUploading(false)
                    toast.dismiss()
                    toast.error(`Upload error: ${error.message}`)
                  }}
                  appearance={{
                    button: "bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-r rounded-l-none font-medium text-sm",
                    allowedContent: "hidden",
                  }}
                  content={{
                    button: "Choose File(s)",
                    allowedContent: "",
                  }}
                />
              </div>
            )}
          </div>

          {/* Status message */}
          <div className="text-right">
            <p className="text-sm text-gray-500">{getRemainingMessage()}</p>
            <p className="text-xs text-gray-400">
              {imageUrls.length}/{maxImages} images
            </p>
          </div>
        </div>


        {/* Loading state overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span className="text-sm font-medium">Uploading...</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
