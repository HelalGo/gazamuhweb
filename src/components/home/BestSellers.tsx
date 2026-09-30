"use client";
import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useSpring } from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { Product } from "@/lib/data";
import { ProductCard } from "../ProductCard";

// Yana kaydırmalı en çok satanlar (mevsimin öne çıkan kategorisi): kaydırma çubuğu yerine ilerleme çizgisi ve oklar
export function BestSellers({ products, eyebrow, title, href, linkLabel }: { products: Product[]; eyebrow: string; title: string; href: string; linkLabel: string }) {
  const track = useRef<HTMLDivElement>(null);
  const { scrollXProgress } = useScroll({ container: track });
  const progress = useSpring(scrollXProgress, { stiffness: 180, damping: 30 });
  if (!products.length) return null;

  const go = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    el.scrollBy({ left: dir * ((card?.offsetWidth ?? 300) + 24) * 2, behavior: "smooth" });
  };

  return (
    <section className="overflow-hidden pb-14 pt-20 lg:pb-16 lg:pt-28">
      <div className="mx-auto mb-10 flex w-full max-w-7xl flex-wrap items-end justify-between gap-6 px-4 md:px-6">
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-accent">{eyebrow}</p>
          <h2 className="text-3xl font-light tracking-tight md:text-5xl">{title}</h2>
        </div>
        <Link href={href} className="border-b border-primary pb-1 text-xs font-bold uppercase tracking-[0.2em] text-primary transition-colors hover:border-accent hover:text-accent">
          {linkLabel}
        </Link>
      </div>

      <div ref={track}
        className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth scroll-px-4 px-4 pb-2 [scrollbar-width:none] md:scroll-px-[max(1.5rem,calc((100vw_-_80rem)/2_+_1.5rem))] md:px-[max(1.5rem,calc((100vw_-_80rem)/2_+_1.5rem))] [&::-webkit-scrollbar]:hidden">
        {products.map((p, i) => (
          <motion.div key={p.id} data-card className="relative w-[72vw] shrink-0 snap-start sm:w-[300px]"
            initial={{ opacity: 0, x: 60 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: Math.min(i, 4) * 0.08, ease: [0.22, 1, 0.36, 1] }}>
            <span aria-hidden className="pointer-events-none absolute -top-7 left-1 z-10 text-5xl font-extralight tabular-nums text-primary/15">
              {String(i + 1).padStart(2, "0")}
            </span>
            <ProductCard product={p} />
          </motion.div>
        ))}
        <div aria-hidden className="w-px shrink-0" />
      </div>

      <div className="mx-auto mt-10 flex w-full max-w-7xl items-center gap-6 px-4 md:px-6">
        <div className="relative h-px flex-1 bg-border">
          <motion.div className="absolute inset-y-0 left-0 w-full origin-left bg-primary" style={{ scaleX: progress, height: 2, top: -0.5 }} />
        </div>
        <div className="flex gap-2">
          <button onClick={() => go(-1)} aria-label="Önceki ürünler"
            className="grid h-11 w-11 place-items-center rounded-full border border-border text-primary transition-colors hover:border-primary hover:bg-primary hover:text-white">
            <ArrowLeft size={18} />
          </button>
          <button onClick={() => go(1)} aria-label="Sonraki ürünler"
            className="grid h-11 w-11 place-items-center rounded-full border border-border text-primary transition-colors hover:border-primary hover:bg-primary hover:text-white">
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
