import type { RowDataPacket } from "mysql2";
import { cookies } from "next/headers";
import { db } from "./db";
import { SITE_KEY, isSiteKey, type SiteKey } from "./sites";

export type SiteTable = "hero_slides" | "showcase_tiles" | "campaign_blocks" | "app_onboarding" | "app_banners" | "leads" | "orders";

// "site" sütunu sonradan eklendi; yoksa eklenir ve mevcut kayıtlar GAZ-A'nın sayılır.
// İki site de aynı anda eklemeye çalışabilir; ikinci ALTER "Duplicate column" verir, yok sayılır.
const ready = new Set<SiteTable>();
export async function ensureSiteColumn(table: SiteTable) {
  if (ready.has(table)) return;
  const [r] = await db().query<RowDataPacket[]>(
    "SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = 'site'", [table]);
  if (!r.length) {
    try {
      await db().query(`ALTER TABLE ${table} ADD COLUMN site VARCHAR(20) NOT NULL DEFAULT 'gazamuh', ADD INDEX idx_site (site)`);
    } catch (e) {
      if (!/duplicate/i.test((e as Error).message)) throw e;
    }
  }
  ready.add(table);
}

// Admin panelinde içeriği düzenlenen marka (menüdeki GAZ-A / Kombi Klima GO seçimi); seçim yoksa bu site
export const ADMIN_SITE_COOKIE = "admin_site";
export async function adminSite(): Promise<SiteKey> {
  const v = (await cookies()).get(ADMIN_SITE_COOKIE)?.value;
  return isSiteKey(v) ? v : SITE_KEY;
}
