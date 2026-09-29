import Link from "next/link";
import type { RowDataPacket } from "mysql2";
import { ArrowRight, Clock, EyeOff, ImageOff, MessageSquare, Package, PackageX, Plus, ShoppingBag, TrendingUp } from "lucide-react";
import { db } from "@/lib/db";
import { STATUS, isStatus, orderNo } from "@/lib/orders";
import { tl } from "@/lib/utils";
import { btnGhost, btnPrimary, card } from "./_ui";

export const dynamic = "force-dynamic";

async function stats() {
  const q = async (sql: string) => ((await db().query<RowDataPacket[]>(sql))[0][0] ?? {}) as Record<string, number>;
  const [p, o, r] = await Promise.all([
    q(`SELECT COUNT(*) total, SUM(active = 1) active, SUM(active = 0) hidden,
        SUM(image_url IS NULL OR image_url = '') noimg, SUM(in_stock = 0) nostock FROM products`),
    q(`SELECT SUM(status = 'pending') pending,
        SUM(CASE WHEN status <> 'cancelled' AND created_at >= DATE_FORMAT(NOW(), '%Y-%m-01') THEN total ELSE 0 END) month,
        SUM(created_at >= DATE_FORMAT(NOW(), '%Y-%m-01')) monthCount FROM orders`),
    q("SELECT COUNT(*) total FROM reviews"),
  ]);
  const [recent] = await db().query<RowDataPacket[]>("SELECT id, status, total, full_name, city, created_at FROM orders ORDER BY id DESC LIMIT 6");
  const [cats] = await db().query<RowDataPacket[]>("SELECT category, COUNT(*) n FROM products WHERE active = 1 GROUP BY category ORDER BY n DESC");
  return { p, o, r, recent, cats };
}

export default async function Dashboard() {
  let data: Awaited<ReturnType<typeof stats>>;
  try {
    data = await stats();
  } catch (e) {
    return <p className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">Veritabanına bağlanılamadı: {(e as Error).message}</p>;
  }
  const { p, o, r, recent, cats } = data;
  const n = (v: unknown) => Number(v ?? 0);
  const maxCat = Math.max(1, ...cats.map((c) => c.n as number));

  const tiles = [
    { label: "Yayındaki ürün", value: n(p.active), sub: `toplam ${n(p.total)}`, icon: Package, href: "/admin/products", tone: "bg-blue-50 text-primary" },
    { label: "Bekleyen sipariş", value: n(o.pending), sub: "onay bekliyor", icon: Clock, href: "/admin/orders?status=pending", tone: "bg-amber-50 text-amber-700" },
    { label: "Bu ay ciro", value: tl(n(o.month)), sub: `${n(o.monthCount)} sipariş`, icon: TrendingUp, href: "/admin/orders", tone: "bg-green-50 text-green-700" },
    { label: "Yorum", value: n(r.total), sub: "toplam", icon: MessageSquare, href: "/admin/reviews", tone: "bg-violet-50 text-violet-700" },
  ];
  const todo = [
    { n: n(p.noimg), text: "ürünün görseli yok", href: "/admin/products?status=noimg", icon: ImageOff },
    { n: n(p.nostock), text: "ürün stokta yok", href: "/admin/products?status=nostock", icon: PackageX },
    { n: n(p.hidden), text: "ürün gizli", href: "/admin/products?status=hidden", icon: EyeOff },
  ].filter((t) => t.n > 0);

  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Genel Bakış</h1>
          <p className="mt-1 text-sm text-muted">Mağazanızın özeti ve hızlı işlemler.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/orders" className={btnGhost}><ShoppingBag size={16} />Siparişler</Link>
          <Link href="/admin/products/new" className={btnPrimary}><Plus size={16} />Yeni Ürün</Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((t) => (
          <Link key={t.label} href={t.href} className={`${card} group transition hover:-translate-y-0.5 hover:shadow-md`}>
            <div className="flex items-start justify-between">
              <p className="text-sm font-semibold text-muted">{t.label}</p>
              <span className={`grid h-10 w-10 place-items-center rounded-xl ${t.tone}`}><t.icon size={20} /></span>
            </div>
            <p className="mt-3 text-3xl font-extrabold tracking-tight">{t.value}</p>
            <p className="mt-1 text-xs text-muted">{t.sub}</p>
          </Link>
        ))}
      </div>

      {todo.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-3">
          {todo.map((t) => (
            <Link key={t.href} href={t.href} className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm shadow-sm hover:border-accent">
              <t.icon size={16} className="text-muted" /><strong>{t.n}</strong> {t.text}<ArrowRight size={14} className="text-muted" />
            </Link>
          ))}
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className={`${card} lg:col-span-2`}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold">Son siparişler</h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-accent hover:underline">Tümü</Link>
          </div>
          {!recent.length ? (
            <p className="py-8 text-center text-sm text-muted">Henüz sipariş yok.</p>
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((x) => {
                const st = isStatus(x.status) ? STATUS[x.status] : STATUS.pending;
                return (
                  <li key={x.id}>
                    <Link href={`/admin/orders/${x.id}`} className="-mx-2 flex items-center gap-4 rounded-lg px-2 py-3 hover:bg-surface">
                      <span className="w-24 shrink-0 text-sm font-bold">{orderNo(x.id)}</span>
                      <span className="min-w-0 flex-1 truncate text-sm">{x.full_name}<span className="text-muted"> · {x.city}</span></span>
                      <span className={`hidden rounded-full px-2.5 py-1 text-xs font-bold sm:inline ${st.cls}`}>{st.label}</span>
                      <span className="w-28 text-right text-sm font-semibold">{tl(Number(x.total))}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className={card}>
          <h2 className="mb-4 font-bold">Kategoriler</h2>
          <ul className="space-y-3">
            {cats.map((c) => (
              <li key={c.category ?? "-"}>
                <Link href={`/admin/products?cat=${encodeURIComponent(c.category ?? "")}`} className="group block">
                  <div className="mb-1 flex justify-between text-sm"><span className="font-semibold group-hover:text-primary">{c.category ?? "Diğer"}</span><span className="text-muted">{c.n}</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface"><div className="h-full rounded-full bg-accent" style={{ width: `${(c.n / maxCat) * 100}%` }} /></div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
