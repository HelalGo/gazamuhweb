"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";
import { services } from "@/lib/home";
import { Icon } from "./Icons";

const STEP = 6000; // otomatik geçiş süresi (ms)

// Solda numaralı hizmet listesi, sağda seçili hizmetin kartı; kart kendiliğinden sıradakine geçer
export function ServicesShowcase() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setI((n) => (n + 1) % services.length), STEP);
    return () => clearTimeout(t);
  }, [i, paused]);

  const s = services[i];
  const pad = (n: number) => String(n + 1).padStart(2, "0");

  return (
    <div className="grid gap-14 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-20" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">Hizmetlerimiz</p>
        <h2 className="mt-6 text-4xl font-extralight leading-[1.08] tracking-tight md:text-6xl">
          Projeden bakıma,<br />
          <span className="font-semibold text-accent">tek adres.</span>
        </h2>
        <p className="mt-6 max-w-md text-base leading-relaxed text-white/70">
          Isıtma, soğutma ve iklimlendirme sistemlerinde keşiften kuruluma, bakımdan onarıma kadar tüm süreci tek ekiple yürütüyoruz.
        </p>

        <ul className="mt-10 space-y-1">
          {services.map((x, n) => (
            <li key={x.title}>
              <button onClick={() => setI(n)} aria-current={n === i}
                className="group flex w-full items-center gap-5 py-3 text-left">
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-xs font-semibold tabular-nums transition-colors ${n === i ? "bg-accent text-white" : "border border-white/25 text-white/60 group-hover:border-white/60"}`}>
                  {pad(n)}
                </span>
                <span className={`text-lg transition-colors ${n === i ? "font-semibold text-white" : "text-white/60 group-hover:text-white"}`}>{x.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative rounded-[4px] bg-white p-7 text-foreground shadow-2xl shadow-black/30 md:p-12">
        {/* ilerleme çubukları */}
        <div className="flex gap-2">
          {services.map((x, n) => (
            <button key={x.title} onClick={() => setI(n)} aria-label={x.title} className="relative h-0.5 flex-1 overflow-hidden bg-border">
              {n < i && <span className="absolute inset-0 bg-accent" />}
              {n === i && (
                <motion.span key={`${i}-${paused}`} className="absolute inset-y-0 left-0 bg-accent"
                  initial={{ width: paused ? "100%" : "0%" }} animate={{ width: "100%" }}
                  transition={{ duration: paused ? 0 : STEP / 1000, ease: "linear" }} />
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={s.title} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
            <div className="mt-10 flex items-start justify-between gap-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">
                  {pad(i)} / {pad(services.length - 1)} · Hizmet
                </p>
                <h3 className="mt-4 text-3xl font-light tracking-tight md:text-4xl">{s.title}</h3>
              </div>
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-[4px] bg-primary text-white"><Icon name={s.icon} size={30} /></span>
            </div>
            <p className="mt-5 max-w-lg leading-relaxed text-muted">{s.text}</p>
            <ul className="mt-8 grid gap-3">
              {s.points.map((p) => (
                <li key={p} className="flex items-center justify-between gap-4 rounded-[4px] border border-border px-5 py-4 text-sm font-medium">
                  {p}
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-surface-alt text-primary"><Check size={13} strokeWidth={3} /></span>
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>

        <Link href="/bilgi-al" className="mt-10 inline-flex rounded-[4px] bg-primary px-7 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-primary/90">
          Bu hizmet için bilgi al
        </Link>
      </div>
    </div>
  );
}
