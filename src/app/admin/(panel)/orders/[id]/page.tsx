import { notFound } from "next/navigation";
import type { RowDataPacket } from "mysql2";
import { Mail, MapPin, Phone } from "lucide-react";
import { db } from "@/lib/db";
import { REVIEW_STATUSES, STATUS, isStatus, orderNo } from "@/lib/orders";
import { tl } from "@/lib/utils";
import { updateOrderStatus } from "../../../orders-actions";
import { Notice, PageHead, card } from "../../_ui";

export default async function AdminOrder({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const id = Number((await params).id);
  const { saved } = await searchParams;
  const [rows] = await db().query<RowDataPacket[]>("SELECT * FROM orders WHERE id = ?", [id]);
  const o = rows[0];
  if (!o) notFound();
  const [items] = await db().query<RowDataPacket[]>("SELECT name, price, qty FROM order_items WHERE order_id = ?", [id]);
  const st = isStatus(o.status) ? o.status : "pending";

  return (
    <>
      <PageHead title={`Sipariş ${orderNo(id)}`} sub={new Date(o.created_at).toLocaleString("tr-TR", { dateStyle: "long", timeStyle: "short" })} back={{ href: "/admin/orders", label: "Siparişler" }}>
        <span className={`rounded-full px-3 py-1.5 text-sm font-bold ${STATUS[st].cls}`}>{STATUS[st].label}</span>
      </PageHead>
      <Notice saved={saved} text="Sipariş durumu güncellendi." />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className={card}>
            <h2 className="mb-3 font-bold">Durumu değiştir</h2>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(STATUS) as (keyof typeof STATUS)[]).map((s) => (
                <form key={s} action={updateOrderStatus}>
                  <input type="hidden" name="id" value={id} /><input type="hidden" name="status" value={s} />
                  <button disabled={s === st} className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${s === st ? `${STATUS[s].cls} ring-2 ring-current` : "border border-border bg-white hover:bg-surface"}`}>{STATUS[s].label}</button>
                </form>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted">Müşteri, sipariş <strong>{REVIEW_STATUSES.map((s) => STATUS[s].label).join(" / ")}</strong> durumuna geçtikten sonra ürüne yorum yapabilir.</p>
          </section>

          <section className={card}>
            <h2 className="mb-2 font-bold">Ürünler</h2>
            <ul className="divide-y divide-border text-sm">
              {items.map((i, n) => (
                <li key={n} className="flex justify-between gap-4 py-3">
                  <span><span className="mr-2 rounded-md bg-surface px-2 py-0.5 text-xs font-bold">{i.qty}×</span>{i.name}</span>
                  <span className="whitespace-nowrap font-semibold">{tl(Number(i.price) * i.qty)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 flex justify-between border-t border-border pt-4 text-lg font-extrabold"><span>Toplam</span><span className="text-primary">{tl(Number(o.total))}</span></p>
          </section>
        </div>

        <section className={`${card} h-fit space-y-3 text-sm`}>
          <h2 className="font-bold">Müşteri</h2>
          <p className="text-base font-semibold">{o.full_name}</p>
          <a href={`tel:${o.phone}`} className="flex items-center gap-2 text-muted hover:text-foreground"><Phone size={16} />{o.phone}</a>
          <a href={`mailto:${o.email}`} className="flex items-center gap-2 break-all text-muted hover:text-foreground"><Mail size={16} />{o.email}</a>
          <p className="flex gap-2 text-muted"><MapPin size={16} className="mt-0.5 shrink-0" /><span className="whitespace-pre-line">{o.address}, {o.city}</span></p>
          {o.note && <p className="rounded-xl bg-amber-50 p-3 text-amber-900"><strong>Not:</strong> {o.note}</p>}
        </section>
      </div>
    </>
  );
}
