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

// Hesap silme (KVKK; App Store / Google Play zorunluluğu). Parola doğrulandıktan sonra çağrılır.
// Üyelik, favoriler, yorumlar ve telefon bağlantıları silinir; bülten izni kapatılır.
// Siparişler vergi / ticaret mevzuatı gereği saklanır, yalnızca hesaptan ayrılır (user_id = 0).
export async function deleteAccount(userId: number, email: string) {
  const c = await db().getConnection();
  try {
    await c.beginTransaction();
    await c.query("UPDATE orders SET user_id = 0 WHERE user_id = ?", [userId]);
    await c.query("DELETE FROM favorites WHERE user_id = ?", [userId]);
    await c.query("DELETE FROM reviews WHERE user_id = ?", [userId]);
    await c.query("UPDATE push_tokens SET user_id = NULL WHERE user_id = ?", [userId]).catch(() => {});
    await c.query("UPDATE subscribers SET active = 0, unsubscribed_at = NOW() WHERE email = ? AND active = 1", [email]).catch(() => {});
    await c.query("DELETE FROM users WHERE id = ?", [userId]);
    await c.commit();
  } catch (e) {
    await c.rollback();
    throw e;
  } finally {
    c.release();
  }
}
