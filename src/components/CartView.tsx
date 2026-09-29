"use client";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { tl } from "@/lib/utils";
import { cartTotal, useCart } from "@/store/cart";
import { useCartReady } from "./useCartReady";

export function CartView() {
  const ready = useCartReady();
  const { items, setQty, remove } = useCart();

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
        {items.map((i) => (
          <li key={i.id} className="flex flex-wrap items-center gap-4 py-5">
            <div className="min-w-0 flex-1 basis-56">
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
        ))}
      </ul>

      <aside className="h-fit rounded-[4px] bg-surface p-6 lg:sticky lg:top-40">
        <h2 className="text-lg font-bold">Sipariş Özeti</h2>
        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between"><dt className="text-muted">Ürünler ({items.reduce((t, i) => t + i.qty, 0)})</dt><dd className="font-semibold">{tl(cartTotal(items))}</dd></div>
        </dl>
        <div className="mt-5 flex justify-between border-t border-border pt-5 text-lg font-extrabold"><span>Toplam</span><span className="text-primary">{tl(cartTotal(items))}</span></div>
        <Link href="/siparis" className="mt-6 block rounded-[4px] bg-primary py-3.5 text-center text-sm font-semibold text-white hover:bg-primary/90">Siparişi Tamamla</Link>
        <p className="mt-3 text-xs leading-relaxed text-muted">Fiyatlar sipariş anında güncel fiyat üzerinden kesinleşir.</p>
      </aside>
    </div>
  );
}
