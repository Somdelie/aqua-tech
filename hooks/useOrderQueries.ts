import { OrderUpdateData } from "@/types/orders";
import { orderAPI } from "@/services/orderApi";

import {
  useQuery,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { toast } from "sonner";

// Query keys for caching
export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (filters: any) => [...orderKeys.lists(), { filters }] as const,
  filteredList: (dateFilter: any, searchQuery: string) =>
    [...orderKeys.lists(), { dateFilter, searchQuery }] as const,
  details: () => [...orderKeys.all, "detail"] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
};

// Get all orders with regular query
export function useOrders() {
  const {
    data: orders = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: orderKeys.lists(),
    queryFn: () => orderAPI.getAllOrders(),
  });

  return {
    orders,
    isLoading,
    isError,
    error,
    refetch,
  };
}

// Get orders with suspense
export function useOrdersSuspense() {
  const { data: orders = [], refetch } = useSuspenseQuery({
    queryKey: orderKeys.lists(),
    queryFn: () => orderAPI.getAllOrders(),
  });

  return {
    orders,
    refetch,
  };
}

// Get single order by ID
export function useOrder(id: string, enabled = true) {
  const {
    data: order,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => orderAPI.getById(id),
    enabled: enabled && !!id,
  });

  return {
    order,
    isLoading,
    isError,
    error,
    refetch,
  };
}

// Update order mutation
export function useOrderUpdate(
  id: string,
  options?: { showToast?: boolean; successMessage?: string }
) {
  const queryClient = useQueryClient();
  const showToast = options?.showToast ?? true;
  const successMessage = options?.successMessage;

  return useMutation({
    mutationFn: (data: OrderUpdateData) => {
      return orderAPI.update(id, data);
    },
    onMutate: async (newData: OrderUpdateData) => {
      await queryClient.cancelQueries({ queryKey: orderKeys.detail(id) });
      const previousOrder = queryClient.getQueryData(orderKeys.detail(id));
      queryClient.setQueryData(orderKeys.detail(id), (old: any) => ({
        ...old,
        ...newData,
        updatedAt: new Date(),
      }));
      return { previousOrder };
    },
    onError: (err, newData, context) => {
      queryClient.setQueryData(orderKeys.detail(id), context?.previousOrder);
      if (showToast) {
        toast.error("Update failed", {
          description:
            err instanceof Error ? err.message : "Something went wrong",
          style: {
            backgroundColor: "red",
            color: "white",
          },
        });
      }
    },
    onSuccess: () => {
      if (showToast) {
        toast.success(successMessage || "Order updated successfully", {
          description: "The order has been updated.",
          style: {
            backgroundColor: "green",
            color: "#fff",
          },
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}
