import type { Metadata } from "next";
import Link from "next/link";
import type { RowDataPacket } from "mysql2";
import { Breadcrumb } from "@/components/Breadcrumb";
import { requireUser } from "@/lib/customer";
import { db } from "@/lib/db";
import { STATUS, isStatus, orderNo } from "@/lib/orders";
import { tl } from "@/lib/utils";
import { logout } from "../actions";

export const metadata: Metadata = { title: "Hesabım | GAZ-A Mühendislik" };
export const dynamic = "force-dynamic";

export default async function Account() {
  const u = await requireUser("/hesabim");
  const [orders] = await db().query<RowDataPacket[]>(
    `SELECT o.id, o.status, o.total, o.created_at, COUNT(i.id) AS item_count
     FROM orders o LEFT JOIN order_items i ON i.order_id = o.id
     WHERE o.user_id = ? GROUP BY o.id ORDER BY o.id DESC`,
    [u.id]
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-8 pt-40 md:px-6">
      <Breadcrumb crumbs={["Ana Sayfa", "Hesabım"]} />
      <div className="mb-10 mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold">Merhaba, {u.firstName}</h1>
          <p className="mt-1 text-sm text-muted">{u.email}{u.phone ? ` · ${u.phone}` : ""}</p>
        </div>
        <div className="flex items-center gap-3 text-sm font-semibold">
          <Link href="/favoriler" className="rounded-[4px] bg-surface px-5 py-2.5 hover:bg-surface-alt">Favorilerim</Link>
          <form action={logout}><button className="rounded-[4px] bg-surface px-5 py-2.5 hover:bg-surface-alt">Çıkış Yap</button></form>
        </div>
      </div>

      <h2 className="mb-4 text-lg font-bold">Siparişlerim</h2>
      {!orders.length ? (
        <p className="rounded-3xl bg-surface p-10 text-center text-sm text-muted">Henüz siparişiniz yok. <Link href="/urunler" className="font-semibold text-primary hover:underline">Ürünlere göz atın</Link>.</p>
      ) : (
        <ul className="divide-y divide-border">
          {orders.map((o) => {
            const st = isStatus(o.status) ? STATUS[o.status] : STATUS.pending;
            return (
              <li key={o.id}>
                <Link href={`/hesabim/siparis/${o.id}`} className="flex flex-wrap items-center justify-between gap-4 py-5 hover:bg-surface/60">
                  <div>
                    <p className="font-bold">{orderNo(o.id)}</p>
                    <p className="text-xs text-muted">{new Date(o.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })} · {o.item_count} kalem</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${st.cls}`}>{st.label}</span>
                  <p className="font-extrabold text-primary">{tl(Number(o.total))}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
