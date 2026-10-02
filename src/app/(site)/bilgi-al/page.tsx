import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { LeadForm } from "@/components/LeadForm";
import { getProduct } from "@/lib/products";
import { whatsappUrl } from "@/lib/home";
import { contact } from "@/lib/site";
import { tl } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Bilgi ve Teklif Al | Kombi, Klima Keşif ve Montaj | GAZ-A Mühendislik",
  description: "Kombi, klima, ısı pompası ve radyatör için ücretsiz bilgi ve fiyat teklifi alın. Keşif, doğalgaz projesi, montaj ve servis İstanbul'da.",
  alternates: { canonical: "/bilgi-al" },
};
export const dynamic = "force-dynamic";

export default async function InfoPage({ searchParams }: { searchParams: Promise<{ urun?: string }> }) {
  const { urun } = await searchParams;
  const p = urun ? await getProduct(urun) : undefined;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-8 pt-40 md:px-6">
      <Breadcrumb crumbs={[{ label: "Ana Sayfa", href: "/" }, ...(p ? [{ label: p.name, href: `/urun/${p.slug}` }] : []), { label: "Bilgi Al" }]} />
      <h1 className="mt-6 text-2xl font-extrabold md:text-3xl">{p ? "Bu ürün hakkında bilgi alın" : "Bilgi alın"}</h1>
      <p className="mb-8 mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        Bilgilerinizi bırakın; uzman ekibimiz fiyat, stok, kurulum ve teslimat hakkında en kısa sürede sizi arasın.
      </p>

      <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
        <LeadForm slug={p?.slug} />

        <aside className="order-first space-y-4 lg:order-none">
          {p && (
            <Link href={`/urun/${p.slug}`} className="group block overflow-hidden rounded-[4px] bg-surface transition-colors hover:bg-surface-alt">
              <div className="relative aspect-square overflow-hidden">
                {p.imageUrl && <Image src={p.imageUrl} alt={p.name} fill sizes="400px" className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized />}
              </div>
              <div className="p-5">
              <p className="text-xs text-muted">{p.brand}{p.sku ? ` · ${p.sku}` : ""}</p>
              <p className="mt-1 font-bold leading-snug">{p.name}</p>
              <p className="mt-3 text-xl font-extrabold text-primary">{p.price > 0 ? tl(p.price) : "Fiyat için arayın"}</p>
              <p className={`mt-1 text-xs font-semibold ${p.inStock ? "text-green-600" : "text-red-600"}`}>{p.inStock ? "Stokta var" : "Stokta yok"}</p>
              </div>
            </Link>
          )}
          <div className="space-y-3 rounded-[4px] bg-surface p-5 text-sm">
            <p className="font-bold">Hemen ulaşmak isterseniz</p>
            <a href={`tel:+9${contact.phone.replace(/\s/g, "")}`} className="flex items-center gap-3 hover:text-primary"><Phone size={16} className="text-primary" />{contact.phone}</a>
            <a href={`mailto:${contact.email}`} className="flex items-center gap-3 hover:text-primary"><Mail size={16} className="text-primary" />{contact.email}</a>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-primary"><MessageCircle size={16} className="text-primary" />WhatsApp&apos;tan yazın</a>
          </div>
        </aside>
      </div>
    </div>
  );
}
