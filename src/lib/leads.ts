import type { ResultSetHeader } from "mysql2";
import { db } from "./db";
import { adminInbox, mailConfigured, sendMail } from "./mail";
import { leadAdminMail, leadCustomerMail } from "./mails";
import { WHATSAPP_NUMBER } from "./site";
import { ensureSiteColumn } from "./site-db";
import { SITES, SITE_KEY } from "./sites";
import { tl } from "./utils";

export type Lead = {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  message: string;
  product: { id: number; name: string; brand: string; sku: string | null; price: number; url: string } | null;
};

// "Bilgi Al" talepleri: hem veritabanına kaydedilir (admin panelinde görünür) hem de bildirim gönderilir.
let tableReady = false;
async function ensureTable() {
  if (tableReady) return;
  await db().query(`CREATE TABLE IF NOT EXISTS leads (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id INT UNSIGNED NULL,
    product_name VARCHAR(255) NULL,
    full_name VARCHAR(160) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(190) NULL,
    city VARCHAR(80) NULL,
    message TEXT NULL,
    handled TINYINT(1) NOT NULL DEFAULT 0,
    mail_ok TINYINT(1) NOT NULL DEFAULT 0,
    wa_ok TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_handled (handled)
  ) CHARACTER SET utf8mb4`);
  tableReady = true;
}

export async function saveLead(l: Lead) {
  await ensureTable();
  await ensureSiteColumn("leads");
  const [res] = await db().query<ResultSetHeader>(
    "INSERT INTO leads (product_id, product_name, full_name, phone, email, city, message, site) VALUES (?,?,?,?,?,?,?,?)",
    [l.product?.id ?? null, l.product?.name ?? null, l.fullName, l.phone, l.email || null, l.city || null, l.message || null, SITE_KEY]
  );
  return res.insertId;
}

// Boş satır ("") ürün ve müşteri bölümlerini ayırır
function lines(l: Lead): string[] {
  const p = l.product;
  return [
    p ? `Ürün: ${p.name}` : "Genel bilgi talebi",
    ...(p ? [`Marka: ${p.brand}${p.sku ? ` · Kod: ${p.sku}` : ""}`, `Fiyat: ${p.price > 0 ? tl(p.price) : "Fiyat için arayın"}`, `Link: ${p.url}`] : []),
    "",
    `Ad Soyad: ${l.fullName}`,
    `Telefon: ${l.phone}`,
    ...(l.email ? [`E-posta: ${l.email}`] : []),
    ...(l.city ? [`Şehir: ${l.city}`] : []),
    ...(l.message ? [`Mesaj: ${l.message}`] : []),
  ];
}

async function sendLeadMails(l: Lead) {
  if (!mailConfigured()) return false;
  const ok = await sendMail(adminInbox(), leadAdminMail(l), { from: "noreply", replyTo: l.email || undefined, tag: "talep" });
  if (l.email) await sendMail(l.email, leadCustomerMail(l), { from: "noreply", tag: "talep onayı" });
  return ok;
}

// CallMeBot: kayıtlı WhatsApp numarasına otomatik mesaj (https://www.callmebot.com/blog/free-api-whatsapp-messages/)
async function sendWhatsApp(l: Lead) {
  const key = process.env.CALLMEBOT_APIKEY;
  if (!key || key.startsWith("BURAYA")) return false;
  const phone = process.env.CALLMEBOT_PHONE || `+${WHATSAPP_NUMBER}`;
  // WhatsApp numarası iki sitede ortak: başlıkta talebin hangi markadan geldiği yazar
  const text = [`*Yeni bilgi talebi · ${SITES[SITE_KEY].label}*`, ...lines(l)].join("\n");
  const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(key)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  return res.ok;
}

// Bildirimleri gönderir; biri başarısız olsa da talep kaybolmaz (veritabanında durur).
export async function notifyLead(id: number, l: Lead) {
  const [mail, wa] = await Promise.all([
    sendLeadMails(l).catch((e) => { console.error("[lead mail]", (e as Error).message); return false; }),
    sendWhatsApp(l).catch((e) => { console.error("[lead whatsapp]", (e as Error).message); return false; }),
  ]);
  await db().query("UPDATE leads SET mail_ok = ?, wa_ok = ? WHERE id = ?", [mail ? 1 : 0, wa ? 1 : 0, id]).catch(() => {});
  return { mail, wa };
}
