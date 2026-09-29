import Link from "next/link";
import type { RowDataPacket } from "mysql2";
import { ChevronRight, Search } from "lucide-react";
import { db } from "@/lib/db";
import { STATUS, isStatus, orderNo } from "@/lib/orders";
import { tl } from "@/lib/utils";
import { Empty, PageHead, field } from "../_ui";

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const { status, q = "" } = await searchParams;
  const filter = isStatus(status) ? status : null;
  const cond: string[] = [];
  const args: unknown[] = [];
  if (filter) { cond.push("status = ?"); args.push(filter); }
  if (q) {
    const no = Number(q.replace(/\D/g, ""));
    cond.push("(full_name LIKE ? OR phone LIKE ? OR email LIKE ? OR id = ?)");
    args.push(`%${q}%`, `%${q}%`, `%${q}%`, no || -1);
  }
  const [rows] = await db().query<RowDataPacket[]>(
    `SELECT id, status, total, full_name, phone, city, created_at FROM orders ${cond.length ? `WHERE ${cond.join(" AND ")}` : ""} ORDER BY id DESC LIMIT 200`,
    args
  );
  const [counts] = await db().query<RowDataPacket[]>("SELECT status, COUNT(*) AS n FROM orders GROUP BY status");
  const n = Object.fromEntries(counts.map((c) => [c.status, c.n as number]));
  const all = counts.reduce((a, c) => a + (c.n as number), 0);
  const tabHref = (s?: string) => `/admin/orders?${new URLSearchParams({ ...(s && { status: s }), ...(q && { q }) })}`;
  const tab = (active: boolean) => `-mb-px shrink-0 border-b-2 px-3 py-3 text-sm font-semibold ${active ? "border-primary text-primary" : "border-transparent text-muted hover:text-foreground"}`;

  return (
    <>
      <PageHead title="Siparişler" sub="Siparişi açarak durumunu tek tıkla güncelleyebilirsiniz." />
      <form className="relative mb-4 max-w-md">
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
        <input name="q" defaultValue={q} placeholder="Müşteri adı, telefon, e-posta veya sipariş no…" className={`${field} pl-10`} />
        {filter && <input type="hidden" name="status" value={filter} />}
      </form>

      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <div className="flex gap-1 overflow-x-auto border-b border-border px-3">
          <Link href={tabHref()} className={tab(!filter)}>Tümü <span className="ml-1 rounded-full bg-surface px-2 py-0.5 text-xs">{all}</span></Link>
          {(Object.keys(STATUS) as (keyof typeof STATUS)[]).map((s) => (
            <Link key={s} href={tabHref(s)} className={tab(filter === s)}>{STATUS[s].label} <span className="ml-1 rounded-full bg-surface px-2 py-0.5 text-xs">{n[s] ?? 0}</span></Link>
          ))}
        </div>
        {!rows.length ? (
          <div className="p-6"><Empty text="Bu filtreyle eşleşen sipariş yok." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface/60 text-xs font-semibold uppercase tracking-wide text-muted">
                <tr><th className="py-3 pl-5 pr-4">No</th><th className="pr-4">Müşteri</th><th className="pr-4">Tarih</th><th className="pr-4">Tutar</th><th className="pr-4">Durum</th><th /></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((r) => {
                  const st = isStatus(r.status) ? STATUS[r.status] : STATUS.pending;
                  return (
                    <tr key={r.id} className="transition-colors hover:bg-surface/50">
                      <td className="py-3 pl-5 pr-4 font-bold"><Link href={`/admin/orders/${r.id}`} className="hover:text-primary">{orderNo(r.id)}</Link></td>
                      <td className="pr-4">{r.full_name}<span className="block text-xs text-muted">{r.city} · {r.phone}</span></td>
                      <td className="whitespace-nowrap pr-4 text-muted">{new Date(r.created_at).toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" })}</td>
                      <td className="whitespace-nowrap pr-4 font-semibold">{tl(Number(r.total))}</td>
                      <td className="pr-4"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${st.cls}`}>{st.label}</span></td>
                      <td className="pr-4 text-right">
                        <Link href={`/admin/orders/${r.id}`} className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-semibold text-accent hover:bg-surface">Aç<ChevronRight size={16} /></Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
