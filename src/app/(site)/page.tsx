import { Campaigns } from "@/components/home/Campaigns";
import { HeroSlider } from "@/components/home/HeroSlider";
import { ProductTabs, type Group } from "@/components/home/ProductTabs";
import { Brands, CtaBand, ProductRow, Services, Stats } from "@/components/home/Sections";
import { Showcase } from "@/components/home/Showcase";
import { getCampaigns, getSlides, getTiles } from "@/lib/cms";
import type { Product } from "@/lib/data";
import { getProducts } from "@/lib/products";
import { slugify } from "@/lib/slug";

export const dynamic = "force-dynamic";

const discount = (p: Product) => (p.oldPrice && p.oldPrice > p.price ? 1 - p.price / p.oldPrice : 0);

// Önce fiyatı olan, stoktaki ve indirimi yüksek ürünler; gerekirse kalanlarla tamamlanır
function pick(list: Product[], n: number) {
  const good = list.filter((p) => p.price > 0 && p.inStock).sort((a, b) => discount(b) - discount(a));
  const rest = list.filter((p) => !good.includes(p));
  return [...good, ...rest].slice(0, n);
}

export default async function Home() {
  const [all, slides, tiles, campaigns] = await Promise.all([getProducts(), getSlides(), getTiles(), getCampaigns()]);

  const byCat = new Map<string, Product[]>();
  const brandCounts = new Map<string, number>();
  for (const p of all) {
    byCat.set(p.category, [...(byCat.get(p.category) ?? []), p]);
    if (p.brand) brandCounts.set(p.brand, (brandCounts.get(p.brand) ?? 0) + 1);
  }
  const groups: Group[] = [...byCat]
    .sort((a, b) => b[1].length - a[1].length)
    .map(([name, list]) => ({ name, slug: slugify(name), count: list.length, products: pick(list, 4) }));
  const brands = [...brandCounts].sort((a, b) => b[1] - a[1]).map(([b]) => b);
  const deals = all.filter((p) => discount(p) >= 0.05 && p.inStock).sort((a, b) => discount(b) - discount(a)).slice(0, 4);

  return (
    <main>
      <HeroSlider slides={slides} />
      <ProductTabs groups={groups} />
      <Showcase tiles={tiles} />
      <Campaigns blocks={campaigns} />
      <ProductRow eyebrow="Fırsatlar" title="Kampanyalı Ürünler" href="/urunler" products={deals} />
      <Services />
      <Stats products={all.length} brands={brands.length} categories={groups.length} />
      <Brands items={brands.slice(0, 12)} />
      <CtaBand />
    </main>
  );
}
