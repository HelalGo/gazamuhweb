import type { RowDataPacket } from "mysql2";
import { db } from "./db";
import { slides as defaultSlides } from "./home";
import type { CampaignLayout } from "./layouts";

const dbOn = () => !!process.env.DB_HOST && !process.env.DB_HOST.startsWith("BURAYA");

export type HeroSlide = {
  id: string;
  image: string | null;
  mobileImage: string | null;
  overlay: boolean;
  eyebrow: string;
  title: string;
  text: string;
  buttons: { label: string; url: string }[];
  art?: "klima" | "kombi" | "ankastre" | "proje"; // görsel yokken gösterilen yerleşik tasarım
};

export type Tile = { id: string; image: string | null; title: string; url: string };
export type CampaignItem = { image_url: string; url: string | null; alt: string };
export type CampaignBlock = { id: string; title: string; layout: CampaignLayout; items: CampaignItem[] };

const fallbackSlides = (): HeroSlide[] =>
  defaultSlides.map((s) => ({
    id: s.id, image: null, mobileImage: null, overlay: true, eyebrow: s.eyebrow, title: s.title, text: s.text, art: s.art,
    buttons: [s.cta, ...(s.cta2 ? [s.cta2] : [])].map((b) => ({ label: b.label, url: b.href })),
  }));

type SlideRow = RowDataPacket & {
  id: number; image_url: string | null; mobile_image_url: string | null; overlay: number; eyebrow: string | null; title: string;
  text: string | null; btn1_label: string | null; btn1_url: string | null; btn2_label: string | null; btn2_url: string | null;
};

export async function getSlides(): Promise<HeroSlide[]> {
  if (!dbOn()) return fallbackSlides();
  try {
    const [rows] = await db().query<SlideRow[]>("SELECT * FROM hero_slides WHERE active = 1 ORDER BY sort_order, id");
    if (!rows.length) return fallbackSlides();
    return rows.map((r) => ({
      id: String(r.id), image: r.image_url, mobileImage: r.mobile_image_url, overlay: !!r.overlay,
      eyebrow: r.eyebrow ?? "", title: r.title, text: r.text ?? "",
      buttons: [
        r.btn1_label && r.btn1_url ? { label: r.btn1_label, url: r.btn1_url } : null,
        r.btn2_label && r.btn2_url ? { label: r.btn2_label, url: r.btn2_url } : null,
      ].filter((b): b is { label: string; url: string } => !!b),
      art: r.image_url ? undefined : "klima",
    }));
  } catch (e) {
    console.error("[cms] slider okunamadı:", (e as Error).message);
    return fallbackSlides();
  }
}

export async function getTiles(): Promise<Tile[]> {
  const fallback: Tile[] = ["Kombi", "Klima", "Ankastre", "Oda Termostatı"].map((t) => ({
    id: t, image: null, title: t, url: `/${t.toLocaleLowerCase("tr").replace(/ı/g, "i").replace(/ş/g, "s").replace(/ /g, "-")}`,
  }));
  if (!dbOn()) return fallback;
  try {
    const [rows] = await db().query<RowDataPacket[]>("SELECT * FROM showcase_tiles WHERE active = 1 ORDER BY sort_order, id");
    return rows.length ? rows.map((r) => ({ id: String(r.id), image: r.image_url, title: r.title, url: r.url ?? "/urunler" })) : fallback;
  } catch {
    return fallback;
  }
}

export async function getCampaigns(): Promise<CampaignBlock[]> {
  if (!dbOn()) return [];
  try {
    const [rows] = await db().query<RowDataPacket[]>("SELECT * FROM campaign_blocks WHERE active = 1 ORDER BY sort_order, id");
    return rows.map((r) => ({
      id: String(r.id), title: r.title ?? "", layout: r.layout as CampaignLayout,
      items: typeof r.items === "string" ? JSON.parse(r.items) : r.items,
    }));
  } catch {
    return [];
  }
}
