import Link from "next/link";
import { notFound } from "next/navigation";
import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import { deleteProduct, saveProduct } from "../../../actions";

const field = "w-full rounded-xl bg-surface px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/50";

function Label({ text, children }: { text: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">{text}</span>
      {children}
    </label>
  );
}

export default async function EditProduct({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { id } = await params;
  const { saved, error } = await searchParams;
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

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/products" className="text-sm text-muted hover:text-foreground">← Ürünler</Link>
      <h1 className="mb-6 mt-2 text-2xl font-extrabold">{isNew ? "Yeni Ürün" : "Ürünü Düzenle"}</h1>
      {saved && <p role="status" className="mb-6 rounded-xl bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">Kaydedildi.</p>}
      {error && <p role="alert" className="mb-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">Ürün adı ve fiyat zorunlu.</p>}

      <form action={saveProduct} className="space-y-5">
        {!isNew && <input type="hidden" name="id" value={id} />}
        <Label text="Ürün adı"><input name="name" required defaultValue={r.name} className={field} /></Label>
        <div className="grid gap-5 sm:grid-cols-2">
          <Label text="Marka"><input name="brand" defaultValue={r.brand ?? ""} className={field} /></Label>
          <Label text="Ürün kodu (SKU)"><input name="sku" defaultValue={r.sku ?? ""} className={field} /></Label>
          <Label text="Kategori">
            <input name="category" list="cats" defaultValue={r.category ?? ""} className={field} />
            <datalist id="cats">{cats.map((c) => <option key={c.category} value={c.category} />)}</datalist>
          </Label>
          <Label text="Ürün grubu"><input name="product_group" defaultValue={r.product_group ?? ""} className={field} /></Label>
          <Label text="Fiyat (₺)"><input name="price" required inputMode="decimal" defaultValue={r.price ?? ""} className={field} /></Label>
          <Label text="Eski fiyat (₺)"><input name="old_price" inputMode="decimal" defaultValue={r.old_price ?? ""} className={field} /></Label>
        </div>
        <Label text="Açıklama"><textarea name="description" rows={7} defaultValue={r.description ?? ""} className={field} /></Label>
        <Label text="Teknik özellikler (her satır: Özellik: Değer)"><textarea name="specs" rows={6} defaultValue={specText} className={field + " font-mono"} /></Label>
        <Label text="Görsel adresi (URL)"><input name="image_url" defaultValue={r.image_url ?? ""} placeholder="https://…" className={field} /></Label>
        <div className="flex gap-8 text-sm font-semibold">
          <label className="flex items-center gap-2"><input type="checkbox" name="in_stock" defaultChecked={isNew ? true : !!r.in_stock} className="h-4 w-4 accent-[#1a3e85]" /> Stokta</label>
          <label className="flex items-center gap-2"><input type="checkbox" name="active" defaultChecked={isNew ? true : !!r.active} className="h-4 w-4 accent-[#1a3e85]" /> Sitede yayınla</label>
        </div>
        <button className="rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white">Kaydet</button>
      </form>

      {!isNew && (
        <form action={deleteProduct} className="mt-10 border-t border-border pt-6">
          <input type="hidden" name="id" value={id} />
          <button className="text-sm font-semibold text-red-600 hover:underline">Bu ürünü sil</button>
        </form>
      )}
    </div>
  );
}
