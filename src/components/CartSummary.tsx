"use client";
import { useEffect, useState } from "react";
import { Loader2, TicketPercent, X } from "lucide-react";
import { quoteCart } from "@/app/(site)/cart-actions";
import type { Quote } from "@/lib/pricing";
import { tl } from "@/lib/utils";
import { cartTotal, useCart, type Line } from "@/store/cart";

// Sepet değiştikçe (ve kupon uygulanınca) özet sunucudan yeniden hesaplanır
export function useQuote(items: Line[], coupon: string | null) {
  const [q, setQ] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const key = JSON.stringify([items.map((i) => [i.id, i.qty]), coupon]);
  useEffect(() => {
    let live = true;
    const t = setTimeout(async () => {
      setLoading(true);
      const r = await quoteCart(items.map((i) => ({ id: Number(i.id), qty: i.qty })), coupon);
      if (live) { setQ(r); setLoading(false); }
    }, 250);
    return () => { live = false; clearTimeout(t); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return { q, loading };
}

// Ürünler / kargo / indirim / toplam satırları
export function SummaryRows({ items, q, loading }: { items: Line[]; q: Quote | null; loading: boolean }) {
  const count = items.reduce((t, i) => t + i.qty, 0);
  const subtotal = q?.subtotal ?? cartTotal(items);
  return (
    <>
      <dl className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between"><dt className="text-muted">Ürünler ({count})</dt><dd className="font-semibold">{tl(subtotal)}</dd></div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Kargo{q?.shippingNote ? <span className="block text-xs">{q.shippingNote}</span> : null}</dt>
          <dd className="shrink-0 font-semibold">{!q ? "…" : q.shipping > 0 ? tl(q.shipping) : <span className="text-green-700">Ücretsiz</span>}</dd>
        </div>
        {q?.coupon && q.discount > 0 && (
          <div className="flex justify-between text-green-700"><dt>İndirim <span className="text-xs font-semibold">({q.coupon.code})</span></dt><dd className="font-semibold">−{tl(q.discount)}</dd></div>
        )}
      </dl>
      {q && q.freeOver > 0 && q.shipping > 0 && (
        <p className="mt-3 rounded-[4px] bg-white px-3 py-2 text-xs text-muted">
          <strong className="text-foreground">{tl(q.freeOver - (q.subtotal - q.discount))}</strong> daha ekleyin, kargo ücretsiz olsun.
        </p>
      )}
      <div className="mt-5 flex items-center justify-between border-t border-border pt-5 text-lg font-extrabold">
        <span>Toplam</span>
        <span className="flex items-center gap-2 text-primary">{loading && <Loader2 size={16} className="animate-spin text-muted" />}{q ? tl(q.total) : tl(subtotal)}</span>
      </div>
    </>
  );
}

// İndirim kuponu girme / kaldırma
export function CouponBox({ q, loading }: { q: Quote | null; loading: boolean }) {
  const coupon = useCart((s) => s.coupon);
  const setCoupon = useCart((s) => s.setCoupon);
  const [code, setCode] = useState("");
  const applied = coupon && q?.coupon;
  const error = coupon && q && !loading ? q.couponError : null;

  if (applied)
    return (
      <div className="mt-5 flex items-center gap-3 rounded-[4px] border border-green-200 bg-green-50 px-3 py-2.5">
        <TicketPercent size={18} className="shrink-0 text-green-700" />
        <p className="min-w-0 flex-1 text-sm"><span className="font-bold text-green-800">{q.coupon!.code}</span> <span className="text-green-700">· {q.coupon!.label}</span></p>
        <button type="button" onClick={() => setCoupon(null)} className="grid h-7 w-7 place-items-center rounded-[4px] text-green-800 hover:bg-green-100" aria-label="Kuponu kaldır" title="Kuponu kaldır"><X size={16} /></button>
      </div>
    );

  const apply = () => { const c = code.trim(); if (c) setCoupon(c); };
  return (
    <div className="mt-5">
      <label htmlFor="kupon" className="mb-1.5 block text-sm font-semibold">İndirim kuponu</label>
      <div className="flex gap-2">
        <input id="kupon" value={code} onChange={(e) => setCode(e.target.value.toLocaleUpperCase("tr-TR"))}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); apply(); } }}
          placeholder="Kupon kodunuz" maxLength={40} autoComplete="off"
          className="min-w-0 flex-1 rounded-[4px] border border-border bg-white px-3 py-2.5 text-sm uppercase outline-none placeholder:normal-case placeholder:text-muted focus:ring-2 focus:ring-accent/50" />
        <button type="button" onClick={apply} disabled={!code.trim() || (!!coupon && loading)}
          className="shrink-0 rounded-[4px] border border-primary px-4 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-white disabled:opacity-50">
          Uygula
        </button>
      </div>
      {error && (
        <p role="alert" className="mt-2 flex items-center justify-between gap-2 text-xs font-semibold text-red-700">
          {error}
          <button type="button" onClick={() => setCoupon(null)} className="shrink-0 underline">Temizle</button>
        </p>
      )}
    </div>
  );
}

// Sözleşme onayı (sipariş özetinin altında)
export function TermsCheck({ checked, onChange, name }: { checked: boolean; onChange: (v: boolean) => void; name?: string }) {
  return (
    <label className="mt-5 flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed text-muted">
      <input type="checkbox" name={name} checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span className="mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[4px] border border-border bg-white text-transparent transition-colors peer-checked:border-primary peer-checked:bg-primary peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-accent">
        <svg viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 6.5l2.5 2.5 4.5-5.5" /></svg>
      </span>
      <span>
        <a href="/on-bilgilendirme-formu" target="_blank" className="font-semibold text-accent hover:underline">Ön Bilgilendirme Formu</a>&apos;nu ve{" "}
        <a href="/mesafeli-satis-sozlesmesi" target="_blank" className="font-semibold text-accent hover:underline">Mesafeli Satış Sözleşmesi</a>&apos;ni okudum, kabul ediyorum.
      </span>
    </label>
  );
}
