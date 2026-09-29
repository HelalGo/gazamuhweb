// Kullanım: npm run db:import  — data/products.json'daki ürünleri veritabanına ekler.
// Zaten var olan ürünlere (aynı SKU / adres) DOKUNMAZ; admin panelinden yaptığın düzenlemeler ezilmez.
import { readFile } from "node:fs/promises";
import mysql from "mysql2/promise";

const c = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: "utf8mb4",
});

const items = JSON.parse(await readFile("data/products.json", "utf8"));
let added = 0;
for (const p of items) {
  const slug = new URL(p.source_url).pathname.replace(/\//g, "");
  const [res] = await c.query(
    `INSERT IGNORE INTO products
     (slug, sku, name, brand, category, product_group, price, old_price, in_stock, description, specs, source_image_url, source_url)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [slug, p.sku, p.name, p.brand, p.category, p.product_group, p.price ?? 0, p.old_price, p.in_stock ? 1 : 0,
     p.description || null, JSON.stringify(p.specs || {}), p.source_image_url, p.source_url]
  );
  added += res.affectedRows;
}
console.log(`${items.length} üründen ${added} tanesi eklendi (kalanlar zaten vardı).`);
await c.end();
