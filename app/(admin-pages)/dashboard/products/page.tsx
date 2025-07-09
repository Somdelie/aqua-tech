import ProductsListing from "@/components/dashboard/products/ProductsListing";
import { getProducts } from "@/actions/products-action";

export default async function ProductsPage() {
  const response = await getProducts()
  
  // Handle error case
  if (response.error || !response.data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-red-600">Error Loading Products</h2>
          <p className="text-gray-600 mt-2">{response.error || "Failed to load products"}</p>
        </div>
      </div>
    )
  }

  const { products, categories, brands } = response.data

  // Create category map for ProductsListing
  const categoryMap = (categories || []).reduce(
    (acc, category) => {
      acc[category.id] = {
        id: category.id,
        name: category.name,
        parentId: category.parentId ?? undefined,
        parent: category.parent ? { name: category.parent.name } : undefined,
      }
      return acc
    },
    {} as Record<string, { id: string; name: string; parentId?: string; parent?: { name: string } }>,
  )

  // Create brand map for ProductsListing
  const brandMap = (brands || []).reduce(
    (acc, brand) => {
      acc[brand.id] = {
        id: brand.id,
        name: brand.name,
      }
      return acc
    },
    {} as Record<string, { id: string; name: string }>,
  )

  return <ProductsListing products={products} categoryMap={categoryMap} brandMap={brandMap} />
}
