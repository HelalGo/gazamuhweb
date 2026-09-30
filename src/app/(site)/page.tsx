import { BestSellers } from "@/components/home/BestSellers";
import { Campaigns } from "@/components/home/Campaigns";
import { CategoryRow } from "@/components/home/CategoryRow";
import { HeroSlider } from "@/components/home/HeroSlider";
import { ProductTabs, type Group } from "@/components/home/ProductTabs";
import { Brands, CtaBand, Deals, Igdas, Services, Stats } from "@/components/home/Sections";
import { Showcase } from "@/components/home/Showcase";
import { getBrandLogos, getCampaigns, getSlides, getTiles } from "@/lib/cms";
import type { Product } from "@/lib/data";
import { getProducts, getSalesCounts } from "@/lib/products";
import { getSeason, sortBySeason } from "@/lib/season";
import { slugify } from "@/lib/slug";

export const dynamic = "force-dynamic";

const discount = (p: Product) => (p.oldPrice && p.oldPrice > p.price ? 1 - p.price / p.oldPrice : 0);

// Önce fiyatı olan, stoktaki ve indirimi yüksek ürünler; gerekirse kalanlarla tamamlanır
function pick(list: Product[], n: number) {
  const good = list.filter((p) => p.price > 0 && p.inStock).sort((a, b) => discount(b) - discount(a));
  const rest = list.filter((p) => !good.includes(p));
  return [...good, ...rest].slice(0, n);
}

// Başlıklarda kullanılan çoğul adlar
const PLURAL: Record<string, string> = {
  Kombi: "Kombiler", Klima: "Klimalar", Radyatör: "Radyatörler", "Isı Pompası": "Isı Pompaları",
  "Oda Termostatı": "Oda Termostatları", "Sirkülasyon Pompası": "Sirkülasyon Pompaları", Şofben: "Şofbenler",
};
const plural = (c: string) => PLURAL[c] ?? c;

export default async function Home() {
  const [all, slides, tiles, campaigns, logos, sales, season] = await Promise.all([getProducts(), getSlides(), getTiles(), getCampaigns(), getBrandLogos(), getSalesCounts(), getSeason()]);

  const byCat = new Map<string, Product[]>();
  const brandCounts = new Map<string, number>();
  for (const p of all) {
    byCat.set(p.category, [...(byCat.get(p.category) ?? []), p]);
    if (p.brand) brandCounts.set(p.brand, (brandCounts.get(p.brand) ?? 0) + 1);
  }
  // Kategori sekmeleri ve bölümler mevsime göre: kışın Kombi, yazın Klima önde
  const groups: Group[] = sortBySeason([...byCat], season, ([name]) => name)
    .map(([name, list]) => ({ name, slug: slugify(name), count: list.length, products: pick(list, 4) }));
  const brands = [...brandCounts].sort((a, b) => b[1] - a[1]).map(([b]) => b);
  const deals = all.filter((p) => discount(p) >= 0.05 && p.inStock).sort((a, b) => discount(b) - discount(a)).slice(0, 5);

  // Satış adedine göre; henüz satış yoksa indirimli ve fiyatı olan ürünler öne çıkar
  const top = (cat: string, n: number) => (byCat.get(cat) ?? [])
    .filter((p) => p.price > 0 && p.inStock)
    .sort((a, b) => (sales.get(b.id) ?? 0) - (sales.get(a.id) ?? 0) || discount(b) - discount(a))
    .slice(0, n);
  // Mevsimin ilk kategorisi yana kaydırmalı "En Çok Satan…", diğerleri 4'er ürünlük bölümler
  const [lead, ...others] = groups.map((g) => g.name);
  const seasonName = season === "isitma" ? "Kış sezonu" : "Yaz sezonu";
  const rows = others.map((cat) => (
    <CategoryRow key={cat} eyebrow={cat} title={`Öne Çıkan ${plural(cat)}`} href={`/${slugify(cat)}`}
      linkLabel={`Tüm ${plural(cat).toLocaleLowerCase("tr")}`} products={top(cat, 4)} />
  ));

  // Sıralama: önce alışveriş (kategoriler, ürünler, kampanyalar, markalar), sonra firma ve güven (hizmetler, İGDAŞ, rakamlar, teklif)
  return (
    <main>
      <HeroSlider slides={slides} />
      <Showcase tiles={tiles} />
      <ProductTabs groups={groups} />
      {lead && (
        <BestSellers products={top(lead, 10)} eyebrow={`${lead} · ${seasonName}`} title={`En Çok Satan ${plural(lead)}`}
          href={`/${slugify(lead)}`} linkLabel={`Tüm ${plural(lead).toLocaleLowerCase("tr")}`} />
      )}
      {rows.slice(0, 3)}
      <Campaigns blocks={campaigns} />
      <Deals products={deals} />
      {rows.slice(3)}
      {/* Adminden logo eklendiyse onlar, eklenmediyse en çok ürünü olan markaların adları */}
      <Brands items={logos.length ? logos.map((l) => ({ name: l.name, image: l.image })) : brands.slice(0, 12).map((name) => ({ name, image: null }))} />
      <Services />
      <Igdas />
      <Stats products={all.length} brands={brands.length} categories={groups.length} />
      <CtaBand />
    </main>
  );
}
