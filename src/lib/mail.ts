import nodemailer, { type Transporter } from "nodemailer";
import { company, contact, igdas, mailboxes, socials } from "./site";

// Tüm e-postalar buradan gönderilir. Her gönderici kendi posta kutusunun kullanıcı adı ve parolasıyla
// oturum açar (.env): SMTP_USER/SMTP_PASS (destek), NOREPLY_PASS, SIPARIS_PASS.
// Bir hesabın parolası yoksa e-posta destek hesabından gönderilir; hiçbir e-posta kaybolmaz.
export const SITE_URL = (process.env.SITE_URL || "https://gazamuhendislik.com.tr").replace(/\/$/, "");

export type Sender = "destek" | "siparis" | "noreply";
const NAMES: Record<Sender, string> = { destek: "GAZ-A Mühendislik", siparis: "GAZ-A Mühendislik Sipariş", noreply: "GAZ-A Mühendislik" };

const usable = (v?: string) => !!v && !v.startsWith("BURAYA");
function account(s: Sender) {
  const e = process.env;
  const a = {
    destek: { user: e.SMTP_USER || mailboxes.destek, pass: e.SMTP_PASS },
    siparis: { user: e.SIPARIS_USER || mailboxes.siparis, pass: e.SIPARIS_PASS },
    noreply: { user: e.NOREPLY_USER || mailboxes.noreply, pass: e.NOREPLY_PASS },
  }[s];
  return usable(a.pass) ? a : null;
}

export const mailConfigured = () => !!process.env.SMTP_HOST && !!account("destek");
export const senderReady = (s: Sender) => !!process.env.SMTP_HOST && !!account(s);
// Size gelen bildirimler: bilgi talepleri destek@, siparişler siparis@ kutusuna
export const adminInbox = () => process.env.MAIL_TO || mailboxes.destek;
export const orderInbox = () => process.env.ORDER_MAIL_TO || mailboxes.siparis;

const transports = new Map<string, Transporter>();
function getTransport(user: string, pass: string) {
  let t = transports.get(user);
  if (!t) {
    const port = Number(process.env.SMTP_PORT || 465);
    t = nodemailer.createTransport({ host: process.env.SMTP_HOST, port, secure: port === 465, auth: { user, pass } });
    transports.set(user, t);
  }
  return t;
}

export type Mail = { subject: string; html: string; text: string };

// Gönderim hatası akışı bozmaz; sonuç true/false döner ve hata günlüğe yazılır.
export async function sendMail(to: string, m: Mail, opts: { from?: Sender; replyTo?: string; tag?: string } = {}) {
  if (!process.env.SMTP_HOST) return false;
  const wanted = opts.from ?? "noreply";
  const sender = account(wanted) ? wanted : "destek";
  const acc = account(sender);
  if (!acc) return false;
  try {
    await getTransport(acc.user, acc.pass!).sendMail({
      from: `"${NAMES[sender]}" <${acc.user}>`,
      to, replyTo: opts.replyTo || (wanted === "siparis" ? mailboxes.siparis : mailboxes.destek),
      subject: m.subject, html: m.html, text: m.text,
    });
    return true;
  } catch (e) {
    console.error(`[mail${opts.tag ? ` ${opts.tag}` : ""} ${sender}]`, (e as Error).message);
    return false;
  }
}

/* ------------------------------------------------------------------ */
/* Şablon parçaları (e-posta istemcileri için tablo + satır içi stil) */

const C = { primary: "#1a3e85", accent: "#2099d0", text: "#0f172a", muted: "#64748b", border: "#e2e8f0", surface: "#f5f7fb" };
const FONT = "font-family:Arial,Helvetica,sans-serif;";

export const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export const h = {
  eyebrow: (t: string) => `<p style="${FONT}margin:0 0 8px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:${C.accent};font-weight:bold">${esc(t)}</p>`,
  title: (t: string) => `<h1 style="${FONT}margin:0 0 16px;font-size:26px;line-height:1.25;font-weight:normal;color:${C.text}">${t}</h1>`,
  p: (t: string) => `<p style="${FONT}margin:0 0 14px;font-size:15px;line-height:1.7;color:#334155">${t}</p>`,
  small: (t: string) => `<p style="${FONT}margin:0 0 8px;font-size:12px;line-height:1.6;color:${C.muted}">${t}</p>`,
  button: (label: string, href: string) =>
    `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0"><tr><td style="background:${C.primary};border-radius:4px">
      <a href="${esc(href)}" style="${FONT}display:inline-block;padding:14px 28px;font-size:12px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:#ffffff;text-decoration:none">${esc(label)}</a>
    </td></tr></table>`,
  divider: () => `<div style="height:1px;background:${C.border};margin:24px 0"></div>`,
  // Anahtar–değer kutusu (sipariş özeti, müşteri bilgisi vb.)
  box: (rows: [string, string][], title?: string) =>
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 20px;background:${C.surface};border-radius:4px">
      ${title ? `<tr><td colspan="2" style="${FONT}padding:16px 20px 4px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${C.muted};font-weight:bold">${esc(title)}</td></tr>` : ""}
      ${rows.map(([k, v]) => `<tr><td style="${FONT}padding:8px 20px;font-size:13px;color:${C.muted};width:38%;vertical-align:top">${esc(k)}</td><td style="${FONT}padding:8px 20px;font-size:14px;color:${C.text};font-weight:bold;vertical-align:top">${v}</td></tr>`).join("")}
      <tr><td colspan="2" style="height:8px"></td></tr>
    </table>`,
  // Adım göstergesi: sipariş durumu için
  steps: (labels: string[], active: number) =>
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 24px"><tr>
      ${labels.map((l, i) => `<td align="center" style="${FONT}width:${100 / labels.length}%;vertical-align:top">
        <div style="height:4px;background:${i <= active ? C.accent : C.border};margin:0 2px 10px;border-radius:2px"></div>
        <span style="font-size:11px;color:${i <= active ? C.primary : C.muted};font-weight:${i === active ? "bold" : "normal"}">${esc(l)}</span>
      </td>`).join("")}
    </tr></table>`,
};

