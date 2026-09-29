"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import type { Product } from "@/lib/data";
import { ProductCard } from "../ProductCard";

export type Group = { name: string; slug: string; count: number; products: Product[] };

export function ProductTabs({ groups }: { groups: Group[] }) {
  const [active, setActive] = useState(0); // ilk gerçek grup; "Tümü" sekmesi tüm ürünler sayfasına gider
  const router = useRouter();
  if (!groups.length) return null;
  const g = groups[Math.min(active, groups.length - 1)];

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 md:px-6">
      <div className="mb-8">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-accent">Kategoriler</p>
        <h2 className="text-3xl font-light tracking-tight md:text-4xl">Ürün Gruplarımız</h2>
      </div>

      <div role="tablist" aria-label="Ürün grupları" className="-mx-4 mb-10 flex gap-1 overflow-x-auto border-b border-border px-4 [scrollbar-width:none] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden">
        <Link href="/urunler" role="tab" aria-selected={false} onMouseEnter={() => router.prefetch("/urunler")}
          className="relative shrink-0 whitespace-nowrap px-5 py-3.5 text-sm font-semibold text-muted transition-colors hover:text-foreground">
          Tümü
        </Link>
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
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
            {g.products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
