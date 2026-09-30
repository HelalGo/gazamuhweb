import { appUser, fail, json, preflight } from "@/lib/app-api";
import { dbConfigured } from "@/lib/customer";
import { getProduct, getProducts } from "@/lib/products";
import { getReviews, reviewEligibility, type Eligibility } from "@/lib/reviews";

export const dynamic = "force-dynamic";
export const OPTIONS = preflight;

// Mobil ürün detayı: ürünün tüm bilgileri, yorumlar, kullanıcının yorum hakkı ve benzer ürünler
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return fail("Ürün bulunamadı.", 404);

  const user = await appUser(req).catch(() => null);
  const reviews = dbConfigured() ? await getReviews(p.id) : { list: [], summary: { avg: 0, count: 0 } };
  const eligibility: Eligibility = user ? await reviewEligibility(user.id, p.id).catch(() => "not-purchased" as Eligibility) : "guest";

  // benzer ürünler: aynı kategori, önce aynı marka, fiyatlı olanlar
  const related = (await getProducts())
    .filter((x) => x.id !== p.id && x.category === p.category && x.price > 0)
    .sort((a, b) => Number(b.brand === p.brand) - Number(a.brand === p.brand))
    .slice(0, 10)
    .map((x) => ({ id: x.id, slug: x.slug, name: x.name, brand: x.brand, category: x.category, price: x.price, oldPrice: x.oldPrice, inStock: x.inStock, imageUrl: x.imageUrl }));

  return json({
    product: {
      id: p.id, slug: p.slug, sku: p.sku, name: p.name, brand: p.brand, category: p.category,
      price: p.price, oldPrice: p.oldPrice, inStock: p.inStock, description: p.description, specs: p.specs,
      images: [p.imageUrl, ...p.images].filter((x): x is string => !!x),
    },
    reviews,
    eligibility,
    related,
  });
}
