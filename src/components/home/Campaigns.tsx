import Image from "next/image";
import Link from "next/link";
import type { CampaignBlock, CampaignItem } from "@/lib/cms";
import { CAMPAIGN_LAYOUTS } from "@/lib/layouts";
import { Reveal } from "./Reveal";

function Cell({ item, className }: { item: CampaignItem; className: string }) {
  const inner = <Image src={item.image_url} alt={item.alt} fill sizes="(min-width:1280px) 640px, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" unoptimized />;
  const cls = `group relative block overflow-hidden rounded-[4px] bg-surface ${className}`;
  return item.url ? <Link href={item.url} className={cls}>{inner}</Link> : <div className={cls}>{inner}</div>;
}

// Yerleşimler layouts.ts'teki boyutlarla birebir aynı oranlarda çizilir.
function Block({ b }: { b: CampaignBlock }) {
  const it = b.items;
  const need = CAMPAIGN_LAYOUTS[b.layout]?.slots.length ?? 0;
  if (!need || it.length < need) return null;

  switch (b.layout) {
    case "full":
      return <Cell item={it[0]} className="aspect-[1600/450]" />;
    case "half":
      return <div className="grid gap-4 sm:grid-cols-2">{it.slice(0, 2).map((x, i) => <Cell key={i} item={x} className="aspect-[16/9]" />)}</div>;
    case "third":
      return <div className="grid gap-4 sm:grid-cols-3">{it.slice(0, 3).map((x, i) => <Cell key={i} item={x} className="aspect-[4/3]" />)}</div>;
    case "bigLeft":
      return (
        <div className="grid gap-4 sm:aspect-[2/1] sm:grid-cols-2 sm:grid-rows-2">
          <Cell item={it[0]} className="aspect-square sm:row-span-2 sm:aspect-auto" />
          <Cell item={it[1]} className="aspect-[2/1] sm:aspect-auto" />
          <Cell item={it[2]} className="aspect-[2/1] sm:aspect-auto" />
        </div>
      );
    case "bigRight":
      return (
        <div className="grid gap-4 sm:aspect-[2/1] sm:grid-cols-2 sm:grid-rows-2">
          <Cell item={it[0]} className="aspect-[2/1] sm:aspect-auto" />
          <Cell item={it[2]} className="aspect-square sm:col-start-2 sm:row-span-2 sm:row-start-1 sm:aspect-auto" />
          <Cell item={it[1]} className="aspect-[2/1] sm:aspect-auto" />
        </div>
      );
    default:
      return null;
  }
}

export function Campaigns({ blocks }: { blocks: CampaignBlock[] }) {
  if (!blocks.length) return null;
  return (
    <section className="mx-auto w-full max-w-7xl space-y-4 px-4 py-10 md:px-6">
      {blocks.map((b) => <Reveal key={b.id}><Block b={b} /></Reveal>)}
    </section>
  );
}
