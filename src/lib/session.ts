import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export type Kind = "admin" | "user" | "app";

function secret() {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("ADMIN_SESSION_SECRET tanımlı değil");
  return s;
}

const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

// İmzalı belirteç: "<yük>.<imza>". Yükteki "k" (tür) sayesinde yönetici belirteci müşteri belirteci yerine geçemez.
// Çerezlerde ve mobil uygulamanın "Authorization: Bearer" başlığında (tür "app") aynı biçim kullanılır.
export function makeToken(kind: Kind, id: number, maxAgeSec: number) {
  const payload = Buffer.from(JSON.stringify({ id, k: kind, exp: Date.now() + maxAgeSec * 1000 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readToken(token: string | null | undefined, kind: Kind): number | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const good = Buffer.from(sign(payload));
  const given = Buffer.from(sig);
  if (good.length !== given.length || !timingSafeEqual(good, given)) return null;
  try {
    const { id, k, exp } = JSON.parse(Buffer.from(payload, "base64url").toString());
    return k === kind && typeof id === "number" && exp > Date.now() ? id : null;
  } catch {
    return null;
  }
}

export async function setSession(cookie: string, kind: Kind, id: number, maxAgeSec: number) {
  (await cookies()).set(cookie, makeToken(kind, id, maxAgeSec), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: maxAgeSec,
  });
}

export async function clearSession(cookie: string) {
  (await cookies()).delete(cookie);
}

export async function readSession(cookie: string, kind: Kind): Promise<number | null> {
  return readToken((await cookies()).get(cookie)?.value, kind);
}
