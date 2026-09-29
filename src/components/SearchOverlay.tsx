"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { useLenis } from "lenis/react";
import { ArrowRight, Search, X } from "lucide-react";
import type { Product } from "@/lib/data";
import { searchProducts } from "@/lib/search";
import { tl } from "@/lib/utils";

let cache: Product[] | null = null; // sayfalar arası geçişte ürünler tekrar indirilmez

export function SearchOverlay({ popular, onClose }: { popular: string[]; onClose: () => void }) {
  const router = useRouter();
  const lenis = useLenis();
  const input = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [products, setProducts] = useState<Product[] | null>(cache);

  useEffect(() => {
    input.current?.focus();
    lenis?.stop();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", esc);
    if (!cache)
      fetch("/api/products").then((r) => r.json()).then((d: Product[]) => { cache = d; setProducts(d); }).catch(() => setProducts([]));
    return () => { lenis?.start(); document.body.style.overflow = prev; window.removeEventListener("keydown", esc); };
  }, [lenis, onClose]);

  const results = useMemo(() => (products && q.trim().length >= 2 ? searchProducts(products, q) : []), [products, q]);
  const go = (term: string) => { onClose(); router.push(`/urunler?q=${encodeURIComponent(term)}`); };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
      role="dialog" aria-modal aria-label="Ürün ara"
      className="fixed inset-0 z-[60] overflow-y-auto bg-white" data-lenis-prevent
    >
      <div className="mx-auto w-full max-w-5xl px-5 pb-16 pt-8 md:pt-14">
        <div className="flex items-center justify-between">
          <Image src="/brand/logo.png" alt="GAZ-A" width={242} height={58} className="h-10 w-auto md:h-12" />
          <button onClick={onClose} className="grid h-11 w-11 place-items-center rounded-[4px] text-primary transition hover:bg-surface" aria-label="Aramayı kapat">
            <X size={28} strokeWidth={1.5} />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); if (q.trim()) go(q.trim()); }}
          className="mt-10 flex items-center gap-4 border-b-2 border-primary pb-4 md:mt-16">
          <Search size={30} strokeWidth={1.75} className="shrink-0 text-primary" />
          <input
            ref={input} value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Ne arıyorsunuz?" aria-label="Aranacak kelime"
            className="w-full bg-transparent text-3xl font-light tracking-tight text-foreground outline-none placeholder:text-muted/50 md:text-5xl"
          />
          {q && <button type="button" onClick={() => { setQ(""); input.current?.focus(); }} className="shrink-0 text-sm font-semibold text-accent hover:text-primary">Temizle</button>}
        </form>

        {q.trim().length < 2 ? (
          <div className="mt-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Popüler aramalar</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {popular.map((t) => (
                <button key={t} onClick={() => setQ(t)}
                  className="rounded-[4px] border border-border bg-white px-5 py-2.5 text-sm font-semibold text-primary transition hover:border-primary hover:bg-primary hover:text-white">
                  {t}
                </button>
              ))}
            </div>
          </div>
        ) : !products ? (
          <p className="mt-12 text-sm text-muted">Ürünler yükleniyor…</p>
        ) : !results.length ? (
          <div className="mt-12">
            <p className="text-lg">“{q}” için sonuç bulunamadı.</p>
            <p className="mt-2 text-sm text-muted">Farklı bir kelime deneyin ya da <Link href="/bilgi-al" onClick={onClose} className="font-semibold text-primary hover:underline">bize sorun</Link>, sizin için bulalım.</p>
          </div>
        ) : (
          <div className="mt-10">
            <div className="mb-5 flex items-end justify-between gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{results.length} ürün bulundu</p>
              {results.length > 8 && (
                <button onClick={() => go(q.trim())} className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-accent">
                  Tüm sonuçlar <ArrowRight size={16} />
                </button>
              )}
            </div>
            <ul className="grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-4">
              {results.slice(0, 8).map((p) => (
                <li key={p.id}>
                  <Link href={`/urun/${p.slug}`} onClick={onClose} className="group block">
                    <div className="relative aspect-square overflow-hidden rounded-[4px] bg-surface">
                      {p.imageUrl && <Image src={p.imageUrl} alt={p.name} fill sizes="(min-width:768px) 25vw, 50vw" className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized />}
                    </div>
                    <p className="mt-3 text-xs text-muted">{p.brand}</p>
                    <p className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug group-hover:text-primary">{p.name}</p>
                    <p className="mt-1 text-sm font-bold text-primary">{p.price > 0 ? tl(p.price) : "Fiyat için arayın"}</p>
                  </Link>
                </li>
              ))}
            </ul>
            {results.length > 8 && (
              <button onClick={() => go(q.trim())} className="mx-auto mt-10 flex items-center gap-2 rounded-[4px] bg-primary px-7 py-3 text-sm font-semibold text-white hover:bg-primary/90">
                {results.length} sonucun tamamını gör <ArrowRight size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
