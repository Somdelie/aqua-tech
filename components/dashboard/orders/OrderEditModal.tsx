"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import { toast } from "sonner"
import { Truck, RefreshCw } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useOrderUpdate } from "@/hooks/useOrderQueries"
import { useRouter } from "next/navigation"

interface Order {
  id: string
  orderNumber: string
  status: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "REFUNDED"
  trackingNumber: string | null
  estimatedDelivery: string | Date | null
  internalNotes: string | null
}

interface OrderEditModalProps {
  order: Order
  open: boolean
  onOpenChange: (open: boolean) => void
}

const orderUpdateSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]),
  internalNotes: z.string().optional(),
  trackingNumber: z.string().optional(),
  estimatedDelivery: z.string().optional(),
})

type OrderUpdateData = z.infer<typeof orderUpdateSchema>

// Function to generate a realistic tracking number
const generateTrackingNumber = (): string => {
  const prefix = "WP" // WalterProjects prefix
  const timestamp = Date.now().toString().slice(-6) // Last 6 digits of timestamp
  const random = Math.random().toString(36).substring(2, 8).toUpperCase() // Random alphanumeric
  return `${prefix}${timestamp}${random}`
}

export default function OrderEditModal({ order, open, onOpenChange }: OrderEditModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const updateOrderMutation = useOrderUpdate(order.id)
  const router = useRouter()

  const form = useForm<OrderUpdateData>({
    resolver: zodResolver(orderUpdateSchema),
    defaultValues: {
      status: order.status,
      internalNotes: order.internalNotes || "",
      trackingNumber: order.trackingNumber || "",
      estimatedDelivery: order.estimatedDelivery ? format(new Date(order.estimatedDelivery), "yyyy-MM-dd") : "",
    },
  })

  useEffect(() => {
    if (order) {
      form.reset({
        status: order.status,
        internalNotes: order.internalNotes || "",
        trackingNumber: order.trackingNumber || "",
        estimatedDelivery: order.estimatedDelivery ? format(new Date(order.estimatedDelivery), "yyyy-MM-dd") : "",
      })
    }
  }, [order, form])

  const handleGenerateTracking = async () => {
    setIsGenerating(true)

    // Simulate API call delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 500))

    const newTrackingNumber = generateTrackingNumber()
    form.setValue("trackingNumber", newTrackingNumber)

    toast.success("Tracking number generated successfully")
    setIsGenerating(false)
  }

  const onSubmit = async (data: OrderUpdateData) => {
    setIsSubmitting(true)

    try {
      const updatePayload = {
        status: data.status,
        internalNotes: data.internalNotes,
        trackingNumber: data.trackingNumber,
        estimatedDelivery: data.estimatedDelivery ? new Date(data.estimatedDelivery) : undefined,
      }

      await updateOrderMutation.mutateAsync(updatePayload)
      toast.success("Order updated successfully")
      onOpenChange(false)
      router.refresh() // Refresh the server component
    } catch (error) {
      console.error(error)
      const errorMessage = error instanceof Error ? error.message : "Something went wrong. Please try again."
      toast.error("Error", { description: errorMessage })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Update Order {order.orderNumber}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              <FormField
                control={form.control}
                name="trackingNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tracking Number (Optional)</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Truck className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Enter tracking number"
                            className="pl-8"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="default"
                          onClick={handleGenerateTracking}
                          disabled={isGenerating}
                          className="flex-shrink-0"
                        >
                          {isGenerating ? (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Generate
                            </>
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Provide tracking number for shipped orders or generate one automatically
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              {/* Spacer to ensure buttons don't get cut off */}
              <div className="pb-4" />
            </form>
          </Form>
        </ScrollArea>

        {/* Fixed footer with buttons */}
        <div className="flex-shrink-0 border-t pt-4 mt-4">
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} onClick={form.handleSubmit(onSubmit)}>
              {isSubmitting ? "Updating..." : "Update Order"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
