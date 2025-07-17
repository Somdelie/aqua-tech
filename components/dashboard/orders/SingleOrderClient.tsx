"use client"

import { useState } from "react"
import { format } from "date-fns"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  User,
  CreditCard,
  Phone,
  Mail,
  Edit,
  Printer,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatPrice } from "@/lib/formatPrice"
import { toast } from "sonner"
import OrderEditModal from "./OrderEditModal"

interface Order {
  id: string
  orderNumber: string
  userId: string
  status: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED"
  paymentMethod: "CASH_ON_DELIVERY" | "CASH_ON_COLLECTION" | "CARD_ONLINE" | "EFT" | "BANK_TRANSFER"
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED" | "PARTIALLY_REFUNDED"
  deliveryMethod: "DELIVERY" | "COLLECTION"
  subtotal: number
  taxAmount: number
  shippingAmount: number // Renamed from deliveryFee
  discountAmount: number // Renamed from discount
  totalAmount: number // Renamed from total
  // shippingAddressId: string | null
  billingAddressId?: string | null
  estimatedDelivery: string | Date | null
  actualDelivery: string | Date | null
  trackingNumber: string | null
  // deliveryNotes: string | null
  customerNotes: string | null // Renamed from notes
  internalNotes: string | null
  createdAt: Date | string
  updatedAt: Date | string
  items: Array<{
    id: string
    productId: string
    quantity: number
    unitPrice: number
    totalPrice: number
    product: {
      name: string
      thumbnail: string | null
    }
  }>
  // shippingAddress: {
  //   firstName: string
  //   lastName: string
  //   company?: string | null
  //   streetLine1: string | null
  //   streetLine2?: string | null
  //   city: string
  //   state: string
  //   postalCode: string
  //   country: string
  //   phone?: string | null
  // } | null
  payments?: Array<{
    id: string
    amount: number
    method: string
    status: string
    transactionId?: string | null
    reference?: string | null
    createdAt: Date | string
  }>
}

interface SingleOrderClientProps {
  order: Order
  userMap: Record<
    string,
    { id: string; name: string; email: string; firstName: string; lastName: string; phone?: string; image?: string }
  >
}

