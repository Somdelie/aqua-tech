import type { Metadata } from "next"
import { Suspense } from "react"
import { ProductsPageSkeleton } from "@/components/front/products-page/ProductsPageSkeleton"
import ProductsClientPage from '@/components/front/products-page/ProductsClientPage';
import { getProducts } from '@/actions/products-action';

export const metadata: Metadata = {
  title: "Quality Second-Hand Devices | Aquatech Computer Repairs",
  description:
    "Browse our selection of quality second-hand phones, computers, tablets, and accessories. All devices tested and guaranteed with warranty.",
  keywords: [
    "second-hand phones",
    "used computers",
    "refurbished devices",
    "affordable phones",
    "quality laptops",
    "South Africa",
    "warranty",
  ],
}

export default async function ProductsPage() {
  const result = await getProducts()
  // console.log("Fetched products:", result)

  // Handle error case
  if (result.error || !result.data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Products</h1>
          <p className="text-gray-600">{result.error || "Failed to load products"}</p>
        </div>
      </div>
    )
  }

  return (
    <Suspense fallback={<ProductsPageSkeleton />}>
      <ProductsClientPage data={result.data} />
    </Suspense>
  )
}

