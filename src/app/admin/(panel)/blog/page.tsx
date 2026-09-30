import Link from "next/link";
import type { RowDataPacket } from "mysql2";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { ensureBlogTable, blogDate } from "@/lib/blog";
import { db } from "@/lib/db";
import { deleteBlogPost, toggleBlogPost } from "../../blog-actions";
import { ConfirmButton } from "../_client";
import { Badge, Empty, Notice, PageHead, btnPrimary, iconBtn } from "../_ui";

export default async function BlogAdmin({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  await ensureBlogTable();
  const [rows] = await db().query<RowDataPacket[]>("SELECT id, slug, title, category, cover_url, active, published_at, published_at > NOW() AS scheduled FROM blog_posts ORDER BY published_at DESC, id DESC");
  return (
    <>
      <PageHead title="Blog Yazıları" sub="Sitede Blog sayfasında (alt bilgideki bağlantı) ve mobil uygulamada Hesabım → Blog'da yayınlanır. Yayın tarihi ileri bir gün seçilirse yazı o gün kendiliğinden yayına girer." newHref="/admin/blog/new" newLabel="Yeni Yazı" />
      <Notice saved={saved} />
      {!rows.length ? (
        <Empty text="Henüz blog yazısı yok." action={<Link href="/admin/blog/new" className={btnPrimary}><Plus size={16} />İlk yazıyı ekle</Link>} />
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => {
            const scheduled = !!r.scheduled; // yayın tarihi henüz gelmemiş
            return (
              <li key={r.id} className={`flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-white p-3 pr-4 shadow-sm ${r.active ? "" : "opacity-70"}`}>
                <Link href={`/admin/blog/${r.id}`} className="h-16 w-28 shrink-0 overflow-hidden rounded-xl bg-surface">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {r.cover_url && <img src={r.cover_url} alt="" className="h-full w-full object-cover" />}
                </Link>
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/blog/${r.id}`} className="line-clamp-1 font-semibold hover:text-primary">{r.title}</Link>
                  <p className="line-clamp-1 text-xs text-muted">
                    {[r.category, blogDate(new Date(r.published_at)), scheduled ? "ileri tarihli" : null].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <form action={toggleBlogPost}><input type="hidden" name="id" value={r.id} />
                  <button title="Yayınla / gizle"><Badge on={!!r.active} /></button>
                </form>
                <div className="flex items-center">
                  {r.active && !scheduled ? (
                    <a href={`/blog/${r.slug}`} target="_blank" className={iconBtn} aria-label="Sitede gör" title="Sitede gör"><ExternalLink size={16} /></a>
                  ) : null}
                  <Link href={`/admin/blog/${r.id}`} className={iconBtn} aria-label="Düzenle" title="Düzenle"><Pencil size={16} /></Link>
                  <form action={deleteBlogPost}><input type="hidden" name="id" value={r.id} />
                    <ConfirmButton message="Bu yazı ve görselleri kalıcı olarak silinecek. Emin misiniz?" className={`${iconBtn} hover:bg-red-50 hover:text-red-600`} aria-label="Sil" title="Sil"><Trash2 size={16} /></ConfirmButton>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
