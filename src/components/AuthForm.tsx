"use client";
import { useActionState, useState } from "react";
import { motion } from "motion/react";
import { Eye, EyeOff } from "lucide-react";
import { login, register } from "@/app/(site)/actions";
import { Breadcrumb } from "./Breadcrumb";
import { useSite } from "./SiteProvider";

const inputCls = "w-full rounded-xl bg-surface px-4 py-3 text-sm outline-none transition-shadow placeholder:text-muted focus:ring-2 focus:ring-accent/50";
const box = "grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[5px] bg-surface-alt text-transparent transition-colors peer-checked:bg-primary peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-accent";
const tick = (
  <svg viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 6.5l2.5 2.5 4.5-5.5" />
  </svg>
);

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      {children}
    </label>
  );
}

export function AuthForm({ mode, next }: { mode: "login" | "register"; next?: string }) {
  const isLogin = mode === "login";
  const [error, action, pending] = useActionState(isLogin ? login : register, null);
  const { enabled } = useSite();
  const [show, setShow] = useState(false);
  const q = next ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-8 pt-40 md:px-6">
      <Breadcrumb crumbs={["Ana Sayfa", isLogin ? "Giriş Yap" : "Üye Ol"]} />

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="mx-auto mt-10 w-full max-w-md">
        <h1 className="text-2xl font-extrabold">{isLogin ? "Giriş Yap" : "Üye Ol"}</h1>
        <p className="mt-1 text-sm text-muted">
          {isLogin ? "Hesabınıza giriş yaparak siparişlerinizi ve favorilerinizi yönetin." : "Hesap oluşturarak sipariş verin, favorilerinizi ve yorumlarınızı yönetin."}
        </p>
        {!enabled && <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">Üyelik sistemi şu an kullanılamıyor.</p>}

        <form action={action} className="mt-8 space-y-5">
          {next && <input type="hidden" name="next" value={next} />}
          {!isLogin && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Ad"><input name="first_name" required autoComplete="given-name" className={inputCls} /></Field>
              <Field label="Soyad"><input name="last_name" required autoComplete="family-name" className={inputCls} /></Field>
            </div>
          )}
          <Field label="E-Posta"><input name="email" type="email" required autoComplete="email" placeholder="ornek@mail.com" className={inputCls} /></Field>
          {!isLogin && (
            <Field label="Telefon"><input name="phone" type="tel" required autoComplete="tel" placeholder="05xx xxx xx xx" className={inputCls} /></Field>
          )}
          <Field label="Parola">
            <div className="relative">
              <input
                name="password"
                type={show ? "text" : "password"}
                required
                minLength={isLogin ? 1 : 8}
                autoComplete={isLogin ? "current-password" : "new-password"}
                className={inputCls + " pr-12"}
              />
              <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Parolayı gizle" : "Parolayı göster"} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground">
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {!isLogin && <span className="mt-1.5 block text-xs text-muted">En az 8 karakter</span>}
          </Field>

          {isLogin ? (
            <label className="flex cursor-pointer items-center gap-2.5 text-sm">
              <input type="checkbox" name="remember" className="peer sr-only" />
              <span className={box}>{tick}</span> Beni hatırla
            </label>
          ) : (
            <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed text-muted">
              <input type="checkbox" name="kvkk" required className="peer sr-only" />
              <span className={box + " mt-0.5"}>{tick}</span>
              <span><a href="#" className="font-semibold text-accent hover:underline">KVKK Aydınlatma Metni</a>&apos;ni okudum ve kabul ediyorum.</span>
            </label>
          )}

          {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
          <motion.button whileTap={{ scale: 0.98 }} disabled={pending || !enabled} className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-white transition-colors hover:bg-primary/90 disabled:opacity-60">
            {pending ? "Lütfen bekleyin…" : isLogin ? "Giriş Yap" : "Üye Ol"}
          </motion.button>
        </form>

        <p className="mt-8 text-center text-sm text-muted">
          {isLogin ? "Henüz üye değil misiniz?" : "Zaten üye misiniz?"}{" "}
          <a href={(isLogin ? "/uye-ol" : "/giris") + q} className="font-bold text-primary hover:underline">{isLogin ? "Üye Ol" : "Giriş Yap"}</a>
        </p>
      </motion.div>
    </div>
  );
}
