"use client";
import { useRef, useState } from "react";
import {
  AlignLeft, ArrowDown, ArrowUp, Bold, Copy, Eye, Heading2, Heading3, ImagePlus, Info, Link2, List, ListOrdered, Loader2, Minus, PenLine,
  Plus, Quote, Table2, Trash2,
} from "lucide-react";
import { BlogContent } from "@/components/BlogContent";
import { BLOCK_LABELS, NOTE_TONES, emptyBlock, type BlogBlock, type BlogType } from "@/lib/blog-types";
import { uploadBlogImage } from "../../../blog-actions";

const ICONS: Record<BlogType, React.ComponentType<{ size?: number; className?: string }>> = {
  h2: Heading2, h3: Heading3, p: AlignLeft, ul: List, ol: ListOrdered, img: ImagePlus, table: Table2, quote: Quote, note: Info, hr: Minus,
};
const ORDER: BlogType[] = ["p", "h2", "h3", "ul", "ol", "img", "table", "quote", "note", "hr"];

const input = "w-full rounded-[4px] border border-border bg-white px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/15";
const small = "inline-flex items-center gap-1.5 rounded-[4px] border border-border bg-white px-2.5 py-1.5 text-xs font-semibold text-foreground/80 transition hover:bg-surface";

// Blok tabanlı yazı düzenleyici. İçerik gizli "content" alanında JSON olarak forma eklenir.
export function BlogEditor({ initial }: { initial: BlogBlock[] }) {
  const [blocks, setBlocks] = useState<BlogBlock[]>(initial.length ? initial : [emptyBlock("p")]);
  const [preview, setPreview] = useState(false);
  const [menuAt, setMenuAt] = useState<number | null>(null); // hangi bloğun altına eklenecek (-1: en üst)

  const update = (i: number, b: BlogBlock) => setBlocks((bs) => bs.map((x, k) => (k === i ? b : x)));
  const insert = (at: number, t: BlogType) => { setBlocks((bs) => [...bs.slice(0, at + 1), emptyBlock(t), ...bs.slice(at + 1)]); setMenuAt(null); };
  const move = (i: number, d: -1 | 1) => setBlocks((bs) => { const c = [...bs]; [c[i], c[i + d]] = [c[i + d], c[i]]; return c; });
  const remove = (i: number) => setBlocks((bs) => (bs.length > 1 ? bs.filter((_, k) => k !== i) : [emptyBlock("p")]));
  const duplicate = (i: number) => setBlocks((bs) => [...bs.slice(0, i + 1), structuredClone(bs[i]), ...bs.slice(i + 1)]);

  return (
    <div className="rounded-2xl border border-border bg-white shadow-sm">
      <input type="hidden" name="content" value={JSON.stringify(blocks)} />
      <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
        <p className="text-sm font-bold">İçerik</p>
        <div className="flex rounded-[4px] border border-border p-0.5 text-xs font-semibold">
          <button type="button" onClick={() => setPreview(false)} className={`inline-flex items-center gap-1.5 rounded-[3px] px-3 py-1.5 ${!preview ? "bg-primary text-white" : "text-muted"}`}><PenLine size={14} />Düzenle</button>
          <button type="button" onClick={() => setPreview(true)} className={`inline-flex items-center gap-1.5 rounded-[3px] px-3 py-1.5 ${preview ? "bg-primary text-white" : "text-muted"}`}><Eye size={14} />Önizleme</button>
        </div>
      </div>

      {preview ? (
        <div className="px-5 py-8 md:px-10"><BlogContent blocks={blocks} /></div>
      ) : (
        <div className="space-y-3 p-4 md:p-5">
          <AddMenu open={menuAt === -1} onToggle={() => setMenuAt(menuAt === -1 ? null : -1)} onPick={(t) => insert(-1, t)} compact />
          {blocks.map((b, i) => {
            const Icon = ICONS[b.t];
            return (
              <div key={i}>
                <div className="group rounded-[4px] border border-border bg-surface/40 transition focus-within:border-accent/60 focus-within:bg-white">
                  <div className="flex items-center gap-2 border-b border-border/70 px-3 py-1.5">
                    <Icon size={15} className="text-accent" />
                    <span className="text-xs font-bold uppercase tracking-wider text-muted">{BLOCK_LABELS[b.t]}</span>
                    <div className="ml-auto flex items-center gap-0.5">
                      <IconBtn label="Yukarı taşı" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp size={14} /></IconBtn>
                      <IconBtn label="Aşağı taşı" disabled={i === blocks.length - 1} onClick={() => move(i, 1)}><ArrowDown size={14} /></IconBtn>
                      <IconBtn label="Çoğalt" onClick={() => duplicate(i)}><Copy size={14} /></IconBtn>
                      <IconBtn label="Sil" danger onClick={() => remove(i)}><Trash2 size={14} /></IconBtn>
                    </div>
                  </div>
                  <div className="p-3"><BlockEditor b={b} onChange={(nb) => update(i, nb)} /></div>
                </div>
                <AddMenu open={menuAt === i} onToggle={() => setMenuAt(menuAt === i ? null : i)} onPick={(t) => insert(i, t)} compact={i < blocks.length - 1} />
              </div>
            );
          })}
          <p className="pt-1 text-xs leading-relaxed text-muted">
            Metinlerde <strong>**kalın**</strong> ve <strong>[bağlantı metni](/urun/...)</strong> kullanabilirsiniz; paragraftaki &quot;Kalın&quot; ve &quot;Bağlantı&quot; düğmeleri seçili metne bunu kendiliğinden ekler.
          </p>
        </div>
      )}
    </div>
  );
}

