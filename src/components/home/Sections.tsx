import Link from "next/link";
import { ArrowRight, Phone } from "lucide-react";
import type { Product } from "@/lib/data";
import { services, usp, whatsappUrl } from "@/lib/home";
import { contact } from "@/lib/site";
import { slugify } from "@/lib/slug";
import { ProductCard } from "../ProductCard";
import { CountUp } from "./CountUp";
import { Icon } from "./Icons";
import { Reveal } from "./Reveal";

const wrap = "mx-auto w-full max-w-7xl px-4 md:px-6";

export function Heading({ eyebrow, title, href, linkLabel = "Tümünü gör" }: { eyebrow?: string; title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-10 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-2 text-xs font-bold uppercase tracking-widest text-accent">{eyebrow}</p>}
        <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-primary hover:underline sm:flex">
          {linkLabel} <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}

export function UspStrip() {
  return (
    <section className="bg-surface">
      <div className={`${wrap} grid grid-cols-2 gap-x-6 gap-y-5 py-7 lg:grid-cols-4`}>
        {usp.map((u) => (
          <div key={u.title} className="flex items-center gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-primary"><Icon name={u.icon} size={20} /></span>
            <div>
              <p className="text-sm font-bold">{u.title}</p>
              <p className="text-xs text-muted">{u.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Categories({ items }: { items: { name: string; count: number }[] }) {
  return (
    <section className={`${wrap} py-20`}>
      <Heading eyebrow="Kategoriler" title="Ürün Gruplarımız" href="/urunler" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {items.map((c, n) => (
          <Reveal key={c.name} delay={(n % 4) * 0.07}>
            <Link href={`/${slugify(c.name)}`} className="group flex h-full flex-col rounded-3xl bg-surface p-6 transition-colors hover:bg-primary hover:text-white">
              <span className="mb-8 grid h-12 w-12 place-items-center rounded-2xl bg-white text-primary transition-colors group-hover:bg-white/15 group-hover:text-white">
                <Icon name={c.name} size={24} />
              </span>
              <p className="text-lg font-bold">{c.name}</p>
              <p className="mt-1 flex items-center justify-between text-sm text-muted transition-colors group-hover:text-white/80">
                {c.count} ürün <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </p>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function ProductRow({ eyebrow, title, href, products }: { eyebrow?: string; title: string; href: string; products: Product[] }) {
  if (!products.length) return null;
  return (
    <section className={`${wrap} py-14`}>
      <Heading eyebrow={eyebrow} title={title} href={href} />
      <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
      </div>
    </section>
  );
}

export function Services() {
  return (
    <section className="bg-surface py-20">
      <div className={wrap}>
        <Heading eyebrow="Hizmetlerimiz" title="Projeden Bakıma Tek Adres" />
        <div className="grid gap-5 md:grid-cols-3">
          {services.map((s, n) => (
            <Reveal key={s.title} delay={n * 0.1}>
              <div className="h-full rounded-3xl bg-white p-8">
                <span className="mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-primary text-white"><Icon name={s.icon} size={26} /></span>
                <h3 className="text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Stats({ products, brands, categories }: { products: number; brands: number; categories: number }) {
  const items = [
    { label: "Kuruluş yılı", node: <>2020</> },
    { label: "Ürün", node: <CountUp to={products} /> },
    { label: "Marka", node: <CountUp to={brands} /> },
    { label: "Kategori", node: <CountUp to={categories} /> },
  ];
  return (
    <section className="bg-primary text-white">
      <div className={`${wrap} grid grid-cols-2 gap-y-10 py-16 text-center lg:grid-cols-4`}>
        {items.map((s) => (
          <div key={s.label}>
            <p className="text-4xl font-extrabold tabular-nums md:text-5xl">{s.node}</p>
            <p className="mt-2 text-sm uppercase tracking-widest text-white/70">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Brands({ items }: { items: string[] }) {
  return (
    <section className={`${wrap} py-20`}>
      <Heading eyebrow="Markalar" title="Çalıştığımız Markalar" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((b) => (
          <Link key={b} href={`/urunler?marka=${encodeURIComponent(b)}`}
            className="grid h-20 place-items-center rounded-2xl bg-surface px-3 text-center text-sm font-bold text-foreground/70 transition-colors hover:bg-primary hover:text-white">
            {b}
          </Link>
        ))}
      </div>
    </section>
  );
}

export function CtaBand() {
  return (
    <section className={`${wrap} pb-4`}>
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b1d45] via-primary to-accent px-6 py-14 text-center text-white md:px-16">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <h2 className="relative text-2xl font-extrabold md:text-4xl">Projeniz için teklif alın</h2>
        <p className="relative mx-auto mt-3 max-w-xl text-white/85">İhtiyacınızı anlatın, mekânınıza uygun çözümü birlikte belirleyelim.</p>
        <div className="relative mt-8 flex flex-wrap justify-center gap-3">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="rounded-full bg-[#25D366] px-7 py-3.5 text-sm font-bold text-white transition hover:brightness-95">
            WhatsApp ile Yazın
          </a>
          <a href={`tel:+9${contact.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 rounded-full border border-white/40 px-7 py-3.5 text-sm font-bold transition hover:bg-white/10">
            <Phone size={16} /> {contact.phone}
          </a>
        </div>
      </div>
    </section>
  );
}
