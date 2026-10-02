import type { Metadata } from "next";
import { JsonLd } from "@/components/JsonLd";
import { articleLd, breadcrumbLd } from "@/lib/seo";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, MessageCircle, Phone } from "lucide-react";
import { BlogContent } from "@/components/BlogContent";
import { Breadcrumb } from "@/components/Breadcrumb";
import { blogDate, getPost, getPosts } from "@/lib/blog";
import { contact } from "@/lib/site";
import { PostCard } from "@/components/BlogCards";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getPost((await params).slug);
  if (!p) return { title: "Yazı bulunamadı" };
  return {
    title: `${p.title} | GAZ-A Mühendislik Blog`,
    description: p.excerpt,
    alternates: { canonical: `/blog/${p.slug}` },
    openGraph: { title: p.title, description: p.excerpt ?? undefined, type: "article", url: `/blog/${p.slug}`, publishedTime: p.publishedAt.toISOString(), images: p.cover ? [p.cover] : undefined },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getPost((await params).slug);
  if (!post) notFound();
  const others = (await getPosts({ limit: 12 })).filter((p) => p.id !== post.id);
  const related = [...others.filter((p) => post.category && p.category === post.category), ...others.filter((p) => !post.category || p.category !== post.category)].slice(0, 3);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-8 pt-40 md:px-6">
      <JsonLd data={[articleLd(post), breadcrumbLd([{ name: "Ana Sayfa", url: "/" }, { name: "Blog", url: "/blog" }, { name: post.title, url: `/blog/${post.slug}` }])]} />
      <Breadcrumb crumbs={[{ label: "Ana Sayfa", href: "/" }, { label: "Blog", href: "/blog" }, { label: post.title }]} />

      <article className="mx-auto mt-10 max-w-3xl">
        <header>
          {post.category && (
            <Link href={`/blog?kategori=${encodeURIComponent(post.category)}`} className="text-[11px] font-semibold uppercase tracking-[0.25em] text-accent hover:text-primary">{post.category}</Link>
          )}
          <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight md:text-5xl md:leading-[1.1]">{post.title}</h1>
          {post.excerpt && <p className="mt-5 text-lg leading-relaxed text-muted">{post.excerpt}</p>}
          <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 border-y border-border py-4 text-sm text-muted">
            <span className="font-semibold text-foreground">GAZ-A Mühendislik</span>
            <span>{blogDate(post.publishedAt)}</span>
            <span className="inline-flex items-center gap-1.5"><Clock size={14} />{post.readMin} dk okuma</span>
          </p>
        </header>
      </article>

      {post.cover && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.cover} alt="" className="mx-auto mt-10 aspect-[16/9] w-full max-w-5xl rounded-[4px] object-cover" />
      )}

      <div className="mx-auto mt-12 max-w-3xl">
        <BlogContent blocks={post.blocks} />

        {/* yazı sonu: danışmanlık çağrısı */}
        <aside className="mt-16 rounded-[4px] bg-primary p-8 text-white md:p-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-white/60">Uzmanına danışın</p>
          <h2 className="mt-3 text-2xl font-extrabold leading-snug">Projeniz için doğru çözümü birlikte belirleyelim</h2>
          <p className="mt-3 leading-relaxed text-white/75">Keşif, ürün seçimi ve montaj için mühendislerimizden bilgi alın.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/bilgi-al" className="inline-flex items-center justify-center gap-2 rounded-[4px] bg-white px-6 py-3 text-sm font-bold text-primary transition hover:bg-white/90">
              <MessageCircle size={17} />Bilgi al
            </Link>
            <a href={`tel:+9${contact.phone.replace(/\s/g, "")}`} className="inline-flex items-center justify-center gap-2 rounded-[4px] border-2 border-white/40 px-6 py-3 text-sm font-bold transition hover:border-white">
              <Phone size={17} />{contact.phone}
            </a>
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-24 border-t border-border pt-14">
          <h2 className="text-2xl font-extrabold">Diğer yazılar</h2>
          <div className="mt-8 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => <PostCard key={p.id} post={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
