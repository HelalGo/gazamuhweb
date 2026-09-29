"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown, SlidersHorizontal, X } from "lucide-react";
import type { Product } from "@/lib/data";
import { Breadcrumb } from "./Breadcrumb";
import { ProductCard } from "./ProductCard";

type Key = "category" | "brand" | "productGroup";
type Sel = Record<Key, string[]>;
const empty: Sel = { category: [], brand: [], productGroup: [] };
const PAGE = 24;
const label = "text-[11px] font-semibold uppercase tracking-[0.2em]";

const facetDefs: { key: Key; title: string }[] = [
  { key: "category", title: "Kategori" },
  { key: "brand", title: "Marka" },
  { key: "productGroup", title: "Ürün Grubu" },
];

export function ProductListing({ products, crumbs = ["Ana Sayfa"], hideCategory = false, initialBrands = [], eyebrow }: {
  products: Product[]; crumbs?: string[]; hideCategory?: boolean; initialBrands?: string[]; eyebrow?: string;
}) {
  const [sel, setSel] = useState<Sel>({ ...empty, brand: initialBrands });
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");
  const [sort, setSort] = useState("default");
  const [showFilters, setShowFilters] = useState(false);
  const [visible, setVisible] = useState(PAGE);
  const facets = facetDefs.filter((f) => !(hideCategory && f.key === "category"));

  const toggle = (key: Key, v: string) => {
    setVisible(PAGE);
    setSel((s) => ({ ...s, [key]: s[key].includes(v) ? s[key].filter((x) => x !== v) : [...s[key], v] }));
  };

  const filtered = useMemo(() => {
    const lo = min ? Number(min) : 0;
    const hi = max ? Number(max) : Infinity;
    const list = products.filter(
      (p) =>
        (!sel.category.length || sel.category.includes(p.category)) &&
        (!sel.brand.length || sel.brand.includes(p.brand)) &&
        (!sel.productGroup.length || (p.productGroup !== null && sel.productGroup.includes(p.productGroup))) &&
        p.price >= lo &&
        p.price <= hi
    );
    if (sort === "asc") list.sort((a, b) => a.price - b.price);
    if (sort === "desc") list.sort((a, b) => b.price - a.price);
    return list;
  }, [products, sel, min, max, sort]);

  const active = Object.values(sel).some((l) => l.length) || min || max;
  const clear = () => { setSel(empty); setMin(""); setMax(""); setVisible(PAGE); };

  // Markalar: başlık altındaki hızlı filtre butonları
  const brandCounts = new Map<string, number>();
  for (const p of products) if (p.brand) brandCounts.set(p.brand, (brandCounts.get(p.brand) ?? 0) + 1);
  const topBrands = [...brandCounts].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([b]) => b);
  const title = crumbs[crumbs.length - 1];
  const chip = (on: boolean) =>
    `shrink-0 rounded-[4px] border px-4 py-2 text-sm transition-colors ${on ? "border-primary bg-primary text-white" : "border-border bg-white hover:border-primary hover:text-primary"}`;

  const sidebar = (
    <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:block lg:space-y-2">
      {facets.map((f) => {
        const counts = new Map<string, number>();
        for (const p of products) {
          const v = p[f.key];
          if (v) counts.set(v, (counts.get(v) ?? 0) + 1);
        }
        if (counts.size < 2) return null;
        const values = [...counts.keys()].sort((a, b) => a.localeCompare(b, "tr"));
        return (
          <FilterSection key={f.key} title={f.title} badge={sel[f.key].length}>
            <ul className="max-h-72 space-y-1 overflow-y-auto pr-1">
              {values.map((v) => {
                const checked = sel[f.key].includes(v);
                return (
                  <li key={v}>
                    <label className="group flex cursor-pointer items-center gap-3 rounded-[4px] px-2 py-1.5 text-sm transition-colors hover:bg-surface">
                      <input type="checkbox" checked={checked} onChange={() => toggle(f.key, v)} className="peer sr-only" />
                      <span className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[4px] bg-surface-alt text-transparent transition-colors peer-checked:bg-primary peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-accent">
                        <Check size={12} strokeWidth={3.5} />
                      </span>
                      <span className={`flex-1 ${checked ? "font-semibold text-foreground" : "text-foreground/80"}`}>{v}</span>
                      <span className="text-xs tabular-nums text-muted">{counts.get(v)}</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </FilterSection>
        );
      })}
      <FilterSection title="Fiyat" badge={min || max ? 1 : 0}>
        <div className="flex items-center gap-2 px-2">
          <PriceInput value={min} onChange={setMin} placeholder="En az" />
          <span className="text-muted">–</span>
          <PriceInput value={max} onChange={setMax} placeholder="En çok" />
        </div>
      </FilterSection>
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-8 pt-40 md:px-6">
      <Breadcrumb crumbs={crumbs} />

      <div className="mt-8 flex flex-wrap items-end justify-between gap-6 border-b border-border pb-8">
        <div>
          <p className={`${label} text-accent`}>{eyebrow ?? (hideCategory ? "Kategori" : "Koleksiyon")}</p>
          <h1 className="mt-3 text-4xl font-light tracking-tight md:text-5xl">
            {title}<sup className="ml-2 align-super text-base font-normal text-muted">({products.length})</sup>
          </h1>
        </div>
        <button onClick={() => setShowFilters((v) => !v)}
          className={`flex items-center gap-2 rounded-[4px] border px-4 py-2.5 text-sm font-semibold transition-colors lg:hidden ${showFilters || active ? "border-primary text-primary" : "border-border hover:border-primary"}`}>
          {showFilters ? <X size={16} /> : <SlidersHorizontal size={16} />} Filtrele{active ? " (aktif)" : ""}
        </button>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[250px_1fr] lg:gap-12">
        {/* Filtreler: masaüstünde solda sürekli açık, telefonda "Filtrele" ile açılır */}
        <aside className={`${showFilters ? "block" : "hidden"} lg:block`}>
          <div className="lg:sticky lg:top-32 lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto lg:pr-2" data-lenis-prevent>
            <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
              <span className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.15em]"><SlidersHorizontal size={15} />Filtreler</span>
              {active && <button onClick={clear} className="text-xs font-semibold text-accent hover:underline">Temizle</button>}
            </div>
            {sidebar}
          </div>
        </aside>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6">
            {topBrands.length > 1 ? (
              <div className="-mx-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0">
                <button onClick={() => { setSel((s) => ({ ...s, brand: [] })); setVisible(PAGE); }} className={chip(!sel.brand.length)}>Tümü</button>
                {topBrands.map((b) => (
                  <button key={b} onClick={() => toggle("brand", b)} className={chip(sel.brand.includes(b))}>{b}</button>
                ))}
              </div>
            ) : <span />}
            <div className="flex items-center gap-5 text-sm">
              <span className="text-muted">{filtered.length} ürün</span>
              <SortMenu value={sort} onChange={setSort} />
            </div>
          </div>

      {filtered.length ? (
        <>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-3">
            {filtered.slice(0, visible).map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
          {visible < filtered.length && (
            <button onClick={() => setVisible((v) => v + PAGE)}
              className="mx-auto mt-14 block rounded-[4px] border border-primary px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-primary transition-colors hover:bg-primary hover:text-white">
              Daha fazla göster ({filtered.length - visible})
            </button>
          )}
        </>
      ) : (
        <div className="border border-dashed border-border p-12 text-center">
          <p className="text-muted">Seçtiğiniz filtrelere uygun ürün bulunamadı.</p>
          {active && <button onClick={clear} className="mt-3 text-sm font-semibold text-accent hover:underline">Filtreleri temizle</button>}
        </div>
      )}
        </div>
      </div>
    </div>
  );
}

function FilterSection({ title, badge = 0, children }: { title: string; badge?: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <section className="pb-3">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-center justify-between rounded-[4px] px-2 py-2 text-left">
        <span className="flex items-center gap-2 text-sm font-bold text-primary">
          {title}
          {badge > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-[4px] bg-accent px-1 text-[11px] font-bold text-white">{badge}</span>
          )}
        </span>
        <ChevronDown size={16} className={`text-muted transition-transform ${open ? "" : "-rotate-90"}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function PriceInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
      placeholder={placeholder}
      inputMode="numeric"
      className="w-full min-w-0 rounded-[4px] bg-surface px-3 py-2.5 text-sm outline-none transition-shadow placeholder:text-muted focus:ring-2 focus:ring-accent/40"
    />
  );
}

const sortOptions = [
  { value: "default", label: "Önerilen" },
  { value: "asc", label: "Fiyat: Düşükten Yükseğe" },
  { value: "desc", label: "Fiyat: Yüksekten Düşüğe" },
];

function SortMenu({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = sortOptions.find((o) => o.value === value)!;

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-[4px] border border-border bg-white px-4 py-2.5 text-sm transition-colors hover:border-primary"
      >
        <span className="text-muted">Sırala:</span>
        <span className="font-semibold">{current.label}</span>
        <ChevronDown size={16} className={`text-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-30 mt-2 w-64 rounded-[4px] bg-white p-1.5 shadow-xl shadow-black/10"
          >
            {sortOptions.map((o) => (
              <li key={o.value}>
                <button
                  role="option"
                  aria-selected={o.value === value}
                  onClick={() => { onChange(o.value); setOpen(false); }}
                  className={`flex w-full items-center justify-between rounded-[4px] px-3 py-2.5 text-left text-sm transition-colors hover:bg-surface ${
                    o.value === value ? "font-bold text-primary" : ""
                  }`}
                >
                  {o.label}
                  {o.value === value && <Check size={15} strokeWidth={3} />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
