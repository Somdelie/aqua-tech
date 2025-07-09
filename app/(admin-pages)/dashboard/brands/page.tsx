
import { getBrands } from "@/actions/brands-action"
import BrandsListing from '@/components/dashboard/brands/BrandsListing';

export default async function BrandsPage() {
  const { brands } = await getBrands()

  return <BrandsListing brands={brands} />
}
