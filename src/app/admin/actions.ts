"use server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { redirect } from "next/navigation";
import { createSession, destroySession, requireAdmin, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { slugify } from "@/lib/slug";
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
  redirect("/admin/products");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

const num = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "").replace(/\./g, "").replace(",", ".").trim();
  return s === "" ? null : Number(s);
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

  if (id) {
    await db().query("UPDATE products SET ? WHERE id = ?", [v, id]);
  } else {
    let slug = slugify(name);
    const [taken] = await db().query<RowDataPacket[]>("SELECT id FROM products WHERE slug = ?", [slug]);
    if (taken.length) slug += `-${Date.now().toString(36)}`;
    const [res] = await db().query<ResultSetHeader>("INSERT INTO products SET ?", [{ ...v, slug }]);
    redirect(`/admin/products/${res.insertId}?saved=1`);
  }
  redirect(`/admin/products/${id}?saved=1`);
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = Number(formData.get("id"));
  const [old] = await db().query<RowDataPacket[]>("SELECT image_url FROM products WHERE id = ?", [id]);
  await removeImage(old[0]?.image_url);
  await db().query("DELETE FROM products WHERE id = ?", [id]);
  redirect("/admin/products");
}

export async function toggleActive(formData: FormData) {
  await requireAdmin();
  await db().query("UPDATE products SET active = 1 - active WHERE id = ?", [Number(formData.get("id"))]);
  redirect(String(formData.get("back") || "/admin/products"));
}

export type BulkResult = { matched: number; unmatched: string[]; failed: string[] } | null;

// Dosya adı (uzantısız) ürün kodu (SKU) ile aynıysa o ürüne görsel olarak atanır. Örn: OK-DUO0124.jpg
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
