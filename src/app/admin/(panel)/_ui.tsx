import Link from "next/link";
import { ArrowDown, ArrowUp } from "lucide-react";
import { deleteItem, moveItem, toggleItem } from "../cms-actions";
import type { Req } from "@/lib/uploads";

export const field = "w-full rounded-xl bg-surface px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/50";
export const fileCls = "block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-surface file:px-4 file:py-2 file:text-sm file:font-semibold hover:file:bg-surface-alt";

export function Label({ text, hint, children }: { text: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">{text}</span>
      {children}
      {hint && <span className="mt-1.5 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function Notice({ saved, err }: { saved?: string; err?: string }) {
  return (
    <>
      {saved && <p role="status" className="mb-6 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">Kaydedildi.</p>}
      {err && <p role="alert" className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{err}</p>}
    </>
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

type Row = { id: number; thumb: string | null; title: string; sub: string; active: number };

export function AdminList({ table, base, rows, empty }: { table: string; base: string; rows: Row[]; empty: string }) {
  if (!rows.length) return <p className="rounded-2xl bg-surface p-8 text-center text-sm text-muted">{empty}</p>;
  const btn = "grid h-8 w-8 place-items-center rounded-lg bg-surface hover:bg-surface-alt";
  return (
    <ul className="divide-y divide-border">
      {rows.map((r, i) => (
        <li key={r.id} className={`flex flex-wrap items-center gap-4 py-4 ${r.active ? "" : "opacity-60"}`}>
          <div className="h-16 w-28 shrink-0 overflow-hidden rounded-lg bg-surface">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {r.thumb && <img src={r.thumb} alt="" className="h-full w-full object-cover" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-1 font-semibold">{r.title || "(başlıksız)"}</p>
            <p className="line-clamp-1 text-xs text-muted">{r.sub}</p>
          </div>
          <div className="flex items-center gap-2">
            {(["up", "down"] as const).map((d) => (
              <form key={d} action={moveItem}>
                <input type="hidden" name="table" value={table} /><input type="hidden" name="id" value={r.id} /><input type="hidden" name="dir" value={d} />
                <button className={`${btn} disabled:opacity-30`} disabled={(d === "up" && i === 0) || (d === "down" && i === rows.length - 1)} aria-label={d === "up" ? "Yukarı taşı" : "Aşağı taşı"}>
                  {d === "up" ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                </button>
              </form>
            ))}
            <form action={toggleItem}>
              <input type="hidden" name="table" value={table} /><input type="hidden" name="id" value={r.id} />
              <button className={`rounded-full px-3 py-1 text-xs font-bold ${r.active ? "bg-green-100 text-green-700" : "bg-surface-alt text-muted"}`}>{r.active ? "Yayında" : "Gizli"}</button>
            </form>
            <Link href={`${base}/${r.id}`} className="px-2 text-sm font-semibold text-accent hover:underline">Düzenle</Link>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function DeleteForm({ table, id }: { table: string; id: number }) {
  return (
    <form action={deleteItem} className="mt-10 border-t border-border pt-6">
      <input type="hidden" name="table" value={table} /><input type="hidden" name="id" value={id} />
      <button className="text-sm font-semibold text-red-600 hover:underline">Bunu sil</button>
    </form>
  );
}

export function PageHead({ title, sub, newHref, newLabel }: { title: string; sub: string; newHref: string; newLabel: string }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-extrabold">{title}</h1>
        <p className="mt-1 text-sm leading-relaxed text-muted">{sub}</p>
      </div>
      <Link href={newHref} className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white">{newLabel}</Link>
    </div>
  );
}
