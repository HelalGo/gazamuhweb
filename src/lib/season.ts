import type { RowDataPacket } from "mysql2";
import { db } from "./db";
import { ensurePricingTables } from "./pricing";
import { nav } from "./site";

/*
  Mevsime göre kategori sırası: header, footer, site haritası ve ana sayfa bölümleri bu sırayı izler.
  Isıtma sezonu Eylül–Mart, soğutma sezonu Nisan–Ağustos. Admin panelinden (Mağaza → Mevsim Sıralaması)
  otomatik yerine elle bir sezon seçilebilir.
*/
export type Season = "isitma" | "sogutma";
export type SeasonMode = "auto" | Season;

export const SEASONS: Record<Season, { label: string; months: string; order: string[] }> = {
  isitma: {
    label: "Isıtma sezonu (kış)",
    months: "Eylül – Mart",
    order: ["Kombi", "Radyatör", "Isı Pompası", "Oda Termostatı", "Sirkülasyon Pompası", "Şofben", "Klima"],
  },
  sogutma: {
    label: "Soğutma sezonu (yaz)",
    months: "Nisan – Ağustos",
    order: ["Klima", "Isı Pompası", "Şofben", "Kombi", "Radyatör", "Oda Termostatı", "Sirkülasyon Pompası"],
  },
};

// Türkiye saatine göre ay
export function autoSeason(d = new Date()): Season {
  const month = Number(new Intl.DateTimeFormat("en", { month: "numeric", timeZone: "Europe/Istanbul" }).format(d));
  return month >= 4 && month <= 8 ? "sogutma" : "isitma";
}

export async function getSeasonMode(): Promise<SeasonMode> {
  try {
    await ensurePricingTables(); // shop_settings tablosu
    const [r] = await db().query<RowDataPacket[]>("SELECT v FROM shop_settings WHERE k = 'season_mode'");
    const v = r[0]?.v;
    return v === "isitma" || v === "sogutma" ? v : "auto";
  } catch {
    return "auto";
  }
}

export async function getSeason(): Promise<Season> {
  const mode = await getSeasonMode();
  return mode === "auto" ? autoSeason() : mode;
}

// Kategori adlarını sezon sırasına dizer; listede olmayanlar sona, kendi sıralarıyla
export function seasonRank(season: Season) {
  const order = SEASONS[season].order;
  return (category: string) => {
    const i = order.indexOf(category);
    return i < 0 ? order.length : i;
  };
}

export function sortBySeason<T>(items: T[], season: Season, name: (t: T) => string) {
  const rank = seasonRank(season);
  return [...items].sort((a, b) => rank(name(a)) - rank(name(b)));
}

// Header/footer kategori bağlantıları: "Tüm Ürünler" başta, kategoriler sezona göre
export async function seasonalNav() {
  const season = await getSeason();
  const [all, ...cats] = nav;
  return [all, ...sortBySeason(cats, season, (n) => n.label)];
}
