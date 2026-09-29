"use server";
import { after } from "next/server";
import { SITE_URL, sendMail } from "@/lib/mail";
import { newsletterWelcomeMail } from "@/lib/mails";
import { subscribe } from "@/lib/newsletter";
import { clientIp, tooMany } from "@/lib/ratelimit";

export type SubState = { ok?: string; error?: string } | null;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function subscribeAction(_: SubState, f: FormData): Promise<SubState> {
  if (f.get("website")) return { ok: "Teşekkürler!" }; // bot tuzağı
  const ip = await clientIp();
  if (tooMany(`sub:${ip}`, 5, 10 * 60_000)) return { error: "Çok fazla deneme yaptınız. Lütfen biraz sonra tekrar deneyin." };
  const email = String(f.get("email") ?? "").trim().toLowerCase().slice(0, 190);
  if (!EMAIL.test(email)) return { error: "Geçerli bir e-posta adresi yazın." };
  if (!f.get("consent")) return { error: "Abone olmak için ticari elektronik ileti onayını işaretleyin." };
  try {
    const r = await subscribe(email, ip);
    if (r.status === "exists") return { ok: "Bu adres zaten bültenimize kayıtlı." };
    after(() => sendMail(email, newsletterWelcomeMail(email, `${SITE_URL}/abonelik?iptal=${r.token}`), { from: "noreply", tag: "bülten" }));
    return { ok: "Aboneliğiniz oluşturuldu. Hoş geldiniz!" };
  } catch (e) {
    console.error("[bülten]", (e as Error).message);
    return { error: "Şu an abonelik oluşturulamadı. Lütfen daha sonra tekrar deneyin." };
  }
}
