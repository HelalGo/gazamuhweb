import Image from "next/image";
import Link from "next/link";
import type { Tile } from "@/lib/cms";
import { Reveal } from "./Reveal";

// Dikey görselli kartlar; başlık görselin alt kısmında görünür.
export function Showcase({ tiles }: { tiles: Tile[] }) {
  if (!tiles.length) return null;
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 md:px-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {tiles.map((t, n) => (
          <Reveal key={t.id} delay={(n % 4) * 0.08}>
            <Link href={t.url} className="group relative block aspect-[5/7] overflow-hidden rounded-[4px] bg-gradient-to-br from-[#0b1d45] via-primary to-accent">
              {t.image && <Image src={t.image} alt={t.title} fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover transition-transform duration-700 group-hover:scale-105" unoptimized />}
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/65 to-transparent" />
              <p className="absolute inset-x-0 bottom-6 px-3 text-center text-lg font-bold text-white drop-shadow sm:text-2xl">{t.title}</p>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
