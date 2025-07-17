"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingBag, ArrowRight } from "lucide-react"
import Link from "next/link"

export function OrdersEmptyState() {
  return (
    <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-8 h-8 text-teal-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No orders yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          You haven't placed any orders yet. Start shopping to see your order history here.
        </p>
        <Button asChild className="group bg-teal-600 hover:bg-teal-700">
          <Link href="/products">
            Start Shopping
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
