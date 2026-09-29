"use server";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { isStatus } from "@/lib/orders";

export async function updateOrderStatus(f: FormData) {
  await requireAdmin();
  const id = Number(f.get("id"));
  const status = f.get("status");
  if (!id || !isStatus(status)) return;
  await db().query("UPDATE orders SET status = ? WHERE id = ?", [status, id]);
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
