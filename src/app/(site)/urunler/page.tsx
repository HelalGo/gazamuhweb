import type { Metadata } from "next";
import { ProductListing } from "@/components/ProductListing";
import { getProducts } from "@/lib/products";
import { searchProducts } from "@/lib/search";

export const dynamic = "force-dynamic";

type SP = Promise<{ marka?: string; q?: string }>;

export async function generateMetadata({ searchParams }: { searchParams: SP }): Promise<Metadata> {
  const { q } = await searchParams;
  if (q) return { title: `"${q}" araması | GAZ-A Mühendislik`, robots: { index: false, follow: true } };
  return {
    title: "Tüm Ürünler | Kombi, Klima, Isı Pompası, Radyatör | GAZ-A Mühendislik",
    description: "Kombi, klima, ısı pompası, radyatör, şofben ve termostat modellerinin tamamı ve güncel fiyatları. Faturalı, garantili ürün; montaj ve servis İstanbul'da.",
    alternates: { canonical: "/urunler" },
  };
}

export default async function AllProducts({ searchParams }: { searchParams: SP }) {
  const { marka, q = "" } = await searchParams;
  const all = await getProducts();
  const term = q.trim().slice(0, 100);
  return (
    <ProductListing
      key={`${marka ?? "all"}|${term}`}
      products={term ? searchProducts(all, term) : all}
      crumbs={["Ana Sayfa", term ? `“${term}”` : "Tüm Ürünler"]}
      initialBrands={marka ? [marka] : []}
      eyebrow={term ? "Arama sonuçları" : undefined}
    />
  );
}
