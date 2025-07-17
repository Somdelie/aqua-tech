import { Suspense } from "react"
import TableLoading from "@/components/ui/TableLoading"
import { getAllOrders } from "@/actions/order-actions"
import { getAllUsers } from "@/actions/users-action"

import OrdersListing from "@/components/dashboard/orders/OrdersListing"

const OrdersPage = async () => {
  // Fetch all required data
  const [ordersResult, usersData] = await Promise.all([getAllOrders(), getAllUsers()])

  // Handle errors if needed
  if (ordersResult.error) {
    console.error("Error fetching orders:", ordersResult.error)
  }

  // Handle users data (your getAllUsers returns users array directly or 0)
  const users = Array.isArray(usersData) ? usersData : []

  // Create user map for OrdersListing (customers)
  const userMap = users.reduce(
    (acc: Record<string, { id: string; name: string; email: string; firstName: string; lastName: string }>, user) => {
      acc[user.id] = {
        id: user.id,
        name: user.name || "Unknown User",
        email: user.email,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
      }
      return acc
    },
    {},
  )

  return (
    <Suspense fallback={<TableLoading />}>
      <OrdersListing title="Orders" userMap={userMap} />
    </Suspense>
  )
}

export default OrdersPage
