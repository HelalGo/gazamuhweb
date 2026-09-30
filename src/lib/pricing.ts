import type { RowDataPacket } from "mysql2";
import { db } from "./db";

/*
  Sepet hesabı: ürünler + kargo − kupon indirimi. Web sepeti, web siparişi ve mobil sepet aynı hesabı kullanır;
  fiyatlar her zaman veritabanından okunur.

  Kargo kuralı (sepette farklı kategoriler varsa): sipariş tek gönderi sayılır ve sepetteki kategorilerin
  kargo ücretlerinden EN YÜKSEĞİ bir kez alınır. Ör. klima 750 ₺ + termostat 90 ₺ → kargo 750 ₺.
  Ücretsiz kargo sınırı girildiyse, indirimden sonraki ürün toplamı bu sınırı geçince kargo 0 ₺ olur.
*/

export type CouponType = "percent" | "amount";
export type Coupon = {
  id: number; code: string; type: CouponType; value: number; minTotal: number;
  maxUses: number | null; used: number; startsAt: Date | null; endsAt: Date | null; active: boolean;
};
export type ShippingSettings = { defaultFee: number; freeOver: number; rates: Record<string, number> };
export type QuoteLine = { id: number; name: string; brand: string; category: string; price: number; qty: number; image: string | null; slug: string };
export type Quote = {
  lines: QuoteLine[];
  subtotal: number; discount: number; shipping: number; total: number;
  shippingNote: string; // "Klima kargo ücreti" / "1.000 ₺ üzeri ücretsiz" vb.
  freeOver: number;
  coupon: { code: string; label: string } | null;
  couponError: string | null;
  problems: string[]; // satışta olmayan / stokta olmayan / fiyatsız ürünler
};

let ready = false;
export async function ensurePricingTables() {
  if (ready) return;
  await db().query(`CREATE TABLE IF NOT EXISTS coupons (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(40) NOT NULL UNIQUE,
    type VARCHAR(10) NOT NULL DEFAULT 'percent',
    value DECIMAL(12,2) NOT NULL,
    min_total DECIMAL(12,2) NOT NULL DEFAULT 0,
    max_uses INT UNSIGNED NULL,
    used_count INT UNSIGNED NOT NULL DEFAULT 0,
    starts_at DATE NULL,
    ends_at DATE NULL,
    active TINYINT(1) NOT NULL DEFAULT 1,
    note VARCHAR(200) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) CHARACTER SET utf8mb4`);
  await db().query(`CREATE TABLE IF NOT EXISTS shipping_rates (
    category VARCHAR(120) NOT NULL PRIMARY KEY,
    fee DECIMAL(12,2) NOT NULL DEFAULT 0
  ) CHARACTER SET utf8mb4`);
  await db().query(`CREATE TABLE IF NOT EXISTS shop_settings (
    k VARCHAR(60) NOT NULL PRIMARY KEY,
    v VARCHAR(255) NOT NULL
  ) CHARACTER SET utf8mb4`);
  // siparişe ara toplam, indirim, kargo ve kupon kodu sütunları (eski kurulumlarda yoksa eklenir)
  const [cols] = await db().query<RowDataPacket[]>(
    "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'orders'"
  );
  const have = new Set(cols.map((c) => c.COLUMN_NAME as string));
  if (have.size) {
    const add: string[] = [];
    if (!have.has("subtotal")) add.push("ADD COLUMN subtotal DECIMAL(12,2) NULL AFTER total");
    if (!have.has("discount")) add.push("ADD COLUMN discount DECIMAL(12,2) NOT NULL DEFAULT 0 AFTER subtotal");
    if (!have.has("shipping")) add.push("ADD COLUMN shipping DECIMAL(12,2) NOT NULL DEFAULT 0 AFTER discount");
    if (!have.has("coupon_code")) add.push("ADD COLUMN coupon_code VARCHAR(40) NULL AFTER shipping");
    if (!have.has("payment_method")) add.push("ADD COLUMN payment_method VARCHAR(20) NOT NULL DEFAULT 'havale'");
    if (!have.has("paid_at")) add.push("ADD COLUMN paid_at DATETIME NULL");
    if (!have.has("cargo_company")) add.push("ADD COLUMN cargo_company VARCHAR(60) NULL");
    if (!have.has("tracking_no")) add.push("ADD COLUMN tracking_no VARCHAR(80) NULL");
    if (add.length) await db().query(`ALTER TABLE orders ${add.join(", ")}`);
  }
  ready = true;
}

const num = (v: unknown) => Math.round(Number(v) * 100) / 100 || 0;
export const normCode = (s: string) => s.trim().toLocaleUpperCase("tr-TR").replace(/\s+/g, "").slice(0, 40);
const money = (n: number) => `${n.toLocaleString("tr-TR", { maximumFractionDigits: 2 })} ₺`;

export const couponLabel = (c: Pick<Coupon, "type" | "value">) => (c.type === "percent" ? `%${num(c.value)} indirim` : `${money(num(c.value))} indirim`);

