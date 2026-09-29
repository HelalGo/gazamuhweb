"use client";
import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Ürün detay galerisi: küçük resimler (masaüstünde solda dikey, telefonda altta yatay) + büyük görsel
export function ProductGallery({ images, name, children }: { images: string[]; name: string; children?: React.ReactNode }) {
  const [i, setI] = useState(0);
  const go = (d: number) => setI((n) => (n + d + images.length) % images.length);
  const many = images.length > 1;

  const thumbs = many && (
    <div className="flex gap-3 overflow-x-auto [scrollbar-width:none] md:max-h-[640px] md:flex-col md:overflow-y-auto md:overflow-x-visible" data-lenis-prevent>
      {images.map((src, n) => (
        <button key={src} onClick={() => setI(n)} aria-label={`${n + 1}. görsel`} aria-current={n === i}
          className={`relative aspect-square w-20 shrink-0 overflow-hidden rounded-[4px] border-2 transition-colors ${n === i ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"}`}>
          <Image src={src} alt="" fill sizes="80px" className="object-cover" unoptimized />
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row">
      {thumbs}
      <div className="group relative aspect-square flex-1 overflow-hidden rounded-[4px] bg-surface">
        <AnimatePresence initial={false} mode="popLayout">
          {images[i] && (
            <motion.div key={images[i]} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <Image src={images[i]} alt={name} fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" unoptimized priority={i === 0} />
            </motion.div>
          )}
        </AnimatePresence>
        {many && (
          <>
            <button onClick={() => go(-1)} aria-label="Önceki görsel"
              className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-[4px] bg-white/90 text-primary shadow transition md:opacity-0 md:group-hover:opacity-100">
              <ChevronLeft size={20} />
            </button>
            <button onClick={() => go(1)} aria-label="Sonraki görsel"
              className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-[4px] bg-white/90 text-primary shadow transition md:opacity-0 md:group-hover:opacity-100">
              <ChevronRight size={20} />
            </button>
            <span className="absolute bottom-3 right-3 rounded-[4px] bg-white/90 px-2 py-1 text-xs font-semibold tabular-nums text-primary">{i + 1} / {images.length}</span>
          </>
        )}
        {children}
      </div>
    </div>
  );
}
