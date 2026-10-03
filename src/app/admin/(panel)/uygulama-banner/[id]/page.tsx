import { notFound } from "next/navigation";
import type { RowDataPacket } from "mysql2";
import { ensureAppBannerTable } from "@/lib/cms";
import { db } from "@/lib/db";
import { adminSite } from "@/lib/site-db";
import { siteOf } from "@/lib/sites";
import { APP_BANNER_REQ } from "@/lib/layouts";
import { getCategories } from "@/lib/products";
import { saveAppBanner } from "../../../cms-actions";
import { SubmitButton } from "../../_client";
import { DeleteForm, Label, Notice, PageHead, SizeBadge, Toggle, btnPrimary, field, fileCls, SiteBadge } from "../../_ui";

export default async function AppBannerForm({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ err?: string }> }) {
  const { id } = await params;
  const { err } = await searchParams;
  const isNew = id === "new";
  await ensureAppBannerTable();
  let r: RowDataPacket = {} as RowDataPacket;
  if (!isNew) {
    const [rows] = await db().query<RowDataPacket[]>("SELECT * FROM app_banners WHERE id = ?", [Number(id)]);
    if (!rows[0]) notFound();
    r = rows[0];
  }
  const cats = await getCategories();
  const target: string = r.target ?? "";
  const isApp = !target || target === "kampanyalar" || target.startsWith("kategori:");

  return (
    <div className="mx-auto max-w-4xl">
      <PageHead title={isNew ? "Yeni Uygulama Bannerı" : "Uygulama Bannerını Düzenle"} back={{ href: "/admin/uygulama-banner", label: "Uygulama Bannerları" }}><SiteBadge site={isNew ? await adminSite() : siteOf(r?.site)} /></PageHead>
      <Notice err={err} />
      <div className="grid gap-6 md:grid-cols-[1fr_300px]">
        <form action={saveAppBanner} className="space-y-5 rounded-2xl border border-border bg-white p-5 shadow-sm md:p-6">
          {!isNew && <input type="hidden" name="id" value={id} />}
          <div className="space-y-3">
            <p className="text-sm font-semibold">Görsel</p>
            <SizeBadge req={APP_BANNER_REQ} note="yatay 2:1 oran; farklı oranlı görselin kenarları kırpılır. Görselin üzerinde zaten yazı varsa başlığı boş bırakın" />
            <input type="file" name="image" accept="image/jpeg,image/png,image/webp" required={isNew} className={fileCls} />
          </div>
          <Label text="Başlık (isteğe bağlı)" hint="Görselin sol altına beyaz yazıyla basılır. En fazla iki satır görünür.">
            <input name="title" defaultValue={r.title ?? ""} maxLength={120} placeholder="Örn. Yoğuşmalı kombilerde kış kampanyası" className={field} />
          </Label>
          <Label text="Alt yazı (isteğe bağlı)" hint="Başlığın altında küçük yazı.">
            <input name="text" defaultValue={r.text ?? ""} maxLength={200} placeholder="Örn. Seçili modellerde indirimli fiyatlar" className={field} />
          </Label>
          <Label text="Dokununca açılacak yer" hint="Uygulama içindeki bir sayfa seçin ya da aşağıya sitedeki bir adresi yazın.">
            <select name="target" defaultValue={isApp ? target : ""} className={field}>
              <option value="">Bağlantı yok</option>
              <option value="kampanyalar">Kampanyalar sayfası</option>
              {cats.map((c) => <option key={c} value={`kategori:${c}`}>Kategori: {c}</option>)}
            </select>
          </Label>
          <Label text="Ya da site adresi (isteğe bağlı)" hint="Örn. /urun/baymak-... ya da https://... Doluysa yukarıdaki seçimin yerine bu açılır.">
            <input name="target_url" defaultValue={isApp ? "" : target} maxLength={300} placeholder="/urun/..." className={field} />
          </Label>
          <Toggle name="active" defaultChecked={isNew ? true : !!r.active} label="Uygulamada yayınla" />
          <SubmitButton className={btnPrimary}>Kaydet</SubmitButton>
        </form>

        {/* uygulamadaki görünümün önizlemesi (kayıtlı haliyle) */}
        <div className="hidden md:block">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Uygulamada görünüm</p>
          <div className="rounded-[24px] border-[6px] border-[#0b1d45] bg-white p-3 shadow-lg">
            <div className="mb-2 flex h-8 items-center rounded-[4px] border border-border bg-surface px-3 text-[10px] text-muted">Kombi, klima, marka ara…</div>
            <div className="relative aspect-[2/1] overflow-hidden rounded-[4px] bg-surface">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {r.image_url ? <img src={r.image_url} alt="" className="absolute inset-0 h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-[10px] text-muted">Görsel yüklenince görünür</div>}
              {r.title && (
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-r from-[#0b1d45]/75 to-transparent p-3 pr-[35%]">
                  <p className="text-[11px] font-extrabold leading-tight text-white">{r.title}</p>
                  {r.text && <p className="mt-0.5 text-[9px] text-white/80">{r.text}</p>}
                </div>
              )}
            </div>
            <div className="mt-2 flex justify-center gap-1"><i className="h-1 w-3 rounded-[4px] bg-primary" /><i className="h-1 w-1 rounded-[4px] bg-border" /><i className="h-1 w-1 rounded-[4px] bg-border" /></div>
          </div>
        </div>
      </div>
      {!isNew && <DeleteForm table="app_banners" id={Number(id)} />}
    </div>
  );
}
