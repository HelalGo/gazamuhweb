"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { Info, Minus, Plus, ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/data";
import { tl } from "@/lib/utils";
import { useCart } from "@/store/cart";
import { FavoriteButton } from "./FavoriteButton";
import { useCartReady } from "./useCartReady";

export function ProductCard({ product: p, index = 0 }: { product: Product; index?: number }) {
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
        {/* Üzerine gelince görselin altında beliren bilgi bağlantısı */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-1/3 items-end justify-center rounded-b-[4px] bg-gradient-to-t from-[#0b1d45]/70 to-transparent pb-5 opacity-0 transition-opacity duration-500 group-hover:opacity-100 md:flex">
          <Link href={`/bilgi-al?urun=${encodeURIComponent(p.slug)}`}
            className="pointer-events-auto translate-y-2 text-sm font-semibold text-white underline decoration-white/60 underline-offset-4 transition-transform duration-500 group-hover:translate-y-0 hover:decoration-white">
            Bilgi al
          </Link>
        </div>
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
        {noPrice ? (
          <Link href={`/bilgi-al?urun=${encodeURIComponent(p.slug)}`} aria-label="Bilgi al" title="Bilgi al"
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-[4px] border border-primary px-3 text-xs font-bold uppercase tracking-wider text-primary transition-colors hover:bg-primary hover:text-white">
            <Info size={15} />Bilgi al
          </Link>
        ) : (
          <CartControl product={p} />
        )}
      </div>
    </motion.article>
  );
}

// Sepette yoksa "Sepete ekle"; sepetteyse sepet sayfasındaki gibi − adet + (1'in altına inince sepetten çıkar)
function CartControl({ product: p }: { product: Product }) {
  const ready = useCartReady();
  const qty = useCart((s) => s.items.find((i) => i.id === p.id)?.qty ?? 0);
  const { add, setQty, remove } = useCart.getState();
  const btn = "grid h-10 w-9 place-items-center text-primary transition-colors hover:bg-primary hover:text-white disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-primary";
  if (!ready || qty === 0)
    return (
      <motion.button whileTap={{ scale: 0.94 }} onClick={() => add(p)} disabled={!p.inStock} aria-label="Sepete ekle" title="Sepete ekle"
        className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-[4px] bg-primary px-3 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-surface-alt disabled:text-muted">
        <ShoppingBag size={15} />{p.inStock ? "Sepete ekle" : "Tükendi"}
      </motion.button>
    );
  return (
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      className="flex h-10 shrink-0 items-center overflow-hidden rounded-[4px] border border-primary" role="group" aria-label="Sepetteki adet">
      <button className={btn} aria-label={qty === 1 ? "Sepetten çıkar" : "Azalt"} onClick={() => (qty <= 1 ? remove(p.id) : setQty(p.id, qty - 1))}><Minus size={15} /></button>
      <span className="w-7 text-center text-sm font-bold tabular-nums text-primary" aria-live="polite">{qty}</span>
      <button className={btn} aria-label="Artır" onClick={() => setQty(p.id, qty + 1)} disabled={qty >= 20}><Plus size={15} /></button>
    </motion.div>
  );
}
