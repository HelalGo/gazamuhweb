import { json, preflight } from "@/lib/app-api";
import { getBlogCategories, getPosts, postSummary } from "@/lib/blog";

export const dynamic = "force-dynamic";
export const OPTIONS = preflight;

// Mobil blog listesi (?kategori= ile süzülebilir)
export async function GET(req: Request) {
  const category = new URL(req.url).searchParams.get("kategori") || undefined;
  const [posts, categories] = await Promise.all([getPosts({ category }), getBlogCategories()]);
  return json({ posts: posts.map(postSummary), categories });
}
