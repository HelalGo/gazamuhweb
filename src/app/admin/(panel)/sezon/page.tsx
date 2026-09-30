import { Snowflake, Sun } from "lucide-react";
import { SEASONS, autoSeason, getSeasonMode, type Season } from "@/lib/season";
import { saveSeason } from "../../shop-actions";
import { SubmitButton } from "../_client";
import { Notice, PageHead, btnPrimary, card } from "../_ui";

const ICON: Record<Season, React.ReactNode> = { isitma: <Snowflake size={18} />, sogutma: <Sun size={18} /> };

export default async function SeasonPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const mode = await getSeasonMode();
  const auto = autoSeason();
  const active: Season = mode === "auto" ? auto : mode;
  const options = [
    { v: "auto", t: "Otomatik (önerilen)", h: `Takvime göre değişir. Şu an: ${SEASONS[auto].label}. Isıtma ${SEASONS.isitma.months}, soğutma ${SEASONS.sogutma.months}.` },
    { v: "isitma", t: SEASONS.isitma.label, h: "Takvimden bağımsız olarak ısıtma sırası kullanılır." },
    { v: "sogutma", t: SEASONS.sogutma.label, h: "Takvimden bağımsız olarak soğutma sırası kullanılır." },
  ];

  return (
    <div className="mx-auto max-w-3xl">
      <PageHead title="Mevsim Sıralaması" sub="Header ve footer menüsündeki kategori sırası, ana sayfadaki kategori sekmeleri ve bölümleri, site haritası ve mobil uygulamanın ana sayfası mevsime göre sıralanır. Mevsimin ilk kategorisi ana sayfada “En Çok Satan…” bölümünde öne çıkar." />
      <Notice saved={saved} />

      <form action={saveSeason} className={`${card} space-y-3`}>
        <p className="mb-1 text-sm font-semibold">Sezon</p>
        {options.map((o) => (
          <label key={o.v} className="flex cursor-pointer gap-3 rounded-xl border border-border p-4 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
            <input type="radio" name="season_mode" value={o.v} defaultChecked={mode === o.v} className="mt-1 accent-[#1a3e85]" />
            <span><span className="block text-sm font-semibold">{o.t}</span><span className="block text-xs text-muted">{o.h}</span></span>
          </label>
        ))}
        <div className="flex justify-end pt-2"><SubmitButton className={btnPrimary}>Kaydet</SubmitButton></div>
      </form>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {(Object.keys(SEASONS) as Season[]).map((s) => (
          <div key={s} className={`${card} ${s === active ? "ring-2 ring-primary" : ""}`}>
            <p className="flex items-center gap-2 font-bold">
              <span className="text-primary">{ICON[s]}</span>{SEASONS[s].label}
              {s === active && <span className="ml-auto rounded-lg bg-primary px-2 py-0.5 text-[11px] font-bold text-white">Şu an kullanılıyor</span>}
            </p>
            <p className="mt-0.5 text-xs text-muted">{SEASONS[s].months}</p>
            <ol className="mt-4 space-y-1.5 text-sm">
              {SEASONS[s].order.map((c, i) => (
                <li key={c} className="flex items-center gap-2.5">
                  <span className="grid h-6 w-6 place-items-center rounded-md bg-surface text-xs font-bold text-muted">{i + 1}</span>
                  <span className={i === 0 ? "font-bold text-primary" : ""}>{c}{i === 0 && " · En Çok Satan bölümü"}</span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>
    </div>
  );
}
