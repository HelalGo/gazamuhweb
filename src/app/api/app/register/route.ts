import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { after } from "next/server";
import { hashPassword } from "@/lib/auth";
import { EMAIL, appToken, body, fail, json, preflight } from "@/lib/app-api";
import { db } from "@/lib/db";
import { sendMail } from "@/lib/mail";
import { welcomeMail } from "@/lib/mails";
import { subscribe } from "@/lib/newsletter";
import { clientIp, tooMany } from "@/lib/ratelimit";

export const OPTIONS = preflight;

// Mobil uygulamadan üyelik: sitedeki üyelikle aynı kurallar, aynı hoş geldiniz e-postası ve bülten onayı
export async function POST(req: Request) {
  const ip = await clientIp();
  if (tooMany(`reg:${ip}`, 8, 15 * 60_000)) return fail("Çok fazla deneme yaptınız. Lütfen biraz sonra tekrar deneyin.", 429);
  const b = await body(req);
  const first = b.str("firstName", 80), last = b.str("lastName", 80);
  const email = b.str("email", 190).toLowerCase();
  const phone = b.str("phone", 30);
  const password = b.str("password", 200);
  if (!first || !last) return fail("Ad ve soyad zorunlu.");
  if (!EMAIL.test(email)) return fail("Geçerli bir e-posta adresi girin.");
  if (phone.replace(/\D/g, "").length < 10) return fail("Geçerli bir telefon numarası girin.");
  if (password.length < 8) return fail("Parola en az 8 karakter olmalı.");
  if (!b.bool("kvkk")) return fail("KVKK Aydınlatma Metni'ni onaylamalısınız.");

  try {
    const [exists] = await db().query<RowDataPacket[]>("SELECT id FROM users WHERE email = ?", [email]);
    if (exists.length) return fail("Bu e-posta adresiyle kayıtlı bir hesap var. Giriş yapmayı deneyin.", 409);
    const [res] = await db().query<ResultSetHeader>(
      "INSERT INTO users (first_name, last_name, email, phone, password_hash) VALUES (?,?,?,?,?)",
      [first, last, email, phone, await hashPassword(password)]
    );
    after(() => sendMail(email, welcomeMail({ firstName: first, email }), { from: "noreply", tag: "hoş geldiniz" }));
    if (b.bool("newsletter")) after(() => subscribe(email, ip).catch((e) => console.error("[bülten üyelik]", (e as Error).message)));
    return json({ token: appToken(res.insertId), user: { id: res.insertId, firstName: first, lastName: last, email, phone } });
  } catch (e) {
    console.error("[app register]", (e as Error).message);
    return fail("Şu an kayıt yapılamıyor. Lütfen daha sonra tekrar deneyin.", 500);
  }
}
