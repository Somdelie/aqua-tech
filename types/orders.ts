export interface OrderUpdateData {
  status?:
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED"
    | "REFUNDED";
  internalNotes?: string | null;
  trackingNumber?: string | null;
  estimatedDelivery?: Date | null;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: {
    name: string;
    thumbnail: string | null;
  };
  variant: {
    name: string;
  } | null;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED"
    | "REFUNDED";
  paymentMethod:
    | "CASH_ON_DELIVERY"
    | "CASH_ON_COLLECTION"
    | "CARD_ONLINE"
    | "EFT"
    | "BANK_TRANSFER";
  paymentStatus:
    | "PENDING"
    | "PAID"
    | "FAILED"
    | "REFUNDED"
    | "PARTIALLY_REFUNDED";
  deliveryMethod: "DELIVERY" | "COLLECTION";
  subtotal: number;
  taxAmount: number;
  deliveryFee: number;
  discount: number;
  total: number;
  // shippingAddressId: string | null;
  estimatedDelivery: Date | null;
  actualDelivery: Date | null;
  trackingNumber: string | null;
  notes: string | null;
  internalNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
  shippingAddress: {
    streetLine1: string;
    streetLine2?: string | null; // 👈 optional
    city: string;
    state: string;
    postalCode: string;
    country?: string | null; // 👈 optional
  } | null;
  user: {
    name: string;
    email: string;
    firstName: string;
    lastName: string;
  } | null;
}
