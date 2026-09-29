"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toggleFavorite } from "@/app/(site)/actions";
import { useCart } from "@/store/cart";

type Ctx = {
  user: { name: string } | null;
  enabled: boolean; // veritabanı bağlıysa favori/sipariş/yorum çalışır
  favs: Set<string>;
  toggleFav: (id: string) => void;
};

const SiteCtx = createContext<Ctx>({ user: null, enabled: false, favs: new Set(), toggleFav: () => {} });
export const useSite = () => useContext(SiteCtx);

export function SiteProvider({ user, favIds, enabled, children }: { user: { name: string } | null; favIds: string[]; enabled: boolean; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [favs, setFavs] = useState(() => new Set(favIds));
  useEffect(() => setFavs(new Set(favIds)), [favIds]);
  useEffect(() => { useCart.persist.rehydrate(); }, []); // sepeti tarayıcı hafızasından yükle

  const toggleFav = useCallback(
    async (id: string) => {
      if (!user) return router.push(`/giris?next=${encodeURIComponent(pathname)}`);
      const was = favs.has(id);
      setFavs((s) => { const n = new Set(s); was ? n.delete(id) : n.add(id); return n; }); // hemen göster
      const res = await toggleFavorite(Number(id));
      if (res.login) return router.push(`/giris?next=${encodeURIComponent(pathname)}`);
      if (res.favorite === undefined || res.favorite === was) setFavs((s) => { const n = new Set(s); was ? n.add(id) : n.delete(id); return n; }); // hata: geri al
      router.refresh();
    },
    [user, favs, router, pathname]
  );

  const value = useMemo(() => ({ user, enabled, favs, toggleFav }), [user, enabled, favs, toggleFav]);
  return <SiteCtx.Provider value={value}>{children}</SiteCtx.Provider>;
}
