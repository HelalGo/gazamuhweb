import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, FileText, Mail, Phone } from "lucide-react";
import type { Product } from "@/lib/data";
import { whatsappUrl } from "@/lib/home";
import { contact, igdas } from "@/lib/site";
import { BrandIcon } from "../SocialIcons";
import { BigNumber } from "./BigNumber";
import { CountUp } from "./CountUp";
import { DealsGrid } from "./Deals";
import { Reveal } from "./Reveal";
import { ServicesShowcase } from "./ServicesShowcase";

const wrap = "mx-auto w-full max-w-7xl px-4 md:px-6";

export function Heading({ eyebrow, title, href, linkLabel = "Tümünü gör" }: { eyebrow?: string; title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-10 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-accent">{eyebrow}</p>}
        <h2 className="text-3xl font-light tracking-tight md:text-4xl">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="hidden shrink-0 items-center gap-2 border-b border-primary pb-1 text-xs font-bold uppercase tracking-[0.2em] text-primary transition-colors hover:border-accent hover:text-accent sm:flex">
          {linkLabel} <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}

export function Deals({ products }: { products: Product[] }) {
  if (!products.length) return null;
  return (
    <section className="bg-surface pb-20 pt-12 lg:pb-28 lg:pt-14">
      <div className={wrap}>
        <Heading eyebrow="Fırsatlar" title="Kampanyalı Ürünler" href="/urunler" linkLabel="Tüm ürünler" />
        <DealsGrid products={products} />
      </div>
    </section>
  );
}

// Koyu, tam genişlik bölüm: solda başlık + hizmet listesi, sağda seçili hizmet kartı
export function Services() {
  return (
    <section className="relative isolate overflow-hidden bg-[#0b1d45] text-white">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#0b1d45] via-[#0f2a60] to-primary" />
      <div className="mx-auto w-full max-w-[1400px] px-4 py-24 md:px-10 lg:py-32">
        <ServicesShowcase />
      </div>
    </section>
  );
}

const gasServices = [
  { title: "Proje ve Onay", text: "Doğalgaz projesi çizimi ve İGDAŞ onay süreçlerinin takibi." },
  { title: "Daire İçi Tesisat", text: "Daire içi doğalgaz tesisatı ve kombi montajı." },
  { title: "Kolon Tesisatı", text: "Bina kolon tesisatı ve dönüşüm projeleri." },
  { title: "Gaz Açma", text: "Gaz açma başvurusu ve sızdırmazlık testleri." },
];

const tel = `tel:+9${contact.phone.replace(/\s/g, "")}`;

// İGDAŞ yetkili bayi: büyük yetki numarası, dalgalar ve numaralı sütunlar
export function Igdas() {
  return (
    <section className="relative isolate overflow-hidden bg-surface">
      <div className="mx-auto w-full max-w-[1400px] px-4 pt-24 md:px-10 lg:pt-32">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <Reveal>
            <div className="flex flex-col items-start gap-8 sm:flex-row sm:items-center sm:gap-10">
              <Image src={igdas.logo} alt="İGDAŞ" width={250} height={269} className="h-40 w-auto md:h-56" />
              <div>
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.25em] text-accent"><BadgeCheck size={15} />{igdas.title}</p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.25em] text-muted">Yetki numarası</p>
                <BigNumber value={igdas.no} className="mt-1 text-5xl font-light tabular-nums tracking-tight text-primary md:text-6xl" />
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-3xl font-extralight leading-tight tracking-tight md:text-5xl">
              Doğalgaz projeniz <span className="font-semibold text-primary">yetkili ellerde.</span>
            </h2>
            <p className="mt-5 max-w-xl leading-relaxed text-muted">
              GAZA Mühendislik, İGDAŞ yetkili bayisi olarak doğalgaz projelerinizi baştan sona yürütür: projelendirme,
              onay, tesisat ve gaz açma süreçlerini sizin yerinize takip ederiz.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/bilgi-al" className="inline-flex items-center rounded-[4px] bg-primary px-7 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-primary/90">
                Doğalgaz projesi için bilgi al
              </Link>
              <a href={tel} className="inline-flex items-center gap-2 rounded-[4px] border border-foreground/20 px-7 py-3.5 text-xs font-bold uppercase tracking-[0.2em] transition hover:border-primary hover:text-primary">
                <Phone size={15} />{contact.phone}
              </a>
            </div>
          </Reveal>
        </div>

        <div className="mt-20 grid border-t border-foreground/10 sm:grid-cols-2 lg:mt-24 lg:grid-cols-4">
          {gasServices.map((g, n) => (
            <Reveal key={g.title} delay={n * 0.08} className="h-full">
              <div className={`group h-full border-foreground/10 py-10 lg:py-14 ${cellBorder[n]}`}>
                <p className="text-sm font-semibold tabular-nums text-accent">{String(n + 1).padStart(2, "0")}</p>
                <h3 className="mt-5 text-xl font-semibold">{g.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted">{g.text}</p>
                <span className="mt-8 block h-px w-10 bg-accent transition-all duration-500 group-hover:w-24" />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// Telefonda alt alta (üst çizgi), tablette 2x2, masaüstünde 4 sütun (sol çizgi)
const cellBorder = [
  "sm:pr-8",
  "border-t sm:border-t-0 sm:border-l sm:px-8",
  "border-t sm:pr-8 lg:border-t-0 lg:border-l lg:px-8",
  "border-t sm:border-l sm:px-8 lg:border-t-0",
];

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

export type BrandItem = { name: string; image: string | null };

// Sonsuz kayan şerit: liste ekranı dolduracak kadar çoğaltılır, sonra iki kopya yan yana kaydırılır
function Marquee({ items, reverse = false }: { items: BrandItem[]; reverse?: boolean }) {
  let row = items;
  while (row.length < 10) row = [...row, ...items];
  return (
    <div className="group flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
      {[0, 1].map((copy) => (
        <ul key={copy} aria-hidden={copy === 1} className={`marquee flex shrink-0 gap-4 pr-4 group-hover:[animation-play-state:paused] ${reverse ? "marquee-reverse" : ""}`}
          style={{ animationDuration: `${row.length * 3.5}s` }}>
          {row.map((b, i) => (
            <li key={`${b.name}-${i}`}>
              <Link href={`/urunler?marka=${encodeURIComponent(b.name)}`} tabIndex={copy ? -1 : undefined} title={`${b.name} ürünleri`}
                className="group/b grid h-28 w-48 place-items-center rounded-[4px] border border-border bg-white px-6 transition-colors duration-300 hover:border-primary md:h-32 md:w-60">
                {b.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.image} alt={b.name} loading="lazy"
                    className="max-h-14 max-w-full object-contain opacity-60 grayscale transition duration-300 group-hover/b:opacity-100 group-hover/b:grayscale-0 md:max-h-16" />
                ) : (
                  <span className="text-center text-lg font-bold tracking-tight text-foreground/50 transition-colors group-hover/b:text-primary md:text-xl">{b.name}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}

export function Brands({ items }: { items: BrandItem[] }) {
  if (!items.length) return null;
  const half = Math.ceil(items.length / 2);
  const rows = items.length >= 8 ? [items.slice(0, half), items.slice(half)] : [items];
  return (
    <section className="overflow-hidden py-20 lg:py-28">
      <div className={`${wrap} mb-12 flex flex-wrap items-end justify-between gap-6`}>
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-accent">Markalar</p>
          <h2 className="text-3xl font-light tracking-tight md:text-5xl">Çalıştığımız Markalar</h2>
        </div>
      </div>
      <div className="space-y-4">
        {rows.map((r, i) => <Marquee key={i} items={r} reverse={i === 1} />)}
      </div>
    </section>
  );
}

const channels = [
  { label: "WhatsApp ile yazın", note: "Hızlı yanıt", href: whatsappUrl, icon: "whatsapp", external: true },
  { label: "Bizi arayın", note: contact.phone, href: tel, icon: "phone", external: false },
  { label: "E-posta gönderin", note: contact.email, href: `mailto:${contact.email}`, icon: "mail", external: false },
  { label: "Teklif formunu doldurun", note: "Size dönüş yapalım", href: "/bilgi-al", icon: "form", external: false },
] as const;

const channelIcon = {
  whatsapp: <BrandIcon name="whatsapp" size={20} />,
  phone: <Phone size={20} />,
  mail: <Mail size={20} />,
  form: <FileText size={20} />,
};

// Teklif çağrısı: solda başlık, sağda numaralı iletişim kanalları
export function CtaBand() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto grid w-full max-w-[1400px] gap-14 px-4 py-24 md:px-10 lg:grid-cols-2 lg:gap-24 lg:py-32">
        <Reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-accent">Teklif alın</p>
          <h2 className="mt-6 text-4xl font-extralight leading-[1.08] tracking-tight md:text-6xl">
            Projeniz için<br /><span className="font-semibold text-primary">teklif alın.</span>
          </h2>
          <p className="mt-6 max-w-md leading-relaxed text-muted">
            İhtiyacınızı anlatın, mekânınıza uygun çözümü birlikte belirleyelim. Size en kolay gelen kanaldan ulaşın.
          </p>
          <Link href="/bilgi-al" className="mt-10 inline-flex rounded-[4px] bg-primary px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white transition hover:bg-primary/90">
            Teklif iste
          </Link>
        </Reveal>

        <Reveal delay={0.1}>
          <ul className="border-t border-border">
            {channels.map((c, n) => (
              <li key={c.label} className="border-b border-border">
                <a href={c.href} target={c.external ? "_blank" : undefined} rel={c.external ? "noopener noreferrer" : undefined}
                  className="group relative isolate flex items-center gap-5 overflow-hidden py-7 md:gap-8">
                  <span className="absolute inset-0 -z-10 origin-left scale-x-0 bg-surface transition-transform duration-500 group-hover:scale-x-100" />
                  <span className="w-7 pl-1 text-xs font-semibold tabular-nums text-muted">{String(n + 1).padStart(2, "0")}</span>
                  <span className="min-w-0 flex-1 transition-transform duration-500 group-hover:translate-x-3">
                    <span className="block text-2xl font-light tracking-tight md:text-3xl">{c.label}</span>
                    <span className="mt-1 block truncate text-sm text-muted">{c.note}</span>
                  </span>
                  <span className="mr-2 grid h-12 w-12 shrink-0 place-items-center rounded-full border border-border text-primary transition-colors duration-500 group-hover:border-primary group-hover:bg-primary group-hover:text-white">
                    {channelIcon[c.icon]}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
