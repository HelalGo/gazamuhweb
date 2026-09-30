"use server";
import { quote, type Quote } from "@/lib/pricing";

// Sepet özeti: kargo, kupon indirimi ve toplam sunucuda, güncel fiyatlarla hesaplanır
export async function quoteCart(lines: { id: number; qty: number }[], coupon: string | null): Promise<Quote | null> {
  try {
    return await quote(Array.isArray(lines) ? lines : [], typeof coupon === "string" ? coupon : null);
  } catch (e) {
    console.error("[quote]", (e as Error).message);
    return null;
  }
}
