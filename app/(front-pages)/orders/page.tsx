import { Suspense } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShoppingBag, Package, Clock, CheckCircle } from "lucide-react"
import { getUserOrders } from "@/actions/order-actions"
import { OrdersLoading } from '../../../components/front/orders/OrdersLoading';
import { OrderCard } from '../../../components/front/orders/OrderCard.tsx';
import { OrdersEmptyState } from '../../../components/front/orders/OrdersEmptyState';

async function OrdersContent() {
  const { data: orders } = await getUserOrders()

  if (!orders) {
    return (
      <Card className="animate-in fade-in slide-in-from-bottom-4">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <Package className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2 text-red-600">Error Loading Orders</h3>
          <p className="text-muted-foreground">
            There was an error fetching your orders. Please try again later or contact support if the issue persists.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!orders || orders.length === 0) {
    return <OrdersEmptyState />
  }

  // Calculate order statistics
  const stats = {
    total: orders.length,
    pending: orders.filter((order) => ["PENDING", "CONFIRMED", "PROCESSING"].includes(order.status)).length,
    shipped: orders.filter((order) => order.status === "SHIPPED").length,
    delivered: orders.filter((order) => order.status === "DELIVERED").length,
  }

  return (
    <div className="space-y-6">
      {/* Order Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="animate-in fade-in slide-in-from-left-4 duration-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-teal-600">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-in fade-in slide-in-from-left-4 duration-500 delay-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Processing</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-in fade-in slide-in-from-left-4 duration-500 delay-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Package className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.shipped}</p>
                <p className="text-sm text-muted-foreground">Shipped</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-in fade-in slide-in-from-left-4 duration-500 delay-300">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.delivered}</p>
                <p className="text-sm text-muted-foreground">Delivered</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Your Orders</h2>
          <Badge variant="secondary" className="text-sm">
            {orders.length} order{orders.length !== 1 ? "s" : ""}
          </Badge>
        </div>

        <div className="space-y-4">
          {orders.map((order, index) => (
            <OrderCard key={order.id} order={order} index={index} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function OrdersPage() {
  return (
    <div className="container max-w-6xl mx-auto py-8 px-4 pt-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 animate-in fade-in slide-in-from-top-4 duration-500">My Orders</h1>
        <p className="text-muted-foreground animate-in fade-in slide-in-from-top-4 duration-500 delay-100">
          Track and manage your order history
        </p>
      </div>

      <Suspense fallback={<OrdersLoading />}>
        <OrdersContent />
      </Suspense>
    </div>
  )
}