export async function getShippingSettings(): Promise<ShippingSettings> {
  await ensurePricingTables();
  const [[rates], [set]] = await Promise.all([
    db().query<RowDataPacket[]>("SELECT category, fee FROM shipping_rates"),
    db().query<RowDataPacket[]>("SELECT k, v FROM shop_settings WHERE k IN ('ship_default', 'ship_free_over')"),
  ]);
  const s = new Map(set.map((r) => [r.k as string, r.v as string]));
  return {
    defaultFee: num(s.get("ship_default") ?? 0),
    freeOver: num(s.get("ship_free_over") ?? 0),
    rates: Object.fromEntries(rates.map((r) => [r.category as string, num(r.fee)])),
  };
}

const rowToCoupon = (r: RowDataPacket): Coupon => ({
  id: r.id, code: r.code, type: r.type === "amount" ? "amount" : "percent", value: num(r.value), minTotal: num(r.min_total),
  maxUses: r.max_uses == null ? null : Number(r.max_uses), used: Number(r.used_count),
  startsAt: r.starts_at ? new Date(r.starts_at) : null, endsAt: r.ends_at ? new Date(r.ends_at) : null, active: !!r.active,
});

export async function findCoupon(code: string) {
  await ensurePricingTables();
  const [rows] = await db().query<RowDataPacket[]>(
    "SELECT *, (starts_at IS NULL OR starts_at <= CURDATE()) AS started, (ends_at IS NULL OR ends_at >= CURDATE()) AS not_ended FROM coupons WHERE code = ?",
    [normCode(code)]
  );
  if (!rows[0]) return null;
  return { ...rowToCoupon(rows[0]), started: !!rows[0].started, notEnded: !!rows[0].not_ended };
}

// Kupon geçerli mi? Geçersizse müşteriye gösterilecek nedeni döner
function couponProblem(c: NonNullable<Awaited<ReturnType<typeof findCoupon>>>, subtotal: number): string | null {
  if (!c.active) return "Bu kupon şu an kullanılamıyor.";
  if (!c.started) return "Bu kupon henüz başlamadı.";
  if (!c.notEnded) return "Bu kuponun süresi dolmuş.";
  if (c.maxUses != null && c.used >= c.maxUses) return "Bu kuponun kullanım hakkı dolmuş.";
  if (subtotal < c.minTotal) return `Bu kupon ${money(c.minTotal)} ve üzeri alışverişlerde geçerli.`;
  return null;
}

export async function quote(input: { id: number; qty: number }[], couponCode?: string | null): Promise<Quote> {
  await ensurePricingTables();
  const wanted = input
    .map((l) => ({ id: Number(l.id), qty: Math.floor(Number(l.qty)) }))
    .filter((l) => Number.isInteger(l.id) && l.id > 0 && l.qty >= 1 && l.qty <= 20)
    .slice(0, 30);
  const ids = [...new Set(wanted.map((l) => l.id))];
  const [rows] = ids.length
    ? await db().query<RowDataPacket[]>("SELECT id, slug, name, brand, category, price, in_stock, image_url FROM products WHERE active = 1 AND id IN (?)", [ids])
    : [[] as RowDataPacket[]];
  const byId = new Map(rows.map((r) => [Number(r.id), r]));

  const lines: QuoteLine[] = [];
  const problems: string[] = [];
  for (const l of wanted) {
    const p = byId.get(l.id);
    if (!p) { problems.push("Sepetinizdeki bir ürün artık satışta değil. Lütfen sepetinizi güncelleyin."); continue; }
    if (!p.in_stock) problems.push(`"${p.name}" şu an stokta yok.`);
    if (Number(p.price) <= 0) problems.push(`"${p.name}" için fiyat bilgisi almak üzere bizimle iletişime geçin.`);
    lines.push({ id: l.id, name: p.name, brand: p.brand ?? "", category: p.category ?? "", price: num(p.price), qty: l.qty, image: p.image_url ?? null, slug: p.slug });
  }
  const subtotal = num(lines.reduce((t, l) => t + l.price * l.qty, 0));

  // Kupon
  let discount = 0;
  let coupon: Quote["coupon"] = null;
  let couponError: string | null = null;
  const code = couponCode ? normCode(couponCode) : "";
  if (code) {
    const c = await findCoupon(code);
    const problem = !c ? "Kupon kodu bulunamadı." : couponProblem(c, subtotal);
    if (problem || !c) couponError = problem;
    else {
      discount = Math.min(subtotal, c.type === "percent" ? num((subtotal * Math.min(c.value, 100)) / 100) : c.value);
      coupon = { code: c.code, label: couponLabel(c) };
    }
  }

  // Kargo: sepetteki kategorilerin en yüksek ücreti, bir kez
  const ship = await getShippingSettings();
  let shipping = 0;
  let shippingNote = "";
  if (lines.length) {
    let top = { fee: -1, cat: "" };
    for (const l of lines) {
      const fee = ship.rates[l.category] ?? ship.defaultFee;
      if (fee > top.fee) top = { fee, cat: l.category };
    }
    shipping = Math.max(0, top.fee);
    const cats = new Set(lines.map((l) => l.category));
    shippingNote = shipping > 0 && cats.size > 1 ? `Tek gönderi · ${top.cat} kargo ücreti` : "";
    if (ship.freeOver > 0 && subtotal - discount >= ship.freeOver) { shipping = 0; shippingNote = `${money(ship.freeOver)} ve üzeri alışverişte kargo ücretsiz`; }
  }

  return {
    lines, subtotal, discount, shipping, shippingNote, freeOver: ship.freeOver,
    total: num(subtotal - discount + shipping),
    coupon, couponError, problems: [...new Set(problems)],
  };
}
