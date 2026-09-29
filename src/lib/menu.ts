import { getTiles } from "./cms";
import { getProducts } from "./products";
import { nav } from "./site";
import { slugify } from "./slug";

export type MenuItem = {
  label: string;
  href: string;
  count: number;
  brands: { name: string; count: number }[];
  featured: { name: string; slug: string }[];
  image: string | null; // açılır menünün sağındaki görsel
};

// Header'daki kategori menüleri: markalar + öne çıkan ürünler + görsel.
// Görsel önceliği: admin panelindeki vitrin kartı (adresi kategoriye gidiyorsa) > kategorideki bir ürün görseli.
export async function getMenu(): Promise<MenuItem[]> {
  const [products, tiles] = await Promise.all([getProducts(), getTiles().catch(() => [])]);
  const cats = nav.filter((n) => n.href !== "/urunler");
  return cats.map((n) => {
    const list = products.filter((p) => `/${slugify(p.category)}` === n.href);
    const brandCount = new Map<string, number>();
    for (const p of list) if (p.brand) brandCount.set(p.brand, (brandCount.get(p.brand) ?? 0) + 1);
    const brands = [...brandCount].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, count]) => ({ name, count }));
    // Görseli olan, fiyatlı ve indirimli ürünler öne
    const ranked = [...list].sort((a, b) => score(b) - score(a));
    const tile = tiles.find((t) => t.image && t.url?.split("?")[0] === n.href);
    return {
      label: n.label,
      href: n.href,
      count: list.length,
      brands,
      featured: ranked.slice(0, 5).map((p) => ({ name: p.name, slug: p.slug })),
      image: tile?.image ?? ranked.find((p) => p.imageUrl)?.imageUrl ?? null,
    };
  }).filter((m) => m.count > 0);
}

function score(p: { imageUrl: string | null; price: number; oldPrice: number | null }) {
  return (p.imageUrl ? 4 : 0) + (p.price > 0 ? 2 : 0) + (p.oldPrice && p.oldPrice > p.price ? 1 - p.price / p.oldPrice : 0);
}
