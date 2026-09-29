"use client";
import { useActionState } from "react";
import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { submitLead, type LeadState } from "@/app/(site)/bilgi-al/actions";

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

export function LeadForm({ slug }: { slug?: string }) {
  const [state, action, pending] = useActionState<LeadState, FormData>(submitLead, null);

  if (state?.ok)
    return (
      <div role="status" className="flex flex-col items-center rounded-[4px] bg-surface p-10 text-center">
        <CircleCheck size={48} className="text-green-600" />
        <p className="mt-4 text-xl font-extrabold">Talebiniz bize ulaştı</p>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">Teşekkür ederiz. Ekibimiz en kısa sürede verdiğiniz telefon numarasından size dönüş yapacak.</p>
        <Link href={slug ? `/urun/${slug}` : "/urunler"} className="mt-6 rounded-[4px] bg-primary px-7 py-3 text-sm font-semibold text-white">
          {slug ? "Ürüne geri dön" : "Ürünlere göz at"}
        </Link>
      </div>
    );

  return (
    <form action={action} className="space-y-5">
      {slug && <input type="hidden" name="urun" value={slug} />}
      {/* Botlar için tuzak alan: gerçek kullanıcı görmez */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Ad Soyad"><input name="full_name" required minLength={3} maxLength={160} autoComplete="name" className={inputCls} /></Field>
        <Field label="Telefon"><input name="phone" type="tel" required autoComplete="tel" placeholder="05xx xxx xx xx" className={inputCls} /></Field>
        <Field label="E-posta (isteğe bağlı)"><input name="email" type="email" maxLength={190} autoComplete="email" className={inputCls} /></Field>
        <Field label="Şehir / İlçe (isteğe bağlı)"><input name="city" maxLength={80} autoComplete="address-level2" placeholder="Örn. Sancaktepe" className={inputCls} /></Field>
      </div>
      <Field label="Mesajınız (isteğe bağlı)">
        <textarea name="message" rows={4} maxLength={2000} placeholder="Örn. Kurulum dahil fiyat almak istiyorum, 120 m² daire." className={inputCls} />
      </Field>

      <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed text-muted">
        <input type="checkbox" name="kvkk" required className="peer sr-only" />
        <span className={box + " mt-0.5"}>
          <svg viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 6.5l2.5 2.5 4.5-5.5" /></svg>
        </span>
        <span>Bilgilerimin bu talebe dönüş yapılması amacıyla işlenmesine ilişkin <a href="/kvkk-aydinlatma-metni" target="_blank" className="font-semibold text-accent hover:underline">KVKK Aydınlatma Metni</a>&apos;ni okudum.</span>
      </label>

      {state?.error && <p role="alert" className="rounded-[4px] bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{state.error}</p>}
      <button disabled={pending} className="w-full rounded-[4px] bg-primary py-3.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60 sm:w-auto sm:px-12">
        {pending ? "Gönderiliyor…" : "Bilgi Talebi Gönder"}
      </button>
    </form>
  );
}
