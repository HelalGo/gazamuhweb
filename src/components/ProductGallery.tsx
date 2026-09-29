"use client";
import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

// Ürün detay galerisi: küçük resimler (masaüstünde solda dikey, telefonda altta yatay) + büyük görsel.
// Büyük görsele tıklanınca veya "Görseli büyüt" ile tam ekran görüntüleyici açılır.
export function ProductGallery({ images, name, children }: { images: string[]; name: string; children?: React.ReactNode }) {
  const [i, setI] = useState(0);
  const [full, setFull] = useState(false);
  const many = images.length > 1;
  const go = useCallback((d: number) => setI((n) => (n + d + images.length) % images.length), [images.length]);

  const thumbs = many && (
    <div className="flex gap-3 overflow-x-auto [scrollbar-width:none] md:max-h-[560px] md:flex-col md:overflow-y-auto md:overflow-x-visible" data-lenis-prevent>
      {images.map((src, n) => (
        <button key={src} onClick={() => setI(n)} aria-label={`${n + 1}. görsel`} aria-current={n === i}
          className={`relative aspect-square w-20 shrink-0 overflow-hidden rounded-[4px] border-2 bg-white transition-colors ${n === i ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"}`}>
          <Image src={src} alt="" fill sizes="80px" className="object-contain" unoptimized />
        </button>
      ))}
    </div>
  );

  return (
    <div>
      {/* items-start: küçük resim sütunu büyük görseli uzatıp kare oranını bozmasın */}
      <div className="flex flex-col-reverse gap-3 md:flex-row md:items-start">
        {thumbs}
        <div className="group relative aspect-square w-full flex-1 overflow-hidden rounded-[4px] bg-white">
          <AnimatePresence initial={false} mode="popLayout">
            {images[i] && (
              <motion.button key={images[i]} type="button" onClick={() => setFull(true)} aria-label="Görseli büyüt"
                className="absolute inset-0 cursor-zoom-in" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <Image src={images[i]} alt={name} fill sizes="(min-width:1024px) 50vw, 100vw" className="object-contain" unoptimized priority={i === 0} />
              </motion.button>
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
              <span className="pointer-events-none absolute bottom-3 right-3 rounded-[4px] bg-white/90 px-2 py-1 text-xs font-semibold tabular-nums text-primary">{i + 1} / {images.length}</span>
            </>
          )}
          {children}
        </div>
      </div>
      {images.length > 0 && (
        <div className={`mt-3 text-right ${many ? "md:pl-[92px]" : ""}`}>
          <button type="button" onClick={() => setFull(true)}
            className="text-sm font-semibold text-primary underline decoration-primary/40 underline-offset-4 transition-colors hover:decoration-primary">
            Görseli büyüt
          </button>
        </div>
      )}

      <AnimatePresence>
        {full && <Lightbox images={images} name={name} index={i} onIndex={setI} onClose={() => setFull(false)} />}
      </AnimatePresence>
    </div>
  );
}

function Lightbox({ images, name, index, onIndex, onClose }: { images: string[]; name: string; index: number; onIndex: (n: number) => void; onClose: () => void }) {
  const many = images.length > 1;
  const go = useCallback((d: number) => onIndex((index + d + images.length) % images.length), [index, images.length, onIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [go, onClose]);

  return (
    <motion.div role="dialog" aria-modal="true" aria-label="Görsel görüntüleyici" data-lenis-prevent
      className="fixed inset-0 z-[80] flex flex-col bg-[#0b1d45]/95 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <div className="flex items-center justify-between px-4 py-3 text-white md:px-6">
        <p className="min-w-0 truncate pr-4 text-sm text-white/80">{name}</p>
        <div className="flex items-center gap-4">
          {many && <span className="text-sm tabular-nums text-white/70">{index + 1} / {images.length}</span>}
          <button onClick={onClose} aria-label="Kapat" className="grid h-11 w-11 place-items-center rounded-[4px] hover:bg-white/10"><X size={24} /></button>
        </div>
      </div>

      <div className="relative flex-1" onClick={(e) => e.stopPropagation()}>
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div key={images[index]} className="absolute inset-4 md:inset-x-24 md:inset-y-4"
            initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
            drag={many ? "x" : false} dragConstraints={{ left: 0, right: 0 }} dragElastic={0.3}
            onDragEnd={(_, info) => { if (info.offset.x < -60) go(1); else if (info.offset.x > 60) go(-1); }}>
            <Image src={images[index]} alt={name} fill sizes="100vw" className="pointer-events-none select-none object-contain" unoptimized />
          </motion.div>
        </AnimatePresence>
        {many && (
          <>
            <button onClick={() => go(-1)} aria-label="Önceki görsel" className="absolute left-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-[4px] bg-white/10 text-white transition hover:bg-white/20 md:grid"><ChevronLeft size={26} /></button>
            <button onClick={() => go(1)} aria-label="Sonraki görsel" className="absolute right-3 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-[4px] bg-white/10 text-white transition hover:bg-white/20 md:grid"><ChevronRight size={26} /></button>
          </>
        )}
      </div>

      {many && (
        <div className="flex justify-center gap-2 overflow-x-auto px-4 py-4 [scrollbar-width:none]" onClick={(e) => e.stopPropagation()}>
          {images.map((src, n) => (
            <button key={src} onClick={() => onIndex(n)} aria-label={`${n + 1}. görsel`}
              className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-[4px] bg-white transition ${n === index ? "ring-2 ring-accent" : "opacity-50 hover:opacity-100"}`}>
              <Image src={src} alt="" fill sizes="56px" className="object-contain" unoptimized />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
