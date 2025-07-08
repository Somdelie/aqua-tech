

// model Product {
//   id                String              @id @default(cuid())
//   slug              String              @unique
//   name              String
//   description       String?
//   shortDescription  String?
//   price             Float
//   originalPrice     Float?              // For showing crossed-out prices
//   costPrice         Float?              // For profit calculations
//   thumbnail         String?
//   images            String[]
//   stock             Int                 @default(0)
//   lowStockThreshold Int                 @default(5)
//   discount          Float               @default(0)
//   isAvailable       Boolean             @default(true)
//   isFeatured        Boolean             @default(false)
//   isPreOwned        Boolean             @default(false)
  
//   // Product specifications - flexible JSON field
//   specifications    Json?               // Store device-specific specs
  
//   // Physical attributes
//   weight            Float?
//   dimensions        String?             // "L x W x H"
//   color             String?
  
//   // Condition and warranty
//   condition         ProductCondition    @default(NEW)
//   warrantyMonths    Int                 @default(12)
  
//   // SEO and metadata
//   metaTitle         String?
//   metaDescription   String?
//   keywords          String[]
  
//   // Relationships
//   type              ProductType
//   categoryId        String
//   brandId           String
//   category          ProductCategory     @relation(fields: [categoryId], references: [id])
//   brand             Brand               @relation(fields: [brandId], references: [id])
  
//   // Timestamps
//   createdAt         DateTime            @default(now())
//   updatedAt         DateTime            @updatedAt
  
//   // Relations
//   orderItems        OrderItem[]
//   wishlists         Wishlist[]
//   cartItems         CartItem[]
//   reviews           Review[]
//   productVariants   ProductVariant[]
  
//   @@index([categoryId])
//   @@index([brandId])
//   @@index([type])
//   @@index([isAvailable])
//   @@index([isFeatured])
// }   

export interface Product {
  id: string;
    slug: string;
    name: string;
    description?: string;
    shortDescription?: string;
    price: number;
    originalPrice?: number;
    costPrice?: number;
    thumbnail?: string;
    images: string[];
    stock: number;
    lowStockThreshold: number;
    discount: number;
    isAvailable: boolean;
    isFeatured: boolean;
    isPreOwned: boolean;
    specifications?: Record<string, any>; // Flexible JSON field for device-specific specs
    weight?: number;
    dimensions?: string; // "L x W x H"
    color?: string;
    condition: 'NEW' | 'USED' | 'REFURBISHED'; // Enum for product condition
    warrantyMonths: number; // Warranty in months
    metaTitle?: string;
    metaDescription?: string;
}