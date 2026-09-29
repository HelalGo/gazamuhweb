import { HeroSlider } from "@/components/home/HeroSlider";
import { Brands, Categories, CtaBand, ProductRow, Services, Stats, UspStrip } from "@/components/home/Sections";
import { slides } from "@/lib/home";
import { getProducts } from "@/lib/products";
import type { Product } from "@/lib/data";

export const dynamic = "force-dynamic";

const discount = (p: Product) => (p.oldPrice && p.oldPrice > p.price ? 1 - p.price / p.oldPrice : 0);

// Fiyatı olan, stoktaki ürünlerden indirimi en yüksek olanları önce getirir
const featured = (all: Product[], category: string, n = 4) =>
  all
    .filter((p) => p.category === category && p.price > 0 && p.inStock)
    .sort((a, b) => discount(b) - discount(a))
    .slice(0, n);

export default async function Home() {
  const all = await getProducts();

  const counts = new Map<string, number>();
  const brandCounts = new Map<string, number>();
  for (const p of all) {
    counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    if (p.brand) brandCounts.set(p.brand, (brandCounts.get(p.brand) ?? 0) + 1);
  }
  const categories = [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  const brands = [...brandCounts].sort((a, b) => b[1] - a[1]).map(([b]) => b);
  const deals = all.filter((p) => discount(p) >= 0.05 && p.inStock).sort((a, b) => discount(b) - discount(a)).slice(0, 4);

  return (
    <main>
      <HeroSlider slides={slides} />
      <UspStrip />
      <Categories items={categories} />
      <ProductRow eyebrow="Kombi" title="Sizin İçin Seçtiğimiz Kombiler" href="/kombi" products={featured(all, "Kombi")} />
      <ProductRow eyebrow="Klima" title="Sizin İçin Seçtiğimiz Klimalar" href="/klima" products={featured(all, "Klima")} />
      <ProductRow eyebrow="Ankastre" title="Ankastre Ürünler" href="/ankastre" products={featured(all, "Ankastre")} />
      <ProductRow eyebrow="Fırsatlar" title="Kampanyalı Ürünler" href="/urunler" products={deals} />
      <Services />
      <Stats products={all.length} brands={brands.length} categories={categories.length} />
      <Brands items={brands.slice(0, 12)} />
      <CtaBand />
    </main>
  );
}
