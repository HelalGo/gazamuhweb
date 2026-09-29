import type { RowDataPacket } from "mysql2";
import { db } from "./db";

// GAZA ürün kodu: GZ-<kategori>-<sıra>, ör. GZ-KMB-0001. Sıra her kategori için ayrı ilerler.
// Aynı tablo scripts/katalog-duzelt.mjs içinde de var; değiştirirseniz ikisini birlikte güncelleyin.
export const CATEGORY_CODES: Record<string, string> = {
  Kombi: "KMB", Klima: "KLM", "Isı Pompası": "ISP", Radyatör: "RAD", Şofben: "SFB",
  "Sirkülasyon Pompası": "SRK", "Oda Termostatı": "TRM",
};
export const categoryCode = (category: string | null) => CATEGORY_CODES[category ?? ""] ?? "URN";

export async function nextSku(category: string | null) {
  const prefix = `GZ-${categoryCode(category)}-`;
  const [rows] = await db().query<RowDataPacket[]>(
    "SELECT MAX(CAST(SUBSTRING(sku, ?) AS UNSIGNED)) n FROM products WHERE sku LIKE ?", [prefix.length + 1, `${prefix}%`]);
  return prefix + String(Number(rows[0]?.n ?? 0) + 1).padStart(4, "0");
}