function AddMenu({ open, onToggle, onPick, compact }: { open: boolean; onToggle: () => void; onPick: (t: BlogType) => void; compact?: boolean }) {
  return (
    <div className={compact && !open ? "flex h-3 items-center justify-center opacity-0 transition-opacity hover:opacity-100 focus-within:opacity-100" : "py-1"}>
      {open ? (
        <div className="grid grid-cols-2 gap-2 rounded-[4px] border border-dashed border-accent/50 bg-accent/5 p-3 sm:grid-cols-5">
          {ORDER.map((t) => {
            const Icon = ICONS[t];
            return (
              <button key={t} type="button" onClick={() => onPick(t)} className="flex flex-col items-center gap-1.5 rounded-[4px] border border-border bg-white px-2 py-3 text-xs font-semibold transition hover:border-accent hover:text-accent">
                <Icon size={18} />{BLOCK_LABELS[t]}
              </button>
            );
          })}
        </div>
      ) : (
        <button type="button" onClick={onToggle} className={compact
          ? "inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-bold text-white"
          : "flex w-full items-center justify-center gap-2 rounded-[4px] border border-dashed border-border py-3 text-sm font-semibold text-muted transition hover:border-accent hover:text-accent"}>
          <Plus size={compact ? 12 : 16} />{compact ? "Blok ekle" : "Blok ekle"}
        </button>
      )}
    </div>
  );
}

function IconBtn({ label, onClick, disabled, danger, children }: { label: string; onClick: () => void; disabled?: boolean; danger?: boolean; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={label} title={label}
      className={`grid h-7 w-7 place-items-center rounded-[4px] text-muted transition disabled:opacity-30 ${danger ? "hover:bg-red-50 hover:text-red-600" : "hover:bg-white hover:text-foreground"}`}>
      {children}
    </button>
  );
}

/* ---------- Blok türlerine göre düzenleme alanları ---------- */
function BlockEditor({ b, onChange }: { b: BlogBlock; onChange: (b: BlogBlock) => void }) {
  switch (b.t) {
    case "h2": case "h3":
      return <input value={b.text} onChange={(e) => onChange({ ...b, text: e.target.value })} placeholder={b.t === "h2" ? "Bölüm başlığı" : "Alt başlık"}
        className={`${input} ${b.t === "h2" ? "text-lg font-extrabold" : "text-base font-bold"}`} />;
    case "p":
      return <RichText value={b.text} onChange={(text) => onChange({ ...b, text })} rows={5} placeholder="Paragraf metni…" />;
    case "ul": case "ol":
      return (
        <div>
          <textarea value={b.items.join("\n")} onChange={(e) => onChange({ ...b, items: e.target.value.split("\n") })} rows={Math.max(3, b.items.length + 1)}
            placeholder={"Her satır bir madde\nİkinci madde"} className={`${input} leading-relaxed`} />
          <p className="mt-1 text-xs text-muted">Her satır ayrı bir madde olur.</p>
        </div>
      );
    case "img": return <ImageBlock b={b} onChange={onChange} />;
    case "table": return <TableBlock b={b} onChange={onChange} />;
    case "quote":
      return (
        <div className="space-y-2">
          <RichText value={b.text} onChange={(text) => onChange({ ...b, text })} rows={3} placeholder="Alıntı metni" />
          <input value={b.by} onChange={(e) => onChange({ ...b, by: e.target.value })} placeholder="Kimden (isteğe bağlı), örn. Mak. Müh. Ahmet Y." className={input} />
        </div>
      );
    case "note":
      return (
        <div className="space-y-2">
          <div className="flex gap-2">
            <select value={b.tone} onChange={(e) => onChange({ ...b, tone: e.target.value as typeof b.tone })} className={`${input} w-36`}>
              {Object.entries(NOTE_TONES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <input value={b.title} onChange={(e) => onChange({ ...b, title: e.target.value })} placeholder={`Kutu başlığı (boşsa "${NOTE_TONES[b.tone]}")`} className={input} />
          </div>
          <RichText value={b.text} onChange={(text) => onChange({ ...b, text })} rows={3} placeholder="Kutu metni" />
        </div>
      );
    case "hr":
      return <p className="text-center text-xs text-muted">Bölümler arasına ince bir ayırıcı çizgi konur.</p>;
  }
}

// Kalın / bağlantı düğmeli metin alanı: seçili metni **…** ya da [..](adres) ile sarar
function RichText({ value, onChange, rows, placeholder }: { value: string; onChange: (v: string) => void; rows: number; placeholder: string }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const wrap = (kind: "bold" | "link") => {
    const el = ref.current;
    if (!el) return;
    const [a, z] = [el.selectionStart, el.selectionEnd];
    const sel = value.slice(a, z) || (kind === "bold" ? "kalın metin" : "bağlantı metni");
    let rep = `**${sel}**`;
    if (kind === "link") {
      const url = window.prompt("Bağlantı adresi (site içi için / ile başlayın, örn. /urun/... ya da https://...)", "/");
      if (!url || !/^(\/(?!\/)|https?:\/\/)/.test(url)) return;
      rep = `[${sel}](${url.trim()})`;
    }
    onChange(value.slice(0, a) + rep + value.slice(z));
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(a, a + rep.length); });
  };
  return (
    <div>
      <div className="mb-1.5 flex gap-1.5">
        <button type="button" onClick={() => wrap("bold")} className={small}><Bold size={13} />Kalın</button>
        <button type="button" onClick={() => wrap("link")} className={small}><Link2 size={13} />Bağlantı</button>
      </div>
      <textarea ref={ref} value={value} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder} className={`${input} leading-relaxed`} />
    </div>
  );
}

