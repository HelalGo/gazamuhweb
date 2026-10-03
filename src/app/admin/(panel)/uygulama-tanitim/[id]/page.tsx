import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import type { RowDataPacket } from "mysql2";
import { ensureOnboardingTable } from "@/lib/cms";
import { db } from "@/lib/db";
import { adminSite } from "@/lib/site-db";
import { siteOf } from "@/lib/sites";
import { ONBOARD_REQ } from "@/lib/layouts";
import { saveOnboarding } from "../../../cms-actions";
import { SubmitButton } from "../../_client";
import { DeleteForm, Label, Notice, PageHead, SizeBadge, Toggle, btnPrimary, field, fileCls, SiteBadge } from "../../_ui";

export default async function OnboardingForm({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ err?: string }> }) {
  const { id } = await params;
  const { err } = await searchParams;
  const isNew = id === "new";
  await ensureOnboardingTable();
  let r: RowDataPacket = {} as RowDataPacket;
  if (!isNew) {
    const [rows] = await db().query<RowDataPacket[]>("SELECT * FROM app_onboarding WHERE id = ?", [Number(id)]);
    if (!rows[0]) notFound();
    r = rows[0];
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHead title={isNew ? "Yeni Tanıtım Sayfası" : "Tanıtım Sayfasını Düzenle"} back={{ href: "/admin/uygulama-tanitim", label: "Uygulama Tanıtımı" }}><SiteBadge site={isNew ? await adminSite() : siteOf(r?.site)} /></PageHead>
      <Notice err={err} />
      <div className="grid gap-6 md:grid-cols-[1fr_260px]">
        <form action={saveOnboarding} className="space-y-5 rounded-2xl border border-border bg-white p-5 shadow-sm md:p-6">
          {!isNew && <input type="hidden" name="id" value={id} />}
          <Label text="Başlık" hint="Kısa ve net olsun; telefonda en fazla iki satır görünür.">
            <input name="title" required defaultValue={r.title ?? ""} maxLength={120} placeholder="Örn. Kombi ve klimada uygun fiyat" className={field} />
          </Label>
          <Label text="Açıklama" hint="Başlığın altında görünen bir iki cümlelik metin (en fazla 400 karakter).">
            <textarea name="text" rows={4} defaultValue={r.text ?? ""} maxLength={400} placeholder="Örn. Yüzlerce ürünü inceleyin, sepetinize ekleyin, siparişinizi birkaç adımda verin." className={field} />
          </Label>
          <div className="space-y-3">
            <p className="text-sm font-semibold">Görsel</p>
            <SizeBadge req={ONBOARD_REQ} note="durum çubuğu dahil telefonun tüm ekranını kaplar; telefon boyuna göre kenarlardan biraz kırpılabilir, önemli kısmı ortada tutun; alt kısma başlık ve açıklama yazılır" />
            <input type="file" name="image" accept="image/jpeg,image/png,image/webp" required={isNew} className={fileCls} />
          </div>
          <Toggle name="active" defaultChecked={isNew ? true : !!r.active} label="Uygulamada yayınla" />
          <SubmitButton className={btnPrimary}>Kaydet</SubmitButton>
        </form>

        {/* telefondaki görünümün kabaca önizlemesi (kayıtlı haliyle) */}
        <div className="hidden md:block">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">Telefonda görünüm</p>
          <div className="relative aspect-[9/19.5] overflow-hidden rounded-[28px] border-[6px] border-[#0b1d45] bg-[#0b1d45] shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {r.image_url ? <img src={r.image_url} alt="" className="absolute inset-0 h-full w-full object-cover" /> : <div className="absolute inset-0 grid place-items-center text-xs text-white/60">Görsel yüklenince görünür</div>}
            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#0b1d45]/45 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent via-[#0b1d45]/70 to-[#0b1d45]/95" />
            <span className="absolute right-3 top-5 grid h-8 w-8 place-items-center rounded-full bg-white text-primary shadow"><ArrowRight size={16} /></span>
            <div className="absolute inset-x-0 bottom-0 px-4 pb-3">
              <p className="text-sm font-extrabold leading-snug text-white">{r.title || "Başlık"}</p>
              <p className="mt-1.5 text-[10px] leading-relaxed text-white/85">{r.text || "Açıklama metni"}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="flex gap-1"><i className="h-1.5 w-4 rounded-[4px] bg-white" /><i className="h-1.5 w-1.5 rounded-[4px] bg-white/40" /><i className="h-1.5 w-1.5 rounded-[4px] bg-white/40" /></span>
                <span className="text-[10px] font-semibold text-white underline">Tanıtımı geç</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {!isNew && <DeleteForm table="app_onboarding" id={Number(id)} />}
    </div>
  );
}
