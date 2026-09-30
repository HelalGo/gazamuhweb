import type { RowDataPacket } from "mysql2";
import { verifyPassword } from "@/lib/auth";
import { appUser, body, fail, json, preflight } from "@/lib/app-api";
import { deleteAccount } from "@/lib/customer";
import { db } from "@/lib/db";
import { tooMany } from "@/lib/ratelimit";

export const OPTIONS = preflight;

// Mobil uygulamadan hesap silme (App Store / Google Play zorunluluğu). Parola ile doğrulanır.
export async function POST(req: Request) {
  const user = await appUser(req);
  if (!user) return fail("Oturumunuzun süresi doldu. Lütfen yeniden giriş yapın.", 401);
  if (tooMany(`del:${user.id}`, 5, 15 * 60_000)) return fail("Çok fazla deneme yaptınız. 15 dakika sonra tekrar deneyin.", 429);
  const b = await body(req);
  try {
    const [rows] = await db().query<RowDataPacket[]>("SELECT password_hash FROM users WHERE id = ?", [user.id]);
    if (!rows[0] || !(await verifyPassword(b.str("password", 200), rows[0].password_hash))) return fail("Parola hatalı.", 403);
    await deleteAccount(user.id, user.email);
    return json({ ok: true });
  } catch (e) {
    console.error("[app hesap silme]", (e as Error).message);
    return fail("Şu an hesabınız silinemedi. Lütfen daha sonra tekrar deneyin.", 500);
  }
}
