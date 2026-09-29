"use client";
import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { ImagePlus, Loader2 } from "lucide-react";

// Tıklanınca onay sorar; "Vazgeç" denirse form gönderilmez.
export function ConfirmButton({ message, className, children, ...rest }: { message: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...rest} className={className} onClick={(e) => { if (!window.confirm(message)) e.preventDefault(); }}>
      {children}
    </button>
  );
}

// Form gönderilirken dönen simge gösterir ve tekrar basılmasını engeller.
export function SubmitButton({ children, className }: { children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className={`${className} disabled:opacity-60`}>
      {pending && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}

// Dosya seçilince görseli hemen önizler.
export function ImageInput({ name, current, required, hint }: { name: string; current?: string | null; required?: boolean; hint?: string }) {
  const [preview, setPreview] = useState<string | null>(null);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  const shown = preview ?? current;
  return (
    <label className="group block cursor-pointer">
      <div className="relative grid aspect-square w-full place-items-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-surface transition-colors group-hover:border-accent">
        {shown ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shown} alt="" className="h-full w-full object-contain p-4" />
        ) : (
          <span className="flex flex-col items-center gap-2 text-sm text-muted"><ImagePlus size={28} />Görsel seçin</span>
        )}
        {shown && <span className="absolute inset-x-3 bottom-3 rounded-lg bg-black/60 py-1.5 text-center text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">Değiştirmek için tıklayın</span>}
      </div>
      <input
        type="file" name={name} required={required} accept="image/jpeg,image/png,image/webp" className="sr-only"
        onChange={(e) => { const f = e.target.files?.[0]; setPreview(f ? URL.createObjectURL(f) : null); }}
      />
      {preview && <span className="mt-2 block text-xs font-semibold text-accent">Yeni görsel seçildi — kaydedince uygulanır.</span>}
      {hint && <span className="mt-2 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

// Tablodaki seçim kutularını (form="bulk", name="ids") toplu işlem çubuğuna bağlar.
export function SelectAll() {
  return (
    <input
      type="checkbox" aria-label="Tümünü seç" className="h-4 w-4 accent-[#1a3e85]"
      onChange={(e) => {
        document.querySelectorAll<HTMLInputElement>('input[form="bulk"][name="ids"]').forEach((c) => (c.checked = e.target.checked));
        document.dispatchEvent(new Event("bulk-change"));
      }}
    />
  );
}

export function RowCheck({ id }: { id: number }) {
  return (
    <input type="checkbox" form="bulk" name="ids" value={id} aria-label="Seç" className="h-4 w-4 accent-[#1a3e85]"
      onChange={() => document.dispatchEvent(new Event("bulk-change"))} />
  );
}

// Seçili satır varken görünen alt çubuk.
export function BulkBar({ action, back }: { action: (f: FormData) => Promise<void>; back: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const update = () => setCount(document.querySelectorAll('input[form="bulk"][name="ids"]:checked').length);
    document.addEventListener("bulk-change", update);
    return () => document.removeEventListener("bulk-change", update);
  }, []);
  const btn = "rounded-lg px-3 py-2 text-sm font-semibold hover:bg-white/10";
  return (
    <form id="bulk" action={action} className={`fixed inset-x-0 bottom-4 z-40 mx-auto lg:left-64 w-fit max-w-[calc(100%-2rem)] transition-all ${count ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"}`}>
      <input type="hidden" name="back" value={back} />
      <div className="flex flex-wrap items-center gap-1 rounded-2xl bg-[#0b1d45] px-3 py-2 text-white shadow-2xl">
        <span className="px-2 text-sm font-bold">{count} ürün seçili</span>
        <span className="mx-1 h-5 w-px bg-white/20" />
        <button name="op" value="publish" className={btn}>Yayınla</button>
        <button name="op" value="hide" className={btn}>Gizle</button>
        <button name="op" value="instock" className={btn}>Stokta</button>
        <button name="op" value="outstock" className={btn}>Stokta yok</button>
        <ConfirmButton name="op" value="delete" message={`${count} ürün kalıcı olarak silinecek. Emin misiniz?`} className={`${btn} text-red-300`}>Sil</ConfirmButton>
      </div>
    </form>
  );
}

// Galeriye çoklu görsel seçimi; seçilenleri önizler.
export function GalleryInput({ name, max }: { name: string; max: number }) {
  const [previews, setPreviews] = useState<string[]>([]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);
  return (
    <div>
      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-surface px-4 py-4 text-sm font-semibold text-muted transition-colors hover:border-accent hover:text-foreground">
        <ImagePlus size={18} />Görsel ekle (birden fazla seçebilirsiniz)
        <input
          type="file" name={name} multiple accept="image/jpeg,image/png,image/webp" className="sr-only"
          onChange={(e) => setPreviews([...(e.target.files ?? [])].slice(0, max).map((f) => URL.createObjectURL(f)))}
        />
      </label>
      {previews.length > 0 && (
        <>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {previews.map((u) => <img key={u} src={u} alt="" className="aspect-square w-full rounded-lg border border-accent object-cover" />)}
          </div>
          <p className="mt-2 text-xs font-semibold text-accent">{previews.length} yeni görsel seçildi — kaydedince eklenir.</p>
        </>
      )}
    </div>
  );
}
