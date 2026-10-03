"use server";
import type { RowDataPacket } from "mysql2";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendMail } from "@/lib/mail";
import { orderStatusMail, statusMailFor } from "@/lib/mails";
import { isStatus, orderNo, trackingUrl } from "@/lib/orders";
import { ensurePricingTables } from "@/lib/pricing";
import { pushToUser } from "@/lib/push";
import { SITE_KEY, siteOf } from "@/lib/sites";

// Durum değişince müşteriye e-posta ve (uygulamayı kullanıyorsa) push bildirimi gider.
// "Kargoya verildi" seçilirken kargo firması ve takip numarası da kaydedilebilir.
export async function updateOrderStatus(f: FormData) {
  await requireAdmin();
  await ensurePricingTables(); // ödeme / kargo sütunları
  const id = Number(f.get("id"));
  const status = f.get("status");
  if (!id || !isStatus(status)) return;
  const [rows] = await db().query<RowDataPacket[]>("SELECT * FROM orders WHERE id = ?", [id]);
  const o = rows[0];
  if (!o) return;
  // diğer markanın siparişi o markanın panelinden güncellenir (e-posta doğru markadan gitsin)
  if (siteOf(o.site) !== SITE_KEY) redirect(`/admin/orders/${id}`);
  const cargo = String(f.get("cargo_company") ?? "").trim().slice(0, 60) || o.cargo_company || null;
  const tracking = String(f.get("tracking_no") ?? "").trim().slice(0, 80) || o.tracking_no || null;
  const v: Record<string, unknown> = { status, cargo_company: cargo, tracking_no: tracking };
  if (status === "confirmed" && !o.paid_at) v.paid_at = new Date();
  await db().query("UPDATE orders SET ? WHERE id = ?", [v, id]);
  if (o.status === status) redirect(`/admin/orders/${id}?saved=1`);

  const no = orderNo(id);
  const track = trackingUrl(cargo, tracking);
  if (statusMailFor(status) && o.email) {
    const [items] = await db().query<RowDataPacket[]>(
      "SELECT i.name, i.price, i.qty, p.image_url FROM order_items i LEFT JOIN products p ON p.id = i.product_id WHERE i.order_id = ?", [id]);
    const data = {
      id, createdAt: new Date(o.created_at), fullName: o.full_name, email: o.email, phone: o.phone, city: o.city, address: o.address,
      note: o.note, total: Number(o.total),
      subtotal: o.subtotal == null ? null : Number(o.subtotal), discount: Number(o.discount ?? 0), shipping: Number(o.shipping ?? 0), coupon: o.coupon_code ?? null,
      cargo, trackingNo: tracking, trackingUrl: track,
      items: items.map((i) => ({ name: i.name, price: Number(i.price), qty: i.qty, image: i.image_url })),
    };
    after(() => sendMail(o.email, orderStatusMail(data, status), { from: "siparis", tag: "sipariş durumu" }));
  }
  const text = PUSH_TEXT[status];
  if (text && o.user_id) {
    after(() => pushToUser(o.user_id, { title: `${text.title} · ${no}`, body: status === "shipped" && cargo ? `${text.body} ${cargo}${tracking ? ` · Takip no: ${tracking}` : ""}` : text.body, url: `/orders` })
      .catch((e) => console.error("[push sipariş]", (e as Error).message)));
  }
  redirect(`/admin/orders/${id}?saved=1`);
}

const PUSH_TEXT: Partial<Record<string, { title: string; body: string }>> = {
  confirmed: { title: "Ödemeniz alındı", body: "Siparişiniz onaylandı, en kısa sürede hazırlanmaya başlayacak." },
  preparing: { title: "Siparişiniz hazırlanıyor", body: "Ürünleriniz özenle hazırlanıyor." },
  shipped: { title: "Siparişiniz kargoya verildi", body: "Siparişiniz yola çıktı." },
  delivered: { title: "Siparişiniz teslim edildi", body: "Ürünlerinizi güle güle kullanın. Deneyiminizi yorum olarak paylaşabilirsiniz." },
  cancelled: { title: "Siparişiniz iptal edildi", body: "Ayrıntılar için e-postanıza bakabilir ya da bize ulaşabilirsiniz." },
};

export async function toggleReview(f: FormData) {
  await requireAdmin();
  await db().query("UPDATE reviews SET active = 1 - active WHERE id = ?", [Number(f.get("id"))]);
  redirect("/admin/reviews");
}

export async function deleteReview(f: FormData) {
  await requireAdmin();
  await db().query("DELETE FROM reviews WHERE id = ?", [Number(f.get("id"))]);
  redirect("/admin/reviews");
}

export async function toggleLead(f: FormData) {
  await requireAdmin();
  await db().query("UPDATE leads SET handled = 1 - handled WHERE id = ?", [Number(f.get("id"))]);
  redirect("/admin/talepler");
}

export async function deleteLead(f: FormData) {
  await requireAdmin();
  await db().query("DELETE FROM leads WHERE id = ?", [Number(f.get("id"))]);
  redirect("/admin/talepler");
}
