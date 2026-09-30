"use server";
import type { RowDataPacket } from "mysql2";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { blogImages, cleanBlocks, ensureBlogTable, autoExcerpt } from "@/lib/blog";
import { db } from "@/lib/db";
import { slugify } from "@/lib/slug";
import { removeImage, saveImage } from "@/lib/uploads";

const COVER_REQ = { w: 1200, h: 675, ratio: false } as const; // 16:9 kapak
const INLINE_REQ = { w: 800, h: 400, ratio: false } as const; // yazı içi görsel, oran serbest

const str = (f: FormData, k: string, max: number) => String(f.get(k) ?? "").trim().slice(0, max);
const back = (path: string, err: string): never => redirect(`${path}?err=${encodeURIComponent(err)}`);

// Düzenleyicideki "Görsel" bloğu için anında yükleme; kaydedilmeden önce çağrılır
export async function uploadBlogImage(f: FormData): Promise<{ url?: string; error?: string }> {
  await requireAdmin();
  const file = f.get("file");
  if (!(file instanceof File) || !file.size) return { error: "Dosya seçilmedi." };
  const res = await saveImage(file, INLINE_REQ);
  return "error" in res ? { error: res.error } : { url: res.url };
}

async function uniqueSlug(base: string, id: number | null) {
  let slug = base || "yazi";
  for (let n = 2; ; n++) {
    const [r] = await db().query<RowDataPacket[]>("SELECT id FROM blog_posts WHERE slug = ? AND id <> ?", [slug, id ?? 0]);
    if (!r.length) return slug;
    slug = `${base}-${n}`;
  }
}

export async function saveBlogPost(f: FormData) {
  await requireAdmin();
  await ensureBlogTable();
  const id = Number(f.get("id")) || null;
  const errPath = id ? `/admin/blog/${id}` : "/admin/blog/new";

  const title = str(f, "title", 200);
  if (!title) back(errPath, "Başlık zorunlu.");
  let blocks = [] as ReturnType<typeof cleanBlocks>;
  try { blocks = cleanBlocks(JSON.parse(String(f.get("content") ?? "[]"))); } catch {}
  if (!blocks.length) back(errPath, "Yazının içeriği boş. En az bir paragraf ekleyin.");

  const [old] = id ? await db().query<RowDataPacket[]>("SELECT cover_url, content FROM blog_posts WHERE id = ?", [id]) : [[] as RowDataPacket[]];

  let cover: string | null = null;
  const file = f.get("cover");
  if (file instanceof File && file.size) {
    const res = await saveImage(file, COVER_REQ);
    if ("error" in res) back(errPath, res.error);
    else cover = res.url;
  }

  const slug = await uniqueSlug(slugify(str(f, "slug", 200) || title).slice(0, 180), id);
  const date = str(f, "published_at", 20);
  const v: Record<string, unknown> = {
    title, slug,
    excerpt: str(f, "excerpt", 400) || autoExcerpt(blocks),
    category: str(f, "category", 80) || null,
    content: JSON.stringify(blocks),
    active: f.get("active") ? 1 : 0,
    // bugün seçildiyse hemen, ileri/geri bir gün seçildiyse o günün sabahı yayınlanır
    published_at: /^\d{4}-\d{2}-\d{2}$/.test(date) && date !== new Date().toISOString().slice(0, 10) ? `${date} 09:00:00` : new Date(),
  };
  if (cover) v.cover_url = cover;
  if (f.get("remove_cover") && !cover) v.cover_url = null;

  if (id) await db().query("UPDATE blog_posts SET ? WHERE id = ?", [v, id]);
  else await db().query("INSERT INTO blog_posts SET ?", [v]);

  // artık kullanılmayan görselleri sil (eski kapak, içerikten çıkarılan görseller)
  if (old[0]) {
    const keep = new Set([...blogImages(blocks), (v.cover_url === undefined ? old[0].cover_url : v.cover_url) as string]);
    let oldImgs: string[] = [];
    try { oldImgs = blogImages(cleanBlocks(JSON.parse(old[0].content))); } catch {}
    for (const u of [old[0].cover_url, ...oldImgs]) if (u && !keep.has(u)) await removeImage(u);
  }
  revalidatePath("/blog");
  redirect("/admin/blog?saved=1");
}

export async function deleteBlogPost(f: FormData) {
  await requireAdmin();
  const id = Number(f.get("id"));
  const [r] = await db().query<RowDataPacket[]>("SELECT cover_url, content FROM blog_posts WHERE id = ?", [id]);
  if (r[0]) {
    let imgs: string[] = [];
    try { imgs = blogImages(cleanBlocks(JSON.parse(r[0].content))); } catch {}
    for (const u of [r[0].cover_url, ...imgs]) if (u) await removeImage(u);
    await db().query("DELETE FROM blog_posts WHERE id = ?", [id]);
  }
  revalidatePath("/blog");
  redirect("/admin/blog");
}

export async function toggleBlogPost(f: FormData) {
  await requireAdmin();
  await db().query("UPDATE blog_posts SET active = 1 - active WHERE id = ?", [Number(f.get("id"))]);
  revalidatePath("/blog");
  redirect("/admin/blog");
}
