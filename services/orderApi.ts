import { getAllOrders,getOrderById,updateOrder } from '@/actions/order-actions';
import { OrderUpdateData } from '../types/orders';



// Centralized API object for all order-related server actions
export const orderAPI = {
  // Fetch all orders
  getAllOrders: async () => {
    const response = await getAllOrders();
    if (response.error) {
      throw new Error(response.error);
    }
    return response.data || [];
  },

  // Get single order by ID
  getById: async (id: string) => {
    const order = await getOrderById(id);
    if (!order) {
      throw new Error("Order not found");
    }
    return order;
  },

  // Update an existing order
  update: async (id: string, data: OrderUpdateData) => {
    const response = await updateOrder(id, data);
    if (!response.success) {
      throw new Error(response.error || "Failed to update order");
    }
    return response.data;
  },
};
