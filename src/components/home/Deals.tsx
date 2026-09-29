"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/data";
import { tl } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { ProductCard } from "../ProductCard";

const off = (p: Product) => (p.oldPrice && p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0);

// En yüksek indirimli ürün büyük kart olarak solda, diğerleri sağda 2x2
export function DealsGrid({ products }: { products: Product[] }) {
  const [hero, ...rest] = products;
  return (
    <div className="grid gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4 lg:grid-rows-[auto_auto]">
      <Feature product={hero} />
      <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:col-span-2 lg:row-span-2">
        {rest.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
      </div>
    </div>
  );
}

function Feature({ product: p }: { product: Product }) {
  const add = useCart((s) => s.add);
  const d = off(p);
  return (
    <motion.article initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.6 }}
      className="group flex flex-col overflow-hidden rounded-[4px] lg:col-span-2 lg:row-span-2">
      <Link href={`/urun/${p.slug}`} className="relative block aspect-square overflow-hidden bg-surface" aria-label={p.name}>
        {p.imageUrl && (
          <Image src={p.imageUrl} alt={p.name} fill sizes="(min-width:1024px) 50vw, 100vw" unoptimized
            className="object-cover transition-transform duration-[1.2s] group-hover:scale-105" />
        )}
        {d > 0 && (
          <span className="absolute left-0 top-0 bg-accent px-6 py-5 text-white">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.3em] text-white/80">İndirim</span>
            <span className="block text-4xl font-extrabold tabular-nums">%{d}</span>
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col justify-end gap-6 bg-primary p-6 text-white sm:flex-row sm:items-end sm:justify-between md:p-8">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">{p.brand} · En yüksek indirim</p>
          <Link href={`/urun/${p.slug}`} className="mt-2 line-clamp-2 text-xl font-light leading-snug tracking-tight md:text-2xl">{p.name}</Link>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="whitespace-nowrap text-2xl font-bold md:text-3xl">{tl(p.price)}</span>
            {d > 0 && <span className="whitespace-nowrap text-sm text-white/60 line-through">{tl(p.oldPrice!)}</span>}
          </div>
        </div>
        <motion.button whileTap={{ scale: 0.95 }} onClick={() => add(p)}
          className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-[4px] bg-white px-6 text-xs font-bold uppercase tracking-[0.18em] text-primary transition hover:bg-accent hover:text-white">
          <ShoppingBag size={16} />Sepete ekle
        </motion.button>
      </div>
    </motion.article>
  );
}
