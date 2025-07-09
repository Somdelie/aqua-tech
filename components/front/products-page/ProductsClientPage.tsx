"use client"

import { useState, useMemo } from "react"
import { ProductFilters } from "./ProductFilters"
import { ProductsHero } from "./ProductsHero"
import { transformProduct, type ProductWithRelations } from "@/types/product"
import { ProductsGrid } from './ProductsGrid';



interface ProductsClientPageProps {
  data: {
    products: ProductWithRelations[]
    categories: Array<{ id: string; name: string }>
    brands: Array<{ id: string; name: string }>
  }
}

export default function ProductsClientPage({ data }: ProductsClientPageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000])
  const [sortBy, setSortBy] = useState("newest")

  // Transform products to include calculated discount
  const transformedProducts = useMemo(() => {
    return data.products.map(transformProduct)
  }, [data.products])

  // Memoize filtered products to prevent infinite re-renders
  const filteredProducts = useMemo(() => {
    let filtered = [...transformedProducts]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.brand.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply category filter
    if (selectedCategory) {
      filtered = filtered.filter((product) => product.category.id === selectedCategory)
    }

    // Apply brand filter
    if (selectedBrand) {
      filtered = filtered.filter((product) => product.brand.id === selectedBrand)
    }

    // Apply price range filter
    filtered = filtered.filter((product) => product.price >= priceRange[0] && product.price <= priceRange[1])

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        filtered.sort((a, b) => b.price - a.price)
        break
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "discount":
        filtered.sort((a, b) => b.discount - a.discount)
        break
      case "newest":
      default:
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
    }

    return filtered
  }, [transformedProducts, searchQuery, selectedCategory, selectedBrand, priceRange, sortBy])

  const handleFilterChange = (filters: {
    search: string
    category: string | null
    brand: string | null
    priceRange: [number, number]
    sortBy: string
  }) => {
    setSearchQuery(filters.search)
    setSelectedCategory(filters.category)
    setSelectedBrand(filters.brand)
    setPriceRange(filters.priceRange)
    setSortBy(filters.sortBy)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <ProductsHero />
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="grid lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1">
            <ProductFilters
              categories={data.categories}
              brands={data.brands}
              onFilterChange={handleFilterChange}
              totalProducts={filteredProducts.length}
              initialFilters={{
                search: searchQuery,
                category: selectedCategory,
                brand: selectedBrand,
                priceRange,
                sortBy,
              }}
            />
          </div>
          <div className="lg:col-span-3">
            <ProductsGrid products={filteredProducts} />
          </div>
        </div>
      </div>
    </main>
  )
}