function ImageBlock({ b, onChange }: { b: Extract<BlogBlock, { t: "img" }>; onChange: (b: BlogBlock) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pick = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    const fd = new FormData();
    fd.append("file", file);
    const r = await uploadBlogImage(fd).catch(() => ({ error: "Yükleme başarısız oldu." }) as { url?: string; error?: string });
    setBusy(false);
    if (r.url) onChange({ ...b, url: r.url });
    else setError(r.error ?? "Yükleme başarısız oldu.");
  };
  return (
    <div className="space-y-2">
      <label className="group relative block cursor-pointer overflow-hidden rounded-[4px] border-2 border-dashed border-border bg-white transition hover:border-accent">
        {b.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={b.url} alt="" className="max-h-80 w-full object-contain" />
        ) : (
          <span className="flex flex-col items-center gap-2 py-10 text-sm text-muted"><ImagePlus size={26} />Görsel seçin (en az 800 px genişlik, JPG/PNG/WebP, en fazla 5 MB)</span>
        )}
        {busy && <span className="absolute inset-0 grid place-items-center bg-white/80"><Loader2 className="animate-spin text-accent" /></span>}
        {b.url && !busy && <span className="absolute inset-x-3 bottom-3 rounded-[4px] bg-black/60 py-1.5 text-center text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100">Değiştirmek için tıklayın</span>}
        <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
      </label>
      {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
      <input value={b.caption} onChange={(e) => onChange({ ...b, caption: e.target.value })} placeholder="Görsel açıklaması (isteğe bağlı)" className={input} />
    </div>
  );
}

function TableBlock({ b, onChange }: { b: Extract<BlogBlock, { t: "table" }>; onChange: (b: BlogBlock) => void }) {
  const cols = Math.max(1, ...b.rows.map((r) => r.length));
  const set = (ri: number, ci: number, v: string) => onChange({ ...b, rows: b.rows.map((r, i) => (i === ri ? r.map((c, k) => (k === ci ? v : c)) : r)) });
  const addRow = () => onChange({ ...b, rows: [...b.rows, Array(cols).fill("")] });
  const addCol = () => cols < 8 && onChange({ ...b, rows: b.rows.map((r) => [...r, ""]) });
  const delRow = (ri: number) => b.rows.length > 1 && onChange({ ...b, rows: b.rows.filter((_, i) => i !== ri) });
  const delCol = (ci: number) => cols > 1 && onChange({ ...b, rows: b.rows.map((r) => r.filter((_, k) => k !== ci)) });
  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <tbody>
            {b.rows.map((r, ri) => (
              <tr key={ri}>
                {r.map((c, ci) => (
                  <td key={ci} className="border border-border p-0">
                    <input value={c} onChange={(e) => set(ri, ci, e.target.value)} placeholder={b.head && ri === 0 ? "Başlık" : ""}
                      className={`w-full min-w-28 bg-transparent px-2 py-2 outline-none focus:bg-accent/5 ${b.head && ri === 0 ? "font-bold text-primary" : ""}`} />
                  </td>
                ))}
                <td className="w-8 pl-1"><IconBtn label="Satırı sil" danger disabled={b.rows.length < 2} onClick={() => delRow(ri)}><Minus size={13} /></IconBtn></td>
              </tr>
            ))}
            <tr>
              {Array.from({ length: cols }, (_, ci) => (
                <td key={ci} className="pt-1 text-center"><IconBtn label="Sütunu sil" danger disabled={cols < 2} onClick={() => delCol(ci)}><Minus size={13} /></IconBtn></td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={addRow} className={small}><Plus size={13} />Satır</button>
        <button type="button" onClick={addCol} disabled={cols >= 8} className={`${small} disabled:opacity-40`}><Plus size={13} />Sütun</button>
        <label className="ml-auto flex items-center gap-2 text-xs font-semibold text-muted">
          <input type="checkbox" checked={b.head} onChange={(e) => onChange({ ...b, head: e.target.checked })} className="accent-[#1a3e85]" />İlk satır başlık
        </label>
      </div>
    </div>
  );
}
