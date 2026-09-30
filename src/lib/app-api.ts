import type { RowDataPacket } from "mysql2";
import { db } from "./db";
import { dbConfigured, type User } from "./customer";
import { makeToken, readToken } from "./session";

// Mobil uygulama API'si için ortak yardımcılar.
// Uygulama çerez değil "Authorization: Bearer <belirteç>" başlığı kullanır; belirteç 90 gün geçerlidir.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

export const json = (data: unknown, status = 200) => Response.json(data, { status, headers: CORS });
export const fail = (error: string, status = 400) => json({ error }, status);
export const preflight = () => new Response(null, { status: 204, headers: CORS });

const TOKEN_AGE = 60 * 60 * 24 * 90;
export const appToken = (userId: number) => makeToken("app", userId, TOKEN_AGE);

export async function appUser(req: Request): Promise<User | null> {
  if (!dbConfigured()) return null;
  const id = readToken(req.headers.get("authorization")?.replace(/^Bearer\s+/i, ""), "app");
  if (!id) return null;
  const [rows] = await db().query<RowDataPacket[]>("SELECT id, first_name, last_name, email, phone FROM users WHERE id = ?", [id]);
  const r = rows[0];
  return r ? { id: r.id, firstName: r.first_name, lastName: r.last_name, email: r.email, phone: r.phone } : null;
}

// İstek gövdesini (JSON) güvenle okur; alanlar metne çevrilip kırpılır
export async function body(req: Request) {
  let data: Record<string, unknown> = {};
  try {
    data = (await req.json()) ?? {};
  } catch {}
  return {
    str: (k: string, max: number) => String(data[k] ?? "").trim().slice(0, max),
    bool: (k: string) => data[k] === true || data[k] === "true" || data[k] === 1,
  };
}

export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
