import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/Breadcrumb";
import { FeaturedCard, PostCard } from "@/components/BlogCards";
import { getBlogCategories, getPosts } from "@/lib/blog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog | GAZ-A Mühendislik",
  description: "Kombi, klima, ısı pompası ve doğalgaz tesisatı üzerine rehberler, bakım önerileri ve sektörden haberler.",
};

export default async function BlogIndex({ searchParams }: { searchParams: Promise<{ kategori?: string }> }) {
  const { kategori } = await searchParams;
  const [posts, cats] = await Promise.all([getPosts({ category: kategori }), getBlogCategories()]);
  const [first, ...rest] = posts;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-8 pt-40 md:px-6">
      <Breadcrumb crumbs={[{ label: "Ana Sayfa", href: "/" }, { label: "Blog" }]} />
      <header className="mt-8 max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-accent">Blog</p>
        <h1 className="mt-3 text-4xl font-light tracking-tight md:text-5xl">Rehberler ve öneriler</h1>
        <p className="mt-4 leading-relaxed text-muted">Isıtma, soğutma ve doğalgaz sistemlerinde doğru ürünü seçmek, verimli kullanmak ve bakımını yapmak için uzman ekibimizin hazırladığı yazılar.</p>
      </header>

      {cats.length > 1 && (
        <nav className="mt-8 flex flex-wrap gap-2" aria-label="Kategoriler">
          <Chip href="/blog" active={!kategori}>Tümü</Chip>
          {cats.map((c) => <Chip key={c} href={`/blog?kategori=${encodeURIComponent(c)}`} active={kategori === c}>{c}</Chip>)}
        </nav>
      )}

      {!posts.length ? (
        <p className="mt-12 rounded-[4px] bg-surface p-12 text-center text-muted">{kategori ? "Bu kategoride henüz yazı yok." : "Yakında burada yazılarımızı yayınlayacağız."}</p>
      ) : (
        <>
          <FeaturedCard post={first} />
          {rest.length > 0 && (
            <div className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((p) => <PostCard key={p.id} post={p} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link href={href} aria-current={active ? "page" : undefined}
      className={`rounded-[4px] border px-4 py-2 text-sm font-semibold transition-colors ${active ? "border-primary bg-primary text-white" : "border-border hover:border-primary hover:text-primary"}`}>
      {children}
    </Link>
  );
}
