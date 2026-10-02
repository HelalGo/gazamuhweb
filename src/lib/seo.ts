import type { Product } from "./data";
import { company, contact, igdas, socials, WHATSAPP_NUMBER } from "./site";

// Arama motoru verileri: sitenin asıl adresi, yapılandırılmış veri (schema.org JSON-LD) ve açıklama metinleri.
// Asıl adres gazamuhendislik.com.tr'dir; diğer alan adları (kombiklimago.com) buraya 301 ile yönlenir.
export const SITE = (process.env.SITE_URL || "https://gazamuhendislik.com.tr").replace(/\/$/, "");
export const BRAND = "GAZ-A Mühendislik";
export const abs = (u: string) => (/^https?:/.test(u) ? u : `${SITE}${u.startsWith("/") ? "" : "/"}${u}`);

// Açıklama metni: satır sonları ve madde işaretleri temizlenir, ~155 karakterde kelime sınırından kesilir
export function summary(text: string, max = 155) {
  const t = text.replace(/[•*#>\r\n\t]+/g, " ").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return t.slice(0, t.lastIndexOf(" ", max - 1)).replace(/[,;:.\s]+$/, "") + "…";
}

// Firma: yerel işletme (HVACBusiness) + web sitesi arama kutusu
export function siteLd() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "HVACBusiness",
      "@id": `${SITE}/#firma`,
      name: BRAND,
      legalName: company.title,
      url: SITE,
      logo: abs("/brand/logo.png"),
      image: abs("/brand/og.jpg"),
      telephone: `+${WHATSAPP_NUMBER}`,
      email: contact.email,
      priceRange: "₺₺",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Eyüp Sultan Mah. Merkez Cad. No: 18 A",
        addressLocality: "Sancaktepe",
        addressRegion: "İstanbul",
        addressCountry: "TR",
      },
      areaServed: { "@type": "City", name: "İstanbul" },
      taxID: company.taxNo,
      description: `İstanbul'da ${igdas.title.toLocaleLowerCase("tr")} (yetki no ${igdas.no}). Kombi, klima, ısı pompası, radyatör ve şofben satışı; doğalgaz projesi, montaj, bakım ve servis.`,
      sameAs: socials.filter((s) => s.icon !== "whatsapp").map((s) => s.href),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${SITE}/#site`,
      name: BRAND,
      url: SITE,
      inLanguage: "tr-TR",
      publisher: { "@id": `${SITE}/#firma` },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${SITE}/urunler?q={search_term_string}` },
        "query-input": "required name=search_term_string",
      },
    },
  ];
}

export function breadcrumbLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: abs(it.url) })),
  };
}

// Ürün: Google'da fiyat, stok ve (yorum varsa) yıldız puanı olarak görünür
export function productLd(p: Product, rating: { avg: number; count: number }) {
  const images = [p.imageUrl, ...p.images].filter((x): x is string => !!x).map(abs);
  const url = abs(`/urun/${p.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#urun`,
    name: p.name,
    description: summary(p.description, 500),
    image: images.length ? images : undefined,
    sku: p.sku ?? undefined,
    category: p.category,
    brand: { "@type": "Brand", name: p.brand },
    offers: p.price > 0 ? {
      "@type": "Offer",
      url,
      priceCurrency: "TRY",
      price: p.price.toFixed(2),
      priceValidUntil: `${new Date().getFullYear()}-12-31`,
      availability: p.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@id": `${SITE}/#firma` },
    } : undefined,
    aggregateRating: rating.count > 0 ? {
      "@type": "AggregateRating",
      ratingValue: rating.avg.toFixed(1),
      reviewCount: rating.count,
      bestRating: 5,
      worstRating: 1,
    } : undefined,
  };
}

export function articleLd(a: { title: string; excerpt: string | null; cover: string | null; slug: string; publishedAt: Date; updatedAt: Date }) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: a.title,
    description: a.excerpt ?? undefined,
    image: a.cover ? [abs(a.cover)] : undefined,
    datePublished: a.publishedAt.toISOString(),
    dateModified: a.updatedAt.toISOString(),
    mainEntityOfPage: abs(`/blog/${a.slug}`),
    author: { "@type": "Organization", name: BRAND, url: SITE },
    publisher: { "@id": `${SITE}/#firma` },
    inLanguage: "tr-TR",
  };
}
