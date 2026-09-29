import Link from "next/link";
import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import { tl } from "@/lib/utils";
import { toggleActive } from "../../actions";

const PER = 25;
type Row = RowDataPacket & { id: number; name: string; brand: string | null; category: string | null; image_url: string | null; price: string; in_stock: number; active: number };

export default async function AdminProducts({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const { q = "", page = "1" } = await searchParams;
  const p = Math.max(1, Number(page) || 1);
  const like = `%${q}%`;
  const where = q ? "WHERE name LIKE ? OR brand LIKE ? OR sku LIKE ?" : "";
  const args = q ? [like, like, like] : [];

  let rows: Row[] = [];
  let total = 0;
  let error = "";
  try {
    const [[c]] = await db().query<RowDataPacket[]>(`SELECT COUNT(*) AS n FROM products ${where}`, args);
    total = c.n;
    [rows] = await db().query<Row[]>(
      `SELECT id, name, brand, category, image_url, price, in_stock, active FROM products ${where} ORDER BY id DESC LIMIT ? OFFSET ?`,
      [...args, PER, (p - 1) * PER]
    );
  } catch (e) {
    error = (e as Error).message;
  }
  const pages = Math.max(1, Math.ceil(total / PER));
  const href = (n: number) => `/admin/products?${new URLSearchParams({ ...(q && { q }), page: String(n) })}`;

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Ürünler</h1>
          <p className="text-sm text-muted">{total} ürün</p>
        </div>
        <div className="flex gap-3">
          <form>
            <input name="q" defaultValue={q} placeholder="Ürün, marka veya kod ara" className="w-64 rounded-full bg-surface px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/50" />
          </form>
          <Link href="/admin/products/new" className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white">+ Yeni Ürün</Link>
        </div>
      </div>

      {error && (
        <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">
          Veritabanına bağlanılamadı: {error}. <code>.env.local</code> içindeki DB_HOST'u kontrol edip <code>npm run db:init</code> ve <code>npm run db:import</code> çalıştırın.
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-muted">
            <tr><th className="w-14 py-3 pr-3" /><th className="py-3 pr-4">Ürün</th><th className="pr-4">Kategori</th><th className="pr-4">Fiyat</th><th className="pr-4">Stok</th><th className="pr-4">Durum</th><th /></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r) => (
              <tr key={r.id} className={r.active ? "" : "text-muted"}>
                <td className="py-3 pr-3">
                  {r.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.image_url} alt="" className="h-10 w-10 rounded-lg bg-surface object-contain" />
                  ) : (
                    <div className="h-10 w-10 rounded-lg bg-surface" />
                  )}
                </td>
                <td className="max-w-md py-3 pr-4"><p className="line-clamp-1 font-semibold">{r.name}</p><p className="text-xs text-muted">{r.brand}</p></td>
                <td className="pr-4">{r.category}</td>
                <td className="whitespace-nowrap pr-4 font-semibold">{tl(Number(r.price))}</td>
                <td className="pr-4">{r.in_stock ? "Var" : "Yok"}</td>
                <td className="pr-4">
                  <form action={toggleActive}>
                    <input type="hidden" name="id" value={r.id} />
                    <input type="hidden" name="back" value={href(p)} />
                    <button className={`rounded-full px-3 py-1 text-xs font-bold ${r.active ? "bg-green-100 text-green-700" : "bg-surface-alt text-muted"}`}>
                      {r.active ? "Yayında" : "Gizli"}
                    </button>
                  </form>
                </td>
                <td className="text-right"><Link href={`/admin/products/${r.id}`} className="font-semibold text-accent hover:underline">Düzenle</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-4 text-sm">
          {p > 1 && <Link href={href(p - 1)} className="font-semibold text-accent">← Önceki</Link>}
          <span className="text-muted">{p} / {pages}</span>
          {p < pages && <Link href={href(p + 1)} className="font-semibold text-accent">Sonraki →</Link>}
        </div>
      )}
    </>
  );
}