export default function SingleOrderClient({ order, userMap }: SingleOrderClientProps) {
  const router = useRouter()
  const [editModalOpen, setEditModalOpen] = useState(false)

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A"
    try {
      const dateObj = typeof date === "string" ? new Date(date) : date
      if (isNaN(dateObj.getTime())) return "Invalid date"
      return format(dateObj, "MMM dd, yyyy 'at' HH:mm")
    } catch (error) {
      return "Invalid date"
    }
  }

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-5 w-5 text-yellow-600" />
      case "CONFIRMED":
        return <CheckCircle className="h-5 w-5 text-blue-600" />
      case "PROCESSING":
        return <Package className="h-5 w-5 text-orange-600" />
      case "SHIPPED":
        return <Truck className="h-5 w-5 text-purple-600" />
      case "DELIVERED":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "CANCELLED":
      case "REFUNDED":
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "PROCESSING":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "SHIPPED":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "DELIVERED":
        return "bg-green-100 text-green-800 border-green-200"
      case "CANCELLED":
      case "REFUNDED":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPaymentStatusColor = (status: Order["paymentStatus"]) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800 border-green-200"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "FAILED":
        return "bg-red-100 text-red-800 border-red-200"
      case "REFUNDED":
      case "PARTIALLY_REFUNDED":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadInvoice = () => {
    toast.info("Invoice download feature coming soon")
  }

  const customer = userMap[order.userId]

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Order {order.orderNumber}</h1>
            <p className="text-gray-600">Placed on {formatDate(order.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadInvoice}>
            <Download className="h-4 w-4 mr-2" />
            Invoice
          </Button>
          <Button size="sm" onClick={() => setEditModalOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Order
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {getStatusIcon(order.status)}
                <span>Order Status</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Badge className={`${getStatusColor(order.status)} px-3 py-1`}>{order.status.replace("_", " ")}</Badge>
                <div className="text-sm text-gray-600">Last updated: {formatDate(order.updatedAt)}</div>
              </div>
              {order.trackingNumber && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Truck className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Tracking Number:</span>
                    <span className="text-sm font-mono text-blue-700">{order.trackingNumber}</span>
                  </div>
                </div>
              )}
              {order.estimatedDelivery && (
                <div className="mt-2 text-sm text-gray-600">
                  <strong>Estimated Delivery:</strong> {formatDate(order.estimatedDelivery)}
                </div>
              )}
              {order.actualDelivery && (
                <div className="mt-2 text-sm text-green-600">
                  <strong>Delivered:</strong> {formatDate(order.actualDelivery)}
                </div>
              )}
            </CardContent>
          </Card>
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items ({order.items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-center">Qty</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            {item.product.thumbnail ? (
                              <img
                                src={item.product.thumbnail || "/placeholder.svg"}
                                alt={item.product.name}
                                className="h-10 w-10 object-cover rounded"
                              />
                            ) : (
                              <Package className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{item.product.name}</div>
                          </div>
                        </div>
                      </TableCell>
                      {/* <TableCell className="font-mono text-sm">{item.product.sku}</TableCell> */}
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatPrice(item.unitPrice)}</TableCell>
                      <TableCell className="text-right font-medium">{formatPrice(item.totalPrice)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          {/* Delivery Information */}
          {/* {order.shippingAddress && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Delivery Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Delivery Method</h4>
                    <div className="flex items-center space-x-2">
                      {order.deliveryMethod === "DELIVERY" ? (
                        <Truck className="h-4 w-4 text-blue-600" />
                      ) : (
                        <MapPin className="h-4 w-4 text-green-600" />
                      )}
                      <span className="capitalize">{order.deliveryMethod.toLowerCase()}</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Shipping Address</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>
                        {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                      </div>
                      {order.shippingAddress.company && <div>{order.shippingAddress.company}</div>}
                      <div>{order.shippingAddress.streetLine1}</div>
                      {order.shippingAddress.streetLine2 && <div>{order.shippingAddress.streetLine2}</div>}
                      <div>
                        {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                      </div>
                      <div>{order.shippingAddress.country}</div>
                      {order.shippingAddress.phone && <div>Phone: {order.shippingAddress.phone}</div>}
                    </div>
                  </div>
                </div>
                {order.deliveryNotes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-1">Delivery Notes</h4>
                    <p className="text-sm text-gray-600">{order.deliveryNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )} */}
          {/* Notes */}
          {(order.customerNotes || order.internalNotes) && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.customerNotes && (
                  <div>
                    <h4 className="font-medium mb-2">Customer Notes</h4>
                    <p className="text-sm text-gray-600 p-3 bg-blue-50 rounded-lg">{order.customerNotes}</p>
                  </div>
                )}
                {order.internalNotes && (
                  <div>
                    <h4 className="font-medium mb-2">Internal Notes</h4>
                    <p className="text-sm text-gray-600 p-3 bg-yellow-50 rounded-lg">{order.internalNotes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Customer</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {customer ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={customer.image || "/placeholder.svg"} />
                      <AvatarFallback>
                        {customer.firstName?.[0]}
                        {customer.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-gray-600">{customer.email}</div>
                    </div>
                  </div>
                  {customer.phone && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{customer.email}</span>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-600">Customer information not available</div>
              )}
            </CardContent>
          </Card>
          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Payment</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <Badge className={`${getPaymentStatusColor(order.paymentStatus)} px-2 py-1`}>
                  {order.paymentStatus.replace("_", " ")}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Method:</span>
                <span className="text-sm font-medium">{order.paymentMethod.replace("_", " ")}</span>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount:</span>
                    <span>-{formatPrice(order.discountAmount)}</span>
                  </div>
                )}
                {order.taxAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Tax:</span>
                    <span>{formatPrice(order.taxAmount)}</span>
                  </div>
                )}
                {order.shippingAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Delivery:</span>
                    <span>{formatPrice(order.shippingAmount)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Payment History */}
          {order.payments && order.payments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="text-sm font-medium">{formatPrice(payment.amount)}</div>
                        <div className="text-xs text-gray-600">{formatDate(payment.createdAt)}</div>
                        {payment.reference && <div className="text-xs text-gray-500">Ref: {payment.reference}</div>}
                      </div>
                      <Badge variant={payment.status === "PAID" ? "default" : "secondary"}>{payment.status}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      {/* Edit Modal */}
      <OrderEditModal order={order} open={editModalOpen} onOpenChange={setEditModalOpen} />
    </>
  )
}
