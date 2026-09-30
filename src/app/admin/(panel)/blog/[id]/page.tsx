import { notFound } from "next/navigation";
import type { RowDataPacket } from "mysql2";
import { Trash2 } from "lucide-react";
import { cleanBlocks, ensureBlogTable, type BlogBlock } from "@/lib/blog";
import { db } from "@/lib/db";
import { deleteBlogPost, saveBlogPost } from "../../../blog-actions";
import { ConfirmButton, ImageInput, SubmitButton } from "../../_client";
import { Label, Notice, PageHead, Toggle, btnPrimary, field } from "../../_ui";
import { BlogEditor } from "./BlogEditor";

export default async function BlogForm({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ err?: string }> }) {
  const { id } = await params;
  const { err } = await searchParams;
  const isNew = id === "new";
  await ensureBlogTable();
  let r: RowDataPacket = {} as RowDataPacket;
  let blocks: BlogBlock[] = [{ t: "p", text: "" }];
  if (!isNew) {
    const [rows] = await db().query<RowDataPacket[]>("SELECT * FROM blog_posts WHERE id = ?", [Number(id)]);
    if (!rows[0]) notFound();
    r = rows[0];
    try { blocks = cleanBlocks(JSON.parse(r.content)); } catch {}
  }
  const [cats] = await db().query<RowDataPacket[]>("SELECT DISTINCT category FROM blog_posts WHERE category IS NOT NULL AND category <> '' ORDER BY category");
  const date = (r.published_at ? new Date(r.published_at) : new Date()).toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHead title={isNew ? "Yeni Blog Yazısı" : "Yazıyı Düzenle"} back={{ href: "/admin/blog", label: "Blog Yazıları" }} />
      <Notice err={err} />
      <form action={saveBlogPost} className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {!isNew && <input type="hidden" name="id" value={id} />}
        <div className="min-w-0 space-y-5">
          <div className="space-y-5 rounded-2xl border border-border bg-white p-5 shadow-sm md:p-6">
            <Label text="Başlık">
              <input name="title" required defaultValue={r.title ?? ""} maxLength={200} placeholder="Örn. Kombi seçerken dikkat edilmesi gereken 7 şey" className={`${field} text-base font-semibold`} />
            </Label>
            <Label text="Özet (isteğe bağlı)" hint="Liste ve paylaşım önizlemelerinde görünür. Boş bırakılırsa ilk paragraftan üretilir.">
              <textarea name="excerpt" rows={2} defaultValue={r.excerpt ?? ""} maxLength={400} className={field} />
            </Label>
          </div>
          <BlogEditor initial={blocks} />
        </div>

        <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
          <div className="space-y-4 rounded-2xl border border-border bg-white p-5 shadow-sm">
            <Toggle name="active" defaultChecked={isNew ? true : !!r.active} label="Yayında" />
            <Label text="Yayın tarihi" hint="İleri bir tarih seçilirse o gün yayına girer.">
              <input type="date" name="published_at" defaultValue={date} className={field} />
            </Label>
            <Label text="Kategori (isteğe bağlı)">
              <input name="category" list="blog-cats" defaultValue={r.category ?? ""} maxLength={80} placeholder="Örn. Kombi Rehberi" className={field} />
              <datalist id="blog-cats">{cats.map((c) => <option key={c.category} value={c.category} />)}</datalist>
            </Label>
            <Label text="Bağlantı adresi (isteğe bağlı)" hint="Boş bırakılırsa başlıktan üretilir.">
              <input name="slug" defaultValue={r.slug ?? ""} maxLength={200} placeholder="kombi-secimi-rehberi" className={field} />
            </Label>
            <SubmitButton className={`${btnPrimary} w-full`}>{isNew ? "Yazıyı yayınla" : "Değişiklikleri kaydet"}</SubmitButton>
          </div>
          <div className="space-y-3 rounded-2xl border border-border bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold">Kapak görseli</p>
            <ImageInput name="cover" current={r.cover_url} hint="Önerilen 1200×675 px (16:9). Liste kartlarında ve yazının üstünde görünür." />
            {r.cover_url && (
              <label className="flex items-center gap-2 text-xs text-muted"><input type="checkbox" name="remove_cover" className="accent-[#1a3e85]" />Kapağı kaldır</label>
            )}
          </div>
        </aside>
      </form>

      {!isNew && (
        <form action={deleteBlogPost} className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50/50 p-5">
          <input type="hidden" name="id" value={id} />
          <div><p className="text-sm font-bold text-red-700">Yazıyı sil</p><p className="text-xs text-red-700/70">Bu işlem geri alınamaz; yazıdaki görseller de silinir.</p></div>
          <ConfirmButton message="Bu yazı kalıcı olarak silinecek. Emin misiniz?" className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"><Trash2 size={16} />Sil</ConfirmButton>
        </form>
      )}
    </div>
  );
}
