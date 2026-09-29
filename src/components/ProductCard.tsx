"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Info, ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/data";
import { tl } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { FavoriteButton } from "./FavoriteButton";

export function ProductCard({ product: p, index = 0 }: { product: Product; index?: number }) {
  const add = useCart((s) => s.add);
  const noPrice = p.price <= 0;
  const discount = p.oldPrice && p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0;
  const hover = p.images[0]; // üzerine gelince görünen ikinci görsel
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: (index % 4) * 0.06 }}
      className="group flex flex-col"
    >
      <div className="relative">
        <Link href={`/urun/${p.slug}`} className="relative block aspect-square overflow-hidden rounded-[4px] bg-surface">
          {p.imageUrl && (
            <Image src={p.imageUrl} alt={p.name} fill sizes="(min-width:1280px) 25vw, (min-width:640px) 33vw, 50vw" unoptimized
              className={`object-cover transition-all duration-700 ${hover ? "group-hover:opacity-0" : "group-hover:scale-105"}`} />
          )}
          {hover && (
            <Image src={hover} alt="" fill sizes="(min-width:1280px) 25vw, (min-width:640px) 33vw, 50vw" unoptimized
              className="scale-105 object-cover opacity-0 transition-all duration-700 group-hover:scale-100 group-hover:opacity-100" />
          )}
          <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {discount > 0 && <span className="rounded-[4px] bg-accent px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-white">-%{discount}</span>}
            {!p.inStock && <span className="rounded-[4px] bg-foreground px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-white">Tükendi</span>}
          </div>
        </Link>
        <FavoriteButton id={p.id} className="absolute right-3 top-3" />
      </div>

      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">{p.brand}</p>
      <Link href={`/urun/${p.slug}`} className="mt-1.5 line-clamp-2 min-h-[2.75rem] text-[15px] font-semibold leading-snug transition-colors hover:text-primary">
        {p.name}
      </Link>
      <div className="mt-auto flex items-end justify-between gap-3 pt-3">
        <div className="min-w-0">
          {noPrice ? (
            <span className="text-sm font-semibold text-primary">Fiyat için arayın</span>
          ) : (
            <>
              {p.oldPrice && p.oldPrice > p.price && <p className="text-xs text-muted line-through">{tl(p.oldPrice)}</p>}
              <span className="text-lg font-bold text-primary">{tl(p.price)}</span>
            </>
          )}
        </div>
        {noPrice || !p.inStock ? (
          <Link href={`/bilgi-al?urun=${encodeURIComponent(p.slug)}`} aria-label="Bilgi al" title="Bilgi al"
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-[4px] border border-primary px-3 text-xs font-bold uppercase tracking-wider text-primary transition-colors hover:bg-primary hover:text-white">
            <Info size={15} />Bilgi al
          </Link>
        ) : (
          <motion.button whileTap={{ scale: 0.94 }} onClick={() => add(p)} aria-label="Sepete ekle" title="Sepete ekle"
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-[4px] bg-primary px-3 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-primary/90">
            <ShoppingBag size={15} />Sepete ekle
          </motion.button>
        )}
      </div>
    </motion.article>
  );
}
