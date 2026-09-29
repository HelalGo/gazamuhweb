import { ProductListing } from "@/components/ProductListing";
import { getProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function Home() {
  return <ProductListing products={await getProducts()} />;
}
