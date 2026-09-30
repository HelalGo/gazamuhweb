import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { RowDataPacket } from "mysql2";
import { Breadcrumb } from "@/components/Breadcrumb";
import { requireUser } from "@/lib/customer";
import { db } from "@/lib/db";
import { REVIEW_STATUSES, STATUS, isStatus, orderNo, trackingUrl } from "@/lib/orders";
import { BankCard } from "@/components/BankCard";
import { OrderTotals } from "@/components/OrderTotals";
import { tl } from "@/lib/utils";

export const metadata: Metadata = { title: "Sipariş Detayı | GAZ-A Mühendislik" };
export const dynamic = "force-dynamic";

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const u = await requireUser(`/hesabim/siparis/${id}`);
  const [rows] = await db().query<RowDataPacket[]>("SELECT * FROM orders WHERE id = ? AND user_id = ?", [id, u.id]);
  const o = rows[0];
  if (!o) notFound();
  const [items] = await db().query<RowDataPacket[]>(
    `SELECT i.name, i.price, i.qty, p.slug, p.id AS pid, r.id AS reviewed
     FROM order_items i LEFT JOIN products p ON p.id = i.product_id
     LEFT JOIN reviews r ON r.product_id = i.product_id AND r.user_id = ?
     WHERE i.order_id = ?`,
    [u.id, id]
  );
  const st = isStatus(o.status) ? STATUS[o.status] : STATUS.pending;
  const canReview = isStatus(o.status) && REVIEW_STATUSES.includes(o.status);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-8 pt-40 md:px-6">
      <Breadcrumb crumbs={[{ label: "Ana Sayfa", href: "/" }, { label: "Hesabım", href: "/hesabim" }, { label: orderNo(id) }]} />
      <div className="mb-8 mt-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Sipariş {orderNo(id)}</h1>
        <span className={`rounded-[4px] px-3 py-1 text-xs font-bold ${st.cls}`}>{st.label}</span>
      </div>

      <ul className="divide-y divide-border">
        {items.map((i, n) => (
          <li key={n} className="flex flex-wrap items-center justify-between gap-3 py-4">
            <div className="min-w-0 flex-1 basis-64">
              {i.slug ? <Link href={`/urun/${i.slug}`} className="font-semibold hover:text-primary">{i.name}</Link> : <span className="font-semibold">{i.name}</span>}
              <p className="text-xs text-muted">{i.qty} × {tl(Number(i.price))}</p>
            </div>
            {canReview && i.slug && (
              i.reviewed ? (
                <span className="text-xs font-semibold text-green-700">Yorumunuz yayında</span>
              ) : (
                <Link href={`/urun/${i.slug}#yorumlar`} className="rounded-[4px] bg-surface px-4 py-2 text-xs font-semibold hover:bg-surface-alt">Yorum Yap</Link>
              )
            )}
            <p className="w-28 text-right font-bold">{tl(Number(i.price) * i.qty)}</p>
          </li>
        ))}
      </ul>
      <OrderTotals o={o} />
      <p className="mt-2 flex justify-between border-t border-border pt-4 text-lg font-extrabold"><span>Toplam</span><span className="text-primary">{tl(Number(o.total))}</span></p>

      {o.status === "pending" && (
        <section className="mt-10">
          <h2 className="mb-1 font-bold">Ödeme bekleniyor</h2>
          <p className="mb-4 text-sm text-muted">Tutarı aşağıdaki hesaba havale / EFT ile gönderin; açıklamaya sipariş numaranızı yazın.</p>
          <BankCard amount={tl(Number(o.total))} reference={orderNo(id)} />
        </section>
      )}
      {o.tracking_no && (
        <section className="mt-10 rounded-[4px] border border-border p-6 text-sm">
          <h2 className="mb-2 font-bold">Kargo takibi</h2>
          <p>{o.cargo_company} · <strong>{o.tracking_no}</strong></p>
          {trackingUrl(o.cargo_company, o.tracking_no) && (
            <a href={trackingUrl(o.cargo_company, o.tracking_no)!} target="_blank" rel="noopener noreferrer" className="mt-3 inline-block rounded-[4px] bg-primary px-5 py-2.5 text-sm font-semibold text-white">Kargom nerede?</a>
          )}
        </section>
      )}

      <section className="mt-10 rounded-[4px] bg-surface p-6 text-sm">
        <h2 className="mb-3 font-bold">Teslimat Bilgileri</h2>
        <p className="font-semibold">{o.full_name}</p>
        <p className="text-muted">{o.phone} · {o.email}</p>
        <p className="mt-2 whitespace-pre-line text-muted">{o.address}, {o.city}</p>
        {o.note && <p className="mt-2 text-muted">Not: {o.note}</p>}
      </section>
      {!canReview && isStatus(o.status) && o.status !== "cancelled" && (
        <p className="mt-6 text-sm text-muted">Siparişiniz teslim edildikten sonra ürünlere yorum yapabilirsiniz.</p>
      )}
    </div>
  );
}
