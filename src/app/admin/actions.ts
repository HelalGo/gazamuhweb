"use server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { redirect } from "next/navigation";
import { createSession, destroySession, requireAdmin, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/slug";
import { nextSku } from "@/lib/sku";
import { removeImage, saveImage } from "@/lib/uploads";

export async function login(_: string | null, formData: FormData): Promise<string | null> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  try {
    const [rows] = await db().query<RowDataPacket[]>("SELECT id, password_hash FROM admins WHERE email = ? AND active = 1", [email]);
    const admin = rows[0];
    if (!admin || !(await verifyPassword(password, admin.password_hash))) return "E-posta veya parola hatalı.";
    await createSession(admin.id);
    await db().query("UPDATE admins SET last_login = NOW() WHERE id = ?", [admin.id]);
  } catch (e) {
    console.error("[admin login]", (e as Error).message);
    return "Veritabanına bağlanılamadı.";
  }
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

// Fiyat yazımlarını sayıya çevirir: "35.750,50" → 35750.5 · "35750.00" (veritabanı biçimi) → 35750 · "35.750" → 35750
const num = (v: FormDataEntryValue | null) => {
  let s = String(v ?? "").replace(/[\s₺]/g, "");
  if (s === "") return null;
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", "."); // Türkçe: nokta binlik, virgül kuruş
  else if (!/^\d+\.\d{1,2}$/.test(s)) s = s.replace(/\./g, ""); // yalnızca binlik noktaları
  return Number(s);
};

// "Anahtar: Değer" satırlarını nesneye çevirir
function parseSpecs(text: string) {
  const out: Record<string, string> = {};
  for (const line of text.split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) out[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return out;
}

// Galeri sütunu eski veritabanlarında yoksa ekler (sunucuda katalog betiği de ekler)
let galleryReady = false;
async function ensureGallery() {
  if (galleryReady) return;
  const [col] = await db().query<RowDataPacket[]>(
    "SELECT COUNT(*) n FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'images'"
  );
  if (!col[0].n) await db().query("ALTER TABLE products ADD COLUMN images JSON NULL AFTER image_url");
  galleryReady = true;
}
const parseImages = (v: unknown): string[] => (typeof v === "string" ? JSON.parse(v) : (v as string[] | null)) ?? [];
const MAX_GALLERY = 12;

export async function saveProduct(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id")) || null;
  const name = String(formData.get("name") ?? "").trim();
  const price = num(formData.get("price"));
  if (!name || price === null || Number.isNaN(price)) redirect(id ? `/admin/products/${id}?error=1` : "/admin/products/new?error=1");

  const v = {
    sku: String(formData.get("sku") ?? "").trim() || null,
    name,
    brand: String(formData.get("brand") ?? "").trim() || null,
    category: String(formData.get("category") ?? "").trim() || null,
    product_group: String(formData.get("product_group") ?? "").trim() || null,
    price,
    old_price: num(formData.get("old_price")),
    in_stock: formData.get("in_stock") ? 1 : 0,
    active: formData.get("active") ? 1 : 0,
    description: String(formData.get("description") ?? "").trim() || null,
    specs: JSON.stringify(parseSpecs(String(formData.get("specs") ?? ""))),
    image_url: String(formData.get("image_url") ?? "").trim() || null,
  };

  // Yeni görsel yüklendiyse onu kullan, eski yüklenen dosyayı sil
  const file = formData.get("image_file");
  if (file instanceof File && file.size > 0) {
    const saved = await saveImage(file);
    if ("error" in saved) redirect(`${id ? `/admin/products/${id}` : "/admin/products/new"}?imgerror=${encodeURIComponent(saved.error)}`);
    if (id) {
      const [old] = await db().query<RowDataPacket[]>("SELECT image_url FROM products WHERE id = ?", [id]);
      await removeImage(old[0]?.image_url);
    }
    v.image_url = saved.url;
  }
  if (formData.get("remove_image") && id) {
    const [old] = await db().query<RowDataPacket[]>("SELECT image_url FROM products WHERE id = ?", [id]);
    await removeImage(old[0]?.image_url);
    v.image_url = null;
  }

  // Ek görseller: işaretlenenleri çıkar, yeni yüklenenleri sona ekle
  await ensureGallery();
  const errPath = id ? `/admin/products/${id}` : "/admin/products/new";
  const [cur] = id ? await db().query<RowDataPacket[]>("SELECT images FROM products WHERE id = ?", [id]) : [[] as RowDataPacket[]];
  const removed = new Set(formData.getAll("remove_gallery").map(String));
  const gallery = parseImages(cur[0]?.images).filter((u) => !removed.has(u));
  for (const u of removed) await removeImage(u);
  for (const f of formData.getAll("gallery_files")) {
    if (!(f instanceof File) || f.size === 0) continue;
    if (gallery.length >= MAX_GALLERY) break;
    const saved = await saveImage(f);
    if ("error" in saved) redirect(`${errPath}?imgerror=${encodeURIComponent(`${f.name}: ${saved.error}`)}`);
    gallery.push(saved.url);
  }
  // Ürün kodu boşsa kategoriye göre otomatik atanır; başka üründe kullanılan kod kabul edilmez
  if (!v.sku) v.sku = await nextSku(v.category);
  const [dup] = await db().query<RowDataPacket[]>("SELECT id FROM products WHERE sku = ? AND id <> ? LIMIT 1", [v.sku, id ?? 0]);
  if (dup.length) redirect(`${errPath}?imgerror=${encodeURIComponent(`"${v.sku}" ürün kodu başka bir üründe kullanılıyor.`)}`);
  const values = { ...v, images: JSON.stringify(gallery) };

  if (id) {
    await db().query("UPDATE products SET ? WHERE id = ?", [values, id]);
  } else {
    let slug = slugify(name);
    const [taken] = await db().query<RowDataPacket[]>("SELECT id FROM products WHERE slug = ?", [slug]);
    if (taken.length) slug += `-${Date.now().toString(36)}`;
    const [res] = await db().query<ResultSetHeader>("INSERT INTO products SET ?", [{ ...values, slug }]);
    redirect(`/admin/products/${res.insertId}?saved=1`);
  }
  redirect(`/admin/products/${id}?saved=1`);
}

// Yalnızca panel içi dönüş adreslerine izin ver
const backTo = (f: FormData, extra = "") => {
  const b = String(f.get("back") ?? "");
  const base = b.startsWith("/admin/products") ? b : "/admin/products";
  return extra ? `${base}${base.includes("?") ? "&" : "?"}${extra}` : base;
};

async function removeProducts(ids: number[]) {
  if (!ids.length) return;
  const [old] = await db().query<RowDataPacket[]>("SELECT * FROM products WHERE id IN (?)", [ids]);
  for (const r of old) for (const u of [r.image_url, ...parseImages(r.images)]) await removeImage(u);
  await db().query("DELETE FROM favorites WHERE product_id IN (?)", [ids]).catch(() => {});
  await db().query("DELETE FROM reviews WHERE product_id IN (?)", [ids]).catch(() => {});
  await db().query("UPDATE order_items SET product_id = NULL WHERE product_id IN (?)", [ids]).catch(() => {}); // sipariş geçmişi korunur
  await db().query("DELETE FROM products WHERE id IN (?)", [ids]);
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  await removeProducts([Number(formData.get("id"))]);
  redirect(backTo(formData, "done=deleted"));
}

export async function toggleActive(formData: FormData) {
  await requireAdmin();
  await db().query("UPDATE products SET active = 1 - active WHERE id = ?", [Number(formData.get("id"))]);
  redirect(backTo(formData));
}

export async function toggleStock(formData: FormData) {
  await requireAdmin();
  await db().query("UPDATE products SET in_stock = 1 - in_stock WHERE id = ?", [Number(formData.get("id"))]);
  redirect(backTo(formData));
}

// Ürün listesindeki toplu işlem çubuğu
export async function bulkProducts(formData: FormData) {
  await requireAdmin();
  const ids = formData.getAll("ids").map(Number).filter((n) => n > 0);
  const op = String(formData.get("op"));
  const set: Record<string, string> = { publish: "active = 1", hide: "active = 0", instock: "in_stock = 1", outstock: "in_stock = 0" };
  if (ids.length && op in set) await db().query(`UPDATE products SET ${set[op]} WHERE id IN (?)`, [ids]);
  if (ids.length && op === "delete") await removeProducts(ids);
  redirect(backTo(formData, ids.length ? `done=${op === "delete" ? "deleted" : "updated"}&n=${ids.length}` : ""));
}

export type BulkResult = { matched: number; unmatched: string[]; failed: string[] } | null;

// Dosya adı (uzantısız) ürün kodu (SKU) ile aynıysa o ürüne görsel olarak atanır. Örn: GZ-KMB-0001.jpg
export async function bulkUploadImages(_: BulkResult, formData: FormData): Promise<BulkResult> {
  await requireAdmin();
  const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  const out = { matched: 0, unmatched: [] as string[], failed: [] as string[] };
  for (const f of files) {
    const base = f.name.replace(/\.[^.]+$/, "").trim();
    const [rows] = await db().query<RowDataPacket[]>("SELECT id, image_url FROM products WHERE sku = ? OR slug = ? LIMIT 1", [base, slugify(base)]);
    if (!rows[0]) { out.unmatched.push(f.name); continue; }
    const saved = await saveImage(f);
    if ("error" in saved) { out.failed.push(`${f.name} (${saved.error})`); continue; }
    await removeImage(rows[0].image_url);
    await db().query("UPDATE products SET image_url = ? WHERE id = ?", [saved.url, rows[0].id]);
    out.matched++;
  }
  return out;
}
