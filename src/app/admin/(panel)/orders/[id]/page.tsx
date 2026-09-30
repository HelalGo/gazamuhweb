import { notFound } from "next/navigation";
import type { RowDataPacket } from "mysql2";
import { BadgeCheck, Clock, ExternalLink, Landmark, Mail, MapPin, Phone, Truck } from "lucide-react";
import { db } from "@/lib/db";
import { CARGO, REVIEW_STATUSES, STATUS, isStatus, orderNo, trackingUrl } from "@/lib/orders";
import { ensurePricingTables } from "@/lib/pricing";
import { bank, ibanGroups } from "@/lib/site";
import { OrderTotals } from "@/components/OrderTotals";
import { tl } from "@/lib/utils";
import { updateOrderStatus } from "../../../orders-actions";
import { Notice, PageHead, btnPrimary, card, field } from "../../_ui";

export default async function AdminOrder({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const id = Number((await params).id);
  const { saved } = await searchParams;
  await ensurePricingTables();
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
          {/* Ödeme: havale / EFT */}
          <section className={card}>
            <h2 className="mb-3 flex items-center gap-2 font-bold"><Landmark size={18} className="text-primary" />Ödeme · Havale / EFT</h2>
            {o.paid_at ? (
              <p className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
                <BadgeCheck size={18} />Ödeme alındı · {new Date(o.paid_at).toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" })}
              </p>
            ) : st === "cancelled" ? (
              <p className="rounded-xl bg-surface px-4 py-3 text-sm text-muted">Sipariş iptal edildi.</p>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-amber-50 px-4 py-3">
                <p className="flex items-center gap-2 text-sm font-semibold text-amber-900"><Clock size={18} />Ödeme bekleniyor · {tl(Number(o.total))}</p>
                <form action={updateOrderStatus}>
                  <input type="hidden" name="id" value={id} /><input type="hidden" name="status" value="confirmed" />
                  <button className={btnPrimary}>Ödeme alındı olarak işaretle</button>
                </form>
              </div>
            )}
            <p className="mt-3 text-xs text-muted">Müşteri {bank.name} {ibanGroups(bank.iban)} hesabına, açıklamaya <strong>{orderNo(id)}</strong> yazarak ödeme yapar. Ödemeyi işaretlediğinizde müşteriye e-posta ve uygulama bildirimi gider.</p>
          </section>

          {/* Kargo */}
          <section className={card}>
            <h2 className="mb-3 flex items-center gap-2 font-bold"><Truck size={18} className="text-primary" />Kargo</h2>
            {o.tracking_no && (
              <p className="mb-3 text-sm">
                {o.cargo_company} · <strong>{o.tracking_no}</strong>
                {trackingUrl(o.cargo_company, o.tracking_no) && <a href={trackingUrl(o.cargo_company, o.tracking_no)!} target="_blank" className="ml-2 inline-flex items-center gap-1 text-accent hover:underline">Takip et <ExternalLink size={13} /></a>}
              </p>
            )}
            <form action={updateOrderStatus} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <input type="hidden" name="id" value={id} /><input type="hidden" name="status" value="shipped" />
              <label className="block text-sm"><span className="mb-1.5 block font-semibold">Kargo firması</span>
                <select name="cargo_company" defaultValue={o.cargo_company ?? "Yurtiçi Kargo"} className={field}>
                  {Object.keys(CARGO).map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
              <label className="block text-sm"><span className="mb-1.5 block font-semibold">Takip numarası</span>
                <input name="tracking_no" defaultValue={o.tracking_no ?? ""} maxLength={80} className={field} placeholder="Ör. 123456789012" />
              </label>
              <button className={btnPrimary}>{st === "shipped" ? "Kargo bilgisini güncelle" : "Kargoya ver ve bildir"}</button>
            </form>
            <p className="mt-3 text-xs text-muted">Kaydettiğinizde sipariş “Kargoya verildi” olur; müşteriye takip bilgisiyle e-posta ve uygulama bildirimi gider.</p>
          </section>

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
            <p className="mt-3 text-xs text-muted">Her durum değişikliğinde müşteriye e-posta, uygulamayı kullanıyorsa bildirim de gider. Müşteri, sipariş <strong>{REVIEW_STATUSES.map((s) => STATUS[s].label).join(" / ")}</strong> durumuna geçtikten sonra ürüne yorum yapabilir.</p>
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
            <OrderTotals o={o} />
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
