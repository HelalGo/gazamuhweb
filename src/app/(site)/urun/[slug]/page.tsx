import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, Info, Phone, Wrench } from "lucide-react";
import { AddToCart } from "@/components/AddToCart";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Description } from "@/components/Description";
import { FavoriteButton } from "@/components/FavoriteButton";
import { JsonLd } from "@/components/JsonLd";
import { ProductGallery } from "@/components/ProductGallery";
import { ReviewForm } from "@/components/ReviewForm";
import { Stars } from "@/components/Stars";
import { dbConfigured, getUser } from "@/lib/customer";
import { getProduct } from "@/lib/products";
import { getReviews, reviewEligibility, type Eligibility } from "@/lib/reviews";
import { breadcrumbLd, productLd, summary as clip } from "@/lib/seo";
import { contact, igdas } from "@/lib/site";
import { slugify } from "@/lib/slug";
import { tl } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ yorum?: string }> };

export async function generateMetadata({ params }: Pick<Props, "params">): Promise<Metadata> {
  const p = await getProduct((await params).slug);
  if (!p) return { title: "Ürün bulunamadı", robots: { index: false } };
  const price = p.price > 0 ? `${tl(p.price)} · ` : "";
  const name = p.name.toLocaleLowerCase("tr").startsWith(p.brand.toLocaleLowerCase("tr")) ? p.name : `${p.brand} ${p.name}`;
  const description = clip(`${price}${name}. ${p.description}`);
  const url = `/urun/${p.slug}`;
  return {
    title: `${p.name} | GAZ-A Mühendislik`,
    description,
    alternates: { canonical: url },
    openGraph: { type: "website", url, title: p.name, description, images: p.imageUrl ? [{ url: p.imageUrl, alt: p.name }] : ["/brand/og.jpg"] },
  };
}

