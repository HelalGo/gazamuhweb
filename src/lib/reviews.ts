import type { RowDataPacket } from "mysql2";
import { db } from "./db";
import { dbConfigured } from "./customer";
import { REVIEW_STATUSES } from "./orders";

export type Review = { id: number; rating: number; comment: string; author: string; date: string };
export type Summary = { avg: number; count: number };

export async function getReviews(productId: string): Promise<{ list: Review[]; summary: Summary }> {
  const empty = { list: [], summary: { avg: 0, count: 0 } };
  if (!dbConfigured() || !/^\d+$/.test(productId)) return empty;
  try {
    const [rows] = await db().query<RowDataPacket[]>(
      `SELECT r.id, r.rating, r.comment, r.created_at, u.first_name, u.last_name
       FROM reviews r JOIN users u ON u.id = r.user_id
       WHERE r.product_id = ? AND r.active = 1 ORDER BY r.created_at DESC LIMIT 100`,
      [Number(productId)]
    );
    const list = rows.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      // gizlilik: "Ayşe K." biçimi
      author: `${r.first_name} ${String(r.last_name).charAt(0)}.`,
      date: new Date(r.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }),
    }));
    const count = list.length;
    return { list, summary: { count, avg: count ? list.reduce((t, r) => t + r.rating, 0) / count : 0 } };
  } catch {
    return empty;
  }
}

export type Eligibility = "guest" | "already" | "ok" | "waiting" | "not-purchased";

// Kullanıcı bu ürüne yorum yapabilir mi?
export async function reviewEligibility(userId: number | null, productId: string): Promise<Eligibility> {
  if (!userId) return "guest";
  const pid = Number(productId);
  const [done] = await db().query<RowDataPacket[]>("SELECT 1 FROM reviews WHERE user_id = ? AND product_id = ? LIMIT 1", [userId, pid]);
  if (done.length) return "already";
  const [ok] = await db().query<RowDataPacket[]>(
    `SELECT 1 FROM orders o JOIN order_items i ON i.order_id = o.id
     WHERE o.user_id = ? AND i.product_id = ? AND o.status IN (${REVIEW_STATUSES.map(() => "?").join(",")}) LIMIT 1`,
    [userId, pid, ...REVIEW_STATUSES]
  );
  if (ok.length) return "ok";
  const [any] = await db().query<RowDataPacket[]>(
    `SELECT 1 FROM orders o JOIN order_items i ON i.order_id = o.id WHERE o.user_id = ? AND i.product_id = ? AND o.status <> 'cancelled' LIMIT 1`,
    [userId, pid]
  );
  return any.length ? "waiting" : "not-purchased";
}