export type Line = { name: string; qty: number; price: number; image?: string | null };
const money = (n: number) => `${n.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ₺`;

export function itemsTable(items: Line[], total: number) {
  const rows = items.map((i) => `<tr>
      <td style="padding:14px 0;border-bottom:1px solid ${C.border};width:64px;vertical-align:top">
        ${i.image ? `<img src="${esc(i.image.startsWith("http") ? i.image : SITE_URL + i.image)}" width="56" height="56" alt="" style="display:block;border-radius:4px;object-fit:cover;background:${C.surface}">` : `<div style="width:56px;height:56px;background:${C.surface};border-radius:4px"></div>`}
      </td>
      <td style="${FONT}padding:14px 12px;border-bottom:1px solid ${C.border};font-size:14px;color:${C.text};vertical-align:top">${esc(i.name)}<br><span style="font-size:12px;color:${C.muted}">${i.qty} adet × ${money(i.price)}</span></td>
      <td align="right" style="${FONT}padding:14px 0;border-bottom:1px solid ${C.border};font-size:14px;font-weight:bold;color:${C.text};white-space:nowrap;vertical-align:top">${money(i.price * i.qty)}</td>
    </tr>`).join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 4px">${rows}
    <tr><td></td><td style="${FONT}padding:16px 12px 0;font-size:13px;color:${C.muted}">Toplam (KDV dahil)</td>
    <td align="right" style="${FONT}padding:16px 0 0;font-size:20px;font-weight:bold;color:${C.primary};white-space:nowrap">${money(total)}</td></tr></table>`;
}

// Ortak çerçeve: logo, içerik kartı, iletişim ve yasal alt bilgi
export function layout({ preheader, body, footerNote }: { preheader: string; body: string; footerNote?: string }) {
  const social = socials.filter((s) => s.icon !== "whatsapp").map((s) => `<a href="${esc(s.href)}" style="color:${C.primary};text-decoration:none;margin:0 8px">${esc(s.label.split(" ")[0])}</a>`).join("·");
  return `<!doctype html><html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>GAZ-A Mühendislik</title></head>
<body style="margin:0;padding:0;background:${C.surface}">
<span style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.surface}"><tr><td align="center" style="padding:32px 12px">
  <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px">
    <tr><td style="padding:0 4px 20px"><a href="${SITE_URL}"><img src="${SITE_URL}/brand/logo.png" width="170" alt="GAZ-A Mühendislik" style="display:block;height:auto;border:0"></a></td></tr>
    <tr><td style="background:#ffffff;border-radius:4px;border-top:4px solid ${C.primary};padding:36px 36px 28px">${body}</td></tr>
    <tr><td style="padding:24px 8px 0" align="center">
      <p style="${FONT}margin:0 0 10px;font-size:13px;color:${C.text}"><a href="tel:+9${contact.phone.replace(/\s/g, "")}" style="color:${C.text};text-decoration:none">${esc(contact.phone)}</a> · <a href="mailto:${contact.email}" style="color:${C.text};text-decoration:none">${esc(contact.email)}</a></p>
      <p style="${FONT}margin:0 0 10px;font-size:12px">${social}</p>
      <p style="${FONT}margin:0 0 6px;font-size:11px;line-height:1.6;color:${C.muted}">${esc(company.title)}<br>${esc(contact.address)}<br>${esc(igdas.title)} · Yetki No: ${esc(igdas.no)}</p>
      ${footerNote ? `<p style="${FONT}margin:10px 0 0;font-size:11px;line-height:1.6;color:${C.muted}">${footerNote}</p>` : ""}
    </td></tr>
  </table>
</td></tr></table></body></html>`;
}

// HTML'den basit düz metin (düz metin gösteren istemciler için)
export const toText = (html: string) =>
  html.replace(/<style[\s\S]*?<\/style>/g, "").replace(/<br\s*\/?>/g, "\n").replace(/<\/(p|h1|tr|div)>/g, "\n").replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ").replace(/\n\s*\n\s*\n+/g, "\n\n").trim();
