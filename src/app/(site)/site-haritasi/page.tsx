import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown, FileText, Headset, LayoutGrid, Newspaper, ShieldCheck, Tag, UserRound } from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { getPosts } from "@/lib/blog";
import type { Product } from "@/lib/data";
import { getProducts } from "@/lib/products";
import { getSeason, seasonRank } from "@/lib/season";
import { footerLinks } from "@/lib/site";
import { slugify } from "@/lib/slug";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Site Haritası | GAZ-A Mühendislik",
  description: "GAZ-A Mühendislik sitesindeki tüm kategoriler, markalar, ürünler, blog yazıları, kurumsal sayfalar ve sözleşmeler tek sayfada.",
  alternates: { canonical: "/site-haritasi" },
};

type L = { label: string; href: string };

const general: L[] = [
  { label: "Ana Sayfa", href: "/" },
  { label: "Tüm Ürünler", href: "/urunler" },
  { label: "Blog", href: "/blog" },
  { label: "Bilgi / Teklif Al", href: "/bilgi-al" },
  { label: "İletişim", href: "/iletisim" },
  { label: "Hakkımızda", href: "/hakkimizda" },
];
const account: L[] = [
  { label: "Giriş Yap", href: "/giris" },
  { label: "Üye Ol", href: "/uye-ol" },
  { label: "Hesabım ve Siparişlerim", href: "/hesabim" },
  { label: "Favorilerim", href: "/favoriler" },
  { label: "Sepetim", href: "/sepet" },
  { label: "İletişim Tercihleri", href: "/hesabim/iletisim-tercihleri" },
  { label: "Hesap Silme", href: "/hesap-silme" },
];
const service: L[] = footerLinks["Müşteri Hizmetleri"];

// Kategori sırası header menüsündeki gibi (mevsime göre); listede olmayanlar sona eklenir
function byCategory(products: Product[], rank: (c: string) => number) {
  const map = new Map<string, Product[]>();
  for (const p of products) if (p.category) map.set(p.category, [...(map.get(p.category) ?? []), p]);
  return [...map].sort((a, b) => rank(a[0]) - rank(b[0]) || a[0].localeCompare(b[0], "tr"));
}

function byBrand(list: Product[]) {
  const map = new Map<string, Product[]>();
  for (const p of list) map.set(p.brand || "Diğer", [...(map.get(p.brand || "Diğer") ?? []), p]);
  return [...map].sort((a, b) => a[0].localeCompare(b[0], "tr")).map(([b, ps]) => [b, ps.sort((x, y) => x.name.localeCompare(y.name, "tr"))] as const);
}

