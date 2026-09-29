import type { Metadata } from "next";
import { ProductListing } from "@/components/ProductListing";
import { getProducts } from "@/lib/products";

export const metadata: Metadata = { title: "Tüm Ürünler | GAZ-A Mühendislik" };
export const dynamic = "force-dynamic";

export default async function AllProducts({ searchParams }: { searchParams: Promise<{ marka?: string }> }) {
  const { marka } = await searchParams;
  return (
    <ProductListing
      key={marka ?? "all"}
      products={await getProducts()}
      crumbs={["Ana Sayfa", "Tüm Ürünler"]}
      initialBrands={marka ? [marka] : []}
    />
  );
}
