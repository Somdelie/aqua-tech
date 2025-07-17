"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { format } from "date-fns"
import * as XLSX from "xlsx"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Package, Truck, CheckCircle, XCircle, Clock, MapPin } from "lucide-react"
import { DataTable, type Column, TableActions, EntityForm } from "@/components/ui/data-table"
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { formatPrice } from "@/lib/formatPrice"
import { startTransition } from "react"
import { useOrdersSuspense, useOrderUpdate } from '../../../hooks/useOrderQueries';

interface OrdersListingProps {
  title: string
  userMap: Record<string, { id: string; name: string; email: string; firstName: string; lastName: string }>
}

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
  deliveryFee: number
  discount: number
  total: number
  shippingAddressId: string | null
  billingAddressId?: string | null
  estimatedDelivery: Date | null
  actualDelivery: Date | null
  trackingNumber: string | null
  deliveryNotes: string | null
  notes: string | null
  internalNotes: string | null
  createdAt: Date | string
  updatedAt: Date | string
  items: Array<{
    id: string
    productId: string
    variantId: string | null
    quantity: number
    unitPrice: number
    totalPrice: number
    product: {
      name: string
      thumbnail: string | null
    }
    variant: {
      name: string
    } | null
  }>
  shippingAddress: {
    streetLine1: string
    city: string
    state: string
    postalCode: string
  } | null
}

// Form schema for updating orders
const orderUpdateSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]),
  internalNotes: z.string().optional(),
  trackingNumber: z.string().optional(),
  estimatedDelivery: z.string().optional(),
  deliveryNotes: z.string().optional(),
})

type OrderUpdateData = z.infer<typeof orderUpdateSchema>

