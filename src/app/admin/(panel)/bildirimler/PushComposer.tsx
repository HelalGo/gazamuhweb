"use client";
import { useState } from "react";
// _ui ile aynı sınıflar (istemci bileşeni sunucu modülünü içe aktarmasın diye burada)
const field = "w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/15";
const fileCls = "block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-surface file:px-4 file:py-2 file:text-sm file:font-semibold hover:file:bg-surface-alt";

// Başlık, mesaj ve görsel; yanında telefondaki görünümün canlı önizlemesi
export function PushComposer() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [img, setImg] = useState<string | null>(null);
  return (
    <div className="grid gap-6 md:grid-cols-[1fr_280px]">
      <div className="space-y-5">
        <label className="block">
          <span className="mb-1.5 flex justify-between text-sm font-semibold">Başlık<span className="font-normal text-muted">{title.length}/65</span></span>
          <input name="title" required maxLength={65} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ör. Kombi bakım kampanyası başladı" className={field} />
        </label>
        <label className="block">
          <span className="mb-1.5 flex justify-between text-sm font-semibold">Mesaj<span className="font-normal text-muted">{body.length}/178</span></span>
          <textarea name="body" required maxLength={178} rows={3} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Ör. Ekim sonuna kadar tüm kombi bakımlarında %20 indirim." className={field} />
        </label>
        <div className="space-y-2">
          <p className="text-sm font-semibold">Görsel (isteğe bağlı)</p>
          <p className="text-xs text-muted">Bildirim açıldığında büyük görünür. Yatay 2:1 oran önerilir (ör. 1200×600), JPG/PNG/WebP, en fazla 5 MB.</p>
          <input type="file" name="image" accept="image/jpeg,image/png,image/webp" className={fileCls}
            onChange={(e) => { const f = e.target.files?.[0]; setImg(f ? URL.createObjectURL(f) : null); }} />
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Telefonda görünüm</p>
        <div className="rounded-[26px] bg-gradient-to-b from-[#1a3e85] to-[#0b1d45] p-3 pt-10 shadow-lg">
          <div className="rounded-2xl bg-white/95 p-3 shadow">
            <div className="flex items-center gap-2 text-[10px] text-slate-500">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.png" alt="" className="h-4 w-4 rounded" />GAZ-A Mühendislik<span className="ml-auto">şimdi</span>
            </div>
            <p className="mt-1.5 text-[13px] font-bold leading-snug text-slate-900">{title || "Bildirim başlığı"}</p>
            <p className="mt-0.5 text-[12px] leading-snug text-slate-700">{body || "Mesaj metni burada görünür."}</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {img && <img src={img} alt="" className="mt-2 aspect-[2/1] w-full rounded-lg object-cover" />}
          </div>
          <div className="h-24" />
        </div>
      </div>
    </div>
  );
}
