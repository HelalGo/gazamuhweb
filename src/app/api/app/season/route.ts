import { json, preflight } from "@/lib/app-api";
import { SEASONS, getSeason } from "@/lib/season";

export const OPTIONS = preflight;
export const dynamic = "force-dynamic";

// Mobil ana sayfa: mevsime göre kategori sırası (web ile aynı; admin → Mevsim Sıralaması)
export async function GET() {
  const season = await getSeason();
  return json({ season, label: SEASONS[season].label, order: SEASONS[season].order });
}
