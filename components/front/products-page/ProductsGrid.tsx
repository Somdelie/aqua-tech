"use client"

import { motion } from "framer-motion"
import type { Product } from "@/types/product"
import { ProductCard } from './ProductCard';


interface ProductsGridProps {
  products: Product[]
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export function ProductsGrid({ products }: ProductsGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-2xl font-semibold mb-4">No products found</h3>
        <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </motion.div>
  )
}
