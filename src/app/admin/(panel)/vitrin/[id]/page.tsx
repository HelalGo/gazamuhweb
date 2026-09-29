import Link from "next/link";
import { notFound } from "next/navigation";
import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import { TILE_REQ } from "@/lib/layouts";
import { saveTile } from "../../../cms-actions";
import { DeleteForm, ImagePreview, Label, Notice, SizeBadge, field, fileCls } from "../../_ui";

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
      <Link href="/admin/vitrin" className="text-sm text-muted hover:text-foreground">← Vitrin Kartları</Link>
      <h1 className="mb-6 mt-2 text-2xl font-extrabold">{isNew ? "Yeni Kart" : "Kartı Düzenle"}</h1>
      <Notice err={err} />
      <form action={saveTile} className="space-y-5">
        {!isNew && <input type="hidden" name="id" value={id} />}
        <Label text="Başlık"><input name="title" required defaultValue={r.title ?? ""} maxLength={80} placeholder="Örn. Kombi" className={field} /></Label>
        <Label text="Tıklanınca gidilecek adres" hint="Site içi için /kombi, dışarısı için https://…"><input name="url" defaultValue={r.url ?? ""} placeholder="/kombi" className={field} /></Label>
        <div className="space-y-3">
          <p className="text-sm font-semibold">Görsel</p>
          <SizeBadge req={TILE_REQ} note="dikey kart; başlık görselin alt kısmına yazılır, o bölgeyi sade bırakın" />
          <ImagePreview src={r.image_url} className="h-40" />
          <input type="file" name="image" accept="image/jpeg,image/png,image/webp" required={isNew} className={fileCls} />
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="active" defaultChecked={isNew ? true : !!r.active} className="h-4 w-4 accent-[#1a3e85]" /> Sitede yayınla</label>
        <button className="rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white">Kaydet</button>
      </form>
      {!isNew && <DeleteForm table="showcase_tiles" id={Number(id)} />}
    </div>
  );
}
