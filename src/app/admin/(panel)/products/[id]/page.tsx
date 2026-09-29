import Link from "next/link";
import { notFound } from "next/navigation";
import type { RowDataPacket } from "mysql2";
import { ExternalLink, Save, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { deleteProduct, saveProduct } from "../../../actions";
import { ConfirmButton, GalleryInput, ImageInput, SubmitButton } from "../../_client";
import { Label, Notice, PageHead, Toggle, btnGhost, btnPrimary, card, field } from "../../_ui";

export default async function EditProduct({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string; imgerror?: string }> }) {
  const { id } = await params;
  const { saved, error, imgerror } = await searchParams;
  const isNew = id === "new";
  let r: RowDataPacket = {} as RowDataPacket;
  if (!isNew) {
    const [rows] = await db().query<RowDataPacket[]>("SELECT * FROM products WHERE id = ?", [Number(id)]);
    if (!rows[0]) notFound();
    r = rows[0];
  }
  const specs = r.specs ? (typeof r.specs === "string" ? JSON.parse(r.specs) : r.specs) : {};
  const specText = Object.entries(specs).map(([k, v]) => `${k}: ${v}`).join("\n");
  const [cats] = await db().query<RowDataPacket[]>("SELECT DISTINCT category FROM products WHERE category IS NOT NULL ORDER BY category");
  const [brands] = await db().query<RowDataPacket[]>("SELECT DISTINCT brand FROM products WHERE brand IS NOT NULL ORDER BY brand");
  const gallery: string[] = (typeof r.images === "string" ? JSON.parse(r.images) : r.images) ?? [];
  const err = imgerror ? `Görsel yüklenemedi: ${imgerror}` : error ? "Ürün adı ve fiyat zorunlu." : undefined;

  return (
    <>
      <PageHead title={isNew ? "Yeni Ürün" : "Ürünü Düzenle"} sub={isNew ? undefined : r.name} back={{ href: "/admin/products", label: "Ürünler" }}>
        {!isNew && <a href={`/urun/${r.slug}`} target="_blank" className={btnGhost}><ExternalLink size={16} />Sitede gör</a>}
      </PageHead>
      <Notice saved={saved} err={err} />

      <form action={saveProduct}>
        {!isNew && <input type="hidden" name="id" value={id} />}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className={`${card} space-y-5`}>
              <h2 className="font-bold">Temel bilgiler</h2>
              <Label text="Ürün adı"><input name="name" required defaultValue={r.name} className={field} /></Label>
              <div className="grid gap-5 sm:grid-cols-2">
                <Label text="Marka">
                  <input name="brand" list="brands" defaultValue={r.brand ?? ""} className={field} />
                  <datalist id="brands">{brands.map((b) => <option key={b.brand} value={b.brand} />)}</datalist>
                </Label>
                <Label text="Ürün kodu (SKU)"><input name="sku" defaultValue={r.sku ?? ""} className={field} /></Label>
                <Label text="Kategori" hint="Listeden seçin ya da yeni kategori yazın.">
                  <input name="category" list="cats" defaultValue={r.category ?? ""} className={field} />
                  <datalist id="cats">{cats.map((c) => <option key={c.category} value={c.category} />)}</datalist>
                </Label>
                <Label text="Ürün grubu"><input name="product_group" defaultValue={r.product_group ?? ""} className={field} /></Label>
              </div>
            </section>

            <section className={`${card} space-y-5`}>
              <h2 className="font-bold">Açıklama ve özellikler</h2>
              <Label text="Açıklama"><textarea name="description" rows={7} defaultValue={r.description ?? ""} className={field} /></Label>
              <Label text="Teknik özellikler" hint="Her satıra bir özellik yazın: Özellik: Değer (örn. Kapasite: 24 kW)">
                <textarea name="specs" rows={8} defaultValue={specText} className={`${field} font-mono text-[13px]`} />
              </Label>
            </section>
          </div>

          <div className="space-y-6">
            <section className={`${card} space-y-4`}>
              <h2 className="font-bold">Durum</h2>
              <Toggle name="active" defaultChecked={isNew ? true : !!r.active} label="Sitede yayınla" hint="Kapalıysa ürün sitede görünmez." />
              <Toggle name="in_stock" defaultChecked={isNew ? true : !!r.in_stock} label="Stokta" hint="Kapalıysa “Tükendi” yazar, sepete eklenemez." />
            </section>

            <section className={`${card} space-y-4`}>
              <h2 className="font-bold">Fiyat</h2>
              <Label text="Satış fiyatı (₺)" hint="0 yazarsanız “Fiyat için arayın” gösterilir."><input name="price" required inputMode="decimal" defaultValue={r.price ?? ""} className={field} /></Label>
              <Label text="Eski fiyat (₺)" hint="İndirim göstermek için; boş bırakılabilir."><input name="old_price" inputMode="decimal" defaultValue={r.old_price ?? ""} className={field} /></Label>
            </section>

            <section className={`${card} space-y-4`}>
              <h2 className="font-bold">Kapak görseli</h2>
              <ImageInput name="image_file" current={r.image_url} hint="JPG, PNG veya WebP · en fazla 5 MB · kare görseller en iyi sonucu verir." />
              {r.image_url && (
                <label className="flex items-center gap-2 text-sm text-muted"><input type="checkbox" name="remove_image" className="h-4 w-4 accent-[#1a3e85]" /> Görseli kaldır</label>
              )}
              <details className="text-sm">
                <summary className="cursor-pointer font-semibold text-muted hover:text-foreground">Görsel adresi (URL) ile ekle</summary>
                <input name="image_url" defaultValue={r.image_url ?? ""} placeholder="https://…" className={`${field} mt-2`} />
              </details>
            </section>

            <section className={`${card} space-y-4`}>
              <div>
                <h2 className="font-bold">Ek görseller <span className="text-sm font-normal text-muted">({gallery.length}/12)</span></h2>
                <p className="mt-1 text-xs text-muted">Ürün sayfasındaki galeride görünür; ilki, ürün kartının üzerine gelince gösterilir.</p>
              </div>
              {gallery.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {gallery.map((u) => (
                    <label key={u} className="group relative block cursor-pointer">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={u} alt="" className="aspect-square w-full rounded-lg border border-border object-cover transition group-has-[:checked]:opacity-30" />
                      <span className="absolute inset-x-1 bottom-1 flex items-center gap-1 rounded-md bg-white/90 px-1.5 py-1 text-[11px] font-semibold">
                        <input type="checkbox" name="remove_gallery" value={u} className="h-3.5 w-3.5 accent-red-600" />Kaldır
                      </span>
                    </label>
                  ))}
                </div>
              )}
              {gallery.length < 12 && <GalleryInput name="gallery_files" max={12 - gallery.length} />}
            </section>
          </div>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-white/90 backdrop-blur lg:left-64">
          <div className="mx-auto flex max-w-6xl items-center justify-end gap-3 px-4 py-3 md:px-8">
            <Link href="/admin/products" className={btnGhost}>Vazgeç</Link>
            <SubmitButton className={btnPrimary}><Save size={16} />{isNew ? "Ürünü oluştur" : "Değişiklikleri kaydet"}</SubmitButton>
          </div>
        </div>
      </form>

      {!isNew && (
        <form action={deleteProduct} className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-red-200 bg-red-50/50 p-5">
          <input type="hidden" name="id" value={id} />
          <div><p className="text-sm font-bold text-red-700">Ürünü sil</p><p className="text-xs text-red-700/70">Bu işlem geri alınamaz. Yalnızca geçici olarak kaldırmak için “Sitede yayınla”yı kapatın.</p></div>
          <ConfirmButton message={`"${r.name}" kalıcı olarak silinecek. Emin misiniz?`} className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white hover:bg-red-700"><Trash2 size={16} />Ürünü sil</ConfirmButton>
        </form>
      )}
      <div className="h-24" />
    </>
  );
}
