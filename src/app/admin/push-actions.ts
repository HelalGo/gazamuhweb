"use server";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { safeUrl } from "@/lib/layouts";
import { broadcast } from "@/lib/push";
import { saveImage } from "@/lib/uploads";

const PUSH_IMAGE_REQ = { w: 600, h: 300, ratio: false } as const; // yatay 2:1 önerilir
const back = (err: string): never => redirect(`/admin/bildirimler?err=${encodeURIComponent(err)}`);

// Mobil uygulamaya toplu bildirim (kampanya bildirimlerini kapatanlar hariç)
export async function sendPushMessage(f: FormData) {
  await requireAdmin();
  const title = String(f.get("title") ?? "").trim().slice(0, 65);
  const body = String(f.get("body") ?? "").trim().slice(0, 178);
  if (!title) back("Başlık zorunlu.");
  if (!body) back("Mesaj metni zorunlu.");

  let image: string | null = null;
  const file = f.get("image");
  if (file instanceof File && file.size) {
    const res = await saveImage(file, PUSH_IMAGE_REQ);
    if ("error" in res) back(res.error);
    else image = res.url;
  }

  // Dokununca açılacak yer: uygulama sayfası (kampanyalar, kategori:X) ya da site adresi (/urun/..., /blog/...)
  const custom = String(f.get("target_url") ?? "").trim();
  let target = String(f.get("target") ?? "");
  if (custom) {
    const url = safeUrl(custom);
    if (!url) back("Site adresi / ile başlamalı (örn. /urun/...) ya da https:// ile tam adres olmalı.");
    target = url!;
  } else if (target !== "kampanyalar" && !target.startsWith("kategori:")) target = "";

  const audience = f.get("audience") === "members" ? "members" : "all";
  const r = await broadcast({ title, body, image, url: target || null, audience });
  redirect(`/admin/bildirimler?sent=${r.ok}&failed=${r.failed}&total=${r.sent}`);
}
