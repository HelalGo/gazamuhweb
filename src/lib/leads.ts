import nodemailer from "nodemailer";
import type { ResultSetHeader } from "mysql2";
import { db } from "./db";
import { WHATSAPP_NUMBER, contact } from "./site";
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
  const [res] = await db().query<ResultSetHeader>(
    "INSERT INTO leads (product_id, product_name, full_name, phone, email, city, message) VALUES (?,?,?,?,?,?,?)",
    [l.product?.id ?? null, l.product?.name ?? null, l.fullName, l.phone, l.email || null, l.city || null, l.message || null]
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

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

async function sendMail(l: Lead) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || SMTP_PASS.startsWith("BURAYA")) return false;
  const port = Number(SMTP_PORT || 465);
  const t = nodemailer.createTransport({ host: SMTP_HOST, port, secure: port === 465, auth: { user: SMTP_USER, pass: SMTP_PASS } });
  const rows = lines(l).map((x) => (x ? `<p style="margin:4px 0">${esc(x)}</p>` : "<hr>")).join("");
  await t.sendMail({
    from: `"GAZ-A Web Sitesi" <${SMTP_USER}>`,
    to: process.env.MAIL_TO || contact.email,
    replyTo: l.email || undefined,
    subject: `Bilgi talebi: ${l.product?.name ?? "Genel"} — ${l.fullName}`,
    text: lines(l).join("\n"),
    html: `<div style="font-family:Arial,sans-serif;font-size:14px">${rows}</div>`,
  });
  return true;
}

// CallMeBot: kayıtlı WhatsApp numarasına otomatik mesaj (https://www.callmebot.com/blog/free-api-whatsapp-messages/)
async function sendWhatsApp(l: Lead) {
  const key = process.env.CALLMEBOT_APIKEY;
  if (!key || key.startsWith("BURAYA")) return false;
  const phone = process.env.CALLMEBOT_PHONE || `+${WHATSAPP_NUMBER}`;
  const text = ["*Yeni bilgi talebi*", ...lines(l)].join("\n");
  const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(key)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
  return res.ok;
}

// Bildirimleri gönderir; biri başarısız olsa da talep kaybolmaz (veritabanında durur).
export async function notifyLead(id: number, l: Lead) {
  const [mail, wa] = await Promise.all([
    sendMail(l).catch((e) => { console.error("[lead mail]", (e as Error).message); return false; }),
    sendWhatsApp(l).catch((e) => { console.error("[lead whatsapp]", (e as Error).message); return false; }),
  ]);
  await db().query("UPDATE leads SET mail_ok = ?, wa_ok = ? WHERE id = ?", [mail ? 1 : 0, wa ? 1 : 0, id]).catch(() => {});
  return { mail, wa };
}
