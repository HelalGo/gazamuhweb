import type { Metadata } from "next";
import Link from "next/link";
import { legal, legalNav, policy, type LegalSlug } from "@/lib/legal";
import { Breadcrumb } from "./Breadcrumb";

export const legalMeta = (slug: LegalSlug): Metadata => ({
  title: `${legal[slug].title} | GAZ-A Mühendislik`,
  description: legal[slug].description,
});

// Kurumsal ve yasal sayfaların ortak düzeni: solda sayfa listesi, sağda metin
export function LegalPage({ slug, children }: { slug: LegalSlug; children?: React.ReactNode }) {
  const page = legal[slug];
  const groups = ["Kurumsal", "Sözleşmeler"] as const;
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-8 pt-40 md:px-6">
      <Breadcrumb crumbs={[{ label: "Ana Sayfa", href: "/" }, { label: page.title }]} />
      <div className="mt-8 grid gap-12 lg:grid-cols-[250px_1fr] lg:gap-16">
        <aside className="order-last lg:order-none">
          <nav className="space-y-8 lg:sticky lg:top-32">
            {groups.map((g) => (
              <div key={g}>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-accent">{g}</p>
                <ul className="space-y-1 border-l border-border">
                  {legalNav.filter((n) => n.group === g).map((n) => (
                    <li key={n.slug}>
                      <Link href={`/${n.slug}`} aria-current={n.slug === slug ? "page" : undefined}
                        className={`-ml-px block border-l-2 py-1.5 pl-4 text-sm transition-colors ${n.slug === slug ? "border-primary font-semibold text-primary" : "border-transparent text-muted hover:text-foreground"}`}>
                        {n.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        <article className="min-w-0">
          <h1 className="text-4xl font-light tracking-tight md:text-5xl">{page.title}</h1>
          {slug !== "hakkimizda" && slug !== "iletisim" && <p className="mt-3 text-sm text-muted">Son güncelleme: {policy.updated}</p>}
          <div className="legal mt-10 max-w-3xl">{children ?? page.body}</div>
        </article>
      </div>
    </div>
  );
}
