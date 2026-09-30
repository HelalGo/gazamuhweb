import type { RowDataPacket } from "mysql2";
import { appUser, body, fail, json, preflight } from "@/lib/app-api";
import { db } from "@/lib/db";
import { reviewEligibility } from "@/lib/reviews";

export const OPTIONS = preflight;

// Mobil uygulamadan ürün değerlendirmesi: sitedeki kurallarla aynı (yalnızca teslim alınmış siparişteki ürün, ürün başına bir yorum)
export async function POST(req: Request) {
  const user = await appUser(req);
  if (!user) return fail("Yorum yapmak için giriş yapmalısınız.", 401);
  const b = await body(req);
  const productId = Number(b.str("productId", 20));
  const rating = Number(b.str("rating", 2));
  const comment = b.str("comment", 1000);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return fail("Lütfen 1 ile 5 arasında bir puan verin.");
  if (comment.length < 10) return fail("Yorumunuz en az 10 karakter olmalı.");

  const [p] = await db().query<RowDataPacket[]>("SELECT id FROM products WHERE id = ?", [productId]);
  if (!p.length) return fail("Ürün bulunamadı.", 404);
  if ((await reviewEligibility(user.id, String(productId))) !== "ok") return fail("Bu ürüne yorum yapabilmek için siparişinizin teslim edilmiş olması gerekir.", 403);
  try {
    await db().query("INSERT INTO reviews (product_id, user_id, rating, comment) VALUES (?,?,?,?)", [productId, user.id, rating, comment]);
    return json({ ok: true });
  } catch {
    return fail("Bu ürüne zaten yorum yaptınız.", 409);
  }
}
