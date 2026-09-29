"use server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { createUserSession, destroyUserSession, getUser } from "@/lib/customer";
import { db } from "@/lib/db";
import { safeUrl } from "@/lib/layouts";
import { orderInbox, sendMail } from "@/lib/mail";
import { orderAdminMail, orderReceivedMail, welcomeMail, type OrderMailData } from "@/lib/mails";
import { subscribe } from "@/lib/newsletter";
import { reviewEligibility } from "@/lib/reviews";
import { clientIp, tooMany } from "@/lib/ratelimit";

const clean = (f: FormData, k: string, max: number) => String(f.get(k) ?? "").trim().slice(0, max);
const nextPath = (f: FormData) => {
  const n = safeUrl(f.get("next"));
  return n && n.startsWith("/") ? n : null;
};
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* ---------- Üyelik ---------- */
export async function register(_: string | null, f: FormData): Promise<string | null> {
  if (tooMany(`reg:${await clientIp()}`, 8, 15 * 60_000)) return "Çok fazla deneme yaptınız. Lütfen biraz sonra tekrar deneyin.";
  const first = clean(f, "first_name", 80), last = clean(f, "last_name", 80);
  const email = clean(f, "email", 190).toLowerCase();
  const phone = clean(f, "phone", 30);
  const password = String(f.get("password") ?? "");
  if (!first || !last) return "Ad ve soyad zorunlu.";
  if (!EMAIL.test(email)) return "Geçerli bir e-posta adresi girin.";
  if (phone.replace(/\D/g, "").length < 10) return "Geçerli bir telefon numarası girin.";
  if (password.length < 8) return "Parola en az 8 karakter olmalı.";
  if (!f.get("kvkk")) return "KVKK Aydınlatma Metni'ni onaylamalısınız.";

  try {
    const [exists] = await db().query<RowDataPacket[]>("SELECT id FROM users WHERE email = ?", [email]);
    if (exists.length) return "Bu e-posta adresiyle kayıtlı bir hesap var. Giriş yapmayı deneyin.";
    const [res] = await db().query<ResultSetHeader>(
      "INSERT INTO users (first_name, last_name, email, phone, password_hash) VALUES (?,?,?,?,?)",
      [first, last, email, phone, await hashPassword(password)]
    );
    await createUserSession(res.insertId, true);
    after(() => sendMail(email, welcomeMail({ firstName: first, email }), { from: "noreply", tag: "hoş geldiniz" }));
    // Bülten kutusu işaretliyse aynı e-posta bültene kaydedilir (onay zamanı ve IP ile)
    if (f.get("newsletter")) {
      const ip = await clientIp();
      after(() => subscribe(email, ip).catch((e) => console.error("[bülten üyelik]", (e as Error).message)));
    }
  } catch (e) {
    console.error("[register]", (e as Error).message);
    return "Şu an kayıt yapılamıyor. Lütfen daha sonra tekrar deneyin.";
  }
  redirect(nextPath(f) ?? "/hesabim");
}

export async function login(_: string | null, f: FormData): Promise<string | null> {
  const email = clean(f, "email", 190).toLowerCase();
  if (tooMany(`login:${await clientIp()}:${email}`, 8, 15 * 60_000)) return "Çok fazla deneme yaptınız. 15 dakika sonra tekrar deneyin.";
  try {
    const [rows] = await db().query<RowDataPacket[]>("SELECT id, password_hash FROM users WHERE email = ?", [email]);
    const u = rows[0];
    if (!u || !(await verifyPassword(String(f.get("password") ?? ""), u.password_hash))) return "E-posta veya parola hatalı.";
    await createUserSession(u.id, !!f.get("remember"));
  } catch (e) {
    console.error("[login]", (e as Error).message);
    return "Şu an giriş yapılamıyor. Lütfen daha sonra tekrar deneyin.";
  }
  redirect(nextPath(f) ?? "/hesabim");
}

export async function logout() {
  await destroyUserSession();
  redirect("/");
}

/* ---------- Favoriler ---------- */
export async function toggleFavorite(productId: number): Promise<{ login?: boolean; favorite?: boolean }> {
  const user = await getUser();
  if (!user) return { login: true };
  if (!Number.isInteger(productId) || productId <= 0) return {};
  const [del] = await db().query<ResultSetHeader>("DELETE FROM favorites WHERE user_id = ? AND product_id = ?", [user.id, productId]);
  if (del.affectedRows) return { favorite: false };
  const [p] = await db().query<RowDataPacket[]>("SELECT id FROM products WHERE id = ?", [productId]);
  if (!p.length) return {};
  await db().query("INSERT IGNORE INTO favorites (user_id, product_id) VALUES (?, ?)", [user.id, productId]);
  return { favorite: true };
}

