"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Package, MapPin, CreditCard, Truck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatPrice } from "@/lib/formatPrice"
import { getOrderById } from "@/actions/order-actions"
import { OrderTimeline } from "../../../../components/front/orders/OrderTimeline"

// Updated interface to match the actual database return type
interface Order {
  id: string
  orderNumber: string
  status: string
  createdAt: Date  // Changed from string to Date
  updatedAt: Date  // Changed from string to Date
  subtotal: number
  shippingAmount: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  paymentMethod: string
  paymentStatus: string
  deliveryMethod: string
  trackingNumber: string | null  // Changed from string | undefined to string | null
  estimatedDelivery: Date | null  // Changed from Date | undefined to Date | null
  actualDelivery: Date | null     // Changed from Date | undefined to Date | null
  customerNotes: string | null    // Changed from string | undefined to string | null
  shippingAddress: any  // Changed to any to handle JsonValue
  billingAddress: any   // Changed to any to handle JsonValue
  items: {
    id: string
    product: {
      id: string
      name: string
      thumbnail: string | null  // Changed from string | undefined to string | null
      brand: {
        id: string
        name: string
        createdAt: Date
        updatedAt: Date
        slug: string
        description: string | null
        logo: string | null
        website: string | null
      } | null  // Made nullable
      category: {
        id: string
        name: string
        createdAt: Date
        updatedAt: Date
        slug: string
        description: string | null
      } | null  // Made nullable
    }
    quantity: number
    unitPrice: number
    totalPrice: number
  }[]
}

// Type guard to ensure the address has the expected shape
function isValidAddress(address: any): address is {
  firstName: string
  lastName: string
  streetLine1: string
  streetLine2?: string | null
  city: string
  state: string
  postalCode: string
  country: string
} {
  return (
    address &&
    typeof address === 'object' &&
    typeof address.firstName === 'string' &&
    typeof address.lastName === 'string' &&
    typeof address.streetLine1 === 'string' &&
    typeof address.city === 'string' &&
    typeof address.state === 'string' &&
    typeof address.postalCode === 'string' &&
    typeof address.country === 'string'
  )
}

export default function OrderDetailsPage() {
  const params = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchOrder() {
      if (params.id) {
        const result = await getOrderById(params.id as string)
        if (result.success && result.data) {
          setOrder(result.data)
        } else {
          setOrder(null)
        }
        setLoading(false)
      }
    }
    fetchOrder()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h1>
          <Button asChild>
            <Link href="/orders">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800"
      case "PROCESSING":
        return "bg-purple-100 text-purple-800"
      case "SHIPPED":
        return "bg-indigo-100 text-indigo-800"
      case "DELIVERED":
        return "bg-green-100 text-green-800"
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      case "REFUNDED":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button variant="outline" asChild className="mb-4 bg-transparent">
            <Link href="/orders">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Link>
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order {order.orderNumber}</h1>
              <p className="text-gray-600 mt-1">
                Placed on{" "}
                {order.createdAt.toLocaleDateString("en-ZA", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              {order.trackingNumber && (
                <p className="text-sm text-gray-600 mt-1">
                  Tracking Number: <span className="font-mono font-semibold text-sky-600">{order.trackingNumber}</span>
                </p>
              )}
            </div>
            <Badge className={`${getStatusColor(order.status)} border-0`}>{order.status}</Badge>
          </div>
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Order Timeline and Items */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Order Tracking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <OrderTimeline
                  currentStatus={order.status}
                  orderDate={order.createdAt.toISOString()}
                  estimatedDelivery={order.estimatedDelivery?.toISOString()}
                  actualDelivery={order.actualDelivery?.toISOString()}
                  trackingNumber={order.trackingNumber}
                />
              </CardContent>
            </Card>
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.items.map((item, index: number) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex gap-4 p-4 border rounded-lg hover:shadow-sm transition-shadow"
                    >
                      <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.product.thumbnail || "/placeholder.svg?height=64&width=64"}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.product.name}</h4>
                        {/* {item.variant && <p className="text-sm text-gray-600 mt-1">Variant: {item.variant.name}</p>} */}
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
                          <span className="font-medium">{formatPrice(item.totalPrice)}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
            {/* Shipping Address */}
            {order.shippingAddress && isValidAddress(order.shippingAddress) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    {order.deliveryMethod === "DELIVERY" ? "Delivery Address" : "Collection Address"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    <p className="font-medium">
                      {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                    </p>
                    <p>{order.shippingAddress.streetLine1}</p>
                    {order.shippingAddress.streetLine2 && <p>{order.shippingAddress.streetLine2}</p>}
                    <p>
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                    </p>
                    <p>{order.shippingAddress.country}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery</span>
                  <span>{formatPrice(order.shippingAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>{formatPrice(order.taxAmount)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(order.discountAmount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(order.totalAmount)}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment & Delivery
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Payment Method</span>
                  <span className="capitalize">{order.paymentMethod.replace(/_/g, " ").toLowerCase()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Payment Status</span>
                  <Badge variant="outline" className="text-xs">
                    {order.paymentStatus}
                  </Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery Method</span>
                  <span className="capitalize">{order.deliveryMethod.toLowerCase()}</span>
                </div>
                {order.estimatedDelivery && (
                  <div className="flex justify-between text-sm">
                    <span>Estimated Delivery</span>
                    <span>{order.estimatedDelivery.toLocaleDateString("en-ZA")}</span>
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Order Notes */}
            {order.customerNotes && (
              <Card>
                <CardHeader>
                  <CardTitle>Order Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{order.customerNotes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}