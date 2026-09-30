import type { RowDataPacket } from "mysql2";
import { verifyPassword } from "@/lib/auth";
import { EMAIL, appToken, body, fail, json, preflight } from "@/lib/app-api";
import { db } from "@/lib/db";
import { clientIp, tooMany } from "@/lib/ratelimit";

export const OPTIONS = preflight;

// Mobil uygulama girişi: sitedeki hesapla aynı e-posta ve parola
export async function POST(req: Request) {
  const b = await body(req);
  const email = b.str("email", 190).toLowerCase();
  if (tooMany(`login:${await clientIp()}:${email}`, 8, 15 * 60_000)) return fail("Çok fazla deneme yaptınız. 15 dakika sonra tekrar deneyin.", 429);
  if (!EMAIL.test(email)) return fail("Geçerli bir e-posta adresi girin.");
  try {
    const [rows] = await db().query<RowDataPacket[]>("SELECT id, first_name, last_name, email, phone, password_hash FROM users WHERE email = ?", [email]);
    const u = rows[0];
    if (!u || !(await verifyPassword(b.str("password", 200), u.password_hash))) return fail("E-posta veya parola hatalı.", 401);
    return json({ token: appToken(u.id), user: { id: u.id, firstName: u.first_name, lastName: u.last_name, email: u.email, phone: u.phone } });
  } catch (e) {
    console.error("[app login]", (e as Error).message);
    return fail("Şu an giriş yapılamıyor. Lütfen daha sonra tekrar deneyin.", 500);
  }
}
