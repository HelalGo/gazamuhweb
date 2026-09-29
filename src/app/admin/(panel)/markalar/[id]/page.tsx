import { notFound } from "next/navigation";
import type { RowDataPacket } from "mysql2";
import { ensureBrandTable } from "@/lib/cms";
import { db } from "@/lib/db";
import { BRAND_REQ } from "@/lib/layouts";
import { saveBrand } from "../../../cms-actions";
import { SubmitButton } from "../../_client";
import { DeleteForm, ImagePreview, Label, Notice, PageHead, SizeBadge, Toggle, btnPrimary, field, fileCls } from "../../_ui";

export default async function BrandForm({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ err?: string }> }) {
  const { id } = await params;
  const { err } = await searchParams;
  const isNew = id === "new";
  await ensureBrandTable();
  let r: RowDataPacket = {} as RowDataPacket;
  if (!isNew) {
    const [rows] = await db().query<RowDataPacket[]>("SELECT * FROM brand_logos WHERE id = ?", [Number(id)]);
    if (!rows[0]) notFound();
    r = rows[0];
  }
  // Ürünlerdeki marka adları: logonun doğru ürün listesine gitmesi için ad birebir aynı olmalı
  const [brands] = await db().query<RowDataPacket[]>("SELECT brand, COUNT(*) n FROM products WHERE brand IS NOT NULL AND brand <> '' GROUP BY brand ORDER BY brand");

  return (
    <div className="mx-auto max-w-2xl">
      <PageHead title={isNew ? "Yeni Marka" : "Markayı Düzenle"} back={{ href: "/admin/markalar", label: "Markalar" }} />
      <Notice err={err} />
      <form action={saveBrand} className="space-y-5 rounded-2xl border border-border bg-white p-5 shadow-sm md:p-6">
        {!isNew && <input type="hidden" name="id" value={id} />}
        <Label text="Marka" hint="Listeden seçin; tıklanınca bu markanın ürünleri açılır.">
          <input name="name" required list="brand-names" defaultValue={r.name ?? ""} maxLength={80} placeholder="Örn. Vaillant" className={field} />
          <datalist id="brand-names">
            {brands.map((b) => <option key={b.brand} value={b.brand}>{b.n} ürün</option>)}
          </datalist>
        </Label>
        <div className="space-y-3">
          <p className="text-sm font-semibold">Logo</p>
          <SizeBadge req={BRAND_REQ} note="şeffaf arka planlı PNG en iyi sonucu verir; logonun etrafında fazla boşluk bırakmayın" />
          <ImagePreview src={r.image_url} className="h-24" />
          <input type="file" name="image" accept="image/jpeg,image/png,image/webp" required={isNew} className={fileCls} />
        </div>
        <Toggle name="active" defaultChecked={isNew ? true : !!r.active} label="Sitede yayınla" />
        <SubmitButton className={btnPrimary}>Kaydet</SubmitButton>
      </form>
      {!isNew && <DeleteForm table="brand_logos" id={Number(id)} />}
    </div>
  );
}
