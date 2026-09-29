"use client";
import { motion } from "motion/react";
import type { Product } from "@/lib/data";
import { waLink } from "@/lib/utils";
import { useCart } from "@/store/cart";

export function AddToCart({ product }: { product: Product }) {
  const add = useCart((s) => s.add);
  if (product.price <= 0)
    return (
      <a href={waLink(product.name)} target="_blank" rel="noopener noreferrer"
        className="inline-block w-full rounded-[4px] bg-[#25D366] py-3.5 text-center text-sm font-bold text-white sm:w-auto sm:px-10">
        WhatsApp'tan Fiyat Sor
      </a>
    );
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      disabled={!product.inStock}
      onClick={() => add(product)}
      className="w-full rounded-[4px] bg-primary py-3.5 text-sm font-bold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-surface-alt disabled:text-muted sm:w-auto sm:px-10"
    >
      {product.inStock ? "Sepete Ekle" : "Stokta Yok"}
    </motion.button>
  );
}
