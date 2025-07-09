import { productAPI } from "@/services/productApi"
import type { ProductCreateData, ProductMutationData } from "@/types/product"
import { useQuery, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query"
import { toast } from "sonner"

// Query keys for caching
export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (filters: any) => [...productKeys.lists(), { filters }] as const,
  filteredList: (dateFilter: any, searchQuery: string) =>
    [...productKeys.lists(), { dateFilter, searchQuery }] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
}

interface CreateProductOptions {
  onSuccess?: () => void
}

// Get all products with regular query
export function useProducts() {
  const {
    data: products = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: productKeys.lists(),
    queryFn: () => productAPI.getAllProducts(),
  })

  return {
    products,
    isLoading,
    isError,
    error,
    refetch,
  }
}

// Get products with suspense
export function useProductsSuspense() {
  const { data: products = [], refetch } = useSuspenseQuery({
    queryKey: productKeys.lists(),
    queryFn: () => productAPI.getAllProducts(),
  })

  return {
    products,
    refetch,
  }
}

// Get single product by ID or slug
export function useProduct(identifier: string, enabled = true) {
  const {
    data: product,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: productKeys.detail(identifier),
    queryFn: () => productAPI.getById(identifier),
    enabled: enabled && !!identifier,
    // Prevent automatic refetching that could cause 404s during slug updates
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 30000, // Consider data fresh for 30 seconds
  })

  return {
    product,
    isLoading,
    isError,
    error,
    refetch,
  }
}

// Get single product with suspense
export function useProductSuspense(identifier: string) {
  const { data: product, refetch } = useSuspenseQuery({
    queryKey: productKeys.detail(identifier),
    queryFn: () => productAPI.getById(identifier),
  })

  return {
    product,
    refetch,
  }
}

// Create product mutation
export function useCreateProduct(options: CreateProductOptions = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ProductCreateData) => productAPI.create(data),
    onSuccess: () => {
      toast.success("Product added successfully", {
        description: "The product has been added to your catalog.",
        style: {
          backgroundColor: "green",
          color: "#fff",
        },
      })

      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: productKeys.lists(),
      })

      // Call custom onSuccess handler if provided
      if (options.onSuccess) {
        options.onSuccess()
      }
    },
    onError: (error: Error) => {
      toast.error(error.message, {
        style: {
          backgroundColor: "red",
          color: "white",
        },
      })
    },
  })
}

// Delete product mutation
export function useProductDelete(id?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (productId: string) => productAPI.delete(productId),
    onSuccess: () => {
      toast.success("Product deleted successfully", {
        description: "The product has been removed from your catalog.",
        style: {
          backgroundColor: "green",
          color: "#fff",
        },
      })

      // Invalidate specific product queries
      if (id) {
        queryClient.invalidateQueries({
          queryKey: productKeys.detail(id),
        })
      }

      // Always invalidate the lists
      queryClient.invalidateQueries({
        queryKey: productKeys.lists(),
      })
    },
    onError: (error: Error) => {
      toast.error(error.message, {
        style: {
          backgroundColor: "red",
          color: "white",
        },
      })
    },
  })
}

// Update product mutation with better slug change handling
export function useProductUpdate(id: string, options?: { showToast?: boolean; successMessage?: string }) {
  const queryClient = useQueryClient()
  const showToast = options?.showToast ?? true
  const successMessage = options?.successMessage

  return useMutation({
    mutationFn: (data: ProductMutationData) => {
      return productAPI.update(id, data)
    },
    onMutate: async (newData: ProductMutationData) => {
      await queryClient.cancelQueries({ queryKey: productKeys.detail(id) })
      const previousProduct = queryClient.getQueryData(productKeys.detail(id))
      const old = queryClient.getQueryData<{ slug?: string }>(productKeys.detail(id))

      // Optimistically update to the new value
      queryClient.setQueryData(productKeys.detail(id), (old: any) => ({
        ...old,
        ...newData,
        updatedAt: new Date(),
      }))

      // If slug is changing, also update the cache for the new slug
      if (newData.slug && old && old.slug !== newData.slug) {
        queryClient.setQueryData(productKeys.detail(newData.slug), (old: any) => ({
          ...old,
          ...newData,
          updatedAt: new Date(),
        }))
      }

      return { previousProduct }
    },
    onError: (err, newData, context) => {
      queryClient.setQueryData(productKeys.detail(id), context?.previousProduct)

      // Also clear the new slug cache if it was set
      if (newData.slug) {
        queryClient.removeQueries({
          queryKey: productKeys.detail(newData.slug),
        })
      }

      if (showToast) {
        toast.error("Update failed", {
          description: err instanceof Error ? err.message : "Something went wrong",
          style: {
            backgroundColor: "red",
            color: "white",
          },
        })
      }
    },
    onSuccess: (updatedProduct, variables) => {
      if (showToast) {
        toast.success(successMessage || "Product updated successfully", {
          description: "The product has been updated in your catalog.",
          style: {
            backgroundColor: "green",
            color: "#fff",
          },
        })
      }

      // If slug changed, update cache keys
      if (variables.slug && updatedProduct?.slug) {
        // Set data for new slug
        queryClient.setQueryData(productKeys.detail(updatedProduct.slug), updatedProduct)
        // Remove old slug cache if different
        if (updatedProduct.slug !== id) {
          queryClient.removeQueries({ queryKey: productKeys.detail(id) })
        }
      }
    },
    onSettled: (updatedProduct, error, variables) => {
      // Only invalidate if no slug change or if there was an error
      if (!variables.slug || error) {
        queryClient.invalidateQueries({ queryKey: productKeys.detail(id) })
      }

      // Always invalidate lists
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })

      // If slug changed and no error, invalidate the new slug
      if (variables.slug && !error && updatedProduct) {
        queryClient.invalidateQueries({
          queryKey: productKeys.detail(updatedProduct.slug),
        })
      }
    },
  })
}
