"use client"
import Link from "next/link"
import Image from "next/image"
import { Heart, Trash2, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useWishlist } from '../../providers/wishlist-context';
import { useCart } from '../../providers/cart-context';
import { formatPrice } from '../../lib/formatPrice';

export function WishlistDrawer() {
  const { items, itemCount, removeItem, isLoading: wishlistLoading } = useWishlist()
  const { addItem: addToCart, isLoading: cartLoading } = useCart()

  const handleAddToCart = async (productId: string) => {
    await addToCart(productId, 1)
    await removeItem(productId) // Remove from wishlist after adding to cart
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Heart className="h-5 w-5" />
          {itemCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[400px] md:w-[450px] p-0 flex flex-col">
        <SheetHeader className="px-4 py-6 border-b">
          <SheetTitle className="text-left">Wishlist ({itemCount})</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center px-4">
            <div className="text-center text-gray-500">
              <Heart className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Your wishlist is empty</p>
              <p className="text-sm mt-2">Save items you love for later!</p>
            </div>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 px-4">
              <div className="space-y-4 py-4">
                {items.map((item) => (
                  <div key={item.id} className="group">
                    <div className="flex items-start gap-4 p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                      <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.product.thumbnail || "/placeholder.svg"}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0 space-y-2">
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="block text-sm font-medium hover:text-teal-600 line-clamp-2 leading-tight"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-xs text-gray-500">{item.product.brand.name}</p>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-teal-600">
                            {formatPrice(item.product.price)}
                          </span>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-8 w-8 bg-transparent hover:bg-teal-50 hover:border-teal-200"
                              onClick={() => handleAddToCart(item.productId)}
                              disabled={cartLoading || wishlistLoading}
                              title="Add to Cart"
                            >
                              <ShoppingCart className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeItem(item.productId)}
                              disabled={wishlistLoading}
                              title="Remove from Wishlist"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t bg-white p-4">
              <Button 
                variant="outline" 
                className="w-full bg-transparent border-teal-600 text-teal-600 hover:bg-teal-50" 
                asChild
              >
                <Link href="/wishlist">View All Wishlist Items</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}