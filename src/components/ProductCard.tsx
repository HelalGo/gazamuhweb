"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import type { Product } from "@/lib/data";
import { tl, waLink } from "@/lib/utils";
import { useCart } from "@/store/cart";

export function ProductCard({ product: p, index = 0 }: { product: Product; index?: number }) {
  const add = useCart((s) => s.add);
  const noPrice = p.price <= 0;
  const discount = p.oldPrice && p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: (index % 3) * 0.08 }}
      className="group flex flex-col"
    >
      <Link
        href={`/urun/${p.slug}`}
        className="relative mb-4 block aspect-[4/3] overflow-hidden rounded-2xl bg-surface transition-colors group-hover:bg-surface-alt"
      >
        {p.imageUrl && <Image src={p.imageUrl} alt={p.name} fill sizes="(min-width:1280px) 30vw, 50vw" className="object-contain p-4" unoptimized />}
        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-white">%{discount}</span>
        )}
        {!p.inStock && (
          <span className="absolute right-3 top-3 rounded-full bg-foreground/80 px-2.5 py-1 text-xs font-bold text-white">Tükendi</span>
        )}
      </Link>
      <p className="text-xs text-muted">{p.brand}</p>
      <Link href={`/urun/${p.slug}`} className="mt-0.5 line-clamp-2 min-h-[2.75rem] font-bold leading-snug hover:text-primary">
        {p.name}
      </Link>
      <div className="mt-auto flex items-end justify-between gap-2 pt-4">
        <div>
          {noPrice ? (
            <span className="text-sm font-bold text-primary">Fiyat için arayın</span>
          ) : (
            <>
              {p.oldPrice && p.oldPrice > p.price && <p className="text-xs text-muted line-through">{tl(p.oldPrice)}</p>}
              <span className="text-lg font-extrabold text-primary">{tl(p.price)}</span>
            </>
          )}
        </div>
        {noPrice ? (
          <a href={waLink(p.name)} target="_blank" rel="noopener noreferrer" className="rounded-xl bg-[#25D366] px-3 py-2 text-sm font-bold text-white">
            Bilgi Al
          </a>
        ) : (
          <motion.button
            whileTap={{ scale: 0.94 }}
            disabled={!p.inStock}
            onClick={() => add(p)}
            className="rounded-xl bg-primary px-3 py-2 text-sm font-bold text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-surface-alt disabled:text-muted"
          >
            {p.inStock ? "Sepete Ekle" : "Tükendi"}
          </motion.button>
        )}
      </div>
    </motion.article>
  );
}
