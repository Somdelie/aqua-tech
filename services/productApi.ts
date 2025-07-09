import { ProductCreateData, ProductMutationData } from '../types/product';

import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/actions/products-action"

// Centralized API object for all product-related server actions
export const productAPI = {
  // Fetch all products
  getAllProducts: async () => {
    const response = await getAllProducts()
    if (response.error) {
      throw new Error(response.error)
    }
    return response.data || []
  },

  // Get single product by ID or slug
  getById: async (identifier: string) => {
    const product = await getProductById(identifier)
    if (!product) {
      throw new Error("Product not found")
    }
    return product
  },

  // Create a new product
  create: async (data: ProductCreateData) => {
    const response = await createProduct(data)
    if (response.status === 200) {
      return response.data
    } else {
      throw new Error(response.message || "Failed to create product")
    }
  },

  // Update an existing product - Now uses ProductMutationData
  update: async (id: string, data: ProductMutationData) => {
    const response = await updateProduct(id, data)
    if (response.error) {
      throw new Error(response.error || "Failed to update product")
    }
    return response.data
  },

  // Delete a product
  delete: async (id: string) => {
    const response = await deleteProduct(id)
    if (response?.error ) {
      throw new Error(response?.error || "Failed to delete product")
    }
    return response
  },
}
