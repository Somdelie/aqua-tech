import CategoriesListing from "@/components/dashboard/categories/CategoriesListing"
import { getCategories } from "@/actions/categories-action"

export default async function CategoriesPage() {
  const { categories } = await getCategories()

  console.log("Fetched categories in page:", categories)

  return <CategoriesListing categories={categories} />
}
