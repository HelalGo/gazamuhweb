import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CategoryGuide } from "@/components/CategoryGuide";
import { JsonLd } from "@/components/JsonLd";
import { ProductListing } from "@/components/ProductListing";
import { guides } from "@/lib/category-guides";
import { categoryOf, getProducts } from "@/lib/products";
import { abs, breadcrumbLd } from "@/lib/seo";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ category: string }>; searchParams: Promise<{ marka?: string }> };

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const slug = (await params).category;
  const name = await categoryOf(slug);
  if (!name) return { title: "GAZ-A Mühendislik", robots: { index: false } };
  const g = guides[name];
  const title = g?.title ?? `${name} Fiyatları ve Modelleri | GAZ-A Mühendislik`;
  const description = g?.description ?? `${name} modelleri ve güncel fiyatları. İGDAŞ yetkili bayiden faturalı, garantili ürün; montaj ve servis İstanbul'da.`;
  // Marka filtresi (?marka=) ayrı sayfa sayılmasın: asıl adres her zaman kategori sayfasıdır
  return { title, description, alternates: { canonical: `/${slug}` }, openGraph: { type: "website", url: `/${slug}`, title, description, images: ["/brand/og.jpg"] } };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const slug = (await params).category;
  const name = await categoryOf(slug);
  const { marka } = await searchParams;
  if (!name) notFound();
  const products = (await getProducts()).filter((p) => p.category === name);
  const guide = guides[name];
  return (
    <>
      <JsonLd data={[
        breadcrumbLd([{ name: "Ana Sayfa", url: "/" }, { name, url: `/${slug}` }]),
        {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name,
          numberOfItems: products.length,
          itemListElement: products.slice(0, 30).map((p, i) => ({ "@type": "ListItem", position: i + 1, url: abs(`/urun/${p.slug}`), name: p.name })),
        },
      ]} />
      <ProductListing key={marka ?? "all"} products={products} crumbs={["Ana Sayfa", name]} hideCategory initialBrands={marka ? [marka] : []} />
      {guide && <CategoryGuide guide={guide} />}
    </>
  );
}
