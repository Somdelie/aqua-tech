import { getProductBySlug } from "@/actions/products-action";
import ProductDetails from "@/components/dashboard/products/ProductDetails";
import { notFound } from "next/navigation";

export default async function SingleProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params).slug;
  const product = await getProductBySlug(slug);

  console.log("Fetched product:", product);

  // If product is not found, show 404
  if (product.error || !product.data) {
    notFound();
  }

  return <ProductDetails product={product} />;
}
