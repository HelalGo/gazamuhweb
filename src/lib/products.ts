import { readFile } from "node:fs/promises";
import path from "node:path";
import type { RowDataPacket } from "mysql2";
import { db } from "./db";
import { sampleProducts, type Product } from "./data";
import { slugify } from "./slug";

const dbConfigured = () => !!process.env.DB_HOST && !process.env.DB_HOST.startsWith("BURAYA");

type Row = RowDataPacket & {
  id: number; slug: string; sku: string | null; name: string; brand: string | null; category: string | null;
  product_group: string | null; price: string; old_price: string | null; in_stock: number;
  description: string | null; specs: string | Record<string, string> | null; image_url: string | null;
  images?: string | string[] | null; // galeri sütunu henüz eklenmemiş veritabanlarında yok
};

const fromRow = (r: Row): Product => ({
  id: String(r.id),
  slug: r.slug,
  sku: r.sku,
  name: r.name,
  brand: r.brand ?? "",
  category: r.category ?? "Diğer",
  productGroup: r.product_group,
  price: Number(r.price),
  oldPrice: r.old_price ? Number(r.old_price) : null,
  inStock: !!r.in_stock,
  description: r.description ?? "",
  specs: typeof r.specs === "string" ? JSON.parse(r.specs) : (r.specs ?? {}),
  imageUrl: r.image_url,
  images: (typeof r.images === "string" ? JSON.parse(r.images) : r.images) ?? [],
});

// data/products.json (kazıma çıktısı) — veritabanı bağlanana kadar site bununla çalışır
async function fromFile(): Promise<Product[]> {
  try {
    const raw = JSON.parse(await readFile(path.join(process.cwd(), "data/products.json"), "utf8"));
    return raw
      .map((p: Record<string, any>, i: number): Product => ({
        id: String(i + 1),
        slug: new URL(p.source_url).pathname.replace(/\//g, ""),
        sku: p.sku,
        name: p.name,
        brand: p.brand ?? "",
        category: p.category ?? "Diğer",
        productGroup: p.product_group,
        price: p.price ?? 0,
        oldPrice: p.old_price,
        inStock: p.in_stock,
        description: p.description ?? "",
        specs: p.specs ?? {},
        imageUrl: null,
        images: [],
      }));
  } catch {
    return sampleProducts;
  }
}

export async function getProducts(): Promise<Product[]> {
  if (!dbConfigured()) return fromFile();
  try {
    const [rows] = await db().query<Row[]>("SELECT * FROM products WHERE active = 1 ORDER BY category, brand, name");
    return rows.map(fromRow);
  } catch (err) {
    console.error("[db] ürünler okunamadı, dosya verisi kullanılıyor:", (err as Error).message);
    return fromFile();
  }
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  return (await getProducts()).find((p) => p.slug === slug);
}

export async function getCategories(): Promise<string[]> {
  return [...new Set((await getProducts()).map((p) => p.category))];
}

export const categoryOf = async (slug: string) => (await getCategories()).find((c) => slugify(c) === slug);

// Ürün başına satılan adet (iptal edilen siparişler hariç); "En çok satanlar" sıralaması için
export async function getSalesCounts(): Promise<Map<string, number>> {
  if (!dbConfigured()) return new Map();
  try {
    const [rows] = await db().query<RowDataPacket[]>(
      `SELECT i.product_id, SUM(i.qty) n FROM order_items i JOIN orders o ON o.id = i.order_id
       WHERE o.status <> 'cancelled' AND i.product_id IS NOT NULL GROUP BY i.product_id`);
    return new Map(rows.map((r) => [String(r.product_id), Number(r.n)]));
  } catch {
    return new Map();
  }
}
