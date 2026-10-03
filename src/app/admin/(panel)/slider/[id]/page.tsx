import { notFound } from "next/navigation";
import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import { adminSite } from "@/lib/site-db";
import { siteOf } from "@/lib/sites";
import { HERO_MOBILE_REQ, HERO_REQ } from "@/lib/layouts";
import { saveSlide } from "../../../cms-actions";
import { SubmitButton } from "../../_client";
import { DeleteForm, ImagePreview, Label, Notice, PageHead, SizeBadge, Toggle, btnPrimary, field, fileCls, SiteBadge } from "../../_ui";

export default async function SlideForm({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ err?: string }> }) {
  const { id } = await params;
  const { err } = await searchParams;
  const isNew = id === "new";
  let r: RowDataPacket = {} as RowDataPacket;
  if (!isNew) {
    const [rows] = await db().query<RowDataPacket[]>("SELECT * FROM hero_slides WHERE id = ?", [Number(id)]);
    if (!rows[0]) notFound();
    r = rows[0];
  }
  return (
    <div className="mx-auto max-w-3xl">
      <PageHead title={isNew ? "Yeni Slayt" : "Slaytı Düzenle"} back={{ href: "/admin/slider", label: "Slider" }}><SiteBadge site={isNew ? await adminSite() : siteOf(r?.site)} /></PageHead>
      <Notice err={err} />
      <form action={saveSlide} className="space-y-6 rounded-2xl border border-border bg-white p-5 shadow-sm md:p-6">
        {!isNew && <input type="hidden" name="id" value={id} />}

        <section className="space-y-3">
          <h2 className="font-bold">Arka plan görseli</h2>
          <SizeBadge req={HERO_REQ} note="yazıların ve önemli kısımların görselin ORTASINDA olmasına dikkat edin; küçük ekranlarda kenarlar kırpılır" />
          <ImagePreview src={r.image_url} className="h-32" />
          <input type="file" name="image" accept="image/jpeg,image/png,image/webp" required={isNew} className={fileCls} />
          <details className="rounded-xl bg-surface p-4 text-sm">
            <summary className="cursor-pointer font-semibold">Telefon için ayrı görsel (isteğe bağlı)</summary>
            <div className="mt-3 space-y-3">
              <SizeBadge req={HERO_MOBILE_REQ} note="dikey görsel" />
              <ImagePreview src={r.mobile_image_url} className="h-32" />
              <input type="file" name="mobile_image" accept="image/jpeg,image/png,image/webp" className={fileCls} />
              {r.mobile_image_url && <label className="flex items-center gap-2 text-muted"><input type="checkbox" name="remove_mobile" className="h-4 w-4 accent-[#1a3e85]" /> Telefon görselini kaldır</label>}
            </div>
          </details>
          <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="overlay" defaultChecked={isNew ? true : !!r.overlay} className="h-4 w-4 accent-[#1a3e85]" /> Yazı okunurluğu için görselin üzerine koyu katman ekle</label>
        </section>

        <section className="space-y-4">
          <h2 className="font-bold">Yazılar <span className="text-sm font-normal text-muted">(boş bırakırsanız slaytta sadece görsel görünür)</span></h2>
          <Label text="Küçük üst etiket"><input name="eyebrow" defaultValue={r.eyebrow ?? ""} maxLength={80} placeholder="Örn. Klima" className={field} /></Label>
          <Label text="Başlık"><input name="title" defaultValue={r.title ?? ""} maxLength={200} className={field} /></Label>
          <Label text="Açıklama"><textarea name="text" rows={3} defaultValue={r.text ?? ""} maxLength={400} className={field} /></Label>
        </section>

        <section className="space-y-4">
          <h2 className="font-bold">Butonlar <span className="text-sm font-normal text-muted">(en fazla 2; yazı ve adres ikisi de dolu olmalı)</span></h2>
          {[1, 2].map((n) => (
            <div key={n} className="grid gap-4 sm:grid-cols-2">
              <Label text={`${n}. buton yazısı`}><input name={`btn${n}_label`} defaultValue={r[`btn${n}_label`] ?? ""} maxLength={60} placeholder={n === 1 ? "Örn. Klimaları İncele" : ""} className={field} /></Label>
              <Label text={`${n}. buton adresi`} hint={n === 1 ? "Site içi için /klima, dışarısı için https://…" : undefined}>
                <input name={`btn${n}_url`} defaultValue={r[`btn${n}_url`] ?? ""} placeholder="/klima" className={field} />
              </Label>
            </div>
          ))}
        </section>

        <Toggle name="active" defaultChecked={isNew ? true : !!r.active} label="Sitede yayınla" />
        <SubmitButton className={btnPrimary}>Kaydet</SubmitButton>
      </form>
      {!isNew && <DeleteForm table="hero_slides" id={Number(id)} />}
    </div>
  );
}
