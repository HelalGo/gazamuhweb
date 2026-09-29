import type { Req } from "./uploads";

// Görsel boyut şartları — admin panelinde de bu değerler gösterilir.
export const HERO_REQ: Req = { w: 1920, h: 1080, ratio: false };
export const HERO_MOBILE_REQ: Req = { w: 1080, h: 1920, ratio: false, portrait: true };
export const TILE_REQ: Req = { w: 800, h: 1120 }; // 5:7 dikey kart
export const BRAND_REQ: Req = { w: 400, h: 200, ratio: false }; // marka logosu, oran serbest

export type CampaignLayout = "full" | "half" | "third" | "bigLeft" | "bigRight";

// Ölçüler 1600 px genişliğindeki bir alan için verilmiştir (ekranda otomatik küçülür).
export const CAMPAIGN_LAYOUTS: Record<CampaignLayout, { label: string; hint: string; slots: { name: string; req: Req }[] }> = {
  full: { label: "Tek geniş afiş", hint: "Sayfa genişliğinde tek görsel", slots: [{ name: "Afiş", req: { w: 1600, h: 450 } }] },
  half: {
    label: "İki eşit afiş", hint: "Yan yana iki görsel",
    slots: [{ name: "Sol", req: { w: 800, h: 450 } }, { name: "Sağ", req: { w: 800, h: 450 } }],
  },
  third: {
    label: "Üç eşit afiş", hint: "Yan yana üç görsel",
    slots: [{ name: "Sol", req: { w: 640, h: 480 } }, { name: "Orta", req: { w: 640, h: 480 } }, { name: "Sağ", req: { w: 640, h: 480 } }],
  },
  bigLeft: {
    label: "Solda büyük, sağda iki küçük", hint: "Sol tarafta kare büyük görsel, sağda üst üste iki yatay görsel",
    slots: [{ name: "Sol büyük", req: { w: 800, h: 800 } }, { name: "Sağ üst", req: { w: 800, h: 400 } }, { name: "Sağ alt", req: { w: 800, h: 400 } }],
  },
  bigRight: {
    label: "Solda iki küçük, sağda büyük", hint: "Solda üst üste iki yatay görsel, sağ tarafta kare büyük görsel",
    slots: [{ name: "Sol üst", req: { w: 800, h: 400 } }, { name: "Sol alt", req: { w: 800, h: 400 } }, { name: "Sağ büyük", req: { w: 800, h: 800 } }],
  },
};

// Yalnızca site içi yollar ("/klima") ve http(s) adreslerine izin verir
export function safeUrl(v: unknown): string | null {
  const s = String(v ?? "").trim();
  if (!s) return null;
  if (s.startsWith("/") && !s.startsWith("//")) return s;
  return /^https?:\/\//i.test(s) ? s : null;
}
