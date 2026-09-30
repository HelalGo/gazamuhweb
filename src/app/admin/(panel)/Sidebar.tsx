"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Award, Bell, ExternalLink, MailCheck, Users, GalleryHorizontal, ImagePlus, Inbox, LayoutDashboard, LayoutGrid, LogOut, Megaphone, Menu, MessageSquare, Newspaper, Package, ShoppingBag, Smartphone, SunSnow, TicketPercent, Truck, X,
} from "lucide-react";
import { logout } from "../actions";

const groups = [
  { title: "", items: [{ href: "/admin", label: "Genel Bakış", icon: LayoutDashboard, exact: true }] },
  {
    title: "Mağaza",
    items: [
      { href: "/admin/products", label: "Ürünler", icon: Package },
      { href: "/admin/orders", label: "Siparişler", icon: ShoppingBag, badge: "orders" },
      { href: "/admin/talepler", label: "Bilgi Talepleri", icon: Inbox, badge: "leads" },
      { href: "/admin/kuponlar", label: "İndirim Kuponları", icon: TicketPercent },
      { href: "/admin/kargo", label: "Kargo Ücretleri", icon: Truck },
      { href: "/admin/reviews", label: "Yorumlar", icon: MessageSquare },
      { href: "/admin/images", label: "Toplu Görsel", icon: ImagePlus },
    ],
  },
  {
    title: "Ana Sayfa",
    items: [
      { href: "/admin/sezon", label: "Mevsim Sıralaması", icon: SunSnow },
      { href: "/admin/slider", label: "Slider", icon: GalleryHorizontal },
      { href: "/admin/vitrin", label: "Vitrin Kartları", icon: LayoutGrid },
      { href: "/admin/kampanyalar", label: "Kampanyalar", icon: Megaphone },
      { href: "/admin/markalar", label: "Markalar", icon: Award },
    ],
  },
  {
    title: "İçerik",
    items: [{ href: "/admin/blog", label: "Blog Yazıları", icon: Newspaper }],
  },
  {
    title: "Mobil Uygulama",
    items: [
      { href: "/admin/bildirimler", label: "Bildirim Gönder", icon: Bell },
      { href: "/admin/uygulama-banner", label: "Ana Sayfa Bannerları", icon: GalleryHorizontal },
      { href: "/admin/uygulama-tanitim", label: "Tanıtım Ekranları", icon: Smartphone },
    ],
  },
  {
    title: "İletişim",
    items: [
      { href: "/admin/e-postalar", label: "E-postalar", icon: MailCheck },
      { href: "/admin/aboneler", label: "Bülten Aboneleri", icon: Users },
    ],
  },
] as const;

export function Sidebar({ name, email, pendingOrders, openLeads }: { name: string; email: string; pendingOrders: number; openLeads: number }) {
  const badges: Record<string, number> = { orders: pendingOrders, leads: openLeads };
  const path = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" data-lenis-prevent>
      {groups.map((g) => (
        <div key={g.title}>
          {g.title && <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-widest text-white/40">{g.title}</p>}
          <ul className="space-y-1">
            {g.items.map((it) => {
              const active = "exact" in it ? path === it.href : path.startsWith(it.href);
              const Icon = it.icon;
              return (
                <li key={it.href}>
                  <Link
                    href={it.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${active ? "bg-white text-[#0b1d45] shadow" : "text-white/75 hover:bg-white/10 hover:text-white"}`}
                  >
                    <Icon size={18} />
                    <span className="flex-1">{it.label}</span>
                    {"badge" in it && badges[it.badge] > 0 && (
                      <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[11px] font-extrabold text-[#0b1d45]" title="Bekleyen">{badges[it.badge]}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  const panel = (
    <div className="flex h-full flex-col bg-[#0b1d45] text-white">
      <div className="flex h-16 items-center justify-between px-5">
        <Link href="/admin" className="rounded-lg bg-white px-2.5 py-1.5"><Image src="/brand/logo.png" alt="GAZ-A" width={242} height={58} className="h-7 w-auto" /></Link>
        <button onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-white/10 lg:hidden" aria-label="Menüyü kapat"><X size={20} /></button>
      </div>
      {nav}
      <div className="space-y-1 border-t border-white/10 p-3">
        <Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/75 hover:bg-white/10 hover:text-white">
          <ExternalLink size={18} />Siteyi görüntüle
        </Link>
        <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-sm font-bold uppercase">{(name || email).charAt(0)}</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">{name || "Yönetici"}</span>
            <span className="block truncate text-xs text-white/50">{email}</span>
          </span>
          <form action={logout}>
            <button className="grid h-8 w-8 place-items-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white" aria-label="Çıkış yap" title="Çıkış yap"><LogOut size={16} /></button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Telefon/tablet üst çubuğu */}
      <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-white/90 px-4 backdrop-blur lg:hidden">
        <button onClick={() => setOpen(true)} className="grid h-9 w-9 place-items-center rounded-lg hover:bg-surface" aria-label="Menüyü aç"><Menu size={20} /></button>
        <Image src="/brand/logo.png" alt="GAZ-A" width={242} height={58} className="h-7 w-auto" />
        {pendingOrders > 0 && (
          <Link href="/admin/orders?status=pending" className="ml-auto rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">{pendingOrders} bekleyen sipariş</Link>
        )}
      </div>

      {/* Masaüstü sabit menü */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">{panel}</aside>

      {/* Telefon açılır menü */}
      <div className={`fixed inset-0 z-50 lg:hidden ${open ? "" : "pointer-events-none"}`}>
        <div onClick={() => setOpen(false)} className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`} />
        <aside className={`absolute inset-y-0 left-0 w-72 max-w-[85%] transition-transform ${open ? "translate-x-0" : "-translate-x-full"}`}>{panel}</aside>
      </div>
    </>
  );
}
