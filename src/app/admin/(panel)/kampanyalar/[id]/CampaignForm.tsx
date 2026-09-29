"use client";
import { useState } from "react";
import { CAMPAIGN_LAYOUTS, type CampaignLayout } from "@/lib/layouts";
import type { CampaignItem } from "@/lib/cms";
import { saveCampaign } from "../../../cms-actions";

const field = "w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-4 focus:ring-accent/15";
const fileCls = "block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-surface file:px-4 file:py-2 file:text-sm file:font-semibold hover:file:bg-surface-alt";

// Yerleşimin küçük çizimi (hangi görsel nereye gelir)
function Diagram({ layout }: { layout: CampaignLayout }) {
  const box = "grid place-items-center rounded bg-primary/15 text-[10px] font-bold text-primary";
  const n = (i: number) => <span>{i}</span>;
  const wrap = "grid h-24 w-44 gap-1";
  if (layout === "full") return <div className={wrap}><div className={box}>{n(1)}</div></div>;
  if (layout === "half") return <div className={`${wrap} grid-cols-2`}><div className={box}>{n(1)}</div><div className={box}>{n(2)}</div></div>;
  if (layout === "third") return <div className={`${wrap} grid-cols-3`}>{[1, 2, 3].map((i) => <div key={i} className={box}>{n(i)}</div>)}</div>;
  if (layout === "bigLeft")
    return <div className={`${wrap} grid-cols-2 grid-rows-2`}><div className={`${box} row-span-2`}>{n(1)}</div><div className={box}>{n(2)}</div><div className={box}>{n(3)}</div></div>;
  return <div className={`${wrap} grid-cols-2 grid-rows-2`}><div className={box}>{n(1)}</div><div className={`${box} row-span-2`}>{n(3)}</div><div className={box}>{n(2)}</div></div>;
}

export function CampaignForm({ id, title, layout: initial, items, active, err }: {
  id?: string; title: string; layout: CampaignLayout; items: CampaignItem[]; active: boolean; err?: string;
}) {
  const [layout, setLayout] = useState<CampaignLayout>(initial);
  const def = CAMPAIGN_LAYOUTS[layout];
  const sameAsSaved = layout === initial;

  return (
    <form action={saveCampaign} className="space-y-6 rounded-2xl border border-border bg-white p-5 shadow-sm md:p-6">
      {id && <input type="hidden" name="id" value={id} />}
      {err && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{err}</p>}

      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold">Başlık (isteğe bağlı, sitede görünmez — sadece sizin için not)</span>
        <input name="title" defaultValue={title} maxLength={120} className={field} placeholder="Örn. Eylül klima kampanyası" />
      </label>

      <fieldset>
        <legend className="mb-3 text-sm font-semibold">Yerleşim (grid yapısı)</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {(Object.keys(CAMPAIGN_LAYOUTS) as CampaignLayout[]).map((k) => (
            <label key={k} className={`flex cursor-pointer items-center gap-4 rounded-2xl p-4 transition-colors ${layout === k ? "bg-primary/10 ring-2 ring-primary" : "bg-surface hover:bg-surface-alt"}`}>
              <input type="radio" name="layout" value={k} checked={layout === k} onChange={() => setLayout(k)} className="sr-only" />
              <Diagram layout={k} />
              <span><span className="block text-sm font-bold">{CAMPAIGN_LAYOUTS[k].label}</span><span className="block text-xs text-muted">{CAMPAIGN_LAYOUTS[k].hint}</span></span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="space-y-6">
        {def.slots.map((s, i) => {
          const current = sameAsSaved ? items[i] : undefined;
          return (
            <section key={`${layout}-${i}`} className="space-y-3 rounded-2xl bg-surface p-5">
              <h3 className="font-bold">{i + 1}. görsel — {s.name}</h3>
              <div className="rounded-xl bg-blue-50 px-4 py-3 text-xs leading-relaxed text-blue-900">
                <p><strong>Gerekli boyut: {s.req.w}×{s.req.h} px</strong> (oran {s.req.w}:{s.req.h}; en az {Math.round(s.req.w * 0.75)} px genişlik)</p>
                <p>JPG, PNG veya WebP · en fazla 5 MB</p>
              </div>
              {current?.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={current.image_url} alt="" className="h-24 w-auto rounded-lg bg-white object-contain" />
              )}
              <input type="file" name={`image_${i}`} accept="image/jpeg,image/png,image/webp" required={!current?.image_url} className={fileCls} />
              <div className="grid gap-3 sm:grid-cols-2">
                <input name={`url_${i}`} defaultValue={current?.url ?? ""} placeholder="Tıklanınca gidilecek adres (/klima)" className={field} />
                <input name={`alt_${i}`} defaultValue={current?.alt ?? ""} maxLength={120} placeholder="Görsel açıklaması (erişilebilirlik)" className={field} />
              </div>
            </section>
          );
        })}
      </div>

      {!sameAsSaved && id && <p className="text-xs text-amber-700">Yerleşimi değiştirdiniz: tüm görselleri yeniden yüklemeniz gerekir.</p>}
      <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="active" defaultChecked={active} className="h-4 w-4 accent-[#1a3e85]" /> Sitede yayınla</label>
      <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#15336d]">Kaydet</button>
    </form>
  );
}
