import { notFound } from "next/navigation";
import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import { TILE_REQ } from "@/lib/layouts";
import { saveTile } from "../../../cms-actions";
import { SubmitButton } from "../../_client";
import { DeleteForm, ImagePreview, Label, Notice, PageHead, SizeBadge, Toggle, btnPrimary, field, fileCls } from "../../_ui";

export default async function TileForm({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ err?: string }> }) {
  const { id } = await params;
  const { err } = await searchParams;
  const isNew = id === "new";
  let r: RowDataPacket = {} as RowDataPacket;
  if (!isNew) {
    const [rows] = await db().query<RowDataPacket[]>("SELECT * FROM showcase_tiles WHERE id = ?", [Number(id)]);
    if (!rows[0]) notFound();
    r = rows[0];
  }
  return (
    <div className="mx-auto max-w-2xl">
      <PageHead title={isNew ? "Yeni Kart" : "Kartı Düzenle"} back={{ href: "/admin/vitrin", label: "Vitrin Kartları" }} />
      <Notice err={err} />
      <form action={saveTile} className="space-y-5 rounded-2xl border border-border bg-white p-5 shadow-sm md:p-6">
        {!isNew && <input type="hidden" name="id" value={id} />}
        <Label text="Başlık"><input name="title" required defaultValue={r.title ?? ""} maxLength={80} placeholder="Örn. Kombi" className={field} /></Label>
        <Label text="Tıklanınca gidilecek adres" hint="Site içi için /kombi, dışarısı için https://…"><input name="url" defaultValue={r.url ?? ""} placeholder="/kombi" className={field} /></Label>
        <div className="space-y-3">
          <p className="text-sm font-semibold">Görsel</p>
          <SizeBadge req={TILE_REQ} note="dikey kart; başlık görselin alt kısmına yazılır, o bölgeyi sade bırakın" />
          <ImagePreview src={r.image_url} className="h-40" />
          <input type="file" name="image" accept="image/jpeg,image/png,image/webp" required={isNew} className={fileCls} />
        </div>
        <Toggle name="active" defaultChecked={isNew ? true : !!r.active} label="Sitede yayınla" />
        <SubmitButton className={btnPrimary}>Kaydet</SubmitButton>
      </form>
      {!isNew && <DeleteForm table="showcase_tiles" id={Number(id)} />}
    </div>
  );
}