export default async function ProductPage({ params, searchParams }: Props) {
  const p = await getProduct((await params).slug);
  if (!p) notFound();
  const { yorum } = await searchParams;
  const specs = Object.entries(p.specs);

  const reviewsOn = dbConfigured();
  const user = reviewsOn ? await getUser() : null;
  const { list, summary } = reviewsOn ? await getReviews(p.id) : { list: [], summary: { avg: 0, count: 0 } };
  const eligible: Eligibility = reviewsOn ? await reviewEligibility(user?.id ?? null, p.id).catch(() => "guest" as Eligibility) : "guest";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-8 pt-40 md:px-6">
      <JsonLd data={[
        productLd(p, summary),
        breadcrumbLd([{ name: "Ana Sayfa", url: "/" }, { name: p.category, url: `/${slugify(p.category)}` }, { name: p.name, url: `/urun/${p.slug}` }]),
      ]} />
      <Breadcrumb crumbs={[{ label: "Ana Sayfa", href: "/" }, { label: p.category, href: `/${slugify(p.category)}` }, { label: p.name }]} />

      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <ProductGallery images={[p.imageUrl, ...p.images].filter((x): x is string => !!x)} name={p.name}>
          <FavoriteButton id={p.id} className="absolute right-4 top-4 !h-11 !w-11" />
        </ProductGallery>

        <div className="lg:pl-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
            <Link href={`/${slugify(p.category)}`} className="hover:text-primary">{p.category}</Link> · {p.brand}
          </p>
          <h1 className="mt-3 text-3xl font-light leading-tight tracking-tight md:text-4xl">{p.name}</h1>
          {summary.count > 0 && (
            <a href="#yorumlar" className="mt-2 inline-flex items-center gap-2 text-sm text-muted hover:text-foreground">
              <Stars value={summary.avg} /> <span className="font-semibold text-foreground">{summary.avg.toFixed(1)}</span> ({summary.count} yorum)
            </a>
          )}
          {p.sku && <p className="mt-2 text-xs text-muted">Ürün kodu: {p.sku}</p>}

          <div className="mt-6 flex items-center gap-3">
            {p.price > 0 ? (
              <>
                <span className="text-3xl font-bold text-primary">{tl(p.price)}</span>
                {p.oldPrice && p.oldPrice > p.price && (
                  <>
                    <span className="text-muted line-through">{tl(p.oldPrice)}</span>
                    <span className="rounded-[4px] bg-accent/10 px-2 py-1 text-xs font-bold text-accent">-%{Math.round((1 - p.price / p.oldPrice) * 100)}</span>
                  </>
                )}
              </>
            ) : (
              <span className="text-2xl font-bold text-primary">Fiyat için arayın</span>
            )}
          </div>
          <p className={`mt-2 text-sm font-semibold ${p.inStock ? "text-green-600" : "text-red-600"}`}>
            {p.inStock ? "Stokta var" : "Stokta yok"}
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <AddToCart product={p} />
            <Link href={`/bilgi-al?urun=${encodeURIComponent(p.slug)}`}
              className="inline-flex items-center justify-center gap-2 rounded-[4px] border-2 border-primary py-3 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-white sm:px-8">
              <Info size={18} /> Bilgi Al
            </Link>
          </div>

          <ul className="mt-8 space-y-3 border-t border-border pt-6 text-sm text-foreground/80">
            <li className="flex items-center gap-3"><Wrench size={17} className="shrink-0 text-accent" />Kurulum ve montaj hizmeti</li>
            <li className="flex items-center gap-3"><BadgeCheck size={17} className="shrink-0 text-accent" />{igdas.title} · Yetki No {igdas.no}</li>
            <li className="flex items-center gap-3"><Phone size={17} className="shrink-0 text-accent" />Ürün danışmanlığı: <a href={`tel:+9${contact.phone.replace(/\s/g, "")}`} className="font-semibold hover:text-primary">{contact.phone}</a></li>
          </ul>

          {p.description && (
            <section className="mt-10">
              <h2 className="mb-3 text-lg font-bold">Ürün Açıklaması</h2>
              <Description text={p.description} />
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

      {reviewsOn && (
        <section id="yorumlar" className="mt-20 scroll-mt-40">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-2xl font-extrabold">Değerlendirmeler</h2>
            {summary.count > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-3xl font-extrabold">{summary.avg.toFixed(1)}</span>
                <div><Stars value={summary.avg} size={18} /><p className="text-xs text-muted">{summary.count} değerlendirme</p></div>
              </div>
            )}
          </div>

          <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
            <div>
              {yorum && <p role="status" className="mb-6 rounded-[4px] bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">Yorumunuz için teşekkürler, yayınlandı.</p>}
              {list.length ? (
                <ul className="divide-y divide-border">
                  {list.map((r) => (
                    <li key={r.id} className="py-6 first:pt-0">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <Stars value={r.rating} />
                        <span className="text-sm font-bold">{r.author}</span>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700"><BadgeCheck size={14} /> Satın aldı</span>
                        <span className="text-xs text-muted">{r.date}</span>
                      </div>
                      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-foreground/85">{r.comment}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-[4px] bg-surface p-10 text-center text-sm text-muted">Bu ürün için henüz değerlendirme yok.</p>
              )}
            </div>

            <div>
              {eligible === "ok" && <ReviewForm productId={p.id} />}
              {eligible === "guest" && (
                <p className="rounded-[4px] bg-surface p-6 text-sm leading-relaxed text-muted">
                  Ürünleri değerlendirmek için <Link href={`/giris?next=${encodeURIComponent(`/urun/${p.slug}`)}`} className="font-semibold text-primary hover:underline">giriş yapın</Link>.
                  Yalnızca satın alan müşteriler yorum yapabilir.
                </p>
              )}
              {eligible === "not-purchased" && <p className="rounded-[4px] bg-surface p-6 text-sm leading-relaxed text-muted">Bu ürünü değerlendirebilmek için satın almış olmanız gerekir.</p>}
              {eligible === "waiting" && <p className="rounded-[4px] bg-surface p-6 text-sm leading-relaxed text-muted">Siparişiniz teslim edildikten sonra bu ürünü değerlendirebilirsiniz.</p>}
              {eligible === "already" && <p className="rounded-[4px] bg-surface p-6 text-sm leading-relaxed text-green-700">Bu ürünü zaten değerlendirdiniz, teşekkürler.</p>}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
