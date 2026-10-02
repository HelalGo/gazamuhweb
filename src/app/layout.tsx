import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/SmoothScroll";
import { BRAND, SITE } from "@/lib/seo";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const DESC = "İstanbul'da İGDAŞ yetkili bayi GAZ-A Mühendislik: kombi, klima, ısı pompası, radyatör ve şofbende uygun fiyat, faturalı ve garantili ürün, montaj, bakım ve servis.";

// Sitenin genel meta bilgileri. Sayfalar kendi başlık, açıklama ve asıl adreslerini (canonical) ekler;
// göreli adresler metadataBase ile tam adrese çevrilir.
export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "GAZ-A Mühendislik | Kombi, Klima, Isı Pompası | İGDAŞ Yetkili Bayi",
  description: DESC,
  applicationName: BRAND,
  openGraph: { type: "website", locale: "tr_TR", siteName: BRAND, images: [{ url: "/brand/og.jpg", width: 1200, height: 630, alt: BRAND }] },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
