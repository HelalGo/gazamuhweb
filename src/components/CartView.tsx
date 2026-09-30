"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2 } from "lucide-react";
import { tl } from "@/lib/utils";
import { PAYMENT_SOON, WHATSAPP_NUMBER } from "@/lib/site";
import { useCart } from "@/store/cart";
import { BrandIcon } from "./SocialIcons";
import { CouponBox, SummaryRows, TermsCheck, useQuote } from "./CartSummary";
import { useCartReady } from "./useCartReady";

export function CartView() {
  const ready = useCartReady();
  const { items, setQty, remove, coupon, terms, setTerms } = useCart();
  const { q, loading } = useQuote(items, coupon);
  const router = useRouter();

  // WhatsApp siparişi: ürünler, kargo, kupon ve toplamla hazır mesaj (mobil uygulamadaki gibi)
  const whatsappOrder = () => {
    const lines = [
      "Merhaba, web sitesinden sipariş vermek istiyorum:",
      "",
      ...items.map((i) => `• ${i.name} × ${i.qty} = ${tl(i.price * i.qty)}`),
      "",
      ...(q ? [`Ara toplam: ${tl(q.subtotal)}`, `Kargo: ${q.shipping > 0 ? tl(q.shipping) : "Ücretsiz"}`] : []),
      ...(q?.coupon && q.discount > 0 ? [`İndirim (${q.coupon.code}): -${tl(q.discount)}`] : []),
      ...(q ? [`Toplam: ${tl(q.total)}`] : []),
      "",
      "Ön Bilgilendirme Formu ve Mesafeli Satış Sözleşmesi'ni okudum, kabul ediyorum.",
    ];
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener");
  };

  if (!ready) return <div className="h-48" />;
  if (!items.length)
    return (
      <div className="rounded-[4px] bg-surface p-12 text-center">
        <p className="text-lg font-bold">Sepetiniz boş</p>
        <p className="mt-1 text-sm text-muted">Beğendiğiniz ürünleri sepete ekleyerek başlayın.</p>
        <Link href="/urunler" className="mt-6 inline-block rounded-[4px] bg-primary px-7 py-3 text-sm font-semibold text-white">Ürünlere Göz At</Link>
      </div>
    );

  const btn = "grid h-8 w-8 place-items-center rounded-[4px] bg-surface hover:bg-surface-alt";
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
      <ul className="divide-y divide-border">
        {items.map((i) => {
          // eski sepetlerde görsel kayıtlı değil; sunucudaki sepet özetinden tamamlanır
          const image = i.image ?? q?.lines.find((l) => String(l.id) === i.id)?.image;
          return (
          <li key={i.id} className="flex flex-wrap items-center gap-4 py-5">
            <Link href={`/urun/${i.slug}`} className="relative block h-24 w-24 shrink-0 overflow-hidden rounded-[4px]" aria-hidden tabIndex={-1}>
              {image && <Image src={image} alt="" fill sizes="96px" unoptimized className="object-cover" />}
            </Link>
            <div className="min-w-0 flex-1 basis-40">
              <p className="text-xs text-muted">{i.brand}</p>
              <Link href={`/urun/${i.slug}`} className="line-clamp-2 font-semibold hover:text-primary">{i.name}</Link>
              <p className="mt-1 text-sm text-muted">{tl(i.price)}</p>
            </div>
            <div className="flex items-center gap-3">
              <button className={btn} aria-label="Azalt" onClick={() => setQty(i.id, i.qty - 1)} disabled={i.qty <= 1}><Minus size={14} /></button>
              <span className="w-6 text-center text-sm font-semibold tabular-nums">{i.qty}</span>
              <button className={btn} aria-label="Artır" onClick={() => setQty(i.id, i.qty + 1)} disabled={i.qty >= 20}><Plus size={14} /></button>
            </div>
            <p className="w-28 text-right font-bold text-primary">{tl(i.price * i.qty)}</p>
            <button onClick={() => remove(i.id)} aria-label="Sepetten çıkar" className="text-muted hover:text-red-600"><Trash2 size={18} /></button>
          </li>
          );
        })}
      </ul>

      <aside className="h-fit rounded-[4px] bg-surface p-6 lg:sticky lg:top-40">
        <h2 className="text-lg font-bold">Sipariş Özeti</h2>
        <SummaryRows items={items} q={q} loading={loading} />
        <CouponBox q={q} loading={loading} />
        <TermsCheck checked={terms} onChange={setTerms} />
        {q?.problems[0] && <p role="alert" className="mt-4 rounded-[4px] bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{q.problems[0]}</p>}
        <button onClick={() => router.push("/siparis")} disabled={!terms || !!q?.problems.length}
          title={!terms ? "Devam etmek için sözleşmeyi onaylayın" : undefined}
          className="mt-5 block w-full rounded-[4px] bg-primary py-3.5 text-center text-sm font-semibold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
          Siparişi Tamamla <span className="font-normal opacity-80">· Havale / EFT</span>
        </button>
        <button onClick={whatsappOrder} disabled={!terms || !!q?.problems.length}
          title={!terms ? "Devam etmek için sözleşmeyi onaylayın" : undefined}
          className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-[4px] bg-[#25D366] py-3.5 text-sm font-semibold text-white hover:bg-[#1fb857] disabled:cursor-not-allowed disabled:opacity-50">
          <BrandIcon name="whatsapp" size={17} />WhatsApp ile sipariş ver
        </button>
        <p className="mt-3 text-[11px] leading-relaxed text-muted">{PAYMENT_SOON}</p>
        <p className="mt-3 text-xs leading-relaxed text-muted">Fiyatlar sipariş anında güncel fiyat üzerinden kesinleşir.</p>
      </aside>
    </div>
  );
}
