// Tek seferlik katalog düzeltmesi (sunucuda app.js açılışta kendiliğinden çalıştırır, elle: node katalog-duzelt.mjs):
//  1) Ankastre ürünlerini ve onlara bağlı favori/yorumları siler, ankastreye giden vitrin kartı ve slaytları kapatır.
//  2) image_url'i boş ürünlerin görselini katalog-gorselleri/ klasöründen UPLOAD_DIR'e kopyalayıp bağlar
//     (klasörde yoksa kaynak adresten indirir).
//  3) Kazınan veride "tükendi" görünen ürünleri stokta yapar (ürünler artık kendi stoğumuz).
//  4) products.images sütununu ekler ve katalog-galeri.json'daki ek görselleri ürünlere bağlar.
//  5) Kaynak sitenin kendi bina fotoğraflarını (katalog-cikar.json) ürün galerilerinden çıkarır.
//  6) Ürün açıklamalarını kurumsal metinlerle değiştirir, fiyatı olmayan / 10 TL görünen ürünlere
//     piyasa fiyatı yazar ve yanlış kategorideki ürünü düzeltir (katalog-aciklama.json).
//  7) Kaynak siteden gelen ürün kodlarını GAZA kodlarıyla değiştirir (GZ-KMB-0001 biçimi).
//  8) Ürün görsellerini arka planı temizlenmiş, açık mavi zeminli sürümleriyle değiştirir
//     (katalog-arkaplan/ + katalog-arkaplan.json). Yeni dosyalar yeni adla gelir; tarayıcı önbelleği eskisini göstermez.
//  9) 8. adımda kesilince bozulan yakın çekimleri (ürünün fotoğraf kenarına taştığı görseller) orijinaline döndürür
//     (katalog-arkaplan-geri.json: yeni ad → orijinal ad).
// Her adım başarıyla bitince UPLOAD_DIR'e kendi işaret dosyasını bırakır ve bir daha çalışmaz;
// böylece sonradan admin panelinden yapılan değişikliklere dokunulmaz.
import { createHash, randomBytes } from "node:crypto";
import { access, copyFile, mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import mysql from "mysql2/promise";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MARK = ".katalog-duzeltme-1";
const MARK_STOCK = ".stok-duzeltme-1";
const MARK_GALLERY = ".galeri-1";
const MARK_CLEAN = ".bina-temizle-1";
const MARK_TEXT = ".aciklama-fiyat-1";
const MARK_SKU = ".urun-kodu-1";
const MARK_BG = ".arkaplan-1";
const MARK_BG_BACK = ".arkaplan-geri-1";
const exists = (p) => access(p).then(() => true, () => false);
const bundledName = (url) => createHash("sha1").update(url).digest("hex").slice(0, 24) + ".webp";

async function download(url, dir) {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; GazaMuhCatalogImport/1.0)" } });
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  const ext = buf[0] === 0xff && buf[1] === 0xd8 ? "jpg" : buf[0] === 0x89 && buf[1] === 0x50 ? "png" : null;
  if (!ext) return null;
  const name = `${randomBytes(12).toString("hex")}.${ext}`;
  await writeFile(path.join(dir, name), buf);
  return name;
}

export async function run() {
  if (!process.env.DB_HOST || process.env.DB_HOST.startsWith("BURAYA")) return;
  const uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");
  await mkdir(uploadDir, { recursive: true });
  const doCatalog = !(await exists(path.join(uploadDir, MARK)));
  const doStock = !(await exists(path.join(uploadDir, MARK_STOCK)));
  const doGallery = !(await exists(path.join(uploadDir, MARK_GALLERY)));
  const doClean = !(await exists(path.join(uploadDir, MARK_CLEAN)));
  const doText = !(await exists(path.join(uploadDir, MARK_TEXT)));
  const doSku = !(await exists(path.join(uploadDir, MARK_SKU)));
  const doBg = !(await exists(path.join(uploadDir, MARK_BG))) && (await exists(path.join(HERE, "katalog-arkaplan.json")));
  const doBgBack = !(await exists(path.join(uploadDir, MARK_BG_BACK))) && (await exists(path.join(HERE, "katalog-arkaplan-geri.json")));
  if (!doCatalog && !doStock && !doGallery && !doClean && !doText && !doSku && !doBg && !doBgBack) return;

  const c = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    charset: "utf8mb4",
  });
  const optional = (sql, args) => c.query(sql, args).catch(() => {}); // tablo yoksa atla
  try {
    if (doCatalog) await catalog(c, optional, uploadDir);
    // 3) Stok
    if (doStock) {
      const [res] = await c.query("UPDATE products SET in_stock = 1 WHERE in_stock = 0");
      console.log(`[katalog] ${res.affectedRows} ürün stokta olarak işaretlendi`);
      await writeFile(path.join(uploadDir, MARK_STOCK), new Date().toISOString());
    }
    if (doGallery) await gallery(c, uploadDir);
    if (doClean) await clean(c, uploadDir);
    if (doText) await texts(c, uploadDir);
    if (doSku) await skus(c, uploadDir);
    if (doBg) await backgrounds(c, uploadDir);
    if (doBgBack) await backgroundsBack(c, uploadDir);
  } finally {
    await c.end();
  }
}