export default async function SiteMap() {
  const [products, posts, season] = await Promise.all([getProducts(), getPosts().catch(() => []), getSeason()]);
  const cats = byCategory(products, seasonRank(season));
  const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))].sort((a, b) => a.localeCompare(b, "tr"));
  const stats = [
    [cats.length, "kategori"],
    [brands.length, "marka"],
    [products.length, "ürün"],
    [posts.length, "blog yazısı"],
  ] as const;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-8 pt-40 md:px-6">
      <Breadcrumb crumbs={[{ label: "Ana Sayfa", href: "/" }, { label: "Site Haritası" }]} />
      <header className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-accent">Site Haritası</p>
          <h1 className="mt-3 text-4xl font-light tracking-tight md:text-5xl">Aradığınız her sayfa burada</h1>
          <p className="mt-4 leading-relaxed text-muted">Kategoriler, markalar, ürünler, blog yazıları, kurumsal sayfalar ve sözleşmeler. Bir başlığa tıklayarak ilgili sayfaya gidebilirsiniz.</p>
        </div>
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[4px] border border-border bg-border sm:grid-cols-4">
          {stats.map(([n, l]) => (
            <div key={l} className="bg-white px-5 py-4">
              <dt className="sr-only">{l}</dt>
              <dd><span className="block text-2xl font-extrabold text-primary tabular-nums">{n}</span><span className="text-xs font-semibold uppercase tracking-wider text-muted">{l}</span></dd>
            </div>
          ))}
        </dl>
      </header>

      {/* Hızlı geçiş */}
      <nav aria-label="Bölümler" className="mt-10 flex flex-wrap gap-2 border-y border-border py-4">
        {[["#sayfalar", "Sayfalar"], ["#kategoriler", "Kategoriler ve ürünler"], ["#markalar", "Markalar"], ["#blog", "Blog"], ["#sozlesmeler", "Sözleşmeler"]].map(([h, l]) => (
          <a key={h} href={h} className="rounded-[4px] bg-surface px-4 py-2 text-sm font-semibold transition-colors hover:bg-primary hover:text-white">{l}</a>
        ))}
      </nav>

      <section id="sayfalar" className="mt-14 grid scroll-mt-32 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <LinkCard icon={<LayoutGrid size={18} />} title="Genel sayfalar" links={general} />
        <LinkCard icon={<UserRound size={18} />} title="Hesap ve alışveriş" links={account} />
        <LinkCard icon={<Headset size={18} />} title="Müşteri hizmetleri" links={service} />
      </section>

      <section id="kategoriler" className="mt-16 scroll-mt-32">
        <SectionHead icon={<Tag size={18} />} title="Kategoriler ve ürünler" sub="Her kategorinin markaları ve tüm ürünleri. Ürün listesini açmak için kategorinin altındaki bağlantıya tıklayın." />
        <div className="mt-8 grid items-start gap-6 lg:grid-cols-2">
          {cats.map(([cat, list]) => {
            const href = `/${slugify(cat)}`;
            const groups = byBrand(list);
            return (
              <article key={cat} className="rounded-[4px] border border-border p-6">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="text-xl font-extrabold"><Link href={href} className="hover:text-primary">{cat}</Link></h3>
                  <Link href={href} className="shrink-0 text-sm font-semibold text-accent hover:underline">{list.length} ürün →</Link>
                </div>
                <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Markalar</p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {groups.map(([b, ps]) => (
                    <li key={b}>
                      <Link href={`${href}?marka=${encodeURIComponent(b)}`} className="inline-flex items-center gap-1.5 rounded-[4px] bg-surface px-2.5 py-1 text-sm hover:bg-primary hover:text-white">
                        {b}<span className="text-xs opacity-60">{ps.length}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <details className="group mt-5 border-t border-border pt-4">
                  <summary className="flex cursor-pointer list-none items-center gap-1.5 text-sm font-semibold text-primary [&::-webkit-details-marker]:hidden">
                    <ChevronDown size={16} className="transition-transform group-open:rotate-180" />
                    <span className="group-open:hidden">Tüm ürünleri göster</span><span className="hidden group-open:inline">Ürünleri gizle</span>
                  </summary>
                  <div className="mt-4 space-y-5">
                    {groups.map(([b, ps]) => (
                      <div key={b}>
                        <p className="text-xs font-bold uppercase tracking-wider text-accent">{b}</p>
                        <ul className="mt-1.5 space-y-1 border-l border-border pl-3">
                          {ps.map((p) => (
                            <li key={p.id}><Link href={`/urun/${p.slug}`} className="text-sm leading-snug text-foreground/80 hover:text-primary">{p.name}</Link></li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </details>
              </article>
            );
          })}
        </div>
      </section>

      <section id="markalar" className="mt-16 scroll-mt-32">
        <SectionHead icon={<ShieldCheck size={18} />} title="Markalar" sub="Markanın tüm ürünlerini görmek için tıklayın." />
        <ul className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {brands.map((b) => (
            <li key={b}>
              <Link href={`/urunler?marka=${encodeURIComponent(b)}`} className="block truncate rounded-[4px] border border-border px-3 py-2.5 text-sm font-semibold transition-colors hover:border-primary hover:text-primary">{b}</Link>
            </li>
          ))}
        </ul>
      </section>

      <section id="blog" className="mt-16 scroll-mt-32">
        <SectionHead icon={<Newspaper size={18} />} title="Blog yazıları" sub="Rehberler, öneriler ve bakım ipuçları." />
        {posts.length ? (
          <ul className="mt-6 grid gap-x-8 sm:grid-cols-2">
            {posts.map((p) => (
              <li key={p.id} className="border-b border-border">
                <Link href={`/blog/${p.slug}`} className="flex items-baseline justify-between gap-4 py-3 hover:text-primary">
                  <span className="font-semibold leading-snug">{p.title}</span>
                  {p.category && <span className="shrink-0 text-xs text-muted">{p.category}</span>}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 text-sm text-muted">Yakında burada yazılarımızı yayınlayacağız. <Link href="/blog" className="font-semibold text-primary hover:underline">Blog sayfası</Link></p>
        )}
      </section>

      <section id="sozlesmeler" className="mt-16 scroll-mt-32">
        <SectionHead icon={<FileText size={18} />} title="Sözleşmeler ve politikalar" />
        <ul className="mt-6 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {[...footerLinks["Sözleşmeler"], { label: "Kullanım Koşulları", href: "/kullanim-kosullari" }].map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="flex items-center gap-2 rounded-[4px] bg-surface px-4 py-3 text-sm font-semibold hover:bg-primary hover:text-white"><FileText size={15} className="shrink-0 opacity-60" />{l.label}</Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function SectionHead({ icon, title, sub }: { icon: React.ReactNode; title: string; sub?: string }) {
  return (
    <div className="border-b border-border pb-4">
      <h2 className="flex items-center gap-2.5 text-2xl font-extrabold"><span className="grid h-9 w-9 place-items-center rounded-[4px] bg-primary text-white">{icon}</span>{title}</h2>
      {sub && <p className="mt-2 text-sm text-muted">{sub}</p>}
    </div>
  );
}

function LinkCard({ icon, title, links }: { icon: React.ReactNode; title: string; links: L[] }) {
  return (
    <div className="rounded-[4px] border border-border p-6">
      <h2 className="flex items-center gap-2.5 text-lg font-extrabold"><span className="grid h-8 w-8 place-items-center rounded-[4px] bg-surface-alt text-primary">{icon}</span>{title}</h2>
      <ul className="mt-4 space-y-1">
        {links.map((l) => (
          <li key={l.href + l.label}><Link href={l.href} className="flex items-center justify-between rounded-[4px] px-2 py-1.5 text-sm text-foreground/80 hover:bg-surface hover:text-primary">{l.label}<span aria-hidden className="text-muted">→</span></Link></li>
        ))}
      </ul>
    </div>
  );
}
