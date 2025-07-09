import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Edit, Trash2, Eye, Package, DollarSign, Calendar, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { calculateDiscountPercentage, calculateSavingsAmount } from "@/lib/calculateDiscount"

interface ProductDetailsProps {
  product: {
    data: any
    error: string | null
  }
}

const ProductDetails = ({ product }: ProductDetailsProps) => {
  if (product.error || !product.data) {
    return (
      <Card className="w-full">
        <CardContent className="text-center">
          <AlertTriangle className="h-8 w-8 sm:h-12 sm:w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-lg sm:text-xl font-semibold mb-2">Product Not Found</h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-4">
            {product.error || "The requested product could not be found."}
          </p>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/dashboard/products">Back to Products</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const productData = product.data
  const discount = calculateDiscountPercentage(productData.originalPrice, productData.price)
  const savings = calculateSavingsAmount(productData.originalPrice, productData.price)

  const getStockStatus = () => {
    if (productData.stock === 0) {
      return { icon: XCircle, color: "text-red-500", bg: "bg-red-50", text: "Out of Stock" }
    } else if (productData.stock <= productData.lowStockThreshold) {
      return { icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-50", text: "Low Stock" }
    } else {
      return { icon: CheckCircle, color: "text-green-500", bg: "bg-green-50", text: "In Stock" }
    }
  }

  const stockStatus = getStockStatus()
  const StockIcon = stockStatus.icon

  const getConditionColor = (condition: string) => {
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

  return (
    <div className="w-full mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold break-words">{productData.name}</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 break-all">Product ID: {productData.id}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          <Button variant="outline" asChild size="sm" className="w-full sm:w-auto bg-transparent">
            <Link href={`/products/${productData.slug}`}>
              <Eye className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">View Live</span>
              <span className="sm:hidden">Live</span>
            </Link>
          </Button>
          <Button variant="outline" asChild size="sm" className="w-full sm:w-auto bg-transparent">
            <Link href={`/dashboard/products/${productData.slug}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" size="sm" className="w-full sm:w-auto">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Product Info */}
        <div className="xl:col-span-2 space-y-4 sm:space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5 shrink-0" />
                Product Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="min-w-0">
                  <label className="text-sm font-medium text-muted-foreground">Product Name</label>
                  <p className="font-medium break-words">{productData.name}</p>
                </div>
                <div className="min-w-0">
                  <label className="text-sm font-medium text-muted-foreground">Slug</label>
                  <p className="font-mono text-sm break-all">{productData.slug}</p>
                </div>
              </div>

              <div className="min-w-0">
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="mt-1 break-words">{productData.description || "No description provided"}</p>
              </div>

              <div className="min-w-0">
                <label className="text-sm font-medium text-muted-foreground">Short Description</label>
                <p className="mt-1 break-words">{productData.shortDescription || "No short description provided"}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="min-w-0">
                  <label className="text-sm font-medium text-muted-foreground">Category</label>
                  <p className="font-medium break-words">{productData.category.name}</p>
                </div>
                <div className="min-w-0">
                  <label className="text-sm font-medium text-muted-foreground">Brand</label>
                  <p className="font-medium break-words">{productData.brand.name}</p>
                </div>
                <div className="min-w-0">
                  <label className="text-sm font-medium text-muted-foreground">Type</label>
                  <Badge variant="secondary" className="text-xs">
                    {productData.type}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5 shrink-0" />
                Pricing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="min-w-0">
                  <label className="text-sm font-medium text-muted-foreground">Selling Price</label>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 break-words">
                    R{productData.price.toLocaleString()}
                  </p>
                </div>
                <div className="min-w-0">
                  <label className="text-sm font-medium text-muted-foreground">Original Price</label>
                  <p className="text-sm sm:text-base lg:text-lg font-medium break-words">
                    {productData.originalPrice ? `R${productData.originalPrice.toLocaleString()}` : "Not set"}
                  </p>
                </div>
                <div className="min-w-0">
                  <label className="text-sm font-medium text-muted-foreground">Cost Price</label>
                  <p className="text-sm sm:text-base lg:text-lg font-medium break-words">
                    {productData.costPrice ? `R${productData.costPrice.toLocaleString()}` : "Not set"}
                  </p>
                </div>
                <div className="min-w-0">
                  <label className="text-sm font-medium text-muted-foreground">Profit Margin</label>
                  <p className="text-sm sm:text-base lg:text-lg font-medium text-blue-600 break-words">
                    {productData.costPrice
                      ? `${(((productData.price - productData.costPrice) / productData.price) * 100).toFixed(1)}%`
                      : "N/A"}
                  </p>
                </div>
              </div>

              {discount > 0 && (
                <div className="mt-4 p-3 sm:p-4 bg-red-50 rounded-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <Badge className="bg-red-500 text-white w-fit">-{discount.toFixed(1)}%</Badge>
                    <span className="text-sm text-red-600 font-medium break-words">
                      Customers save R{savings.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product Images */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Product Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {productData.thumbnail && (
                  <div className="relative aspect-square">
                    <Image
                      src={productData.thumbnail || "/placeholder.svg"}
                      alt="Product thumbnail"
                      fill
                      className="object-cover rounded-lg border"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    <Badge className="absolute top-1 left-1 bg-blue-500 text-xs">Thumbnail</Badge>
                  </div>
                )}
                {productData.images.map((image: string, index: number) => (
                  <div key={index} className="relative aspect-square">
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`Product image ${index + 1}`}
                      fill
                      className="object-cover rounded-lg border"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </div>
                ))}
                {!productData.thumbnail && productData.images.length === 0 && (
                  <div className="col-span-full text-center py-6 sm:py-8 text-muted-foreground text-sm sm:text-base">
                    No images uploaded
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Specifications */}
          {productData.specifications && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {Object.entries(productData.specifications).map(([key, value]) => (
                    <div key={key} className="min-w-0">
                      <label className="text-sm font-medium text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}
                      </label>
                      <p className="font-medium break-words">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`flex items-center gap-2 p-3 rounded-lg ${stockStatus.bg}`}>
                <StockIcon className={`h-5 w-5 shrink-0 ${stockStatus.color}`} />
                <span className={`font-medium ${stockStatus.color} break-words`}>{stockStatus.text}</span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-sm text-muted-foreground">Available</span>
                  <Badge variant={productData.isAvailable ? "default" : "destructive"} className="text-xs">
                    {productData.isAvailable ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-sm text-muted-foreground">Featured</span>
                  <Badge variant={productData.isFeatured ? "default" : "secondary"} className="text-xs">
                    {productData.isFeatured ? "Yes" : "No"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-sm text-muted-foreground">Pre-owned</span>
                  <Badge variant={productData.isPreOwned ? "default" : "secondary"} className="text-xs">
                    {productData.isPreOwned ? "Yes" : "No"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inventory */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="h-5 w-5 shrink-0" />
                Inventory
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Current Stock</label>
                <p className="text-xl sm:text-2xl font-bold">{productData.stock}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Low Stock Threshold</label>
                <p className="font-medium">{productData.lowStockThreshold}</p>
              </div>
              <Separator />
              <div>
                <label className="text-sm font-medium text-muted-foreground">Condition</label>
                <div className="mt-1">
                  <Badge className={`${getConditionColor(productData.condition)} text-xs`}>
                    {productData.condition}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Warranty</label>
                <p className="font-medium">{productData.warrantyMonths} months</p>
              </div>
            </CardContent>
          </Card>

          {/* Physical Properties */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Physical Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="min-w-0">
                <label className="text-sm font-medium text-muted-foreground">Weight</label>
                <p className="font-medium break-words">
                  {productData.weight ? `${productData.weight}kg` : "Not specified"}
                </p>
              </div>
              <div className="min-w-0">
                <label className="text-sm font-medium text-muted-foreground">Dimensions</label>
                <p className="font-medium break-words">{productData.dimensions || "Not specified"}</p>
              </div>
              <div className="min-w-0">
                <label className="text-sm font-medium text-muted-foreground">Color</label>
                <p className="font-medium break-words">{productData.color || "Not specified"}</p>
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="min-w-0">
                <label className="text-sm font-medium text-muted-foreground">Meta Title</label>
                <p className="text-sm break-words">{productData.metaTitle || "Not set"}</p>
              </div>
              <div className="min-w-0">
                <label className="text-sm font-medium text-muted-foreground">Meta Description</label>
                <p className="text-sm break-words">{productData.metaDescription || "Not set"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 shrink-0" />
                Timestamps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="min-w-0">
                <label className="text-sm font-medium text-muted-foreground">Created</label>
                <p className="text-sm break-words">{new Date(productData.createdAt).toLocaleString()}</p>
              </div>
              <div className="min-w-0">
                <label className="text-sm font-medium text-muted-foreground">Updated</label>
                <p className="text-sm break-words">{new Date(productData.updatedAt).toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ProductDetails
