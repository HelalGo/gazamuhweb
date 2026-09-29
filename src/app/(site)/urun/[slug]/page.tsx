import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/AddToCart";
import { Breadcrumb } from "@/components/Breadcrumb";
import { getProduct } from "@/lib/products";
import { slugify } from "@/lib/slug";
import { tl } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProduct((await params).slug);
  return { title: p ? `${p.name} | GAZ-A Mühendislik` : "Ürün bulunamadı" };
}

export default async function ProductPage({ params }: Props) {
  const p = await getProduct((await params).slug);
  if (!p) notFound();
  const specs = Object.entries(p.specs);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-8 pt-40 md:px-6">
      <Breadcrumb crumbs={[{ label: "Ana Sayfa", href: "/" }, { label: p.category, href: `/${slugify(p.category)}` }, { label: p.name }]} />

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-surface">
          {p.imageUrl && <Image src={p.imageUrl} alt={p.name} fill sizes="50vw" className="object-contain p-8" unoptimized />}
        </div>

        <div>
          <p className="text-sm text-muted">{p.brand}</p>
          <h1 className="mt-1 text-2xl font-extrabold leading-snug md:text-3xl">{p.name}</h1>
          {p.sku && <p className="mt-2 text-xs text-muted">Ürün kodu: {p.sku}</p>}

          <div className="mt-6 flex items-end gap-3">
            {p.price > 0 ? (
              <>
                <span className="text-3xl font-extrabold text-primary">{tl(p.price)}</span>
                {p.oldPrice && p.oldPrice > p.price && <span className="pb-1 text-muted line-through">{tl(p.oldPrice)}</span>}
              </>
            ) : (
              <span className="text-2xl font-extrabold text-primary">Fiyat için arayın</span>
            )}
          </div>
          <p className={`mt-2 text-sm font-semibold ${p.inStock ? "text-green-600" : "text-red-600"}`}>
            {p.inStock ? "Stokta var" : "Stokta yok"}
          </p>

          <div className="mt-6"><AddToCart product={p} /></div>

          {p.description && (
            <section className="mt-10">
              <h2 className="mb-3 text-lg font-bold">Ürün Açıklaması</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/80">{p.description}</p>
            </section>
          )}

          {specs.length > 0 && (
            <section className="mt-10">
              <h2 className="mb-3 text-lg font-bold">Teknik Özellikler</h2>
              <dl className="divide-y divide-border text-sm">
                {specs.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-2 gap-4 py-2.5">
                    <dt className="text-muted">{k}</dt>
                    <dd className="font-semibold">{v}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
