import Link from "next/link";
import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import { STATUS, isStatus, orderNo } from "@/lib/orders";
import { tl } from "@/lib/utils";

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const filter = isStatus(status) ? status : null;
  const [rows] = await db().query<RowDataPacket[]>(
    `SELECT id, status, total, full_name, city, created_at FROM orders ${filter ? "WHERE status = ?" : ""} ORDER BY id DESC LIMIT 200`,
    filter ? [filter] : []
  );
  const [counts] = await db().query<RowDataPacket[]>("SELECT status, COUNT(*) AS n FROM orders GROUP BY status");
  const n = Object.fromEntries(counts.map((c) => [c.status, c.n as number]));

  const tab = (active: boolean) => `rounded-full px-4 py-2 text-sm font-semibold ${active ? "bg-primary text-white" : "bg-surface hover:bg-surface-alt"}`;
  return (
    <>
      <h1 className="text-2xl font-extrabold">Siparişler</h1>
      <div className="my-6 flex flex-wrap gap-2">
        <Link href="/admin/orders" className={tab(!filter)}>Tümü</Link>
        {(Object.keys(STATUS) as (keyof typeof STATUS)[]).map((s) => (
          <Link key={s} href={`/admin/orders?status=${s}`} className={tab(filter === s)}>{STATUS[s].label} ({n[s] ?? 0})</Link>
        ))}
      </div>
      {!rows.length ? (
        <p className="rounded-2xl bg-surface p-8 text-center text-sm text-muted">Sipariş yok.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted">
              <tr><th className="py-3 pr-4">No</th><th className="pr-4">Müşteri</th><th className="pr-4">Tarih</th><th className="pr-4">Tutar</th><th className="pr-4">Durum</th><th /></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => {
                const st = isStatus(r.status) ? STATUS[r.status] : STATUS.pending;
                return (
                  <tr key={r.id}>
                    <td className="py-3 pr-4 font-bold">{orderNo(r.id)}</td>
                    <td className="pr-4">{r.full_name}<span className="block text-xs text-muted">{r.city}</span></td>
                    <td className="whitespace-nowrap pr-4 text-muted">{new Date(r.created_at).toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" })}</td>
                    <td className="whitespace-nowrap pr-4 font-semibold">{tl(Number(r.total))}</td>
                    <td className="pr-4"><span className={`rounded-full px-3 py-1 text-xs font-bold ${st.cls}`}>{st.label}</span></td>
                    <td className="text-right"><Link href={`/admin/orders/${r.id}`} className="font-semibold text-accent hover:underline">Aç</Link></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
