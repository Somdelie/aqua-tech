import { formatPrice } from "@/lib/formatPrice"


interface OrderSummaryProps {
  items: Array<{
    id: string
    quantity: number
    product: {
      id: string
      name: string
      price: number
      thumbnail?: string | null
    }
    variant?: {
      id: string
      name: string
      price: number
    } | null
  }>
  deliveryMethod?: "DELIVERY" | "COLLECTION"
}

export function OrderSummary({ items, deliveryMethod = "DELIVERY" }: OrderSummaryProps) {
  const subtotal = items.reduce((sum, item) => {
    const price = item.variant?.price || item.product.price
    return sum + price * item.quantity
  }, 0)

  const deliveryFee = deliveryMethod === "DELIVERY" ? 150 : 0
  const total = subtotal + deliveryFee

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {deliveryMethod === "DELIVERY" && (
          <div className="flex justify-between text-sm">
            <span>Delivery</span>
            <span>{formatPrice(deliveryFee)}</span>
          </div>
        )}
        {deliveryMethod === "COLLECTION" && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Collection</span>
            <span>Free</span>
          </div>
        )}
        <div className="flex justify-between text-sm">
          <span>Tax</span>
          <span>Included</span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Total</span>
        <span className="text-sm font-semibold">{formatPrice(total)}</span>
      </div>
    </div>
  )
}
