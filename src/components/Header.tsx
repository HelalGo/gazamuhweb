"use client";
import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Heart, Info, Menu, PhoneCall, Search, ShoppingCart, User, X } from "lucide-react";
import type { MenuItem } from "@/lib/menu";
import { cartCount, useCart } from "@/store/cart";
import { IgdasBadge } from "./IgdasBadge";
import { SearchOverlay } from "./SearchOverlay";
import { SocialIcons } from "./SocialIcons";
import { useSite } from "./SiteProvider";

export function Header({ menu, popular }: { menu: MenuItem[]; popular: string[] }) {
  const count = useCart((s) => cartCount(s.items));
  const { user, favs, enabled } = useSite();
  const pathname = usePathname();
  const [open, setOpen] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const [search, setSearch] = useState(false);
  const closeSearch = useCallback(() => setSearch(false), []);
  // Aşağı kaydırınca tek satırlık kompakt header
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 140);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const active = menu.find((m) => m.label === open);
  const close = () => { setOpen(null); setMobile(false); };
  const icons = (
    <>
      <button onClick={() => setSearch(true)} className="rounded-[4px] p-2 hover:bg-surface sm:p-2.5 md:hidden" aria-label="Ara"><Search size={22} /></button>
      <Link href={enabled ? "/favoriler" : "/giris"} className="relative rounded-[4px] p-2 hover:bg-surface sm:p-2.5" aria-label="Favorilerim">
        <Heart size={22} />
        {favs.size > 0 && (
          <span className="absolute right-0 top-0 grid h-5 min-w-5 place-items-center rounded-[4px] bg-red-500 px-1 text-xs font-bold text-white">{favs.size}</span>
        )}
      </Link>
      <Link href="/sepet" className="relative rounded-[4px] p-2 hover:bg-surface sm:p-2.5" aria-label="Sepetim">
        <ShoppingCart size={22} />
        {count > 0 && (
          <span className="absolute right-0 top-0 grid h-5 min-w-5 place-items-center rounded-[4px] bg-primary px-1 text-xs font-bold text-white">{count}</span>
        )}
      </Link>
      <Link href={user ? "/hesabim" : "/giris"} className="flex items-center gap-2 rounded-[4px] p-2 hover:bg-surface sm:p-2.5" aria-label={user ? "Hesabım" : "Giriş yap"}>
        <User size={22} />
        {user && <span className="hidden max-w-24 truncate text-sm font-semibold lg:block">{user.name}</span>}
      </Link>
    </>
  );
  const navCls = (on: boolean) =>
    `-mb-px block border-b-2 px-3.5 py-3 text-sm font-semibold transition-colors hover:text-accent ${on ? "border-primary text-primary" : "border-transparent"}`;

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed inset-x-0 top-0 z-50 border-b transition-[background-color,box-shadow] duration-300 ${
          scrolled ? "border-transparent bg-white/95 shadow-[0_8px_30px_-12px_rgba(11,29,69,0.35)] backdrop-blur-md" : "border-border bg-white"
        }`}
        onMouseLeave={() => setOpen(null)}
      >
        <div className={`mx-auto h-20 w-full max-w-7xl items-center gap-2 px-3 sm:gap-3 sm:px-4 md:gap-6 md:px-6 ${scrolled ? "hidden" : "flex"}`}>
          <button className="-ml-1 p-1 md:hidden" aria-label="Menü" onClick={() => setMobile((v) => !v)}>
            {mobile ? <X size={26} /> : <Menu size={26} />}
          </button>
          <Link href="/" className="shrink-0" onClick={close}>
            <Image src="/brand/logo.png" alt="GAZ-A Mühendislik Proje Yönetimi" width={242} height={58} className="h-9 w-auto sm:h-12 md:h-[60px]" priority />
          </Link>

          <button
            onClick={() => setSearch(true)}
            className="hidden w-64 items-center gap-2.5 rounded-[4px] border border-border bg-surface px-4 py-2.5 text-left text-sm text-muted transition-colors hover:border-primary/40 md:flex lg:w-72"
          >
            <Search size={17} className="shrink-0" />
            <span className="truncate">Ürün, kategori veya marka ara…</span>
          </button>

          <IgdasBadge className="mx-auto hidden xl:flex" />

          <div className="ml-auto flex items-center sm:gap-1 xl:ml-0">
            <SocialIcons className="mr-1 hidden gap-0.5 lg:flex" itemClass="h-9 w-9 text-foreground/60 hover:bg-surface hover:text-primary" size={16} />
            <span className="mx-2 hidden h-6 w-px bg-border lg:block" />
            {icons}
          </div>
        </div>

        <nav className={`border-t border-border ${scrolled ? "hidden" : "hidden md:block"}`}>
          <ul className="mx-auto flex w-full max-w-7xl items-center px-4 md:px-6">
            <li onMouseEnter={() => setOpen(null)}>
              <Link href="/urunler" onClick={close} className={navCls(pathname === "/urunler")}>Tüm Ürünler</Link>
            </li>
            {menu.map((m) => (
              <li key={m.href} onMouseEnter={() => setOpen(m.label)}>
                <Link href={m.href} onClick={close} aria-current={pathname === m.href ? "page" : undefined}
                  className={`${navCls(pathname === m.href || open === m.label)} ${open === m.label ? "text-accent" : ""}`}>
                  {m.label}
                </Link>
              </li>
            ))}
            <li className="ml-auto" onMouseEnter={() => setOpen(null)}>
              <Link href="/iletisim" onClick={close} className={`${navCls(pathname === "/iletisim")} inline-flex items-center gap-1.5 text-primary`}>
                <PhoneCall size={16} />İletişim
              </Link>
            </li>
            <li onMouseEnter={() => setOpen(null)}>
              <Link href="/bilgi-al" onClick={close} className={`${navCls(pathname === "/bilgi-al")} inline-flex items-center gap-1.5 text-accent`}>
                <Info size={16} />Bilgi Al
              </Link>
            </li>
          </ul>
        </nav>

        {scrolled && (
          <motion.div initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.25 }}
            className="mx-auto flex h-16 w-full max-w-7xl items-center gap-2 px-3 sm:px-4 md:gap-4 md:px-6">
            <button className="-ml-1 p-1 xl:hidden" aria-label="Menü" onClick={() => setMobile((v) => !v)}>
              {mobile ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link href="/" className="shrink-0" onClick={close}>
              <Image src="/brand/logo.png" alt="GAZ-A" width={242} height={58} className="h-9 w-auto" />
            </Link>
            <ul className="ml-4 hidden items-center xl:flex">
              {menu.map((m) => (
                <li key={m.href} onMouseEnter={() => setOpen(m.label)}>
                  <Link href={m.href} onClick={close}
                    className={`block rounded-[4px] px-2.5 py-2 text-[13px] font-semibold transition-colors hover:bg-surface hover:text-primary ${pathname === m.href || open === m.label ? "text-primary" : "text-foreground/80"}`}>
                    {m.label}
                  </Link>
                </li>
              ))}
              <li onMouseEnter={() => setOpen(null)}>
                <Link href="/iletisim" onClick={close} className="ml-1 inline-flex items-center rounded-[4px] bg-primary/10 px-3 py-2 text-[13px] font-bold text-primary hover:bg-primary hover:text-white">
                  İletişim
                </Link>
              </li>
              <li onMouseEnter={() => setOpen(null)}>
                <Link href="/bilgi-al" onClick={close} className="ml-1 inline-flex items-center rounded-[4px] bg-accent/10 px-3 py-2 text-[13px] font-bold text-accent hover:bg-accent hover:text-white">
                  Bilgi Al
                </Link>
              </li>
            </ul>
            <div className="ml-auto flex items-center sm:gap-1" onMouseEnter={() => setOpen(null)}>
              <button onClick={() => setSearch(true)} className="hidden rounded-[4px] p-2.5 hover:bg-surface md:block" aria-label="Ara"><Search size={21} /></button>
              {icons}
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {active && (
            <motion.div
              key={active.label}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="absolute inset-x-0 top-full hidden border-b border-border bg-white shadow-xl md:block"
            >
              <div className="mx-auto grid w-full max-w-7xl grid-cols-12 gap-10 px-6 py-10">
                <div className="col-span-3">
                  <p className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-muted">Markalar</p>
                  <ul className="space-y-3">
                    {active.brands.map((b) => (
                      <li key={b.name}>
                        <Link href={`${active.href}?marka=${encodeURIComponent(b.name)}`} onClick={close} className="group flex items-baseline gap-2 text-lg font-light hover:text-primary">
                          {b.name}<span className="text-xs text-muted group-hover:text-primary/70">{b.count}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="col-span-4">
                  <p className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-muted">Öne çıkan ürünler</p>
                  <ul className="space-y-3">
                    {active.featured.map((p) => (
                      <li key={p.slug}>
                        <Link href={`/urun/${p.slug}`} onClick={close} className="line-clamp-2 text-[15px] leading-snug hover:text-primary">{p.name}</Link>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 flex flex-wrap gap-2">
                    <Link href={active.href} onClick={close} className="rounded-[4px] bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90">Tüm {active.label} ({active.count})</Link>
                    <Link href="/bilgi-al" onClick={close} className="rounded-[4px] border border-border px-4 py-2 text-sm font-semibold hover:border-primary hover:text-primary">Bilgi al</Link>
                  </div>
                </div>
                <div className="col-span-5">
                  <Link href={active.href} onClick={close} className="group block">
                    <div className="relative aspect-[4/3] overflow-hidden rounded-[4px] bg-surface">
                      {active.image && (
                        <Image src={active.image} alt={active.label} fill sizes="480px" unoptimized
                          className="object-cover transition-transform duration-700 group-hover:scale-105" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0b1d45]/70 via-transparent to-transparent" />
                      <p className="absolute bottom-5 left-6 text-2xl font-extrabold text-white drop-shadow">{active.label}</p>
                    </div>
                    <p className="mt-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] group-hover:text-primary">
                      Tümünü gör <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </p>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
          {mobile && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`max-h-[calc(100vh-5rem)] overflow-y-auto border-t border-border bg-white ${scrolled ? "xl:hidden" : "md:hidden"}`} data-lenis-prevent
            >
              <ul className="py-2">
                <li><Link href="/urunler" onClick={close} className="block px-6 py-3 font-semibold">Tüm Ürünler</Link></li>
                {menu.map((m) => (
                  <li key={m.href}>
                    <Link href={m.href} onClick={close} className="flex items-center justify-between px-6 py-3 font-semibold">
                      {m.label}<span className="text-xs font-normal text-muted">{m.count}</span>
                    </Link>
                  </li>
                ))}
                <li><Link href="/iletisim" onClick={close} className="flex items-center gap-2 px-6 py-3 font-semibold text-primary"><PhoneCall size={18} />İletişim</Link></li>
                <li><Link href="/bilgi-al" onClick={close} className="flex items-center gap-2 px-6 py-3 font-semibold text-accent"><Info size={18} />Bilgi Al</Link></li>
              </ul>
              <SocialIcons className="border-t border-border px-5 py-4" itemClass="h-10 w-10 bg-surface text-primary" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <AnimatePresence>{search && <SearchOverlay popular={popular} onClose={closeSearch} />}</AnimatePresence>
    </>
  );
}
