"use client";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowRight, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import type { Slide } from "@/lib/home";
import { SlideArt } from "./SlideArt";

const INTERVAL = 6500;

const container = { hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.25 } } };
const item = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" as const } } };

export function HeroSlider({ slides }: { slides: Slide[] }) {
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();
  const go = useCallback((n: number) => setI((n + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (reduce) return;
    const t = setTimeout(() => go(i + 1), INTERVAL);
    return () => clearTimeout(t);
  }, [i, reduce, go]);

  const s = slides[i];
  const btnPrimary = "inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-primary transition hover:bg-white/90";
  const btnGhost = "inline-flex items-center gap-2 rounded-full border border-white/40 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-white/10";

  return (
    <section aria-roledescription="carousel" aria-label="Öne çıkanlar" className="relative h-svh min-h-[600px] w-full overflow-hidden bg-primary text-white">
      <AnimatePresence initial={false}>
        <motion.div
          key={s.id}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
          onDragEnd={(_, info) => {
            if (info.offset.x < -80) go(i + 1);
            else if (info.offset.x > 80) go(i - 1);
          }}
        >
          {s.image ? (
            <Image src={s.image} alt="" fill priority sizes="100vw" className="object-cover" unoptimized />
          ) : (
            <SlideArt variant={s.art} />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b1d45]/85 via-[#0b1d45]/35 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* İçerik: sabit header'ın altından başlar */}
      <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl items-center px-4 pb-24 pt-36 md:px-6">
        <AnimatePresence mode="wait">
          <motion.div key={s.id} variants={container} initial="hidden" animate="show" exit={{ opacity: 0, transition: { duration: 0.25 } }} className="max-w-2xl">
            <motion.p variants={item} className="mb-4 inline-block rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-widest backdrop-blur">
              {s.eyebrow}
            </motion.p>
            <motion.h1 variants={item} className="text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              {s.title}
            </motion.h1>
            <motion.p variants={item} className="mt-5 max-w-xl text-base text-white/85 sm:text-lg">{s.text}</motion.p>
            <motion.div variants={item} className="mt-8 flex flex-wrap gap-3">
              {s.cta.external ? (
                <a href={s.cta.href} target="_blank" rel="noopener noreferrer" className={btnPrimary}>{s.cta.label} <ArrowRight size={16} /></a>
              ) : (
                <Link href={s.cta.href} className={btnPrimary}>{s.cta.label} <ArrowRight size={16} /></Link>
              )}
              {s.cta2 && <Link href={s.cta2.href} className={btnGhost}>{s.cta2.label}</Link>}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Oklar */}
      {slides.length > 1 && (
        <>
          <button onClick={() => go(i - 1)} aria-label="Önceki slayt"
            className="absolute left-4 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/15 backdrop-blur transition hover:bg-white/30 md:grid">
            <ChevronLeft />
          </button>
          <button onClick={() => go(i + 1)} aria-label="Sonraki slayt"
            className="absolute right-4 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/15 backdrop-blur transition hover:bg-white/30 md:grid">
            <ChevronRight />
          </button>
        </>
      )}

      {/* İlerleme çubukları */}
      <div className="absolute inset-x-0 bottom-8 z-20 flex justify-center gap-3 px-4">
        {slides.map((sl, n) => (
          <button key={sl.id} onClick={() => go(n)} aria-label={`${n + 1}. slayt`} aria-current={n === i} className="group py-2">
            <span className="block h-1 w-12 overflow-hidden rounded-full bg-white/30 sm:w-16">
              {n === i && !reduce ? (
                <motion.span key={`${i}-bar`} className="block h-full bg-white" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: INTERVAL / 1000, ease: "linear" }} />
              ) : (
                <span className={`block h-full bg-white transition-all ${n < i || (n === i && reduce) ? "w-full" : "w-0"}`} />
              )}
            </span>
          </button>
        ))}
      </div>

      <div className="absolute bottom-8 left-6 z-20 hidden items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/70 lg:flex">
        Keşfet <ChevronDown size={16} className="animate-bounce" />
      </div>
    </section>
  );
}
