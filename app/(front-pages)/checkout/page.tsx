"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CreditCard, MapPin, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import Link from "next/link"
import { createOrderFromCart } from "@/actions/order-actions"
import { formatPrice } from "@/lib/formatPrice"
import { useCart } from "@/providers/cart-context"
import { CheckoutForm } from "@/components/front/checkout/CheckoutForm" // Import type
import { OrderSummary } from "@/components/front/checkout/OrderSummary"
import { CheckoutFormData } from '@/components/front/checkout/CheckoutForm';


export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalAmount, itemCount, clearCartItems } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [deliveryMethod, setDeliveryMethod] = useState<"DELIVERY" | "COLLECTION">("DELIVERY")

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart")
    }
  }, [items.length, router])

  const handleOrderSubmit = async (orderData: CheckoutFormData) => {
    setIsSubmitting(true)
    const deliveryFee = orderData.deliveryMethod === "DELIVERY" ? 150 : 0
    const calculatedSubtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
    const calculatedTotal = calculatedSubtotal + deliveryFee // This total is passed to the server action

    try {
      const result = await createOrderFromCart({
        ...orderData, // Spreads all fields from CheckoutFormData
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
        subtotal: calculatedSubtotal, // Pass calculated subtotal
        total: calculatedTotal, // Pass calculated total including delivery fee
      })

      if (result.success) {
        await clearCartItems()
        toast.success("Order placed successfully!")
        router.push(`/orders/${result?.data?.id}`)
      } else {
        toast.error(result.message || "Failed to place order")
      }
    } catch (error) {
      console.error("Error submitting order:", error) // Log the error for debugging
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (items.length === 0) {
    return null // Will redirect
  }

  const steps = [
    { id: 1, name: "Shipping", icon: MapPin },
    { id: 2, name: "Payment", icon: CreditCard },
    { id: 3, name: "Review", icon: ShoppingBag },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8 pt-24">
      <div className="container max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="outline" asChild>
              <Link href="/cart">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Cart
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
              <p className="text-gray-600">
                {itemCount} {itemCount === 1 ? "item" : "items"} • {formatPrice(totalAmount)}
              </p>
            </div>
          </div>
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step.id ? "bg-teal-600 border-teal-600 text-white" : "border-gray-300 text-gray-400"
                  }`}
                >
                  <step.icon className="w-5 h-5" />
                </div>
                <span
                  className={`ml-2 text-sm font-medium ${currentStep >= step.id ? "text-teal-600" : "text-gray-400"}`}
                >
                  {step.name}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${currentStep > step.id ? "bg-teal-600" : "bg-gray-300"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <CheckoutForm
              onSubmit={handleOrderSubmit}
              isSubmitting={isSubmitting}
              currentStep={currentStep}
              setCurrentStep={setCurrentStep}
              onDeliveryMethodChange={setDeliveryMethod}
            />
          </div>
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary items={items} deliveryMethod={deliveryMethod} />
          </div>
        </div>
      </div>
    </div>
  )
}
