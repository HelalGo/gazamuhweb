"use client";
import { useEffect } from "react";
import { useCart } from "@/store/cart";

// Sipariş verildikten sonra tarayıcıdaki sepeti boşaltır
export function ClearCart() {
  useEffect(() => {
    useCart.getState().clear();
    // sepet henüz hafızadan yüklenmediyse yükleme bittikten sonra da temizle
    return useCart.persist.onFinishHydration(() => useCart.getState().clear());
  }, []);
  return null;
}
