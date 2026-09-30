import { after } from "next/server";
import { EMAIL, body, fail, json, preflight } from "@/lib/app-api";
import { notifyLead, saveLead, type Lead } from "@/lib/leads";
import { getProduct } from "@/lib/products";
import { clientIp, tooMany } from "@/lib/ratelimit";

export const OPTIONS = preflight;
const SITE = process.env.SITE_URL || "https://gazamuhendislik.com.tr";

// Mobil uygulamadan bilgi / teklif talebi: sitedeki "Bilgi Al" formuyla aynı kayıt ve bildirimler
export async function POST(req: Request) {
  if (tooMany(`lead:${await clientIp()}`, 5, 10 * 60_000)) return fail("Çok fazla talep gönderdiniz. Lütfen birkaç dakika sonra tekrar deneyin.", 429);
  const b = await body(req);
  const fullName = b.str("fullName", 160);
  const phone = b.str("phone", 30);
  const email = b.str("email", 190).toLowerCase();
  if (fullName.length < 3) return fail("Adınızı ve soyadınızı yazın.");
  if (phone.replace(/\D/g, "").length < 10) return fail("Geçerli bir telefon numarası yazın.");
  if (email && !EMAIL.test(email)) return fail("E-posta adresi geçersiz.");
  if (!b.bool("kvkk")) return fail("Devam etmek için KVKK Aydınlatma Metni'ni onaylayın.");

  const slug = b.str("product", 255);
  const p = slug ? await getProduct(slug) : undefined;
  const lead: Lead = {
    fullName, phone, email,
    city: b.str("city", 80),
    message: b.str("message", 2000),
    product: p ? { id: Number(p.id), name: p.name, brand: p.brand, sku: p.sku, price: p.price, url: `${SITE}/urun/${p.slug}` } : null,
  };
  try {
    const id = await saveLead(lead);
    after(() => notifyLead(id, lead));
    return json({ ok: true });
  } catch (e) {
    console.error("[app lead]", (e as Error).message);
    return fail("Talebiniz şu an iletilemedi. Lütfen bizi telefonla ya da WhatsApp'tan arayın.", 500);
  }
}
