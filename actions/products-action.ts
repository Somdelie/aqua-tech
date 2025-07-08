'use server'

import { revalidatePath } from 'next/cache';
import db from '@/prisma/db';


export async function getAllProducts() {

    try {
        const products = await db.product.findMany({
            include: {
                category: true,
                brand: true,
                reviews: true,
                orderItems: true,
            },
            orderBy: { createdAt: 'desc' }
        });

       return {
      data: products,
      error: null,
    };
        
    } catch (error) {
        console.error("Error fetching products:", error);
        return {
      data: [],
      error: "Failed to fetch categories",
    };
        
    }
}

export async function getProducts() {
  // Simulate loading data
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const products = await db.product.findMany({
    include: {
      brand: true,
      category: {
        include: {
          parent: true,
        },
      },
    },
  })

  const categories = await db.productCategory.findMany({
    include: {
      parent: true,
    },
  })

  const brands = await db.brand.findMany()

  return { products, categories, brands }
}