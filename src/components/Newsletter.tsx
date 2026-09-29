"use client";
import { useActionState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, CircleCheck, Mail } from "lucide-react";
import { subscribeAction, type SubState } from "@/app/(site)/abonelik/actions";

// Alt bilginin en üstündeki bülten aboneliği
export function Newsletter() {
  const [state, action, pending] = useActionState<SubState, FormData>(subscribeAction, null);
  return (
    <section className="relative isolate overflow-hidden bg-primary text-white">
      <div className="absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-14 md:px-6 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-16">
        <div className="flex items-start gap-5">
          <span className="hidden h-14 w-14 shrink-0 place-items-center rounded-full bg-white/10 sm:grid"><Mail size={24} /></span>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">Bülten</p>
            <h2 className="mt-2 text-2xl font-light tracking-tight md:text-3xl">Kampanyalardan ilk siz haberdar olun.</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/70">Sezon fırsatları, yeni ürünler ve enerji tasarrufu önerileri; ayda birkaç e-posta, fazlası değil.</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {state?.ok ? (
            <motion.p key="ok" role="status" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 rounded-[4px] bg-white/10 px-5 py-4 text-sm font-semibold">
              <CircleCheck size={20} className="shrink-0 text-accent" />{state.ok}
            </motion.p>
          ) : (
            <motion.form key="form" action={action} exit={{ opacity: 0, y: -10 }} className="space-y-3">
              <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" />
              <div className="flex overflow-hidden rounded-[4px] bg-white p-1.5 focus-within:ring-2 focus-within:ring-accent">
                <input name="email" type="email" required maxLength={190} autoComplete="email" placeholder="E-posta adresiniz" aria-label="E-posta adresiniz"
                  className="min-w-0 flex-1 bg-transparent px-4 text-sm text-foreground outline-none placeholder:text-muted" />
                <button disabled={pending}
                  className="inline-flex h-11 shrink-0 items-center gap-2 rounded-[4px] bg-primary px-5 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-[#0b1d45] disabled:opacity-60">
                  {pending ? "Gönderiliyor" : <>Abone ol <ArrowRight size={15} /></>}
                </button>
              </div>
              <label className="flex cursor-pointer items-start gap-2.5 text-xs leading-relaxed text-white/70">
                <input type="checkbox" name="consent" required className="mt-0.5 h-4 w-4 shrink-0 accent-[#2099d0]" />
                <span>
                  Kampanya ve duyurular için tarafıma ticari elektronik ileti gönderilmesine onay veriyorum.{" "}
                  <Link href="/kvkk-aydinlatma-metni" className="font-semibold text-white underline-offset-2 hover:underline">KVKK Aydınlatma Metni</Link>
                </span>
              </label>
              {state?.error && <p role="alert" className="text-xs font-semibold text-red-200">{state.error}</p>}
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
