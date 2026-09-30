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
  art?: "klima" | "kombi" | "proje"; // görsel yokken gösterilen yerleşik tasarım
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
  const fallback: Tile[] = ["Kombi", "Klima", "Isı Pompası", "Oda Termostatı"].map((t) => ({
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

export type BrandLogo = { id: string; name: string; image: string };

// Marka logoları tablosu sonradan eklendi; yoksa oluşturulur (sunucuda ayrıca kurulum gerekmez)
export async function ensureBrandTable() {
  await db().query(`CREATE TABLE IF NOT EXISTS brand_logos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sort_order INT NOT NULL DEFAULT 0,
    active TINYINT(1) NOT NULL DEFAULT 1,
    name VARCHAR(80) NOT NULL,
    image_url VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) CHARACTER SET utf8mb4`);
}

export async function getBrandLogos(): Promise<BrandLogo[]> {
  if (!dbOn()) return [];
  try {
    await ensureBrandTable();
    const [rows] = await db().query<RowDataPacket[]>("SELECT * FROM brand_logos WHERE active = 1 AND image_url IS NOT NULL ORDER BY sort_order, id");
    return rows.map((r) => ({ id: String(r.id), name: r.name, image: r.image_url }));
  } catch (e) {
    console.error("[cms] markalar okunamadı:", (e as Error).message);
    return [];
  }
}

/* ---------- Mobil uygulama tanıtım ekranları ---------- */
export type OnboardingSlide = { id: string; title: string; text: string; image: string };

// Uygulamayı ilk kez açan kullanıcıya gösterilen tanıtım sayfaları; tablo yoksa oluşturulur
export async function ensureOnboardingTable() {
  await db().query(`CREATE TABLE IF NOT EXISTS app_onboarding (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sort_order INT NOT NULL DEFAULT 0,
    active TINYINT(1) NOT NULL DEFAULT 1,
    title VARCHAR(120) NOT NULL,
    text VARCHAR(400) NULL,
    image_url VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) CHARACTER SET utf8mb4`);
}

export async function getOnboarding(): Promise<OnboardingSlide[]> {
  if (!dbOn()) return [];
  try {
    await ensureOnboardingTable();
    const [rows] = await db().query<RowDataPacket[]>("SELECT * FROM app_onboarding WHERE active = 1 AND image_url IS NOT NULL ORDER BY sort_order, id");
    return rows.map((r) => ({ id: String(r.id), title: r.title, text: r.text ?? "", image: r.image_url }));
  } catch (e) {
    console.error("[cms] tanıtım ekranları okunamadı:", (e as Error).message);
    return [];
  }
}

/* ---------- Mobil uygulama ana sayfa bannerları ---------- */
// target: "" (bağlantı yok) | "kampanyalar" | "kategori:<ad>" | site adresi ("/urun/..." ya da https://...)
export type AppBanner = { id: string; image: string; title: string; text: string; target: string };

export async function ensureAppBannerTable() {
  await db().query(`CREATE TABLE IF NOT EXISTS app_banners (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sort_order INT NOT NULL DEFAULT 0,
    active TINYINT(1) NOT NULL DEFAULT 1,
    title VARCHAR(120) NULL,
    text VARCHAR(200) NULL,
    target VARCHAR(300) NULL,
    image_url VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) CHARACTER SET utf8mb4`);
}

export async function getAppBanners(): Promise<AppBanner[]> {
  if (!dbOn()) return [];
  try {
    await ensureAppBannerTable();
    const [rows] = await db().query<RowDataPacket[]>("SELECT * FROM app_banners WHERE active = 1 AND image_url IS NOT NULL ORDER BY sort_order, id");
    return rows.map((r) => ({ id: String(r.id), image: r.image_url, title: r.title ?? "", text: r.text ?? "", target: r.target ?? "" }));
  } catch (e) {
    console.error("[cms] uygulama bannerları okunamadı:", (e as Error).message);
    return [];
  }
}
