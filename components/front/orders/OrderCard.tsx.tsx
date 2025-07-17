"use client"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, Package, MapPin, Calendar, CreditCard, Truck, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"
import { formatPrice } from "../../../lib/formatPrice"
import { OrderStatusBadge } from "./OrderStatusBadge"
import { DeliveryMethod, PaymentMethod, Prisma } from "@prisma/client" // Import Prisma and enums

// Define the exact payload type for the order, matching the include in getUserOrders
const orderWithDetails = Prisma.validator<Prisma.OrderDefaultArgs>()({
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
})

export type Order = Prisma.OrderGetPayload<typeof orderWithDetails>

interface OrderCardProps {
  order: Order
  index: number
}

export function OrderCard({ order, index }: OrderCardProps) {
  const [isOpen, setIsOpen] = useState(false)

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(order.createdAt)) // Use order.createdAt directly
  }

  const getPaymentMethodLabel = (method: PaymentMethod) => {
    switch (method) {
      case PaymentMethod.CASH_ON_DELIVERY:
        return "Cash on Delivery"
      case PaymentMethod.CASH_ON_COLLECTION:
        return "Cash on Collection"
      case PaymentMethod.CARD_ONLINE:
        return "Card Payment"
      case PaymentMethod.EFT:
        return "EFT Transfer"
      case PaymentMethod.BANK_TRANSFER:
        return "Bank Transfer"
      default:
        return method
    }
  }

  const getDeliveryMethodLabel = (method: DeliveryMethod) => {
    return method === DeliveryMethod.DELIVERY ? "Delivery" : "Collection"
  }

  return (
    <Card
      className={cn(
        "transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        "animate-in fade-in slide-in-from-bottom-4",
        "border-l-4 border-l-teal-500",
      )}
      style={{
        animationDelay: `${index * 100}ms`,
        animationFillMode: "both",
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-lg">#{order.orderNumber}</h3>
              <OrderStatusBadge status={order.status} />
            </div>
            <p className="text-sm text-muted-foreground">Ordered on {formatDate(order.createdAt)}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-teal-600">{formatPrice(order.totalAmount)}</p>
            <p className="text-sm text-muted-foreground">
              {order.items.length} item{order.items.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Order Items Preview */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {order.items.slice(0, 3).map((item) => (
            <div key={item.id} className="flex-shrink-0 flex items-center gap-2 bg-muted/50 rounded-lg p-2 min-w-0">
              <div className="relative w-10 h-10 rounded-md overflow-hidden bg-muted">
                {item.product.thumbnail ? (
                  <Image
                    src={item.product.thumbnail || "/placeholder.svg"}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{item.product.name}</p>
                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
              </div>
            </div>
          ))}
          {order.items.length > 3 && (
            <Badge variant="secondary" className="flex-shrink-0">
              +{order.items.length - 3} more
            </Badge>
          )}
        </div>
        {/* Quick Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">{getPaymentMethodLabel(order.paymentMethod)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">{getDeliveryMethodLabel(order.deliveryMethod)}</span>
          </div>
          {order.trackingNumber && (
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground font-mono text-xs">{order.trackingNumber}</span>
            </div>
          )}
          {order.estimatedDelivery && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">{formatDate(order.estimatedDelivery)}</span>
            </div>
          )}
        </div>
        {/* Expandable Details */}
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="p-0 h-auto">
                <span className="text-sm font-medium">{isOpen ? "Hide" : "Show"} Details</span>
                <ChevronDown className={cn("w-4 h-4 ml-2 transition-transform duration-200", isOpen && "rotate-180")} />
              </Button>
            </CollapsibleTrigger>
            <Button asChild size="sm" variant="outline">
              <Link href={`/orders/${order.id}`}>
                <Eye className="w-4 h-4 mr-2" />
                View Order
              </Link>
            </Button>
          </div>
          <CollapsibleContent className="space-y-4 pt-4">
            <Separator />
            {/* All Items */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Order Items</h4>
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted">
                    {item.product.thumbnail ? (
                      <Image
                        src={item.product.thumbnail || "/placeholder.svg"}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  {/* <div className="flex-1 min-w-0">
                    <p className="font-medium">{item.product.name}</p>
                    {item.variant && <p className="text-sm text-muted-foreground">Variant: {item.variant.name}</p>}
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(item.unitPrice)} × {item.quantity}
                    </p>
                  </div> */}
                  <div className="text-right">
                    <p className="font-medium text-teal-600">{formatPrice(item.totalPrice)}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Shipping Address */}
            {order.shippingAddress && (() => {
              // Try to parse shippingAddress if it's a string, otherwise use as is
              let address: any = order.shippingAddress;
              if (typeof address === "string") {
                try {
                  address = JSON.parse(address);
                } catch {
                  address = {};
                }
              }
              return address && typeof address === "object" && address.streetLine1 ? (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Shipping Address
                  </h4>
                  <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                    <p>{address.streetLine1}</p>
                    {address.streetLine2 && <p>{address.streetLine2}</p>}
                    <p>
                      {address.city}, {address.state} {address.postalCode}
                    </p>
                    <p>{address.country}</p>
                  </div>
                </div>
              ) : null;
            })()}
            {/* Order Summary */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Order Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(order.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{formatPrice(order.taxAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>{formatPrice(order.shippingAmount)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span className="text-teal-600">{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}
