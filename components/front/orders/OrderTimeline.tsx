"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Check, Clock, Package, Truck, MapPin, XCircle, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"

interface TimelineStep {
  status: string
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  date?: string
}

interface OrderTimelineProps {
  currentStatus: string
  orderDate: string
  estimatedDelivery?: string
  actualDelivery?: string
    trackingNumber: string | null  // Changed from string | undefined to string | null
}

export function OrderTimeline({
  currentStatus,
  orderDate,
  estimatedDelivery,
  actualDelivery,
  trackingNumber,
}: OrderTimelineProps) {
  const getTimelineSteps = (): TimelineStep[] => {
    const baseSteps: TimelineStep[] = [
      {
        status: "PENDING",
        label: "Order Placed",
        description: "Your order has been received and is being reviewed",
        icon: Clock,
        date: orderDate,
      },
      {
        status: "CONFIRMED",
        label: "Order Confirmed",
        description: "Your order has been confirmed and payment is being processed",
        icon: Check,
      },
      {
        status: "PROCESSING",
        label: "Processing",
        description: "Your order is being prepared for shipment",
        icon: Package,
      },
      {
        status: "SHIPPED",
        label: "Shipped",
        description: trackingNumber
          ? `Your order is on its way! Tracking: ${trackingNumber}`
          : "Your order is on its way!",
        icon: Truck,
      },
      {
        status: "DELIVERED",
        label: "Delivered",
        description: "Your order has been successfully delivered",
        icon: MapPin,
        date: actualDelivery,
      },
    ]

    // Handle special statuses
    if (currentStatus === "CANCELLED") {
      return [
        baseSteps[0], // Order Placed
        {
          status: "CANCELLED",
          label: "Order Cancelled",
          description: "Your order has been cancelled",
          icon: XCircle,
        },
      ]
    }

    if (currentStatus === "REFUNDED") {
      return [
        ...baseSteps.slice(0, 4), // Up to shipped
        {
          status: "REFUNDED",
          label: "Refunded",
          description: "Your order has been refunded",
          icon: RotateCcw,
        },
      ]
    }

    return baseSteps
  }

  const steps = getTimelineSteps()
  const currentStepIndex = steps.findIndex((step) => step.status === currentStatus)

  const getStepStatus = (stepIndex: number) => {
    if (currentStatus === "CANCELLED" && stepIndex > 0) {
      return stepIndex === 1 ? "current" : "upcoming"
    }

    if (currentStatus === "REFUNDED") {
      if (stepIndex < steps.length - 1) return "completed"
      return "current"
    }

    if (stepIndex < currentStepIndex) return "completed"
    if (stepIndex === currentStepIndex) return "current"
    return "upcoming"
  }

  const getStepColors = (status: string) => {
    switch (status) {
      case "completed":
        return {
          bg: "bg-green-100",
          border: "border-green-500",
          icon: "text-green-600",
          line: "bg-green-500",
        }
      case "current":
        return {
          bg: "bg-sky-100",
          border: "border-sky-500",
          icon: "text-sky-600",
          line: "bg-gray-300",
        }
      case "upcoming":
        return {
          bg: "bg-gray-100",
          border: "border-gray-300",
          icon: "text-gray-400",
          line: "bg-gray-300",
        }
      default:
        return {
          bg: "bg-gray-100",
          border: "border-gray-300",
          icon: "text-gray-400",
          line: "bg-gray-300",
        }
    }
  }

  return (
    <div className="relative">
      {steps.map((step, index) => {
        const stepStatus = getStepStatus(index)
        const colors = getStepColors(stepStatus)
        const Icon = step.icon
        const isLast = index === steps.length - 1

        return (
          <motion.div
            key={step.status}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative flex items-start pb-8"
          >
            {/* Timeline line */}
            {!isLast && <div className={cn("absolute left-6 top-12 w-0.5 h-16 -ml-px", colors.line)} />}

            {/* Step icon */}
            <div
              className={cn(
                "relative flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300",
                colors.bg,
                colors.border,
              )}
            >
              {stepStatus === "completed" ? (
                <Check className={cn("w-6 h-6", colors.icon)} />
              ) : (
                <Icon className={cn("w-6 h-6", colors.icon)} />
              )}
            </div>

            {/* Step content */}
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between">
                <h4
                  className={cn(
                    "text-lg font-semibold transition-colors duration-300",
                    stepStatus === "current"
                      ? "text-sky-600"
                      : stepStatus === "completed"
                        ? "text-green-600"
                        : "text-gray-500",
                  )}
                >
                  {step.label}
                </h4>
                {step.date && (
                  <span className="text-sm text-gray-500">
                    {new Date(step.date).toLocaleDateString("en-ZA", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </div>
              <p
                className={cn(
                  "text-sm mt-1 transition-colors duration-300",
                  stepStatus === "current" ? "text-gray-700" : "text-gray-500",
                )}
              >
                {step.description}
              </p>

              {/* Estimated delivery for shipped status */}
              {step.status === "SHIPPED" && estimatedDelivery && stepStatus === "current" && (
                <div className="mt-2 p-3 bg-sky-50 border border-sky-200 rounded-lg">
                  <p className="text-sm text-sky-700">
                    <strong>Estimated Delivery:</strong>{" "}
                    {new Date(estimatedDelivery).toLocaleDateString("en-ZA", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}