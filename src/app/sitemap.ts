import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/blog";
import { getProducts } from "@/lib/products";
import { footerLinks } from "@/lib/site";
import { slugify } from "@/lib/slug";

export const dynamic = "force-dynamic";
const SITE = (process.env.SITE_URL || "https://gazamuhendislik.com.tr").replace(/\/$/, "");

// Arama motorları için /sitemap.xml: sayfalar, kategoriler, ürünler ve blog yazıları
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, posts] = await Promise.all([getProducts().catch(() => []), getPosts().catch(() => [])]);
  const pages = ["/", "/urunler", "/blog", "/bilgi-al", "/site-haritasi", ...Object.values(footerLinks).flat().map((l) => l.href)];
  const cats = [...new Set(products.map((p) => p.category).filter(Boolean))].map((c) => `/${slugify(c)}`);
  const skip = new Set(["/hesabim"]);
  return [
    ...[...new Set([...pages, ...cats])].filter((p) => !skip.has(p)).map((p) => ({ url: `${SITE}${p === "/" ? "" : p}`, priority: p === "/" ? 1 : cats.includes(p) ? 0.8 : 0.5 })),
    ...products.map((p) => ({ url: `${SITE}/urun/${p.slug}`, priority: 0.7 })),
    ...posts.map((p) => ({ url: `${SITE}/blog/${p.slug}`, lastModified: p.updatedAt, priority: 0.6 })),
  ];
}
