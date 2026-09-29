import { BestSellers } from "@/components/home/BestSellers";
import { Campaigns } from "@/components/home/Campaigns";
import { HeroSlider } from "@/components/home/HeroSlider";
import { ProductTabs, type Group } from "@/components/home/ProductTabs";
import { Brands, CtaBand, Deals, Igdas, Services, Stats } from "@/components/home/Sections";
import { Showcase } from "@/components/home/Showcase";
import { getBrandLogos, getCampaigns, getSlides, getTiles } from "@/lib/cms";
import type { Product } from "@/lib/data";
import { getProducts, getSalesCounts } from "@/lib/products";
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
  const [all, slides, tiles, campaigns, logos, sales] = await Promise.all([getProducts(), getSlides(), getTiles(), getCampaigns(), getBrandLogos(), getSalesCounts()]);

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
  const deals = all.filter((p) => discount(p) >= 0.05 && p.inStock).sort((a, b) => discount(b) - discount(a)).slice(0, 5);

  // En çok satan kombiler: satış adedine göre; henüz satış yoksa indirimli ve fiyatı olan kombiler öne çıkar
  const bestKombi = all
    .filter((p) => p.category === "Kombi" && p.price > 0 && p.inStock)
    .sort((a, b) => (sales.get(b.id) ?? 0) - (sales.get(a.id) ?? 0) || discount(b) - discount(a))
    .slice(0, 10);

  // Sıralama: önce alışveriş (kategoriler, ürünler, kampanyalar, markalar), sonra firma ve güven (hizmetler, İGDAŞ, rakamlar, teklif)
  return (
    <main>
      <HeroSlider slides={slides} />
      <Showcase tiles={tiles} />
      <ProductTabs groups={groups} />
      <BestSellers products={bestKombi} />
      <Campaigns blocks={campaigns} />
      <Deals products={deals} />
      {/* Adminden logo eklendiyse onlar, eklenmediyse en çok ürünü olan markaların adları */}
      <Brands items={logos.length ? logos.map((l) => ({ name: l.name, image: l.image })) : brands.slice(0, 12).map((name) => ({ name, image: null }))} />
      <Services />
      <Igdas />
      <Stats products={all.length} brands={brands.length} categories={groups.length} />
      <CtaBand />
    </main>
  );
}
