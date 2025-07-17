"use server";
import { auth } from "@/lib/auth";
import db from "@/prisma/db";
import { revalidatePath } from "next/cache";
import { headers } from "next/dist/server/request/headers";
import type { CheckoutFormData } from "@/components/front/checkout/CheckoutForm"; // Import the type
import type { DeliveryMethod, PaymentMethod } from "@prisma/client"; // Import Prisma enums
import { OrderUpdateData } from "../types/orders";
import { cache } from "react";

function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

// This type represents the data received by the server action from the client
interface CreateOrderActionData extends CheckoutFormData {
  items: {
    productId: string;
    quantity: number;
  }[];
  subtotal: number; // Client's calculated subtotal
  total: number; // Client's calculated total including delivery fee
  discount?: number; // Optional discount property
}

export async function createOrderFromCart(data: CreateOrderActionData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // Ensure user is authenticated or handle guest checkout appropriately
    if (!session?.user?.id) {
      return { success: false, message: "User not authenticated." };
    }

    const cart = await db.cart.findUnique({
      where: { userId: session.user.id }, // Use session.user.id directly
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return { success: false, message: "Cart is empty" };
    }

    // Server-side recalculation for security and accuracy
    const calculatedSubtotal = cart.items.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);
    const calculatedTaxAmount = calculatedSubtotal * 0.15; // 15% VAT
    const calculatedShippingAmount =
      data.deliveryMethod === "DELIVERY" ? 150 : 0; // Recalculate based on delivery method
    const calculatedTotalAmount =
      calculatedSubtotal + calculatedTaxAmount + calculatedShippingAmount;

    // Construct shipping and billing addresses from the flat data
    const shippingAddress = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      company: data.company,
      streetLine1: data.streetLine1,
      streetLine2: data.streetLine2,
      city: data.city,
      state: data.state,
      postalCode: data.postalCode,
      country: data.country,
    };
    // Assuming billing address is the same as shipping address for now
    const billingAddress = shippingAddress;

    // Create order
    const order = await db.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: session.user.id,
        subtotal: calculatedSubtotal,
        taxAmount: calculatedTaxAmount,
        shippingAmount: calculatedShippingAmount,
        discountAmount: data.discount || 0, // Ensure discountAmount is passed, default to 0 if not provided
        totalAmount: calculatedTotalAmount, // Use server-calculated total
        status: "PENDING",
        paymentStatus: "PENDING",
        shippingStatus: "NOT_SHIPPED",
        deliveryMethod: data.deliveryMethod as DeliveryMethod, // Cast to Prisma enum
        paymentMethod: data.paymentMethod as PaymentMethod, // Cast to Prisma enum
        shippingAddress: shippingAddress, // Use the constructed object
        billingAddress: billingAddress, // Use the constructed object
        customerNotes: data.notes,
        items: {
          create: cart.items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            unitPrice: item.product.price,
            totalPrice: item.product.price * item.quantity,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                thumbnail: true,
              },
            },
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Clear cart after successful order
    await db.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    revalidatePath("/orders");
    revalidatePath("/cart");

    return {
      success: true,
      data: order,
      message: "Order created successfully",
    };
  } catch (error) {
    console.error("Error creating order:", error);
    return { success: false, message: "Failed to create order" };
  }
}

export async function updateOrder(id: string, data: OrderUpdateData) {
  try {
    if (!id || typeof id !== "string") {
      return { success: false, error: "Invalid order ID" };
    }

    if (!data || typeof data !== "object") {
      return { success: false, error: "Invalid update data" };
    }

    // Build the update data object with proper typing
    const updateData: any = {
      updatedAt: new Date(),
    };

    // Add valid fields from the input data
    const validFields: (keyof OrderUpdateData)[] = [
      "status",
      "internalNotes",
      "trackingNumber",
      "estimatedDelivery",
    ];

    validFields.forEach((field) => {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    });

    const order = await db.order.update({
      where: { id },
      data: updateData,
    });

    revalidatePath(`/dashboard/orders/${id}`);
    revalidatePath("/dashboard/orders");

    return { success: true, data: order };
  } catch (error) {
    console.error("Error updating order:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update order",
    };
  }
}

export async function getUserOrders() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const userId = session?.user?.id;

  try {
    const orders = await db.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                brand: true,
                category: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    console.log("Fetched user orders:", orders);
    return { success: true, data: orders };
  } catch (error) {
    console.error("Error fetching orders:", error);
    return { success: false, data: [] };
  }
}

export async function getOrderById(orderId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    const order = await db.order.findFirst({
      where: {
        id: orderId,
        userId: session?.user?.id,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                brand: true,
                category: true,
              },
            },
          },
        },
      },
    });
    if (!order) {
      return { success: false, message: "Order not found" };
    }
    return { success: true, data: order };
  } catch (error) {
    console.error("Error fetching order:", error);
    return { success: false, message: "Failed to fetch order" };
  }
}

// Cache the order fetch for better performance
export const getOrderByIdAdmin = cache(async (orderId: string) => {
  try {
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
                thumbnail: true,
              },
            },
          },
        },
        // shippingAddress: true,
        // payments: {
        //   orderBy: {
        //     createdAt: "desc",
        //   },
        // },
      },
    });

    if (!order) {
      return null;
    }

    // Transform the data to match our interface
    return {
      ...order,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      estimatedDelivery: order.estimatedDelivery?.toISOString() || null,
      actualDelivery: order.actualDelivery?.toISOString() || null,
      // payments: order.payments?.map((payment) => ({
      //   ...payment,
      //   createdAt: payment.createdAt.toISOString(),
      //   updatedAt: payment.updatedAt.toISOString(),
      // })),
    };
  } catch (error) {
    console.error("Error fetching order:", error);
    return null;
  }
});

export async function cancelOrder(orderId: string, userId: string) {
  try {
    const order = await db.order.findFirst({
      where: {
        id: orderId,
        userId,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    });
    if (!order) {
      return {
        success: false,
        message: "Order not found or cannot be cancelled",
      };
    }
    await db.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
    });
    revalidatePath("/orders");
    return { success: true, message: "Order cancelled successfully" };
  } catch (error) {
    console.error("Error cancelling order:", error);
    return { success: false, message: "Failed to cancel order" };
  }
}

export async function getAllOrders() {
  try {
    const orders = await db.order.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: {
              include: {
                brand: true,
                category: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: orders };
  } catch (error) {
    console.error("Error fetching all orders:", error);
    return {
      success: false,
      message: "Failed to fetch orders",
      data: [],
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Cache the users map for better performance
export const getUsersMap = cache(async () => {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        firstName: true,
        lastName: true,
        image: true,
      },
    });

    // Convert to map for easy lookup
    const userMap: Record<string, any> = {};
    users.forEach((user) => {
      userMap[user.id] = user;
    });

    return userMap;
  } catch (error) {
    console.error("Error fetching users:", error);
    return {};
  }
});
