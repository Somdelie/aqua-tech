import db from '@/prisma/db';


// brands
export async function getAllBrands() {
    try {
        const brands = await db.brand.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                products: true // Include products if needed
            }
        });
        return {
            data: brands,
            error: null
        }
    } catch (error) {
        return {
      data: [],
      error: "Failed to fetch categories",
    };
        
    }
}