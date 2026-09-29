import Link from "next/link";
import { notFound } from "next/navigation";
import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import { REVIEW_STATUSES, STATUS, isStatus, orderNo } from "@/lib/orders";
import { tl } from "@/lib/utils";
import { updateOrderStatus } from "../../../orders-actions";

export default async function AdminOrder({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const id = Number((await params).id);
  const { saved } = await searchParams;
  const [rows] = await db().query<RowDataPacket[]>("SELECT * FROM orders WHERE id = ?", [id]);
  const o = rows[0];
  if (!o) notFound();
  const [items] = await db().query<RowDataPacket[]>("SELECT name, price, qty FROM order_items WHERE order_id = ?", [id]);
  const st = isStatus(o.status) ? o.status : "pending";

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/orders" className="text-sm text-muted hover:text-foreground">← Siparişler</Link>
      <h1 className="mb-6 mt-2 text-2xl font-extrabold">Sipariş {orderNo(id)}</h1>
      {saved && <p role="status" className="mb-6 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">Durum güncellendi.</p>}

      <form action={updateOrderStatus} className="mb-8 flex flex-wrap items-end gap-3 rounded-2xl bg-surface p-5">
        <input type="hidden" name="id" value={id} />
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold">Sipariş durumu</span>
          <select name="status" defaultValue={st} className="rounded-xl bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/50">
            {(Object.keys(STATUS) as (keyof typeof STATUS)[]).map((s) => <option key={s} value={s}>{STATUS[s].label}</option>)}
          </select>
        </label>
        <button className="rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white">Güncelle</button>
        <p className="basis-full text-xs text-muted">
          Müşteri, sipariş <strong>{REVIEW_STATUSES.map((s) => STATUS[s].label).join(" / ")}</strong> durumuna geçtikten sonra ürüne yorum yapabilir.
        </p>
      </form>

      <section className="mb-8 rounded-2xl bg-surface p-5 text-sm">
        <h2 className="mb-2 font-bold">Müşteri</h2>
        <p className="font-semibold">{o.full_name}</p>
        <p className="text-muted"><a href={`tel:${o.phone}`} className="hover:text-foreground">{o.phone}</a> · <a href={`mailto:${o.email}`} className="hover:text-foreground">{o.email}</a></p>
        <p className="mt-2 whitespace-pre-line text-muted">{o.address}, {o.city}</p>
        {o.note && <p className="mt-2 text-muted">Not: {o.note}</p>}
        <p className="mt-2 text-xs text-muted">{new Date(o.created_at).toLocaleString("tr-TR")}</p>
      </section>

      <ul className="divide-y divide-border text-sm">
        {items.map((i, n) => (
          <li key={n} className="flex justify-between gap-4 py-3">
            <span>{i.qty} × {i.name}</span><span className="font-semibold">{tl(Number(i.price) * i.qty)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 flex justify-between border-t border-border pt-4 text-lg font-extrabold"><span>Toplam</span><span className="text-primary">{tl(Number(o.total))}</span></p>
    </div>
  );
}