export default function OrdersListing({ title, userMap }: OrdersListingProps) {
  const [ordersData, setOrdersData] = useState<Order[]>([])
  const { orders, refetch } = useOrdersSuspense()

  useEffect(() => {
    if (orders) {
      startTransition(() => {
        // Map or transform orders to match the Order interface
        setOrdersData(
          orders.map((order: any) => ({
            id: order.id,
            orderNumber: order.orderNumber,
            userId: order.userId,
            status: order.status,
            paymentMethod: order.paymentMethod,
            paymentStatus: order.paymentStatus,
            deliveryMethod: order.deliveryMethod,
            subtotal: order.subtotal,
            taxAmount: order.taxAmount,
            deliveryFee: order.deliveryFee,
            discount: order.discount,
            total: order.total,
            shippingAddressId: order.shippingAddressId,
            billingAddressId: order.billingAddressId,
            estimatedDelivery: order.estimatedDelivery,
            actualDelivery: order.actualDelivery,
            trackingNumber: order.trackingNumber,
            deliveryNotes: order.deliveryNotes,
            notes: order.notes,
            internalNotes: order.internalNotes,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            items: order.items,
            shippingAddress: order.shippingAddress,
          }))
        )
      })
    }
  }, [orders])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)

  // Mutations
  const updateOrderMutation = useOrderUpdate(currentOrder?.id || "")

  const router = useRouter()

  // Navigation handler - only for row clicks, not action buttons
  const handleOrderClick = (order: Order, event?: React.MouseEvent) => {
    // Prevent navigation if clicking on action buttons
    if (event?.target && (event.target as HTMLElement).closest("[data-action-button]")) {
      return
    }
    router.push(`/dashboard/orders/${order.id}`)
  }

  // Form setup
  const form = useForm<OrderUpdateData>({
    resolver: zodResolver(orderUpdateSchema),
    defaultValues: {
      status: "PENDING",
      internalNotes: "",
      trackingNumber: "",
      estimatedDelivery: "",
      deliveryNotes: "",
    },
  })

  // Form reset effect
  useEffect(() => {
    if (currentOrder) {
      form.reset({
        status: currentOrder.status,
        internalNotes: currentOrder.internalNotes || "",
        trackingNumber: currentOrder.trackingNumber || "",
        estimatedDelivery: currentOrder.estimatedDelivery
          ? format(new Date(currentOrder.estimatedDelivery), "yyyy-MM-dd")
          : "",
        deliveryNotes: currentOrder.deliveryNotes || "",
      })
    } else {
      form.reset()
    }
  }, [currentOrder, form])

  const resetFormAndCloseModal = useCallback(() => {
    setCurrentOrder(null)
    setFormDialogOpen(false)
    form.reset()
  }, [form])

  // Utility functions
  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A"
    try {
      const dateObj = typeof date === "string" ? new Date(date) : date
      if (isNaN(dateObj.getTime())) return "Invalid date"
      return format(dateObj, "MMM dd, yyyy")
    } catch (error) {
      return "Invalid date"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "CONFIRMED":
        return <CheckCircle className="h-4 w-4 text-blue-600" />
      case "PROCESSING":
        return <Package className="h-4 w-4 text-orange-600" />
      case "SHIPPED":
        return <Truck className="h-4 w-4 text-purple-600" />
      case "DELIVERED":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "CANCELLED":
      case "REFUNDED":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800"
      case "PROCESSING":
        return "bg-orange-100 text-orange-800"
      case "SHIPPED":
        return "bg-purple-100 text-purple-800"
      case "DELIVERED":
        return "bg-green-100 text-green-800"
      case "CANCELLED":
      case "REFUNDED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentStatusColor = (status: Order["paymentStatus"]) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "FAILED":
        return "bg-red-100 text-red-800"
      case "REFUNDED":
      case "PARTIALLY_REFUNDED":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getDeliveryMethodIcon = (method: Order["deliveryMethod"]) => {
    return method === "DELIVERY" ? <Truck className="h-4 w-4" /> : <MapPin className="h-4 w-4" />
  }

  // Export to Excel
  const handleExport = async (filteredOrders: Order[]) => {
    setIsExporting(true)
    try {
      const exportData = filteredOrders.map((order) => ({
        "Order Number": order.orderNumber,
        Customer: userMap[order.userId]?.name || "Unknown",
        Status: order.status,
        "Payment Status": order.paymentStatus,
        "Payment Method": order.paymentMethod.replace("_", " "),
        "Delivery Method": order.deliveryMethod,
        Subtotal: order.subtotal,
        Tax: order.taxAmount,
        "Delivery Fee": order.deliveryFee,
        Discount: order.discount,
        Total: order.total,
        Items: order.items.length,
        Date: formatDate(order.createdAt),
      }))

      const worksheet = XLSX.utils.json_to_sheet(exportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Orders")

      const fileName = `Orders_${format(new Date(), "yyyy-MM-dd")}.xlsx`
      XLSX.writeFile(workbook, fileName)

      toast.success("Export successful", {
        description: `Orders exported to ${fileName}`,
      })
    } catch (error) {
      toast.error("Export failed", {
        description: error instanceof Error ? error.message : "Unknown error occurred",
      })
    } finally {
      setIsExporting(false)
    }
  }

  // Event handlers
  const handleEditClick = (order: Order) => {
    setCurrentOrder(order)
    setFormDialogOpen(true)
  }

  const onSubmit = async (data: OrderUpdateData) => {
    setIsSubmitting(true)

    try {
      if (currentOrder) {
        const updatePayload = {
          status: data.status,
          internalNotes: data.internalNotes,
          trackingNumber: data.trackingNumber,
          estimatedDelivery: data.estimatedDelivery ? new Date(data.estimatedDelivery) : undefined,
          deliveryNotes: data.deliveryNotes,
        }

        await updateOrderMutation.mutateAsync(updatePayload)
        resetFormAndCloseModal()
        refetch()
      }
    } catch (error) {
      console.error(error)
      const errorMessage = error instanceof Error ? error.message : "Something went wrong. Please try again."
      toast.error("Error", { description: errorMessage })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate totals
  const getTotalRevenue = (orders: Order[]) => {
    return orders.reduce((total, order) => {
      return total + (order.status !== "CANCELLED" && order.status !== "REFUNDED" ? order.total : 0)
    }, 0)
  }

  const truncatedText = (text: string, length: number) => {
    if (text.length > length) {
      return text.slice(0, length) + "..."
    }
    return text
  }

  // Define columns for the data table
  const columns: Column<Order>[] = [
    {
      header: "Order",
      accessorKey: "orderNumber",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.orderNumber}</span>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            {getDeliveryMethodIcon(row.deliveryMethod)}
            <span>{row.deliveryMethod}</span>
            <span>•</span>
            <span>
              {row.items.length} item{row.items.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Customer",
      accessorKey: "userId",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-medium">{truncatedText(userMap[row.userId]?.name || "Unknown Customer", 20)}</span>
          <span className="text-xs text-muted-foreground">{truncatedText(userMap[row.userId]?.email || "", 25)}</span>
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => (
        <div className="flex items-center space-x-2">
          {getStatusIcon(row.status)}
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(row.status)}`}
          >
            {row.status.replace("_", " ")}
          </span>
        </div>
      ),
    },
    {
      header: "Payment",
      accessorKey: "paymentStatus",
      cell: (row) => (
        <div className="flex flex-col items-start justify-center">
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(row.paymentStatus)}`}
          >
            {row.paymentStatus.replace("_", " ")}
          </span>
          <span className="text-xs text-muted-foreground mt-1">{row.paymentMethod.replace("_", " ")}</span>
        </div>
      ),
    },
    {
      header: "Total",
      accessorKey: "total",
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-medium">{formatPrice(Number(row.total))}</span>
          <div className="text-xs text-muted-foreground">
            <div>Sub: {formatPrice(Number(row.subtotal))}</div>
            {row.discount > 0 && <div>Disc: -{formatPrice(Number(row.discount))}</div>}
            {row.taxAmount > 0 && <div>Tax: {formatPrice(Number(row.taxAmount))}</div>}
            {row.deliveryFee > 0 && <div>Del: {formatPrice(Number(row.deliveryFee))}</div>}
          </div>
        </div>
      ),
    },
    {
      header: "Date",
      accessorKey: "createdAt",
      cell: (row) => (
        <div className="flex flex-col">
          <span>{formatDate(row.createdAt)}</span>
          {row.estimatedDelivery && (
            <span className="text-xs text-muted-foreground">Est: {formatDate(row.estimatedDelivery)}</span>
          )}
          {row.trackingNumber && <span className="text-xs text-blue-600 font-mono">{row.trackingNumber}</span>}
        </div>
      ),
    },
  ]

  // Generate subtitle with total revenue
  const getSubtitle = (orderCount: number, totalRevenue: number) => {
    return `${orderCount} ${orderCount === 1 ? "order" : "orders"} | Total Revenue: ${formatCurrency(totalRevenue)}`
  }

  return (
    <div>
      <DataTable<Order>
        title={title}
        emptyStateModalTitle="No Orders Yet"
        emptyStateModalDescription="Orders will appear here when customers make purchases."
        subtitle={ordersData?.length > 0 ? getSubtitle(ordersData.length, getTotalRevenue(ordersData)) : undefined}
        data={ordersData}
        columns={columns}
        keyField="id"
        isLoading={false}
        onRefresh={refetch}
        onRowClick={handleOrderClick}
        actions={{
          onExport: handleExport,
        }}
        filters={{
          searchFields: ["orderNumber", "userId"],
          enableDateFilter: true,
          getItemDate: (item) => new Date(item.createdAt ?? 0),
        }}
        renderRowActions={(order) => (
          <div data-action-button onClick={(e) => e.stopPropagation()}>
            <TableActions.RowActions onEdit={() => handleEditClick(order)} />
          </div>
        )}
      />

      {/* Order Update Form Dialog */}
      <EntityForm
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        title="Update Order"
        form={form}
        onSubmit={onSubmit}
        isSubmitting={updateOrderMutation.isPending}
        submitLabel="Update Order"
        size="md"
      >
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Order Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="PROCESSING">Processing</SelectItem>
                    <SelectItem value="SHIPPED">Shipped</SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="REFUNDED">Refunded</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="trackingNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tracking Number (Optional)</FormLabel>
              <FormControl>
                <div className="relative">
                  <Truck className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Enter tracking number" className="pl-8" {...field} value={field.value ?? ""} />
                </div>
              </FormControl>
              <FormDescription>Provide tracking number for shipped orders</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="estimatedDelivery"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated Delivery (Optional)</FormLabel>
              <FormControl>
                <Input type="date" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormDescription>Expected delivery date</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="col-span-1 md:col-span-2">
          <FormField
            control={form.control}
            name="deliveryNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Delivery Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Add delivery instructions or notes..."
                    rows={2}
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormDescription>Special delivery instructions for the customer</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="col-span-1 md:col-span-2">
          <FormField
            control={form.control}
            name="internalNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Internal Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Add internal notes about this order..."
                    rows={3}
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormDescription>These notes are for internal use only</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </EntityForm>
    </div>
  )
}
