import Link from "next/link";
import { ArrowDown, ArrowUp, CircleAlert, CircleCheck, Pencil, Plus, Trash2 } from "lucide-react";
import { deleteItem, moveItem, toggleItem } from "../cms-actions";
import type { Req } from "@/lib/uploads";
import { SITES, siteOf, type SiteKey } from "@/lib/sites";
import { ConfirmButton } from "./_client";

export const field = "w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/15";
export const fileCls = "block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-surface file:px-4 file:py-2 file:text-sm file:font-semibold hover:file:bg-surface-alt";
export const card = "rounded-2xl border border-border bg-white p-5 shadow-sm md:p-6";
export const btnPrimary = "inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#15336d]";
export const btnGhost = "inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold transition hover:bg-surface";
export const iconBtn = "grid h-9 w-9 place-items-center rounded-lg text-muted transition hover:bg-surface hover:text-foreground";

export function Label({ text, hint, children }: { text: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">{text}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function Notice({ saved, err, text = "Değişiklikler kaydedildi." }: { saved?: string; err?: string; text?: string }) {
  return (
    <>
      {saved && <p role="status" className="mb-6 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700"><CircleCheck size={18} />{text}</p>}
      {err && <p role="alert" className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"><CircleAlert size={18} />{err}</p>}
    </>
  );
}

export function Toggle({ name, defaultChecked, label, hint }: { name: string; defaultChecked?: boolean; label: string; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4">
      <span><span className="block text-sm font-semibold">{label}</span>{hint && <span className="block text-xs text-muted">{hint}</span>}</span>
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-slate-300 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-primary peer-checked:after:translate-x-5 peer-focus-visible:ring-4 peer-focus-visible:ring-accent/30" />
    </label>
  );
}

// "1920×1080 px" biçimi
export const size = (r: Req) => `${r.w}×${r.h} px`;

export function SizeBadge({ req, note }: { req: Req; note?: string }) {
  return (
    <div className="rounded-xl bg-blue-50 px-4 py-3 text-xs leading-relaxed text-blue-900">
      <p><strong>Gerekli boyut: {size(req)}</strong> {req.ratio === false ? "(en az bu genişlikte)" : `(oran ${req.w}:${req.h}; en az ${Math.round(req.w * 0.75)} px genişlik)`}</p>
      <p>JPG, PNG veya WebP · en fazla 5 MB{note ? ` · ${note}` : ""}</p>
    </div>
  );
}

export function ImagePreview({ src, className = "h-24" }: { src?: string | null; className?: string }) {
  if (!src) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" className={`${className} w-auto max-w-full rounded-lg bg-surface object-contain`} />;
}

export function Badge({ on, onText = "Yayında", offText = "Gizli" }: { on: boolean; onText?: string; offText?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${on ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${on ? "bg-green-500" : "bg-slate-400"}`} />{on ? onText : offText}
    </span>
  );
}

export function Empty({ text, action }: { text: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-white p-10 text-center">
      <p className="text-sm text-muted">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

type Row = { id: number; thumb: string | null; title: string; sub: string; active: number };

// Slider / vitrin / kampanya listeleri: sırala, yayınla-gizle, düzenle, sil
export function AdminList({ table, base, rows, empty, contain = false }: { table: string; base: string; rows: Row[]; empty: string; contain?: boolean }) {
  if (!rows.length) return <Empty text={empty} action={<Link href={`${base}/new`} className={btnPrimary}><Plus size={16} />İlk kaydı ekle</Link>} />;
  const hidden = (
    <><input type="hidden" name="table" value={table} /></>
  );
  return (
    <ul className="space-y-3">
      {rows.map((r, i) => (
        <li key={r.id} className={`flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-white p-3 pr-4 shadow-sm ${r.active ? "" : "opacity-70"}`}>
          <Link href={`${base}/${r.id}`} className="h-16 w-28 shrink-0 overflow-hidden rounded-xl bg-surface">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {r.thumb && <img src={r.thumb} alt="" className={`h-full w-full ${contain ? "object-contain p-2" : "object-cover"}`} />}
          </Link>
          <div className="min-w-0 flex-1">
            <Link href={`${base}/${r.id}`} className="line-clamp-1 font-semibold hover:text-primary">{r.title || "(başlıksız)"}</Link>
            <p className="line-clamp-1 text-xs text-muted">{r.sub}</p>
          </div>
          <form action={toggleItem}>{hidden}<input type="hidden" name="id" value={r.id} />
            <button title="Yayınla / gizle"><Badge on={!!r.active} /></button>
          </form>
          <div className="flex items-center">
            {(["up", "down"] as const).map((d) => (
              <form key={d} action={moveItem}>
                {hidden}<input type="hidden" name="id" value={r.id} /><input type="hidden" name="dir" value={d} />
                <button className={`${iconBtn} disabled:opacity-30`} disabled={(d === "up" && i === 0) || (d === "down" && i === rows.length - 1)} aria-label={d === "up" ? "Yukarı taşı" : "Aşağı taşı"}>
                  {d === "up" ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                </button>
              </form>
            ))}
            <Link href={`${base}/${r.id}`} className={iconBtn} aria-label="Düzenle" title="Düzenle"><Pencil size={16} /></Link>
            <form action={deleteItem}>{hidden}<input type="hidden" name="id" value={r.id} />
              <ConfirmButton message="Bu kayıt kalıcı olarak silinecek. Emin misiniz?" className={`${iconBtn} hover:bg-red-50 hover:text-red-600`} aria-label="Sil" title="Sil"><Trash2 size={16} /></ConfirmButton>
            </form>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function DeleteForm({ table, id }: { table: string; id: number }) {
  return (
    <form action={deleteItem} className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50/50 p-5">
      <input type="hidden" name="table" value={table} /><input type="hidden" name="id" value={id} />
      <div><p className="text-sm font-bold text-red-700">Kaydı sil</p><p className="text-xs text-red-700/70">Bu işlem geri alınamaz; görselleri de silinir.</p></div>
      <ConfirmButton message="Bu kayıt kalıcı olarak silinecek. Emin misiniz?" className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"><Trash2 size={16} />Sil</ConfirmButton>
    </form>
  );
}

export function PageHead({ title, sub, newHref, newLabel, back, children }: {
  title: string; sub?: string; newHref?: string; newLabel?: string; back?: { href: string; label: string }; children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {back && <Link href={back.href} className="mb-1 inline-block text-sm text-muted hover:text-foreground">← {back.label}</Link>}
        <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
        {sub && <p className="mt-1 text-sm leading-relaxed text-muted">{sub}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {children}
        {newHref && <Link href={newHref} className={btnPrimary}><Plus size={16} />{newLabel}</Link>}
      </div>
    </div>
  );
}

// İçerik sayfalarında hangi markanın kayıtlarının listelendiğini gösterir (marka menüden değiştirilir)
export function SiteBadge({ site }: { site: SiteKey }) {
  return <span className="rounded-full bg-primary/10 px-3 py-1.5 text-sm font-bold text-primary" title="Marka menünün üstünden değiştirilir">{SITES[site].label}</span>;
}

// Sipariş ve taleplerin hangi siteden (ya da onun uygulamasından) geldiği
export function SiteTag({ site }: { site: unknown }) {
  const k = siteOf(site);
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${k === "kombiklimago" ? "bg-orange-50 text-orange-700" : "bg-blue-50 text-blue-700"}`}>{SITES[k].label}</span>;
}
