import { create } from "zustand";
import type { Product } from "@/lib/data";

type CartItem = Product & { qty: number };
type CartState = {
  items: CartItem[];
  add: (p: Product) => void;
  remove: (id: string) => void;
};

export const useCart = create<CartState>((set) => ({
  items: [],
  add: (p) =>
    set((s) => ({
      items: s.items.some((i) => i.id === p.id)
        ? s.items.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i))
        : [...s.items, { ...p, qty: 1 }],
    })),
  remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
}));
