"use server";
import type { RowDataPacket } from "mysql2";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensurePricingTables, normCode } from "@/lib/pricing";

const str = (f: FormData, k: string, max: number) => String(f.get(k) ?? "").trim().slice(0, max);
// "1.250,50" ve "1250.5" biçimlerinin ikisi de kabul edilir
const money = (f: FormData, k: string) => {
  let s = str(f, k, 20).replace(/\s|₺/g, "");
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : NaN;
};
const date = (f: FormData, k: string) => (/^\d{4}-\d{2}-\d{2}$/.test(str(f, k, 10)) ? str(f, k, 10) : null);
const back = (path: string, err: string): never => redirect(`${path}?err=${encodeURIComponent(err)}`);

/* ---------- İndirim kuponları ---------- */
export async function saveCoupon(f: FormData) {
  await requireAdmin();
  await ensurePricingTables();
  const id = Number(f.get("id")) || null;
  const errPath = id ? `/admin/kuponlar/${id}` : "/admin/kuponlar/new";

  const code = normCode(str(f, "code", 40));
  if (!/^[A-Z0-9ÇĞİÖŞÜ_-]{3,40}$/.test(code)) back(errPath, "Kupon kodu en az 3 karakter olmalı; yalnızca harf, rakam, - ve _ kullanın.");
  const type = f.get("type") === "amount" ? "amount" : "percent";
  const value = money(f, "value");
  if (!(value > 0)) back(errPath, "İndirim değeri 0'dan büyük olmalı.");
  if (type === "percent" && value > 100) back(errPath, "Yüzde indirim en fazla 100 olabilir.");
  const minTotal = money(f, "min_total");
  const maxUsesRaw = str(f, "max_uses", 9);
  const maxUses = maxUsesRaw ? Math.floor(Number(maxUsesRaw)) : null;
  if (maxUses != null && !(maxUses > 0)) back(errPath, "Kullanım sınırı boş ya da 1 ve üzeri bir sayı olmalı.");
  const startsAt = date(f, "starts_at"), endsAt = date(f, "ends_at");
  if (startsAt && endsAt && endsAt < startsAt) back(errPath, "Bitiş tarihi başlangıçtan önce olamaz.");

  const [dup] = await db().query<RowDataPacket[]>("SELECT id FROM coupons WHERE code = ? AND id <> ?", [code, id ?? 0]);
  if (dup.length) back(errPath, `"${code}" kodlu başka bir kupon var.`);

  const v = {
    code, type, value, min_total: Number.isNaN(minTotal) ? 0 : minTotal, max_uses: maxUses,
    starts_at: startsAt, ends_at: endsAt, active: f.get("active") ? 1 : 0, note: str(f, "note", 200) || null,
  };
  if (id) await db().query("UPDATE coupons SET ? WHERE id = ?", [v, id]);
  else await db().query("INSERT INTO coupons SET ?", [v]);
  redirect("/admin/kuponlar?saved=1");
}

export async function toggleCoupon(f: FormData) {
  await requireAdmin();
  await db().query("UPDATE coupons SET active = 1 - active WHERE id = ?", [Number(f.get("id"))]);
  redirect("/admin/kuponlar");
}

export async function deleteCoupon(f: FormData) {
  await requireAdmin();
  await db().query("DELETE FROM coupons WHERE id = ?", [Number(f.get("id"))]);
  redirect("/admin/kuponlar");
}

/* ---------- Kargo ücretleri ---------- */
export async function saveShipping(f: FormData) {
  await requireAdmin();
  await ensurePricingTables();
  const def = money(f, "ship_default"), free = money(f, "ship_free_over");
  if (Number.isNaN(def) || Number.isNaN(free)) back("/admin/kargo", "Tutarlar geçerli bir sayı olmalı (ör. 250 ya da 1.250,50).");

  const rates: [string, number][] = [];
  for (const [k] of f.entries()) {
    if (!k.startsWith("rate:")) continue;
    const cat = k.slice(5);
    const raw = str(f, k, 20);
    if (!raw) continue; // boş bırakılan kategori varsayılan ücreti kullanır
    const n = money(f, k);
    if (Number.isNaN(n)) back("/admin/kargo", `"${cat}" için kargo ücreti geçerli bir sayı değil.`);
    rates.push([cat.slice(0, 120), n]);
  }
  const conn = await db().getConnection();
  try {
    await conn.beginTransaction();
    await conn.query("INSERT INTO shop_settings (k, v) VALUES ('ship_default', ?), ('ship_free_over', ?) ON DUPLICATE KEY UPDATE v = VALUES(v)", [String(def), String(free)]);
    await conn.query("DELETE FROM shipping_rates");
    if (rates.length) await conn.query("INSERT INTO shipping_rates (category, fee) VALUES ?", [rates]);
    await conn.commit();
  } catch (e) {
    await conn.rollback().catch(() => {});
    throw e;
  } finally {
    conn.release();
  }
  redirect("/admin/kargo?saved=1");
}

/* ---------- Mevsim sıralaması ---------- */
export async function saveSeason(f: FormData) {
  await requireAdmin();
  await ensurePricingTables();
  const v = f.get("season_mode");
  const mode = v === "isitma" || v === "sogutma" ? v : "auto";
  await db().query("INSERT INTO shop_settings (k, v) VALUES ('season_mode', ?) ON DUPLICATE KEY UPDATE v = VALUES(v)", [mode]);
  redirect("/admin/sezon?saved=1");
}
