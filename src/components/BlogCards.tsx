import Link from "next/link";
import { Clock } from "lucide-react";
import { blogDate, type BlogPost } from "@/lib/blog";

// Blog liste kartları (blog ana sayfası ve yazı sonundaki "Diğer yazılar")
function Meta({ post }: { post: BlogPost }) {
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-muted">
      {post.category && <span className="uppercase tracking-[0.15em] text-accent">{post.category}</span>}
      <span>{blogDate(post.publishedAt)}</span>
      <span className="inline-flex items-center gap-1"><Clock size={13} />{post.readMin} dk okuma</span>
    </p>
  );
}

function Cover({ post, className }: { post: BlogPost; className: string }) {
  return (
    <div className={`overflow-hidden rounded-[4px] bg-surface ${className}`}>
      {post.cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.cover} alt="" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
      ) : (
        <div className="grid h-full place-items-center bg-gradient-to-br from-primary to-accent text-2xl font-extrabold tracking-[0.3em] text-white/80">GAZ-A</div>
      )}
    </div>
  );
}

export function FeaturedCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group mt-10 grid items-center gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-12">
      <Cover post={post} className="aspect-[16/9]" />
      <div>
        <Meta post={post} />
        <h2 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight transition-colors group-hover:text-primary md:text-4xl">{post.title}</h2>
        {post.excerpt && <p className="mt-4 leading-relaxed text-muted">{post.excerpt}</p>}
        <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary underline decoration-primary/30 underline-offset-4 group-hover:decoration-primary">
          Yazıyı oku
        </span>
      </div>
    </Link>
  );
}

export function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <Cover post={post} className="aspect-[16/10]" />
      <div className="mt-5"><Meta post={post} /></div>
      <h3 className="mt-3 text-xl font-bold leading-snug transition-colors group-hover:text-primary">{post.title}</h3>
      {post.excerpt && <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted">{post.excerpt}</p>}
    </Link>
  );
}
