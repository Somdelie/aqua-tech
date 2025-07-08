
import ProductsListing from "@/components/dashboard/products/ProductsListing";
import { getProducts } from "@/actions/products-action";

export default async function ProductsPage() {
  const { products, categories, brands } = await getProducts()

  // Create category map for ProductsListing
  const categoryMap = (categories || []).reduce(
    (acc, category) => {
      acc[category.id] = {
        id: category.id,
        name: category.name, // Remove the duplicate || category.name
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
