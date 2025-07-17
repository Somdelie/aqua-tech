"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface OrderStatusBadgeProps {
  status: string
  className?: string
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "PENDING":
        return {
          label: "Pending",
          className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        }
      case "CONFIRMED":
        return {
          label: "Confirmed",
          className: "bg-teal-100 text-teal-800 border-teal-200",
        }
      case "PROCESSING":
        return {
          label: "Processing",
          className: "bg-purple-100 text-purple-800 border-purple-200",
        }
      case "SHIPPED":
        return {
          label: "Shipped",
          className: "bg-indigo-100 text-indigo-800 border-indigo-200",
        }
      case "DELIVERED":
        return {
          label: "Delivered",
          className: "bg-green-100 text-green-800 border-green-200",
        }
      case "CANCELLED":
        return {
          label: "Cancelled",
          className: "bg-red-100 text-red-800 border-red-200",
        }
      case "REFUNDED":
        return {
          label: "Refunded",
          className: "bg-gray-100 text-gray-800 border-gray-200",
        }
      default:
        return {
          label: status,
          className: "bg-gray-100 text-gray-800 border-gray-200",
        }
    }
  }

  const config = getStatusConfig(status)

  return (
    <Badge
      variant="outline"
      className={cn("font-medium transition-all duration-200 hover:scale-105", config.className, className)}
    >
      {config.label}
    </Badge>
  )
}
