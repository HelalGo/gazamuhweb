import Link from "next/link";
import type { Guide } from "@/lib/category-guides";

// Kategori sayfasında ürünlerin altında görünen rehber: seçim ipuçları ve sık sorulan sorular
export function CategoryGuide({ guide }: { guide: Guide }) {
  return (
    <section aria-labelledby="kategori-rehberi" className="mx-auto w-full max-w-7xl px-4 pb-4 md:px-6">
      <div className="border-t border-border pt-12">
        <h2 id="kategori-rehberi" className="text-2xl font-light tracking-tight md:text-3xl">{guide.heading}</h2>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted">{guide.intro}</p>

        <div className="mt-8 grid gap-x-10 gap-y-6 md:grid-cols-2">
          {guide.sections.map((s) => (
            <div key={s.h}>
              <h3 className="font-bold">{s.h}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.p}</p>
            </div>
          ))}
        </div>

        <h3 className="mt-10 font-bold">Sık sorulan sorular</h3>
        <div className="mt-3 divide-y divide-border rounded-[4px] border border-border">
          {guide.faq.map((f) => (
            <details key={f.q} className="group px-5 py-4">
              <summary className="cursor-pointer list-none text-sm font-semibold marker:hidden">
                <span className="mr-2 inline-block text-accent transition group-open:rotate-45">+</span>{f.q}
              </summary>
              <p className="mt-2 pl-5 text-sm leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>

        <p className="mt-6 text-sm text-muted">
          Size uygun modeli birlikte seçelim: <Link href="/bilgi-al" className="font-semibold text-primary hover:underline">ücretsiz bilgi ve teklif alın</Link>.
        </p>
      </div>
    </section>
  );
}
