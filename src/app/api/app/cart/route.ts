import { fail, json, preflight } from "@/lib/app-api";
import { quote } from "@/lib/pricing";

export const OPTIONS = preflight;

// Mobil sepet özeti: { items: [{ id, qty }], coupon? } → ara toplam, kargo, kupon indirimi, toplam
export async function POST(req: Request) {
  let data: { items?: unknown; coupon?: unknown } = {};
  try { data = (await req.json()) ?? {}; } catch {}
  const items = Array.isArray(data.items) ? (data.items as { id: number; qty: number }[]) : [];
  try {
    const q = await quote(items, typeof data.coupon === "string" ? data.coupon : null);
    return json(q);
  } catch (e) {
    console.error("[app cart]", (e as Error).message);
    return fail("Sepet özeti şu an hesaplanamadı.", 500);
  }
}
