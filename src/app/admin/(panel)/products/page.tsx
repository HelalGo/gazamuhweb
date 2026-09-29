import Link from "next/link";
import type { RowDataPacket } from "mysql2";
import { ChevronLeft, ChevronRight, ExternalLink, Eye, EyeOff, ImageOff, Pencil, Search, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { tl } from "@/lib/utils";
import { deleteProduct, toggleActive, toggleStock, bulkProducts } from "../../actions";
import { BulkBar, ConfirmButton, RowCheck, SelectAll } from "../_client";
import { Empty, Notice, PageHead, field, iconBtn } from "../_ui";

const PER = 30;
const FILTERS = {
  all: { label: "Tümü", sql: "" },
  active: { label: "Yayında", sql: "active = 1" },
  hidden: { label: "Gizli", sql: "active = 0" },
  noimg: { label: "Görselsiz", sql: "(image_url IS NULL OR image_url = '')" },
  nostock: { label: "Stokta yok", sql: "in_stock = 0" },
} as const;
type Filter = keyof typeof FILTERS;

type Row = RowDataPacket & {
  id: number; slug: string; sku: string | null; name: string; brand: string | null; category: string | null;
  image_url: string | null; price: string; old_price: string | null; in_stock: number; active: number;
};
type SP = { q?: string; cat?: string; status?: string; page?: string; done?: string; n?: string };

export default async function AdminProducts({ searchParams }: { searchParams: Promise<SP> }) {
  const { q = "", cat = "", status = "all", page = "1", done, n } = await searchParams;
  const filter: Filter = status in FILTERS ? (status as Filter) : "all";
  const p = Math.max(1, Number(page) || 1);

  const cond: string[] = [];
  const args: unknown[] = [];
  if (q) { cond.push("(name LIKE ? OR brand LIKE ? OR sku LIKE ?)"); args.push(`%${q}%`, `%${q}%`, `%${q}%`); }
  if (cat) { cond.push("category = ?"); args.push(cat); }
  const base = cond.length ? cond.join(" AND ") : "1";
  const where = `WHERE ${[base, FILTERS[filter].sql].filter(Boolean).join(" AND ")}`;

  let rows: Row[] = [];
  let total = 0;
  let counts: Record<string, number> = {};
  let cats: string[] = [];
  let error = "";
  try {
    const [[c]] = await db().query<RowDataPacket[]>(`SELECT COUNT(*) AS n FROM products ${where}`, args);
    total = c.n;
    [rows] = await db().query<Row[]>(
      `SELECT id, slug, sku, name, brand, category, image_url, price, old_price, in_stock, active FROM products ${where} ORDER BY id DESC LIMIT ? OFFSET ?`,
      [...args, PER, (p - 1) * PER]
    );
    const [[k]] = await db().query<RowDataPacket[]>(
      `SELECT COUNT(*) AS all_, ${(Object.keys(FILTERS) as Filter[]).filter((f) => f !== "all").map((f) => `SUM(${FILTERS[f].sql}) AS ${f}`).join(", ")} FROM products WHERE ${base}`,
      args
    );
    counts = { all: Number(k.all_), ...Object.fromEntries((Object.keys(FILTERS) as Filter[]).filter((f) => f !== "all").map((f) => [f, Number(k[f] ?? 0)])) };
    const [cr] = await db().query<RowDataPacket[]>("SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category");
    cats = cr.map((r) => r.category);
  } catch (e) {
    error = (e as Error).message;
  }
  const pages = Math.max(1, Math.ceil(total / PER));
  // Mevcut filtreleri koruyarak adres üretir
  const href = (o: Partial<SP>) => {
    const s = new URLSearchParams();
    for (const [k, v] of Object.entries({ q, cat, status: filter === "all" ? "" : filter, page: String(p), ...o })) {
      if (v && !(k === "page" && v === "1")) s.set(k, v);
    }
    return `/admin/products${s.size ? `?${s}` : ""}`;
  };
  const self = href({});
  const hidden = <input type="hidden" name="back" value={self} />;

  return (
    <>
      <PageHead title="Ürünler" sub={`${counts.all ?? total} ürün${cat ? ` · ${cat}` : ""}`} newHref="/admin/products/new" newLabel="Yeni Ürün" />
      <Notice saved={done} text={done === "deleted" ? `${n ?? 1} ürün silindi.` : `${n ?? 1} ürün güncellendi.`} />
      {error && <Notice err={`Veritabanına bağlanılamadı: ${error}`} />}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <form className="relative min-w-60 flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <input name="q" defaultValue={q} placeholder="Ürün adı, marka veya kod ara…" className={`${field} pl-10`} />
          {cat && <input type="hidden" name="cat" value={cat} />}
          {filter !== "all" && <input type="hidden" name="status" value={filter} />}
        </form>
        <div className="flex flex-wrap gap-2">
          <Link href={href({ cat: "", page: "1" })} className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${!cat ? "bg-primary text-white" : "border border-border bg-white hover:bg-surface"}`}>Tüm kategoriler</Link>
          {cats.map((c) => (
            <Link key={c} href={href({ cat: c, page: "1" })} className={`rounded-full px-3.5 py-1.5 text-sm font-semibold ${cat === c ? "bg-primary text-white" : "border border-border bg-white hover:bg-surface"}`}>{c}</Link>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
        <div className="flex gap-1 overflow-x-auto border-b border-border px-3">
          {(Object.keys(FILTERS) as Filter[]).map((f) => (
            <Link key={f} href={href({ status: f === "all" ? "" : f, page: "1" })}
              className={`-mb-px shrink-0 border-b-2 px-3 py-3 text-sm font-semibold ${filter === f ? "border-primary text-primary" : "border-transparent text-muted hover:text-foreground"}`}>
              {FILTERS[f].label} <span className="ml-1 rounded-full bg-surface px-2 py-0.5 text-xs">{counts[f] ?? 0}</span>
            </Link>
          ))}
        </div>

        {!rows.length ? (
          <div className="p-6"><Empty text={q || cat || filter !== "all" ? "Bu filtreyle eşleşen ürün yok." : "Henüz ürün yok."} /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface/60 text-xs font-semibold uppercase tracking-wide text-muted">
                <tr>
                  <th className="w-10 py-3 pl-4"><SelectAll /></th>
                  <th className="py-3 pr-4">Ürün</th>
                  <th className="hidden pr-4 md:table-cell">Kategori</th>
                  <th className="pr-4">Fiyat</th>
                  <th className="pr-4">Stok</th>
                  <th className="hidden pr-4 sm:table-cell">Durum</th>
                  <th className="pr-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((r) => (
                  <tr key={r.id} className={`transition-colors hover:bg-surface/50 ${r.active ? "" : "bg-slate-50/70"}`}>
                    <td className="py-3 pl-4"><RowCheck id={r.id} /></td>
                    <td className="min-w-56 py-3 pr-4">
                      <Link href={`/admin/products/${r.id}`} className="flex items-center gap-3">
                        <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-white">
                          {r.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={r.image_url} alt="" loading="lazy" className="h-full w-full object-contain p-1" />
                          ) : <ImageOff size={18} className="text-slate-300" />}
                        </span>
                        <span className="min-w-0">
                          <span className={`line-clamp-2 max-w-md font-semibold hover:text-primary ${r.active ? "" : "text-muted"}`}>{r.name}</span>
                          <span className="block text-xs text-muted">{[r.brand, r.sku].filter(Boolean).join(" · ")}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="hidden whitespace-nowrap pr-4 text-muted md:table-cell">{r.category}</td>
                    <td className="whitespace-nowrap pr-4">
                      <span className="font-semibold">{Number(r.price) > 0 ? tl(Number(r.price)) : <span className="text-muted">Fiyat sorunuz</span>}</span>
                      {r.old_price && Number(r.old_price) > Number(r.price) && <span className="block text-xs text-muted line-through">{tl(Number(r.old_price))}</span>}
                    </td>
                    <td className="pr-4">
                      <form action={toggleStock}>{hidden}<input type="hidden" name="id" value={r.id} />
                        <button title="Stok durumunu değiştir" className={`rounded-full px-2.5 py-1 text-xs font-bold ${r.in_stock ? "bg-blue-50 text-primary" : "bg-red-50 text-red-600"}`}>{r.in_stock ? "Var" : "Yok"}</button>
                      </form>
                    </td>
                    <td className="hidden pr-4 sm:table-cell">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${r.active ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${r.active ? "bg-green-500" : "bg-slate-400"}`} />{r.active ? "Yayında" : "Gizli"}
                      </span>
                    </td>
                    <td className="pr-3">
                      <div className="flex justify-end">
                        <Link href={`/admin/products/${r.id}`} className={iconBtn} title="Düzenle" aria-label="Düzenle"><Pencil size={16} /></Link>
                        <form action={toggleActive}>{hidden}<input type="hidden" name="id" value={r.id} />
                          <button className={iconBtn} title={r.active ? "Gizle" : "Yayınla"} aria-label={r.active ? "Gizle" : "Yayınla"}>{r.active ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                        </form>
                        <a href={`/urun/${r.slug}`} target="_blank" className={iconBtn} title="Sitede gör" aria-label="Sitede gör"><ExternalLink size={16} /></a>
                        <form action={deleteProduct}>{hidden}<input type="hidden" name="id" value={r.id} />
                          <ConfirmButton message={`"${r.name}" kalıcı olarak silinecek. Emin misiniz?`} className={`${iconBtn} hover:bg-red-50 hover:text-red-600`} title="Sil" aria-label="Sil"><Trash2 size={16} /></ConfirmButton>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm">
            <span className="text-muted">{(p - 1) * PER + 1}–{Math.min(p * PER, total)} / {total}</span>
            <div className="flex items-center gap-1">
              {p > 1 ? <Link href={href({ page: String(p - 1) })} className={iconBtn} aria-label="Önceki sayfa"><ChevronLeft size={18} /></Link> : <span className={`${iconBtn} opacity-30`}><ChevronLeft size={18} /></span>}
              <span className="px-2 font-semibold">{p} / {pages}</span>
              {p < pages ? <Link href={href({ page: String(p + 1) })} className={iconBtn} aria-label="Sonraki sayfa"><ChevronRight size={18} /></Link> : <span className={`${iconBtn} opacity-30`}><ChevronRight size={18} /></span>}
            </div>
          </div>
        )}
      </div>

      <p className="mt-3 text-xs text-muted">İpucu: Stok rozetine tıklayarak stok durumunu değiştirebilir, satırları seçip toplu işlem yapabilirsiniz.</p>
      <BulkBar action={bulkProducts} back={self} />
    </>
  );
}
