import { fail, json, preflight } from "@/lib/app-api";
import { getPost, getPosts, postSummary } from "@/lib/blog";

export const dynamic = "force-dynamic";
export const OPTIONS = preflight;

// Mobil blog yazısı: içerik blokları ve diğer yazılar
export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const post = await getPost((await params).slug);
  if (!post) return fail("Yazı bulunamadı.", 404);
  const others = (await getPosts({ limit: 12 })).filter((p) => p.id !== post.id);
  const related = [...others.filter((p) => post.category && p.category === post.category), ...others.filter((p) => !post.category || p.category !== post.category)].slice(0, 4);
  return json({ post: { ...postSummary(post), blocks: post.blocks }, related: related.map(postSummary) });
}
