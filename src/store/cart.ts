import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/lib/data";

export type Line = { id: string; slug: string; name: string; brand: string; price: number; qty: number; image?: string | null };

type CartState = {
  items: Line[];
  add: (p: Product) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  coupon: string | null; // uygulanan indirim kuponu; sepetten siparişe taşınır
  setCoupon: (code: string | null) => void;
  terms: boolean; // sepette sözleşme onayı verildi mi
  setTerms: (v: boolean) => void;
};

// Sepet tarayıcıda saklanır (sayfa yenilenince kaybolmaz). Fiyatlar sadece gösterim içindir;
// sipariş verilirken sunucu fiyatları veritabanından yeniden okur.
export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (p) =>
        set((s) => ({
          items: s.items.some((i) => i.id === p.id)
            ? s.items.map((i) => (i.id === p.id ? { ...i, qty: Math.min(i.qty + 1, 20) } : i))
            : [...s.items, { id: p.id, slug: p.slug, name: p.name, brand: p.brand, price: p.price, qty: 1, image: p.imageUrl }],
        })),
      setQty: (id, qty) => set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(20, qty)) } : i)) })),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      clear: () => set({ items: [], coupon: null, terms: false }),
      coupon: null,
      setCoupon: (coupon) => set({ coupon }),
      terms: false,
      setTerms: (terms) => set({ terms }),
    }),
    { name: "gaza-cart", skipHydration: true, partialize: (s) => ({ items: s.items, coupon: s.coupon }) }
  )
);

export const cartCount = (items: Line[]) => items.reduce((t, i) => t + i.qty, 0);
export const cartTotal = (items: Line[]) => items.reduce((t, i) => t + i.price * i.qty, 0);
