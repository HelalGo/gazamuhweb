"use server";
import type { RowDataPacket } from "mysql2";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendMail } from "@/lib/mail";
import { orderStatusMail, statusMailFor } from "@/lib/mails";
import { isStatus } from "@/lib/orders";

export async function updateOrderStatus(f: FormData) {
  await requireAdmin();
  const id = Number(f.get("id"));
  const status = f.get("status");
  if (!id || !isStatus(status)) return;
  const [rows] = await db().query<RowDataPacket[]>("SELECT * FROM orders WHERE id = ?", [id]);
  const o = rows[0];
  if (!o) return;
  await db().query("UPDATE orders SET status = ? WHERE id = ?", [status, id]);
  if (o.status !== status && statusMailFor(status) && o.email) {
    const [items] = await db().query<RowDataPacket[]>(
      "SELECT i.name, i.price, i.qty, p.image_url FROM order_items i LEFT JOIN products p ON p.id = i.product_id WHERE i.order_id = ?", [id]);
    const data = {
      id, createdAt: new Date(o.created_at), fullName: o.full_name, email: o.email, phone: o.phone, city: o.city, address: o.address,
      note: o.note, total: Number(o.total), items: items.map((i) => ({ name: i.name, price: Number(i.price), qty: i.qty, image: i.image_url })),
    };
    after(() => sendMail(o.email, orderStatusMail(data, status), { from: "siparis", tag: "sipariş durumu" }));
  }
  redirect(`/admin/orders/${id}?saved=1`);
}

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
