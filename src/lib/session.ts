import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export type Kind = "admin" | "user";

function secret() {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("ADMIN_SESSION_SECRET tanımlı değil");
  return s;
}

const sign = (payload: string) => createHmac("sha256", secret()).update(payload).digest("base64url");

// İmzalı çerez: "<yük>.<imza>". Yükteki "k" (tür) sayesinde yönetici çerezi müşteri çerezi yerine geçemez.
export async function setSession(cookie: string, kind: Kind, id: number, maxAgeSec: number) {
  const payload = Buffer.from(JSON.stringify({ id, k: kind, exp: Date.now() + maxAgeSec * 1000 })).toString("base64url");
  (await cookies()).set(cookie, `${payload}.${sign(payload)}`, {
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
  const token = (await cookies()).get(cookie)?.value;
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
