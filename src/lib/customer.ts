import type { RowDataPacket } from "mysql2";
import { redirect } from "next/navigation";
import { db } from "./db";
import { clearSession, readSession, setSession } from "./session";

const COOKIE = "gaza_user";
export const dbConfigured = () => !!process.env.DB_HOST && !process.env.DB_HOST.startsWith("BURAYA");

export type User = { id: number; firstName: string; lastName: string; email: string; phone: string | null };

export const createUserSession = (id: number, remember: boolean) => setSession(COOKIE, "user", id, remember ? 60 * 60 * 24 * 30 : 60 * 60 * 12);
export const destroyUserSession = () => clearSession(COOKIE);

export async function getUser(): Promise<User | null> {
  if (!dbConfigured()) return null;
  try {
    const id = await readSession(COOKIE, "user");
    if (!id) return null;
    const [rows] = await db().query<RowDataPacket[]>("SELECT id, first_name, last_name, email, phone FROM users WHERE id = ?", [id]);
    const r = rows[0];
    return r ? { id: r.id, firstName: r.first_name, lastName: r.last_name, email: r.email, phone: r.phone } : null;
  } catch {
    return null;
  }
}

export async function requireUser(next: string) {
  const u = await getUser();
  if (!u) redirect(`/giris?next=${encodeURIComponent(next)}`);
  return u;
}

export async function getFavoriteIds(userId: number): Promise<string[]> {
  try {
    const [rows] = await db().query<RowDataPacket[]>("SELECT product_id FROM favorites WHERE user_id = ? ORDER BY created_at DESC", [userId]);
    return rows.map((r) => String(r.product_id));
  } catch {
    return [];
  }
}