/* ---------- Sipariş ---------- */
export async function placeOrder(_: string | null, f: FormData): Promise<string | null> {
  const user = await getUser();
  if (!user) redirect("/giris?next=/siparis");

  let lines: { id: number; qty: number }[] = [];
  try {
    lines = JSON.parse(String(f.get("cart") ?? "[]"));
  } catch {}
  lines = lines.filter((l) => Number.isInteger(l.id) && l.id > 0 && Number.isInteger(l.qty) && l.qty >= 1 && l.qty <= 20).slice(0, 30);
  if (!lines.length) return "Sepetiniz boş.";

  const fullName = clean(f, "full_name", 160), phone = clean(f, "phone", 30), email = clean(f, "email", 190);
  const city = clean(f, "city", 80), address = clean(f, "address", 600), note = clean(f, "note", 600);
  if (!fullName) return "Ad soyad zorunlu.";
  if (phone.replace(/\D/g, "").length < 10) return "Geçerli bir telefon numarası girin.";
  if (!EMAIL.test(email)) return "Geçerli bir e-posta adresi girin.";
  if (!city) return "Şehir zorunlu.";
  if (address.length < 10) return "Lütfen açık adresinizi yazın.";
  if (!f.get("terms")) return "Mesafeli Satış Sözleşmesi'ni onaylamalısınız.";

  let orderId = 0;
  const conn = await db().getConnection();
  try {
    // Fiyat ve stok bilgisi istemciden değil, veritabanından alınır
    const ids = [...new Set(lines.map((l) => l.id))];
    const [rows] = await conn.query<RowDataPacket[]>("SELECT id, name, price, in_stock, image_url FROM products WHERE active = 1 AND id IN (?)", [ids]);
    const byId = new Map(rows.map((r) => [r.id as number, r]));
    let total = 0;
    const items: [number, string, number, number][] = [];
    const images = new Map(rows.map((r) => [r.id as number, r.image_url as string | null]));
    for (const l of lines) {
      const p = byId.get(l.id);
      if (!p) return "Sepetinizdeki bir ürün artık satışta değil. Lütfen sepetinizi güncelleyin.";
      if (!p.in_stock) return `"${p.name}" şu an stokta yok.`;
      if (Number(p.price) <= 0) return `"${p.name}" için fiyat bilgisi almak üzere bizimle iletişime geçin.`;
      total += Number(p.price) * l.qty;
      items.push([l.id, p.name, Number(p.price), l.qty]);
    }

    await conn.beginTransaction();
    const [res] = await conn.query<ResultSetHeader>(
      "INSERT INTO orders (user_id, total, full_name, phone, email, city, address, note) VALUES (?,?,?,?,?,?,?,?)",
      [user.id, total, fullName, phone, email, city, address, note || null]
    );
    await conn.query("INSERT INTO order_items (order_id, product_id, name, price, qty) VALUES ?", [items.map((i) => [res.insertId, ...i])]);
    await conn.commit();
    orderId = res.insertId;
    // Sipariş onayı müşteriye, bildirim size; yanıtı bekletmeden gönderilir
    const mail: OrderMailData = {
      id: orderId, createdAt: new Date(), fullName, email, phone, city, address, note, total,
      items: items.map(([pid, name, price, qty]) => ({ name, price, qty, image: images.get(pid) })),
    };
    after(async () => {
      await sendMail(email, orderReceivedMail(mail), { from: "siparis", tag: "sipariş" });
      await sendMail(orderInbox(), orderAdminMail(mail), { from: "noreply", replyTo: email, tag: "sipariş bildirimi" });
    });
  } catch (e) {
    await conn.rollback().catch(() => {});
    console.error("[order]", (e as Error).message);
    return "Siparişiniz kaydedilemedi. Lütfen tekrar deneyin.";
  } finally {
    conn.release();
  }
  redirect(`/siparis/tamam/${orderId}`);
}

/* ---------- Yorum ---------- */
export async function submitReview(_: string | null, f: FormData): Promise<string | null> {
  const user = await getUser();
  if (!user) return "Yorum yapmak için giriş yapmalısınız.";
  const productId = Number(f.get("product_id"));
  const rating = Number(f.get("rating"));
  const comment = clean(f, "comment", 1000);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return "Lütfen 1 ile 5 arasında bir puan verin.";
  if (comment.length < 10) return "Yorumunuz en az 10 karakter olmalı.";

  const [p] = await db().query<RowDataPacket[]>("SELECT slug FROM products WHERE id = ?", [productId]);
  if (!p.length) return "Ürün bulunamadı.";
  if ((await reviewEligibility(user.id, String(productId))) !== "ok") return "Bu ürüne yorum yapabilmek için siparişinizin teslim edilmiş olması gerekir.";

  try {
    await db().query("INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?,?,?,?)", [productId, user.id, rating, comment]);
  } catch {
    return "Bu ürüne zaten yorum yaptınız.";
  }
  redirect(`/urun/${p[0].slug}?yorum=1#yorumlar`);
}
