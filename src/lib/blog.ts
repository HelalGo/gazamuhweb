import type { RowDataPacket } from "mysql2";
import { db } from "./db";
import { cleanBlocks, readingMinutes, type BlogBlock } from "./blog-types";

export * from "./blog-types";

const dbOn = () => !!process.env.DB_HOST && !process.env.DB_HOST.startsWith("BURAYA");

export type BlogPost = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  cover: string | null;
  blocks: BlogBlock[];
  active: boolean;
  publishedAt: Date;
  updatedAt: Date;
  readMin: number;
};

// Blog tablosu sonradan eklendi; yoksa oluşturulur (sunucuda ayrıca kurulum gerekmez)
export async function ensureBlogTable() {
  await db().query(`CREATE TABLE IF NOT EXISTS blog_posts (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(200) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    excerpt VARCHAR(400) NULL,
    category VARCHAR(80) NULL,
    cover_url VARCHAR(500) NULL,
    content MEDIUMTEXT NOT NULL,
    active TINYINT(1) NOT NULL DEFAULT 1,
    published_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_pub (active, published_at)
  ) CHARACTER SET utf8mb4`);
}

const fromRow = (r: RowDataPacket): BlogPost => {
  let blocks: BlogBlock[] = [];
  try { blocks = cleanBlocks(JSON.parse(r.content)); } catch {}
  return {
    id: r.id, slug: r.slug, title: r.title, excerpt: r.excerpt ?? "", category: r.category ?? "", cover: r.cover_url,
    blocks, active: !!r.active, publishedAt: new Date(r.published_at), updatedAt: new Date(r.updated_at), readMin: readingMinutes(blocks),
  };
};

// Yayındaki yazılar, en yeni önce (yayın tarihi ileri bir tarihse o gün gelince görünür)
export async function getPosts(opts: { category?: string; limit?: number } = {}): Promise<BlogPost[]> {
  if (!dbOn()) return [];
  try {
    await ensureBlogTable();
    const [rows] = await db().query<RowDataPacket[]>(
      `SELECT * FROM blog_posts WHERE active = 1 AND published_at <= NOW() ${opts.category ? "AND category = ?" : ""}
       ORDER BY published_at DESC, id DESC LIMIT ?`,
      [...(opts.category ? [opts.category] : []), opts.limit ?? 200]
    );
    return rows.map(fromRow);
  } catch (e) {
    console.error("[blog] yazılar okunamadı:", (e as Error).message);
    return [];
  }
}

export async function getPost(slug: string): Promise<BlogPost | null> {
  if (!dbOn()) return null;
  try {
    await ensureBlogTable();
    const [rows] = await db().query<RowDataPacket[]>("SELECT * FROM blog_posts WHERE slug = ? AND active = 1 AND published_at <= NOW()", [slug]);
    return rows[0] ? fromRow(rows[0]) : null;
  } catch {
    return null;
  }
}

export async function getBlogCategories(): Promise<string[]> {
  if (!dbOn()) return [];
  try {
    await ensureBlogTable();
    const [rows] = await db().query<RowDataPacket[]>(
      "SELECT category, COUNT(*) n FROM blog_posts WHERE active = 1 AND published_at <= NOW() AND category IS NOT NULL AND category <> '' GROUP BY category ORDER BY n DESC");
    return rows.map((r) => r.category);
  } catch {
    return [];
  }
}

export const blogDate = (d: Date) => d.toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });

// Admin ve uygulama API'si için özet (içerik blokları olmadan)
export const postSummary = (p: BlogPost) => ({
  slug: p.slug, title: p.title, excerpt: p.excerpt, category: p.category, cover: p.cover, date: blogDate(p.publishedAt), readMin: p.readMin,
});
