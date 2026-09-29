"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { Heart, Menu, Search, ShoppingCart, User, X } from "lucide-react";
import { useCart } from "@/store/cart";
import { nav } from "@/lib/site";

export function Header() {
  const count = useCart((s) => s.items.reduce((t, i) => t + i.qty, 0));
  const pathname = usePathname();
  const [open, setOpen] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const active = nav.find((n) => n.label === open);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed inset-x-0 top-0 z-50 border-b border-border bg-white"
      onMouseLeave={() => setOpen(null)}
    >
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center gap-4 px-4 md:gap-8 md:px-6">
        <button className="md:hidden" aria-label="Menü" onClick={() => setMobile((v) => !v)}>
          {mobile ? <X size={26} /> : <Menu size={26} />}
        </button>
        <a href="/" className="shrink-0">
          <Image src="/brand/logo.png" alt="GAZ-A Mühendislik Proje Yönetimi" width={242} height={58} className="h-11 w-auto" priority />
        </a>

        <label className="hidden flex-1 items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-muted focus-within:border-primary md:flex">
          <Search size={18} />
          <input
            placeholder="Ürün, kategori veya marka arayın"
            className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
          />
        </label>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <button className="relative rounded-full p-2.5 hover:bg-surface" aria-label="Favoriler">
            <Heart size={22} />
          </button>
          <button className="relative rounded-full p-2.5 hover:bg-surface" aria-label="Sepet">
            <ShoppingCart size={22} />
            {count > 0 && (
              <span className="absolute right-0 top-0 grid h-5 w-5 place-items-center rounded-full bg-primary text-xs font-bold text-white">
                {count}
              </span>
            )}
          </button>
          <a href="/giris" className="rounded-full p-2.5 hover:bg-surface" aria-label="Giriş yap">
            <User size={22} />
          </a>
        </div>
      </div>

      <nav className="hidden border-t border-border md:block">
        <ul className="mx-auto flex w-full max-w-7xl gap-1 px-6">
          {nav.map((n) => (
            <li key={n.label} onMouseEnter={() => setOpen(n.groups.length ? n.label : null)}>
              <a
                href={n.href}
                aria-current={pathname === n.href ? "page" : undefined}
                className={`-mb-px block border-b-2 px-4 py-3 text-sm font-semibold transition-colors hover:text-accent ${
                  pathname === n.href ? "border-primary text-primary" : "border-transparent"
                } ${open === n.label ? "text-accent" : ""}`}
              >
                {n.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <AnimatePresence>
        {active && (
          <motion.div
            key={active.label}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-x-0 top-full hidden border-b border-border bg-white shadow-lg md:block"
          >
            <div className="mx-auto grid max-w-7xl grid-cols-3 gap-8 px-6 py-8">
              {active.groups.map((g) => (
                <div key={g.title}>
                  <h4 className="mb-3 text-sm font-bold text-primary">{g.title}</h4>
                  <ul className="space-y-2 text-sm text-muted">
                    {g.items.map((i) => (
                      <li key={i}><a href={active.href} className="hover:text-foreground">{i}</a></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        )}
        {mobile && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border bg-white md:hidden"
          >
            {nav.map((n) => (
              <li key={n.label}><a href={n.href} className="block px-6 py-3 font-semibold">{n.label}</a></li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
