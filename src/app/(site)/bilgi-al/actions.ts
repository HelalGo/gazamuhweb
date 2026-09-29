"use server";
import { after } from "next/server";
import { notifyLead, saveLead, type Lead } from "@/lib/leads";
import { getProduct } from "@/lib/products";
import { clientIp, tooMany } from "@/lib/ratelimit";

export type LeadState = { ok?: true; error?: string } | null;

const clean = (f: FormData, k: string, max: number) => String(f.get(k) ?? "").trim().slice(0, max);
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SITE = process.env.SITE_URL || "https://gazamuhendislik.com.tr";

export async function submitLead(_: LeadState, f: FormData): Promise<LeadState> {
  if (f.get("website")) return { ok: true }; // gizli alanı dolduran bot
  if (tooMany(`lead:${await clientIp()}`, 5, 10 * 60_000)) return { error: "Çok fazla talep gönderdiniz. Lütfen birkaç dakika sonra tekrar deneyin." };

  const fullName = clean(f, "full_name", 160);
  const phone = clean(f, "phone", 30);
  const email = clean(f, "email", 190).toLowerCase();
  if (fullName.length < 3) return { error: "Adınızı ve soyadınızı yazın." };
  if (phone.replace(/\D/g, "").length < 10) return { error: "Geçerli bir telefon numarası yazın." };
  if (email && !EMAIL.test(email)) return { error: "E-posta adresi geçersiz." };
  if (!f.get("kvkk")) return { error: "Devam etmek için KVKK Aydınlatma Metni'ni onaylayın." };

  const slug = clean(f, "urun", 255);
  const p = slug ? await getProduct(slug) : undefined;
  const lead: Lead = {
    fullName, phone, email,
    city: clean(f, "city", 80),
    message: clean(f, "message", 2000),
    product: p ? { id: Number(p.id), name: p.name, brand: p.brand, sku: p.sku, price: p.price, url: `${SITE}/urun/${p.slug}` } : null,
  };

  let id: number;
  try {
    id = await saveLead(lead);
  } catch (e) {
    console.error("[lead]", (e as Error).message);
    return { error: "Talebiniz şu an iletilemedi. Lütfen bizi telefonla ya da WhatsApp'tan arayın." };
  }
  after(() => notifyLead(id, lead)); // e-posta ve WhatsApp yanıtı bekletmeden gönderilir
  return { ok: true };
}
