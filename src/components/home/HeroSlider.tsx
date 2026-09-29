"use client";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { HeroSlide } from "@/lib/cms";
import { SlideArt } from "./SlideArt";

const INTERVAL = 6500;

const container = { hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.25 } } };
const item = { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" as const } } };

const isExternal = (u: string) => /^https?:\/\//i.test(u);

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();
  const count = slides.length;
  const go = useCallback((n: number) => setI((n + count) % count), [count]);

  useEffect(() => {
    if (reduce || count < 2) return;
    const t = setTimeout(() => go(i + 1), INTERVAL);
    return () => clearTimeout(t);
  }, [i, reduce, count, go]);

  if (!count) return null;
  const s = slides[Math.min(i, count - 1)];
  const hasContent = !!(s.eyebrow || s.title || s.text || s.buttons.length);
  const btn = "rounded-[4px] px-7 py-3.5 text-sm font-semibold transition";

  return (
    <section aria-roledescription="carousel" aria-label="Öne çıkanlar" className="relative h-svh min-h-[560px] w-full overflow-hidden bg-primary text-white">
      <AnimatePresence initial={false}>
        <motion.div
          key={s.id}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          drag={count > 1 ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.12}
          onDragEnd={(_, info) => {
            if (info.offset.x < -80) go(i + 1);
            else if (info.offset.x > 80) go(i - 1);
          }}
        >
          {s.image ? (
            <picture>
              {s.mobileImage && <source media="(max-width: 767px)" srcSet={s.mobileImage} />}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.image} alt={s.title} className="absolute inset-0 h-full w-full select-none object-cover" draggable={false} />
            </picture>
          ) : (
            <SlideArt variant={s.art ?? "klima"} />
          )}
          {(s.overlay || !s.image) && <div className="absolute inset-0 bg-gradient-to-r from-[#0b1d45]/80 via-[#0b1d45]/30 to-transparent" />}
        </motion.div>
      </AnimatePresence>

      {/* İçerik: sabit header'ın altından başlar */}
      {hasContent && (
        <div className="pointer-events-none relative z-10 mx-auto flex h-full w-full max-w-7xl items-center px-4 pb-24 pt-36 md:px-6">
          <AnimatePresence mode="wait">
            <motion.div key={s.id} variants={container} initial="hidden" animate="show" exit={{ opacity: 0, transition: { duration: 0.25 } }} className="pointer-events-auto max-w-2xl">
              {s.eyebrow && (
                <motion.p variants={item} className="mb-4 inline-block rounded-[4px] bg-white/15 px-3 py-1.5 text-xs font-bold uppercase tracking-widest backdrop-blur">
                  {s.eyebrow}
                </motion.p>
              )}
              {s.title && <motion.h1 variants={item} className="text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">{s.title}</motion.h1>}
              {s.text && <motion.p variants={item} className="mt-5 max-w-xl text-base text-white/85 sm:text-lg">{s.text}</motion.p>}
              {s.buttons.length > 0 && (
                <motion.div variants={item} className="mt-8 flex flex-wrap gap-3">
                  {s.buttons.map((b, n) => {
                    const cls = `${btn} ${n === 0 ? "bg-white text-primary hover:bg-white/90" : "border border-white/50 text-white hover:bg-white/10"}`;
                    return isExternal(b.url) ? (
                      <a key={n} href={b.url} target="_blank" rel="noopener noreferrer" className={cls}>{b.label}</a>
                    ) : (
                      <Link key={n} href={b.url} className={cls}>{b.label}</Link>
                    );
                  })}
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {count > 1 && (
        <>
          <button onClick={() => go(i - 1)} aria-label="Önceki slayt"
            className="absolute left-4 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/15 backdrop-blur transition hover:bg-white/30 md:grid">
            <ChevronLeft />
          </button>
          <button onClick={() => go(i + 1)} aria-label="Sonraki slayt"
            className="absolute right-4 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/15 backdrop-blur transition hover:bg-white/30 md:grid">
            <ChevronRight />
          </button>
          <div className="absolute inset-x-0 bottom-8 z-20 flex justify-center gap-3 px-4">
            {slides.map((sl, n) => (
              <button key={sl.id} onClick={() => go(n)} aria-label={`${n + 1}. slayt`} aria-current={n === i} className="py-2">
                <span className="block h-1 w-12 overflow-hidden rounded-full bg-white/30 sm:w-16">
                  {n === i && !reduce ? (
                    <motion.span key={`${i}-bar`} className="block h-full bg-white" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: INTERVAL / 1000, ease: "linear" }} />
                  ) : (
                    <span className={`block h-full bg-white ${n < i || (n === i && reduce) ? "w-full" : "w-0"}`} />
                  )}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
