/**
 * Calculate discount percentage from original price and selling price
 * @param originalPrice - The original price of the product
 * @param sellingPrice - The current selling price
 * @returns Discount percentage (0-100)
 */
export function calculateDiscountPercentage(originalPrice: number | null, sellingPrice: number): number {
  if (!originalPrice || originalPrice <= 0 || sellingPrice <= 0) {
    return 0
  }

  if (sellingPrice >= originalPrice) {
    return 0
  }

  const discount = ((originalPrice - sellingPrice) / originalPrice) * 100
  return Math.round(discount * 100) / 100 // Round to 2 decimal places
}

/**
 * Calculate the amount saved
 * @param originalPrice - The original price of the product
 * @param sellingPrice - The current selling price
 * @returns Amount saved
 */
export function calculateSavingsAmount(originalPrice: number | null, sellingPrice: number): number {
  if (!originalPrice || originalPrice <= 0 || sellingPrice <= 0) {
    return 0
  }

  if (sellingPrice >= originalPrice) {
    return 0
  }

  return originalPrice - sellingPrice
}
