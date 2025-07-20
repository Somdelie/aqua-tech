
import db from '@/prisma/db';
import DashboardClient from '../../../components/dashboard/dashboard-client';


export default async function DashboardPage() {
  const now = new Date()
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

  // Fetch Order Statistics
  const totalOrders = await db.order.count()
  const pendingOrders = await db.order.count({ where: { status: "PENDING" } })
  const processingOrders = await db.order.count({ where: { status: "PROCESSING" } })
  const completedOrders = await db.order.count({ where: { status: "DELIVERED" } }) // Assuming DELIVERED means completed

  const currentMonthRevenueResult = await db.order.aggregate({
    _sum: { totalAmount: true },
    where: {
      status: "DELIVERED",
      createdAt: { gte: currentMonthStart, lt: new Date(now.getFullYear(), now.getMonth() + 1, 1) },
    },
  })
  const currentMonthRevenue = currentMonthRevenueResult._sum.totalAmount || 0

  const lastMonthRevenueResult = await db.order.aggregate({
    _sum: { totalAmount: true },
    where: {
      status: "DELIVERED",
      createdAt: { gte: lastMonthStart, lt: lastMonthEnd },
    },
  })
  const lastMonthRevenue = lastMonthRevenueResult._sum.totalAmount || 0

  let monthlyGrowth = 0
  if (lastMonthRevenue > 0) {
    monthlyGrowth = ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
  } else if (currentMonthRevenue > 0) {
    monthlyGrowth = 100 // Infinite growth from zero
  }

  const orderStats = {
    total: totalOrders,
    pending: pendingOrders,
    processing: processingOrders,
    completed: completedOrders,
    revenue: currentMonthRevenue,
    monthlyGrowth: Number.parseFloat(monthlyGrowth.toFixed(2)),
  }

  // Fetch Recent Orders
  const recentOrders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 4,
    include: {
      user: true,
      items: {
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  })

  const formattedRecentOrders = recentOrders.map((order) => ({
    id: order.orderNumber,
    customer: order.user?.name || "N/A",
    device: order.items[0]?.product?.name || "N/A", // Using first item's product name as device
    issue: order.items[0]?.product?.category?.name || "N/A", // Using first item's product category as issue
    status: order.status.toLowerCase(),
    amount: order.totalAmount,
    date: order.createdAt.toISOString().split("T")[0],
  }))

  // Fetch Order Status Distribution
  const orderStatusCounts = await db.order.groupBy({
    by: ["status"],
    _count: { id: true },
  })

  const orderStatusData = orderStatusCounts.map((item) => {
    let color = "#9ca3af" // default gray
    if (item.status === "PENDING") color = "#f59e0b"
    if (item.status === "PROCESSING") color = "#3b82f6"
    if (item.status === "DELIVERED") color = "#10b981" // Assuming DELIVERED is 'completed'
    return {
      name: item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase(),
      value: item._count.id,
      color: color,
    }
  })

  // Fetch Revenue Data (last 6 months)
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(now.getMonth() - 5) // Start of the month 6 months ago
  sixMonthsAgo.setDate(1)
  sixMonthsAgo.setHours(0, 0, 0, 0)

  const allOrdersLastSixMonths = await db.order.findMany({
    where: {
      createdAt: { gte: sixMonthsAgo },
      status: "DELIVERED", // Only count delivered orders for revenue
    },
    select: {
      createdAt: true,
      totalAmount: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  })

  const monthlyRevenueMap = new Map<string, number>()
  for (let i = 0; i < 6; i++) {
    const date = new Date(sixMonthsAgo.getFullYear(), sixMonthsAgo.getMonth() + i, 1)
    const monthName = date.toLocaleString("default", { month: "short" })
    monthlyRevenueMap.set(monthName, 0)
  }

  allOrdersLastSixMonths.forEach((order) => {
    const monthName = order.createdAt.toLocaleString("default", { month: "short" })
    monthlyRevenueMap.set(monthName, (monthlyRevenueMap.get(monthName) || 0) + order.totalAmount)
  })

  const revenueData = Array.from(monthlyRevenueMap.entries()).map(([month, revenue]) => ({
    month,
    revenue: Number.parseFloat(revenue.toFixed(2)),
  }))

  // Fetch Product Sales Data
  const productSalesRaw = await db.orderItem.groupBy({
    by: ["productId"],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
  })

  const productSalesDataPromises = productSalesRaw.map(async (item) => {
    const product = await db.product.findUnique({
      where: { id: item.productId },
      include: { category: true },
    })
    return {
      category: product?.category?.name || "Unknown",
      sales: item._sum.quantity || 0,
    }
  })

  const productSalesDataAggregated = await Promise.all(productSalesDataPromises)

  // Aggregate by category name
  const aggregatedSalesMap = new Map<string, number>()
  productSalesDataAggregated.forEach((item) => {
    aggregatedSalesMap.set(item.category, (aggregatedSalesMap.get(item.category) || 0) + item.sales)
  })

  const finalProductSalesData = Array.from(aggregatedSalesMap.entries()).map(([category, sales]) => ({
    category,
    sales,
  }))

  return (
    <DashboardClient
      orderStats={orderStats}
      recentOrders={formattedRecentOrders}
      orderStatusData={orderStatusData}
      revenueData={revenueData}
      productSalesData={finalProductSalesData}
    />
  )
}
