"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Heart,
  ShoppingCart,
  Eye,
  Star,
  Smartphone,
  Laptop,
  Tablet,
  Headphones,
  Printer,
  Projector,
  Monitor,
  Computer,
  Tv,
  Plus,
  Minus,
  Loader2,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/types/product"
import { useCart } from '../../../providers/cart-context';
import { useWishlist } from '../../../providers/wishlist-context';


interface ProductCardProps {
  product: Product
}

const getProductIcon = (type: string) => {
  switch (type) {
    case "PHONE":
      return Smartphone
    case "COMPUTER":
      return Computer
    case "LAPTOP":
      return Laptop
    case "DESKTOP":
      return Computer
    case "GAMING_PC":
      return Computer
    case "GAMING_LAPTOP":
      return Laptop
    case "MONITOR":
      return Monitor
    case "TV":
      return Tv
    case "PRINTER":
      return Printer
    case "SCANNER":
      return Printer
    case "PROJECTOR":
      return Projector
    case "TABLET":
      return Tablet
    case "ACCESSORY":
      return Headphones
    default:
      return Smartphone
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
}

const quantityVariants = {
  initial: { scale: 1 },
  loading: {
    scale: 0.95,
    transition: { duration: 0.1 },
  },
  success: {
    scale: 1.05,
    transition: { duration: 0.2 },
  },
  exit: {
    scale: 1,
    transition: { duration: 0.1 },
  },
}

const badgeVariants = {
  initial: { scale: 1, y: 0 },
  update: {
    scale: 1.1,
    y: -2,
    transition: {
      type: "spring" as "spring",
      stiffness: 500,
      damping: 30,
    },
  },
  exit: {
    scale: 1,
    y: 0,
    transition: { duration: 0.2 },
  },
}

export function ProductCard({ product }: ProductCardProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false)
  const [quantityAction, setQuantityAction] = useState<"increase" | "decrease" | null>(null)
  const [showQuantityAnimation, setShowQuantityAnimation] = useState(false)

  const IconComponent = getProductIcon(product.type)

  // Cart and Wishlist hooks
  const { addItem: addToCart, updateQuantity, isInCart, getCartItemQuantity } = useCart()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist()

  // Check if product is in wishlist and cart
  const isWishlisted = isInWishlist(product.id)
  const productInCart = isInCart(product.id)
  const cartQuantity = getCartItemQuantity(product.id)

  const discountedPrice = product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price
  const savings = product.price - discountedPrice

  const handleAddToCart = async () => {
    setIsAddingToCart(true)
    try {
      if (productInCart) {
        // If product is already in cart, increase quantity by 1
        setQuantityAction("increase")
        await updateQuantity(product.id, cartQuantity + 1)
        setShowQuantityAnimation(true)
        setTimeout(() => setShowQuantityAnimation(false), 500)
      } else {
        // If product is not in cart, add it with quantity 1
        await addToCart(product.id, 1)
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
    } finally {
      setIsAddingToCart(false)
      setQuantityAction(null)
    }
  }

  const handleDecreaseQuantity = async () => {
    if (cartQuantity > 1) {
      setIsAddingToCart(true)
      setQuantityAction("decrease")
      try {
        await updateQuantity(product.id, cartQuantity - 1)
        setShowQuantityAnimation(true)
        setTimeout(() => setShowQuantityAnimation(false), 500)
      } catch (error) {
        console.error("Error updating cart:", error)
      } finally {
        setIsAddingToCart(false)
        setQuantityAction(null)
      }
    }
  }

  const handleIncreaseQuantity = async () => {
    if (cartQuantity < product.stock) {
      setIsAddingToCart(true)
      setQuantityAction("increase")
      try {
        await updateQuantity(product.id, cartQuantity + 1)
        setShowQuantityAnimation(true)
        setTimeout(() => setShowQuantityAnimation(false), 500)
      } catch (error) {
        console.error("Error updating cart:", error)
      } finally {
        setIsAddingToCart(false)
        setQuantityAction(null)
      }
    }
  }

  const handleToggleWishlist = async () => {
    setIsTogglingWishlist(true)
    try {
      if (isWishlisted) {
        await removeFromWishlist(product.id)
      } else {
        await addToWishlist(product.id)
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error)
    } finally {
      setIsTogglingWishlist(false)
    }
  }

  return (
    <motion.div variants={cardVariants} whileHover={{ scale: 1.02 }} className="relative">
      <Card className="h-full border-0 py-0 shadow hover:shadow-lg transition-all duration-300 bg-white backdrop-blur-sm overflow-hidden">
        {/* Discount Badge */}
        {product.discount > 0 && (
          <div className="absolute top-3 left-3 z-10">
            <Badge className="bg-red-500 text-white">-{product.discount}%</Badge>
          </div>
        )}

        {/* Cart Quantity Badge with Animation */}
        <AnimatePresence>
          {productInCart && (
            <motion.div
              className="absolute top-3 left-1/2 transform -translate-x-1/2 z-10"
              variants={badgeVariants}
              initial="initial"
              animate={showQuantityAnimation ? "update" : "initial"}
              exit="exit"
            >
              <Badge className="bg-green-500 text-white flex items-center gap-1">
                <AnimatePresence mode="wait">
                  {isAddingToCart ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Loader2 className="h-3 w-3 animate-spin" />
                    </motion.div>
                  ) : (
                    <motion.span
                      key="quantity"
                      initial={{ opacity: 0, y: quantityAction === "increase" ? -10 : 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: quantityAction === "increase" ? 10 : -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      {cartQuantity}
                    </motion.span>
                  )}
                </AnimatePresence>
                <span className="text-xs">in cart</span>
              </Badge>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wishlist Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-3 right-3 z-10 bg-white/80 hover:bg-white"
          onClick={handleToggleWishlist}
          disabled={isTogglingWishlist}
        >
          {isTogglingWishlist ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Heart className={`h-4 w-4 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
          )}
        </Button>

        {/* Product Image */}
        <div className="relative aspect-[4/3] bg-gradient-to-br flex items-center justify-center">
          <Image
            src={product.thumbnail || "/placeholder.jpg"}
            alt={product.name}
            fill
            className="object-contain"
            sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-black/5" />

          {/* Product Type Icon */}
          <div className="absolute bottom-3 left-3 p-2 bg-white/90 rounded-full">
            <IconComponent className="h-4 w-4 text-gray-600" />
          </div>

          {/* Quick View Button */}
          <Button
            variant="secondary"
            size="sm"
            className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
            asChild
          >
            <Link href={`/products/${product.slug}`}>
              <Eye className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <CardContent className="px-3">
          {/* Brand & Category */}
          <div className="flex items-center justify-between mb-1">
            <Badge variant="outline" className="text-xs">
              {product.brand.name}
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {product.category.name}
            </Badge>
          </div>

          {/* Product Name */}
          <h3 className="font-semibold text-base mb-1 line-clamp-1">{product.name}</h3>

          {/* Description */}
          <p className="text-sm text-muted-foreground mb-2 line-clamp-1">{product.description}</p>

          {/* Price */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl font-bold text-green-600">R{discountedPrice.toLocaleString()}</span>
            {product.discount > 0 && (
              <>
                <span className="text-xs text-muted-foreground line-through">R{product.price.toLocaleString()}</span>
                <span className="text-xs text-green-600 font-medium">Save R{savings.toLocaleString()}</span>
              </>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2 mb-2">
            <div
              className={`w-2 h-2 rounded-full ${
                product.stock > 5 ? "bg-green-500" : product.stock > 0 ? "bg-yellow-500" : "bg-red-500"
              }`}
            />
            <span className="text-xs text-muted-foreground">
              {product.stock > 5 ? "In Stock" : product.stock > 0 ? `Only ${product.stock} left` : "Out of Stock"}
            </span>
          </div>

          {/* Rating (placeholder) */}
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            ))}
            <span className="text-xs text-muted-foreground ml-1">(4.8)</span>
          </div>
        </CardContent>

        <CardFooter className="p-3 pt-0">
          <div className="flex gap-2 w-full">
            {productInCart ? (
              // Show quantity controls if product is in cart
              <motion.div
                className="flex items-center gap-1 flex-1"
                variants={quantityVariants}
                initial="initial"
                animate={isAddingToCart ? "loading" : "initial"}
              >
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0 bg-transparent relative overflow-hidden"
                  onClick={handleDecreaseQuantity}
                  disabled={isAddingToCart || cartQuantity <= 1}
                >
                  <AnimatePresence mode="wait">
                    {isAddingToCart && quantityAction === "decrease" ? (
                      <motion.div
                        key="loading-decrease"
                        initial={{ opacity: 0, rotate: -180 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: 180 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Loader2 className="h-3 w-3 animate-spin" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="minus"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Minus className="h-3 w-3" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>

                <div className="flex-1 text-center">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={cartQuantity}
                      className="text-sm font-medium"
                      initial={{
                        opacity: 0,
                        y: quantityAction === "increase" ? -10 : quantityAction === "decrease" ? 10 : 0,
                      }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{
                        opacity: 0,
                        y: quantityAction === "increase" ? 10 : quantityAction === "decrease" ? -10 : 0,
                      }}
                      transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
                    >
                      {cartQuantity} in cart
                    </motion.span>
                  </AnimatePresence>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0 bg-transparent relative overflow-hidden"
                  onClick={handleIncreaseQuantity}
                  disabled={isAddingToCart || cartQuantity >= product.stock}
                >
                  <AnimatePresence mode="wait">
                    {isAddingToCart && quantityAction === "increase" ? (
                      <motion.div
                        key="loading-increase"
                        initial={{ opacity: 0, rotate: -180 }}
                        animate={{ opacity: 1, rotate: 0 }}
                        exit={{ opacity: 0, rotate: 180 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Loader2 className="h-3 w-3 animate-spin" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="plus"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Plus className="h-3 w-3" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            ) : (
              // Show add to cart button if product is not in cart
              <Button
                size="sm"
                className="flex-1 relative overflow-hidden"
                onClick={handleAddToCart}
                disabled={!product.isAvailable || product.stock === 0 || isAddingToCart}
              >
                <AnimatePresence mode="wait">
                  {isAddingToCart ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center"
                    >
                      <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                      Adding...
                    </motion.div>
                  ) : (
                    <motion.div
                      key="add-to-cart"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center"
                    >
                      <ShoppingCart className="mr-1 h-3 w-3" />
                      Add to Cart
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            )}
            <Button variant="outline" size="sm" asChild>
              <Link href={`/products/${product.slug}`}>
                <Eye className="h-3 w-3" />
              </Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
