
import db from '@/prisma/db';
import ReportsClient from '../../../../components/dashboard/reports/reports-client';

export default async function ReportsPage() {
  // 1. Fetch Summary Statistics
  const totalRevenueResult = await db.order.aggregate({
    _sum: { totalAmount: true },
    where: { status: "DELIVERED" },
  })
  const totalOrdersCount = await db.order.count()
  const totalRevenue = totalRevenueResult._sum.totalAmount || 0
  const averageOrderValue = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0

  // 2. Fetch Sales by Product Category
  const categorySalesRaw = await db.orderItem.groupBy({
    by: ["productId"],
    _sum: { quantity: true, totalPrice: true },
  })

  const categorySalesPromises = categorySalesRaw.map(async (item) => {
    const product = await db.product.findUnique({
      where: { id: item.productId },
      include: { category: true },
    })
    return {
      category: product?.category?.name || "Unknown",
      totalSales: item._sum.totalPrice || 0,
      quantitySold: item._sum.quantity || 0,
    }
  })

  const aggregatedCategorySales = await Promise.all(categorySalesPromises)

  const categorySalesMap = new Map<string, { totalSales: number; quantitySold: number }>()
  aggregatedCategorySales.forEach((item) => {
    const existing = categorySalesMap.get(item.category) || { totalSales: 0, quantitySold: 0 }
    categorySalesMap.set(item.category, {
      totalSales: existing.totalSales + item.totalSales,
      quantitySold: existing.quantitySold + item.quantitySold,
    })
  })

  const categorySalesData = Array.from(categorySalesMap.entries()).map(([category, data]) => ({
    name: category,
    sales: Number.parseFloat(data.totalSales.toFixed(2)),
    quantity: data.quantitySold,
  }))

  // 3. Fetch Order Status Breakdown
  const orderStatusCounts = await db.order.groupBy({
    by: ["status"],
    _count: { id: true },
  })

  const orderStatusData = orderStatusCounts.map((item) => {
    let color = "#9ca3af" // default gray
    if (item.status === "PENDING") color = "#f59e0b"
    if (item.status === "PROCESSING") color = "#3b82f6"
    if (item.status === "DELIVERED") color = "#10b981"
    if (item.status === "CANCELLED") color = "#ef4444"
    if (item.status === "SHIPPED") color = "#8b5cf6"
    return {
      name: item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase(),
      value: item._count.id,
      color: color,
    }
  })

  // 4. Fetch Recent Orders for Table
  const recentOrders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 10, // Display more recent orders for a report
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
    device: order.items[0]?.product?.name || "N/A",
    issue: order.items[0]?.product?.category?.name || "N/A",
    status: order.status.toLowerCase(),
    amount: order.totalAmount,
    date: order.createdAt.toISOString().split("T")[0],
  }))

  const reportData = {
    summaryStats: {
      totalRevenue: totalRevenue,
      totalOrdersCount: totalOrdersCount,
      averageOrderValue: averageOrderValue,
    },
    categorySalesData: categorySalesData,
    orderStatusData: orderStatusData,
    recentOrders: formattedRecentOrders,
  }

  return <ReportsClient {...reportData} />
}
