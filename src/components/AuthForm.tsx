"use client";
import { useState } from "react";
import { motion } from "motion/react";
import { Eye, EyeOff } from "lucide-react";
import { Breadcrumb } from "./Breadcrumb";

type Mode = "login" | "register";

const inputCls =
  "w-full rounded-xl bg-surface px-4 py-3 text-sm outline-none transition-shadow placeholder:text-muted focus:ring-2 focus:ring-accent/50";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      {children}
    </label>
  );
}

export function AuthForm({ mode }: { mode: Mode }) {
  const login = mode === "login";
  const [show, setShow] = useState(false);
  const [sent, setSent] = useState(false);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-8 pt-40 md:px-6">
      <Breadcrumb crumbs={["Ana Sayfa", login ? "Giriş Yap" : "Üye Ol"]} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mx-auto mt-10 w-full max-w-md"
      >
        <h1 className="text-2xl font-extrabold">{login ? "Giriş Yap" : "Üye Ol"}</h1>
        <p className="mt-1 text-sm text-muted">
          {login ? "Hesabınıza giriş yaparak siparişlerinizi takip edin." : "Hesap oluşturarak hızlıca alışveriş yapın."}
        </p>

        <form
          onSubmit={(e) => { e.preventDefault(); setSent(true); }}
          className="mt-8 space-y-5"
        >
          {!login && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Ad"><input required autoComplete="given-name" className={inputCls} /></Field>
              <Field label="Soyad"><input required autoComplete="family-name" className={inputCls} /></Field>
            </div>
          )}
          <Field label="E-Posta">
            <input type="email" required autoComplete="email" placeholder="ornek@mail.com" className={inputCls} />
          </Field>
          {!login && (
            <Field label="Telefon">
              <input type="tel" required autoComplete="tel" placeholder="05xx xxx xx xx" className={inputCls} />
            </Field>
          )}
          <Field label="Parola">
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                required
                minLength={6}
                autoComplete={login ? "current-password" : "new-password"}
                className={inputCls + " pr-12"}
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                aria-label={show ? "Parolayı gizle" : "Parolayı göster"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
              >
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </Field>

          {login ? (
            <div className="flex items-center justify-between text-sm">
              <label className="flex cursor-pointer items-center gap-2.5">
                <input type="checkbox" className="peer sr-only" />
                <span className="grid h-[18px] w-[18px] place-items-center rounded-[5px] bg-surface-alt text-transparent transition-colors peer-checked:bg-primary peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-accent">
                  <svg viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 6.5l2.5 2.5 4.5-5.5" /></svg>
                </span>
                Beni hatırla
              </label>
              <a href="#" className="font-semibold text-accent hover:underline">Şifremi Unuttum</a>
            </div>
          ) : (
            <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed text-muted">
              <input type="checkbox" required className="peer sr-only" />
              <span className="mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[5px] bg-surface-alt text-transparent transition-colors peer-checked:bg-primary peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-accent">
                <svg viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 6.5l2.5 2.5 4.5-5.5" /></svg>
              </span>
              <span><a href="#" className="font-semibold text-accent hover:underline">KVKK Aydınlatma Metni</a>'ni okudum ve kabul ediyorum.</span>
            </label>
          )}

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-white transition-colors hover:bg-primary/90"
          >
            {login ? "Giriş Yap" : "Üye Ol"}
          </motion.button>

          {sent && (
            <p role="status" className="rounded-xl bg-surface px-4 py-3 text-center text-sm text-muted">
              Üyelik sistemi henüz bağlanmadı; bu bir önizlemedir.
            </p>
          )}
        </form>

        <p className="mt-8 text-center text-sm text-muted">
          {login ? "Henüz üye değil misiniz?" : "Zaten üye misiniz?"}{" "}
          <a href={login ? "/uye-ol" : "/giris"} className="font-bold text-primary hover:underline">
            {login ? "Üye Ol" : "Giriş Yap"}
          </a>
        </p>
      </motion.div>
    </div>
  );
}
