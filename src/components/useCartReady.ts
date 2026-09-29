"use client";
import { useEffect, useState } from "react";
import { useCart } from "@/store/cart";

// Sepet tarayıcı hafızasından yüklenene kadar false döner (boş sepet yanıp sönmesin diye)
export function useCartReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (useCart.persist.hasHydrated()) setReady(true);
    return useCart.persist.onFinishHydration(() => setReady(true));
  }, []);
  return ready;
}
