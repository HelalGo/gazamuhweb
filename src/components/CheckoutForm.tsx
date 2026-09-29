"use client";
import { useActionState } from "react";
import Link from "next/link";
import { placeOrder } from "@/app/(site)/actions";
import { tl } from "@/lib/utils";
import { cartTotal, useCart } from "@/store/cart";
import { useCartReady } from "./useCartReady";
import { useSite } from "./SiteProvider";

const inputCls = "w-full rounded-[4px] bg-surface px-4 py-3 text-sm outline-none transition-shadow placeholder:text-muted focus:ring-2 focus:ring-accent/50";
const box = "grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[4px] bg-surface-alt text-transparent transition-colors peer-checked:bg-primary peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-accent";

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
  const items = useCart((s) => s.items);
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
          <p className="font-semibold text-foreground">Ödeme ve teslimat</p>
          <p className="mt-1">Siparişiniz alındıktan sonra ödeme ve teslimat ayrıntıları için sizinle iletişime geçilecektir.</p>
        </div>

        <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed text-muted">
          <input type="checkbox" name="terms" required className="peer sr-only" />
          <span className={box + " mt-0.5"}>
            <svg viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 6.5l2.5 2.5 4.5-5.5" /></svg>
          </span>
          <span>
            <a href="/on-bilgilendirme-formu" target="_blank" className="font-semibold text-accent hover:underline">Ön Bilgilendirme Formu</a>&apos;nu ve{" "}
            <a href="/mesafeli-satis-sozlesmesi" target="_blank" className="font-semibold text-accent hover:underline">Mesafeli Satış Sözleşmesi</a>&apos;ni okudum ve kabul ediyorum.
          </span>
        </label>
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
        <div className="mt-5 flex justify-between border-t border-border pt-5 text-lg font-extrabold"><span>Toplam</span><span className="text-primary">{tl(cartTotal(items))}</span></div>
        {error && <p role="alert" className="mt-5 rounded-[4px] bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
        <button disabled={pending || !enabled} className="mt-6 w-full rounded-[4px] bg-primary py-3.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60">
          {pending ? "Sipariş oluşturuluyor…" : "Siparişi Onayla"}
        </button>
        <Link href="/sepet" className="mt-3 block text-center text-sm text-muted hover:text-foreground">Sepete dön</Link>
      </aside>
    </form>
  );
}