async function catalog(c, optional, uploadDir) {
  // 1) Ankastre temizliği
  const [rows] = await c.query("SELECT id FROM products WHERE category = 'Ankastre' OR product_group LIKE '%ankastre%'");
  const ids = rows.map((r) => r.id);
  if (ids.length) {
    await optional("DELETE FROM favorites WHERE product_id IN (?)", [ids]);
    await optional("DELETE FROM reviews WHERE product_id IN (?)", [ids]);
    await optional("UPDATE order_items SET product_id = NULL WHERE product_id IN (?)", [ids]); // sipariş geçmişi korunur
    await c.query("DELETE FROM products WHERE id IN (?)", [ids]);
  }
  await optional("UPDATE showcase_tiles SET active = 0 WHERE url LIKE '%ankastre%'");
  await optional("UPDATE hero_slides SET active = 0 WHERE btn1_url LIKE '%ankastre%' OR btn2_url LIKE '%ankastre%'");
  console.log(`[katalog] ${ids.length} ankastre ürünü silindi`);

  // 2) Ürün görselleri
  const [missing] = await c.query(
    "SELECT id, source_image_url FROM products WHERE (image_url IS NULL OR image_url = '') AND source_image_url IS NOT NULL"
  );
  let linked = 0;
  const failed = [];
  for (const p of missing) {
    let name = bundledName(p.source_image_url);
    const src = path.join(HERE, "katalog-gorselleri", name);
    if (await exists(src)) {
      if (!(await exists(path.join(uploadDir, name)))) await copyFile(src, path.join(uploadDir, name));
    } else {
      name = await download(p.source_image_url, uploadDir).catch(() => null);
    }
    if (!name) { failed.push(p.id); continue; }
    await c.query("UPDATE products SET image_url = ? WHERE id = ?", [`/uploads/${name}`, p.id]);
    linked++;
  }
  console.log(`[katalog] ${linked}/${missing.length} ürüne görsel bağlandı${failed.length ? `, bulunamayan ürün id'leri: ${failed.join(", ")}` : ""}`);
  if (!failed.length) await writeFile(path.join(uploadDir, MARK), new Date().toISOString());
}

// 4) Galeri: ilk görsel kapak (image_url), kalanlar images sütununa
async function gallery(c, uploadDir) {
  const [col] = await c.query("SELECT COUNT(*) n FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'images'");
  if (!col[0].n) await c.query("ALTER TABLE products ADD COLUMN images JSON NULL AFTER image_url");
  let manifest = {};
  try { manifest = JSON.parse(await readFile(path.join(HERE, "katalog-galeri.json"), "utf8")); } catch { return; }
  const [rows] = await c.query("SELECT id, source_url, image_url FROM products WHERE images IS NULL AND source_url IS NOT NULL");
  let linked = 0;
  for (const p of rows) {
    const files = manifest[p.source_url];
    if (!files?.length) continue;
    const urls = [];
    for (const f of files) {
      const src = path.join(HERE, "katalog-gorselleri", f);
      if (!(await exists(path.join(uploadDir, f)))) {
        if (!(await exists(src))) continue;
        await copyFile(src, path.join(uploadDir, f));
      }
      urls.push(`/uploads/${f}`);
    }
    if (!urls.length) continue;
    const cover = p.image_url || urls[0];
    const extras = urls.filter((u) => u !== cover);
    await c.query("UPDATE products SET image_url = ?, images = ? WHERE id = ?", [cover, JSON.stringify(extras), p.id]);
    linked++;
  }
  console.log(`[katalog] ${linked} ürüne galeri bağlandı`);
  await writeFile(path.join(uploadDir, MARK_GALLERY), new Date().toISOString());
}

// 5) Bina fotoğrafları: galeriden çıkar, dosyayı sil
async function clean(c, uploadDir) {
  let bad = [];
  try { bad = JSON.parse(await readFile(path.join(HERE, "katalog-cikar.json"), "utf8")); } catch { return; }
  const urls = new Set(bad.map((f) => `/uploads/${f}`));
  const [rows] = await c.query("SELECT id, images FROM products WHERE images IS NOT NULL");
  let fixed = 0;
  for (const p of rows) {
    const list = typeof p.images === "string" ? JSON.parse(p.images) : p.images;
    if (!Array.isArray(list)) continue;
    const kept = list.filter((u) => !urls.has(u));
    if (kept.length === list.length) continue;
    await c.query("UPDATE products SET images = ? WHERE id = ?", [JSON.stringify(kept), p.id]);
    fixed++;
  }
  for (const f of bad) await unlink(path.join(uploadDir, f)).catch(() => {});
  console.log(`[katalog] ${fixed} ürünün galerisinden bina fotoğrafı çıkarıldı`);
  await writeFile(path.join(uploadDir, MARK_CLEAN), new Date().toISOString());
}

// 6) Açıklama, fiyat ve kategori. Adminden değiştirilmiş açıklama ve fiyatlara dokunulmaz.
async function texts(c, uploadDir) {
  let data = {};
  try { data = JSON.parse(await readFile(path.join(HERE, "katalog-aciklama.json"), "utf8")); } catch { return; }
  const [rows] = await c.query("SELECT id, source_url, description, price, category FROM products WHERE source_url IS NOT NULL");
  let desc = 0, price = 0, cat = 0;
  for (const p of rows) {
    const e = data[p.source_url];
    if (!e) continue;
    const v = {};
    const cur = (p.description ?? "").trim();
    if (!cur || createHash("sha1").update(cur).digest("hex").slice(0, 16) === e.origHash) { v.description = e.description; desc++; }
    if (e.price && Number(p.price) <= 10) { v.price = e.price; v.old_price = null; price++; }
    if (e.category && p.category !== e.category) { v.category = e.category; cat++; }
    if (Object.keys(v).length) await c.query("UPDATE products SET ? WHERE id = ?", [v, p.id]);
  }
  console.log(`[katalog] ${desc} açıklama, ${price} fiyat, ${cat} kategori güncellendi`);
  await writeFile(path.join(uploadDir, MARK_TEXT), new Date().toISOString());
}

// 7) Ürün kodları: kategori başına marka ve ada göre sıralı numara. Zaten GZ- ile başlayanlara dokunulmaz.
// Kategori kısaltmaları src/lib/sku.ts ile aynıdır.
const CATEGORY_CODES = { Kombi: "KMB", Klima: "KLM", "Isı Pompası": "ISP", Radyatör: "RAD", Şofben: "SFB", "Sirkülasyon Pompası": "SRK", "Oda Termostatı": "TRM" };
async function skus(c, uploadDir) {
  const [rows] = await c.query("SELECT id, sku, category FROM products ORDER BY category, brand, name, id");
  const next = new Map();
  for (const r of rows) {
    const m = /^GZ-([A-Z]{3})-(\d+)$/.exec(r.sku ?? "");
    if (m) next.set(m[1], Math.max(next.get(m[1]) ?? 0, Number(m[2])));
  }
  let n = 0;
  for (const r of rows) {
    if ((r.sku ?? "").startsWith("GZ-")) continue;
    const code = CATEGORY_CODES[r.category] ?? "URN";
    const seq = (next.get(code) ?? 0) + 1;
    next.set(code, seq);
    await c.query("UPDATE products SET sku = ? WHERE id = ?", [`GZ-${code}-${String(seq).padStart(4, "0")}`, r.id]);
    n++;
  }
  console.log(`[katalog] ${n} ürüne GAZA ürün kodu verildi`);
  await writeFile(path.join(uploadDir, MARK_SKU), new Date().toISOString());
}

// 8) Arka plan: eski görsel adı → yeni görsel adı. Yalnızca hâlâ eski katalog görselini kullanan ürünler değişir;
// admin panelinden sonradan yüklenen görsellere dokunulmaz. Eski dosyalar silinmez.
async function backgrounds(c, uploadDir) {
  const map = JSON.parse(await readFile(path.join(HERE, "katalog-arkaplan.json"), "utf8"));
  const swap = (u) => {
    const m = /^\/uploads\/([a-f0-9]{24}\.webp)$/.exec(u ?? "");
    return m && map[m[1]] ? `/uploads/${map[m[1]]}` : u;
  };
  const [rows] = await c.query("SELECT id, image_url, images FROM products");
  const updates = [];
  for (const r of rows) {
    let imgs = [];
    try { imgs = typeof r.images === "string" ? JSON.parse(r.images) : (r.images ?? []); } catch {}
    if (!Array.isArray(imgs)) imgs = [];
    const cover = swap(r.image_url);
    const gallery = imgs.map(swap);
    if (cover !== r.image_url || gallery.some((u, i) => u !== imgs[i])) updates.push([cover, gallery, r.id]);
  }
  // önce yeni dosyalar kopyalanır, sonra ürünler bağlanır (yarıda kalırsa kırık görsel olmasın)
  const fresh = new Set(Object.values(map));
  let copied = 0;
  for (const [cover, gallery] of updates) {
    for (const u of [cover, ...gallery]) {
      const name = u?.startsWith("/uploads/") ? u.slice(9) : null;
      if (!name || !fresh.has(name) || (await exists(path.join(uploadDir, name)))) continue;
      await copyFile(path.join(HERE, "katalog-arkaplan", name), path.join(uploadDir, name));
      copied++;
    }
  }
  for (const [cover, gallery, id] of updates) await c.query("UPDATE products SET image_url = ?, images = ? WHERE id = ?", [cover, JSON.stringify(gallery), id]);
  const n = updates.length;
  console.log(`[katalog] ${n} ürünün görseli arka planı temizlenmiş sürümle değiştirildi (${copied} dosya)`);
  await writeFile(path.join(uploadDir, MARK_BG), new Date().toISOString());
}

// 9) Geri alma: yeni ad → orijinal ad. Orijinal dosya yüklenenler klasöründe yoksa paketteki katalog-gorselleri'nden kopyalanır.
async function backgroundsBack(c, uploadDir) {
  const back = JSON.parse(await readFile(path.join(HERE, "katalog-arkaplan-geri.json"), "utf8"));
  const swap = (u) => {
    const m = /^\/uploads\/([a-f0-9]{24}\.webp)$/.exec(u ?? "");
    return m && back[m[1]] ? `/uploads/${back[m[1]]}` : u;
  };
  const [rows] = await c.query("SELECT id, image_url, images FROM products");
  const updates = [];
  for (const r of rows) {
    let imgs = [];
    try { imgs = typeof r.images === "string" ? JSON.parse(r.images) : (r.images ?? []); } catch {}
    if (!Array.isArray(imgs)) imgs = [];
    const cover = swap(r.image_url);
    const gallery = imgs.map(swap);
    if (cover !== r.image_url || gallery.some((u, i) => u !== imgs[i])) updates.push([cover, gallery, r.id]);
  }
  const originals = new Set(Object.values(back));
  let copied = 0;
  for (const [cover, gallery] of updates) {
    for (const u of [cover, ...gallery]) {
      const name = u?.startsWith("/uploads/") ? u.slice(9) : null;
      if (!name || !originals.has(name) || (await exists(path.join(uploadDir, name)))) continue;
      const src = path.join(HERE, "katalog-gorselleri", name);
      if (await exists(src)) { await copyFile(src, path.join(uploadDir, name)); copied++; }
    }
  }
  for (const [cover, gallery, id] of updates) await c.query("UPDATE products SET image_url = ?, images = ? WHERE id = ?", [cover, JSON.stringify(gallery), id]);
  console.log(`[katalog] ${updates.length} ürünün yakın çekim görselleri orijinaline döndürüldü (${copied} dosya)`);
  await writeFile(path.join(uploadDir, MARK_BG_BACK), new Date().toISOString());
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { process.loadEnvFile(path.join(HERE, ".env")); } catch {}
  await run();
}
