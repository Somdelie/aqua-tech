import { getProductBySlug } from "@/actions/products-action"
import { getCategories } from "@/actions/categories-action"
import EmptyState from "@/components/global/EmptyState"
import type { Product } from "@prisma/client"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import ProductEditForm from "@/components/dashboard/products/ProductEditForm"

interface ProductWithDetails extends Product {
  category: {
    id: string
    title: string
  }
  variants: {
    id: string
    name: string
    price: number
    stockQuantity: number
  }[]
  attributes: {
    attribute: {
      id: string
      name: string
    }
    value: {
      id: string
      value: string
    }
  }[]
  reviews: {
    id: string
    rating: number
    comment: string | null
    user: {
      name: string
      image: string | null
    }
  }[]
}

interface Category {
  id: string
  name: string
}

interface CategoryOption {
  value: string
  label: string
}

const SingleProductPage = async ({
  params,
}: {
  params: Promise<{ slug: string }>
}) => {
  const productSlug = (await params).slug

  // Handle the union type properly
  const productResult = await getProductBySlug(productSlug)
  const categoriesResult = await getCategories()

  // Check for errors and extract data
  if (productResult.error) {
    return <EmptyState message={productResult.error} />
  }

  if (categoriesResult.error) {
    return <EmptyState message="Failed to load categories" />
  }

  const product = productResult.data
  const categories = categoriesResult.categories

  if (!product) {
    return <EmptyState message="Product not found" />
  }

  const categoryOptions: CategoryOption[] =
    categories?.map((category: Category) => ({
      value: category.id,
      label: category.name,
    })) || []

  return (
    <div className="space-y-2">
      <Link
        href="/dashboard/products"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors mb-2"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Product / Edit</span>
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-primary">{product.name}</h1>
        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="font-medium">Last Updated:</span>
            <span>
              {product.updatedAt
                ? new Date(product.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "N/A"}
            </span>
          </div>
        </div>
      </div>

      <ProductEditForm product={product} categoryOptions={categoryOptions} />
    </div>
  )
}

export default SingleProductPage
