"use server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { createUserSession, deleteAccount, destroyUserSession, getUser } from "@/lib/customer";
import { db } from "@/lib/db";
import { safeUrl } from "@/lib/layouts";
import { orderInboxes, sendMail } from "@/lib/mail";
import { orderAdminMail, orderReceivedMail, welcomeMail, type OrderMailData } from "@/lib/mails";
import { setSubscribed, subscribe } from "@/lib/newsletter";
import { setPrefs } from "@/lib/push";
import { quote } from "@/lib/pricing";
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

  // Fiyat, stok, kargo ve kupon istemciden değil, veritabanından hesaplanır
  const couponCode = clean(f, "coupon", 40);
  let q: Awaited<ReturnType<typeof quote>>;
  try {
    q = await quote(lines, couponCode || null);
  } catch (e) {
    console.error("[order quote]", (e as Error).message);
    return "Siparişiniz kaydedilemedi. Lütfen tekrar deneyin.";
  }
  if (q.problems.length) return q.problems[0];
  if (q.lines.length !== lines.length) return "Sepetinizdeki bir ürün artık satışta değil. Lütfen sepetinizi güncelleyin.";
  if (couponCode && q.couponError) return `İndirim kuponu: ${q.couponError}`;

  let orderId = 0;
  const conn = await db().getConnection();
  try {
    await conn.beginTransaction();
    // kupon kullanım hakkı aynı anda iki siparişte tükenmesin diye sayaç koşullu artırılır
    if (q.coupon) {
      const [u] = await conn.query<ResultSetHeader>(
        "UPDATE coupons SET used_count = used_count + 1 WHERE code = ? AND active = 1 AND (max_uses IS NULL OR used_count < max_uses)", [q.coupon.code]);
      if (!u.affectedRows) { await conn.rollback(); return "İndirim kuponu: Bu kuponun kullanım hakkı dolmuş."; }
    }
    const [res] = await conn.query<ResultSetHeader>(
      "INSERT INTO orders (user_id, total, subtotal, discount, shipping, coupon_code, full_name, phone, email, city, address, note) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
      [user.id, q.total, q.subtotal, q.discount, q.shipping, q.coupon?.code ?? null, fullName, phone, email, city, address, note || null]
    );
    await conn.query("INSERT INTO order_items (order_id, product_id, name, price, qty) VALUES ?", [q.lines.map((l) => [res.insertId, l.id, l.name, l.price, l.qty])]);
    await conn.commit();
    orderId = res.insertId;
    // Sipariş onayı müşteriye, bildirim size; yanıtı bekletmeden gönderilir
    const mail: OrderMailData = {
      id: orderId, createdAt: new Date(), fullName, email, phone, city, address, note, total: q.total,
      subtotal: q.subtotal, discount: q.discount, shipping: q.shipping, coupon: q.coupon?.code ?? null,
      items: q.lines.map((l) => ({ name: l.name, price: l.price, qty: l.qty, image: l.image })),
    };
    after(async () => {
      await sendMail(email, orderReceivedMail(mail), { from: "siparis", tag: "sipariş" });
      await sendMail(orderInboxes(), orderAdminMail(mail), { from: "noreply", replyTo: email, tag: "sipariş bildirimi" });
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

/* ---------- İletişim tercihleri ---------- */
export async function savePrefs(f: FormData) {
  const user = await getUser();
  if (!user) redirect("/giris?next=/hesabim/iletisim-tercihleri");
  await setPrefs({ userId: user.id }, { marketing: !!f.get("push_marketing"), orders: !!f.get("push_orders") });
  await setSubscribed(user.email, !!f.get("email_marketing"), await clientIp());
  redirect("/hesabim/iletisim-tercihleri?saved=1");
}

/* ---------- Hesap silme ---------- */
export async function deleteMyAccount(_: string | null, f: FormData): Promise<string | null> {
  const user = await getUser();
  if (!user) redirect("/giris?next=/hesap-silme");
  if (tooMany(`del:${user.id}`, 5, 15 * 60_000)) return "Çok fazla deneme yaptınız. 15 dakika sonra tekrar deneyin.";
  if (!f.get("confirm")) return "Devam etmek için onay kutusunu işaretleyin.";
  try {
    const [rows] = await db().query<RowDataPacket[]>("SELECT password_hash FROM users WHERE id = ?", [user.id]);
    if (!rows[0] || !(await verifyPassword(String(f.get("password") ?? ""), rows[0].password_hash))) return "Parola hatalı.";
    await deleteAccount(user.id, user.email);
  } catch (e) {
    console.error("[hesap silme]", (e as Error).message);
    return "Şu an hesabınız silinemedi. Lütfen daha sonra tekrar deneyin.";
  }
  await destroyUserSession();
  redirect("/hesap-silme?silindi=1");
}
