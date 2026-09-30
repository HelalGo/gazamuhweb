import type { RowDataPacket } from "mysql2";
import { appUser, fail, json, preflight } from "@/lib/app-api";
import { db } from "@/lib/db";
import { STATUS, isStatus, orderNo, trackingUrl } from "@/lib/orders";

export const dynamic = "force-dynamic";
export const OPTIONS = preflight;

// Giriş yapmış kullanıcının bilgileri ve siparişleri (en yenisi önce, kalemleriyle)
export async function GET(req: Request) {
  const user = await appUser(req);
  if (!user) return fail("Oturumunuzun süresi doldu. Lütfen yeniden giriş yapın.", 401);
  try {
    const [orders] = await db().query<RowDataPacket[]>(
      "SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC LIMIT 50", [user.id]);
    const ids = orders.map((o) => o.id);
    const [items] = ids.length
      ? await db().query<RowDataPacket[]>(
          `SELECT i.order_id, i.name, i.price, i.qty, p.image_url, p.slug FROM order_items i
           LEFT JOIN products p ON p.id = i.product_id WHERE i.order_id IN (?) ORDER BY i.id`, [ids])
      : [[] as RowDataPacket[]];
    return json({
      user,
      orders: orders.map((o) => ({
        id: o.id,
        no: orderNo(o.id),
        status: o.status,
        statusLabel: isStatus(o.status) ? STATUS[o.status].label : o.status,
        total: Number(o.total),
        createdAt: o.created_at,
        city: o.city,
        address: o.address,
        cargo: o.cargo_company ?? null,
        trackingNo: o.tracking_no ?? null,
        trackingUrl: trackingUrl(o.cargo_company, o.tracking_no),
        awaitingPayment: o.status === "pending",
        items: items.filter((i) => i.order_id === o.id).map((i) => ({ name: i.name, price: Number(i.price), qty: i.qty, image: i.image_url, slug: i.slug })),
      })),
    });
  } catch (e) {
    console.error("[app me]", (e as Error).message);
    return fail("Bilgiler şu an alınamadı.", 500);
  }
}
