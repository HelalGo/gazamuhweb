import Link from "next/link";
import type { RowDataPacket } from "mysql2";
import { Pencil, Plus, TicketPercent, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { couponLabel, ensurePricingTables } from "@/lib/pricing";
import { tl } from "@/lib/utils";
import { deleteCoupon, toggleCoupon } from "../../shop-actions";
import { ConfirmButton } from "../_client";
import { Badge, Empty, Notice, PageHead, btnPrimary, iconBtn } from "../_ui";

const d = (v: unknown) => (v ? new Date(v as string).toLocaleDateString("tr-TR") : null);

export default async function Coupons({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  await ensurePricingTables();
  const [rows] = await db().query<RowDataPacket[]>(
    `SELECT *, (ends_at IS NOT NULL AND ends_at < CURDATE()) AS expired, (starts_at IS NOT NULL AND starts_at > CURDATE()) AS upcoming
     FROM coupons ORDER BY active DESC, id DESC`
  );
  return (
    <>
      <PageHead title="İndirim Kuponları" sub="Müşteriler kupon kodunu web sitesinde ve mobil uygulamada sepet sayfasındaki “İndirim kuponu” alanına yazar. İndirim ürün toplamına uygulanır; kargo ücretine uygulanmaz." newHref="/admin/kuponlar/new" newLabel="Yeni Kupon" />
      <Notice saved={saved} />
      {!rows.length ? (
        <Empty text="Henüz indirim kuponu yok." action={<Link href="/admin/kuponlar/new" className={btnPrimary}><Plus size={16} />İlk kuponu oluştur</Link>} />
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => {
            const full = r.max_uses != null && r.used_count >= r.max_uses;
            const state = r.expired ? "Süresi doldu" : r.upcoming ? "Başlamadı" : full ? "Hakkı doldu" : null;
            return (
              <li key={r.id} className={`flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-white p-4 shadow-sm ${r.active && !state ? "" : "opacity-70"}`}>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><TicketPercent size={20} /></span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2">
                    <Link href={`/admin/kuponlar/${r.id}`} className="font-mono text-base font-bold tracking-wide hover:text-primary">{r.code}</Link>
                    <span className="rounded-lg bg-green-50 px-2 py-0.5 text-xs font-bold text-green-700">{couponLabel({ type: r.type, value: Number(r.value) })}</span>
                    {state && <span className="rounded-lg bg-amber-50 px-2 py-0.5 text-xs font-bold text-amber-700">{state}</span>}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {[
                      Number(r.min_total) > 0 ? `En az ${tl(Number(r.min_total))}` : null,
                      `${r.used_count}${r.max_uses != null ? ` / ${r.max_uses}` : ""} kullanım`,
                      d(r.starts_at) || d(r.ends_at) ? `${d(r.starts_at) ?? "…"} – ${d(r.ends_at) ?? "süresiz"}` : "Süresiz",
                      r.note,
                    ].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <form action={toggleCoupon}><input type="hidden" name="id" value={r.id} />
                  <button title="Aç / kapat"><Badge on={!!r.active} onText="Aktif" offText="Pasif" /></button>
                </form>
                <div className="flex items-center">
                  <Link href={`/admin/kuponlar/${r.id}`} className={iconBtn} aria-label="Düzenle" title="Düzenle"><Pencil size={16} /></Link>
                  <form action={deleteCoupon}><input type="hidden" name="id" value={r.id} />
                    <ConfirmButton message="Bu kupon silinecek. Emin misiniz?" className={`${iconBtn} hover:bg-red-50 hover:text-red-600`} aria-label="Sil" title="Sil"><Trash2 size={16} /></ConfirmButton>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
