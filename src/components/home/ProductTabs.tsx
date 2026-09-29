"use client";
import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import type { Product } from "@/lib/data";
import { ProductCard } from "../ProductCard";

export type Group = { name: string; slug: string; count: number; products: Product[] };

export function ProductTabs({ groups }: { groups: Group[] }) {
  const [active, setActive] = useState(0);
  if (!groups.length) return null;
  const g = groups[Math.min(active, groups.length - 1)];

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 md:px-6">
      <div className="mb-8">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-accent">Kategoriler</p>
        <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">Ürün Gruplarımız</h2>
      </div>

      <div role="tablist" aria-label="Ürün grupları" className="-mx-4 mb-10 flex gap-1 overflow-x-auto border-b border-border px-4 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden">
        {groups.map((t, n) => (
          <button
            key={t.slug}
            role="tab"
            aria-selected={n === active}
            onClick={() => setActive(n)}
            className={`relative shrink-0 whitespace-nowrap px-5 py-3.5 text-sm font-semibold transition-colors ${n === active ? "text-primary" : "text-muted hover:text-foreground"}`}
          >
            {t.name}
            {n === active && <motion.span layoutId="tab-underline" className="absolute inset-x-0 -bottom-px h-0.5 bg-primary" />}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={g.slug}
          role="tabpanel"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
        >
          <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {g.products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
          <div className="mt-10 text-center">
            <Link href={`/${g.slug}`} className="inline-block rounded-[4px] bg-surface px-7 py-3 text-sm font-semibold transition-colors hover:bg-surface-alt">
              {g.name} kategorisindeki {g.count} ürünü gör
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
