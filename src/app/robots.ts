import type { MetadataRoute } from "next";

const SITE = (process.env.SITE_URL || "https://gazamuhendislik.com.tr").replace(/\/$/, "");

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/hesabim", "/sepet", "/siparis"] },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
