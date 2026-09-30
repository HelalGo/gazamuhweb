"use client";
import { useActionState } from "react";
import Link from "next/link";
import { placeOrder } from "@/app/(site)/actions";
import { tl } from "@/lib/utils";
import { PAYMENT_SOON } from "@/lib/site";
import { useCart } from "@/store/cart";
import { BankCard } from "./BankCard";
import { CouponBox, SummaryRows, TermsCheck, useQuote } from "./CartSummary";
import { useCartReady } from "./useCartReady";
import { useSite } from "./SiteProvider";

const inputCls = "w-full rounded-[4px] bg-surface px-4 py-3 text-sm outline-none transition-shadow placeholder:text-muted focus:ring-2 focus:ring-accent/50";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      {children}
    </label>
  );
}

export function CheckoutForm({ defaults }: { defaults: { name: string; phone: string; email: string } }) {
  const ready = useCartReady();
  const { items, coupon, terms, setTerms } = useCart();
  const { q, loading } = useQuote(items, coupon);
  const { enabled } = useSite();
  const [error, action, pending] = useActionState(placeOrder, null);

  if (!ready) return <div className="h-48" />;
  if (!items.length)
    return (
      <div className="rounded-[4px] bg-surface p-12 text-center">
        <p className="text-lg font-bold">Sepetiniz boş</p>
        <Link href="/urunler" className="mt-6 inline-block rounded-[4px] bg-primary px-7 py-3 text-sm font-semibold text-white">Ürünlere Göz At</Link>
      </div>
    );

  const cartJson = JSON.stringify(items.map((i) => ({ id: Number(i.id), qty: i.qty })));

  return (
    <form action={action} className="grid gap-10 lg:grid-cols-[1fr_360px]">
      <input type="hidden" name="cart" value={cartJson} />
      <input type="hidden" name="coupon" value={q?.coupon?.code ?? ""} />
      <div className="space-y-5">
        <h2 className="text-lg font-bold">Teslimat Bilgileri</h2>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Ad Soyad"><input name="full_name" required defaultValue={defaults.name} autoComplete="name" className={inputCls} /></Field>
          <Field label="Telefon"><input name="phone" type="tel" required defaultValue={defaults.phone} autoComplete="tel" className={inputCls} /></Field>
          <Field label="E-Posta"><input name="email" type="email" required defaultValue={defaults.email} autoComplete="email" className={inputCls} /></Field>
          <Field label="Şehir"><input name="city" required autoComplete="address-level1" placeholder="İstanbul" className={inputCls} /></Field>
        </div>
        <Field label="Açık Adres"><textarea name="address" required rows={3} autoComplete="street-address" className={inputCls} /></Field>
        <Field label="Sipariş Notu (isteğe bağlı)"><textarea name="note" rows={2} className={inputCls} /></Field>

        <div className="rounded-[4px] bg-surface p-5 text-sm leading-relaxed text-muted">
          <p className="font-semibold text-foreground">Ödeme: Havale / EFT</p>
          <p className="mt-1">Siparişinizi onayladıktan sonra tutarı aşağıdaki hesaba gönderin ve açıklamaya sipariş numaranızı yazın. Ödemeniz ulaştığında siparişiniz hazırlanmaya başlar. Hesap bilgileri sipariş sonrası ekranda ve e-postanızda da yer alır.</p>
          <div className="mt-4"><BankCard compact /></div>
          <p className="mt-3 text-[11px]">{PAYMENT_SOON}</p>
        </div>

      </div>

      <aside className="h-fit rounded-[4px] bg-surface p-6 lg:sticky lg:top-40">
        <h2 className="text-lg font-bold">Sipariş Özeti</h2>
        <ul className="mt-5 space-y-3 text-sm">
          {items.map((i) => (
            <li key={i.id} className="flex justify-between gap-4">
              <span className="line-clamp-2 text-muted">{i.qty} × {i.name}</span>
              <span className="shrink-0 font-semibold">{tl(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 border-t border-border pt-1"><SummaryRows items={items} q={q} loading={loading} /></div>
        <CouponBox q={q} loading={loading} />
        <TermsCheck name="terms" checked={terms} onChange={setTerms} />
        {error && <p role="alert" className="mt-5 rounded-[4px] bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
        <button disabled={pending || !enabled || !terms || loading} className="mt-6 w-full rounded-[4px] bg-primary py-3.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60">
          {pending ? "Sipariş oluşturuluyor…" : "Siparişi Onayla"}
        </button>
        <Link href="/sepet" className="mt-3 block text-center text-sm text-muted hover:text-foreground">Sepete dön</Link>
      </aside>
    </form>
  );
}
