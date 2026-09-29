import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/Breadcrumb";
import { ProductCard } from "@/components/ProductCard";
import { getFavoriteIds, requireUser } from "@/lib/customer";
import { getProducts } from "@/lib/products";

export const metadata: Metadata = { title: "Favorilerim | GAZ-A Mühendislik" };
export const dynamic = "force-dynamic";

export default async function Favorites() {
  const u = await requireUser("/favoriler");
  const ids = await getFavoriteIds(u.id);
  const all = await getProducts();
  const byId = new Map(all.map((p) => [p.id, p]));
  const list = ids.map((id) => byId.get(id)).filter((p) => !!p);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-8 pt-40 md:px-6">
      <Breadcrumb crumbs={[{ label: "Ana Sayfa", href: "/" }, { label: "Hesabım", href: "/hesabim" }, { label: "Favorilerim" }]} />
      <h1 className="mb-8 mt-6 text-2xl font-extrabold">Favorilerim <span className="text-base font-normal text-muted">({list.length})</span></h1>
      {list.length ? (
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((p, i) => <ProductCard key={p!.id} product={p!} index={i} />)}
        </div>
      ) : (
        <p className="rounded-3xl bg-surface p-12 text-center text-sm text-muted">
          Henüz favori ürününüz yok. Ürün kartlarındaki kalp simgesine dokunarak ekleyebilirsiniz.{" "}
          <Link href="/urunler" className="font-semibold text-primary hover:underline">Ürünlere göz atın</Link>.
        </p>
      )}
    </div>
  );
}
