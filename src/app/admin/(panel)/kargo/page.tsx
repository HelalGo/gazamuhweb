import type { RowDataPacket } from "mysql2";
import { Info } from "lucide-react";
import { db } from "@/lib/db";
import { getShippingSettings } from "@/lib/pricing";
import { getCategories } from "@/lib/products";
import { saveShipping } from "../../shop-actions";
import { SubmitButton } from "../_client";
import { Label, Notice, PageHead, btnPrimary, card, field } from "../_ui";

const val = (n: number | undefined) => (n == null ? "" : String(n));

export default async function Shipping({ searchParams }: { searchParams: Promise<{ saved?: string; err?: string }> }) {
  const { saved, err } = await searchParams;
  const [ship, cats] = await Promise.all([getShippingSettings(), getCategories()]);
  const [counts] = await db().query<RowDataPacket[]>("SELECT category, COUNT(*) AS n FROM products WHERE active = 1 GROUP BY category");
  const count = new Map(counts.map((c) => [c.category as string, Number(c.n)]));
  // ürünü kalmamış ama ücreti kayıtlı kategoriler de listelenir
  const all = [...new Set([...cats, ...Object.keys(ship.rates)])].filter(Boolean);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHead title="Kargo Ücretleri" sub="Web sitesinde ve mobil uygulamada sepet ve sipariş özetinde kullanılır." />
      <Notice saved={saved} err={err} />

      <div className="mb-6 flex gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-relaxed text-blue-900">
        <Info size={18} className="mt-0.5 shrink-0" />
        <div>
          <p className="font-bold">Sepette farklı kategoriler olunca nasıl hesaplanır?</p>
          <p className="mt-1">Sipariş tek gönderi sayılır ve sepetteki kategorilerin kargo ücretlerinden <strong>en yükseği bir kez</strong> alınır. Ör. sepette Klima (750 ₺) ve Oda Termostatı (90 ₺) varsa kargo <strong>750 ₺</strong> olur. Aynı kategoriden birden fazla ürün de tek kargo ücreti öder.</p>
          <p className="mt-1">Ücretsiz kargo sınırı girerseniz, kupon indiriminden sonraki ürün toplamı bu tutarı geçen siparişlerde kargo ücretsiz olur.</p>
        </div>
      </div>

      <form action={saveShipping} className="space-y-6">
        <div className={`${card} grid gap-5 sm:grid-cols-2`}>
          <Label text="Varsayılan kargo ücreti (₺)" hint="Aşağıda ücret girilmeyen kategoriler için. 0: ücretsiz.">
            <input name="ship_default" inputMode="decimal" defaultValue={val(ship.defaultFee)} className={field} placeholder="0" />
          </Label>
          <Label text="Ücretsiz kargo sınırı (₺)" hint="Bu tutar ve üzeri siparişlerde kargo ücretsiz. 0: kapalı.">
            <input name="ship_free_over" inputMode="decimal" defaultValue={val(ship.freeOver)} className={field} placeholder="0" />
          </Label>
        </div>

        <div className={card}>
          <h2 className="font-bold">Kategori bazında kargo ücreti</h2>
          <p className="mt-1 text-xs text-muted">Boş bırakılan kategori varsayılan ücreti kullanır. Ücretsiz göndermek istediğiniz kategoriye 0 yazın.</p>
          <ul className="mt-5 divide-y divide-border">
            {all.map((c) => (
              <li key={c} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="font-semibold">{c}</p>
                  <p className="text-xs text-muted">{count.get(c) ?? 0} ürün</p>
                </div>
                <label className="relative w-40 shrink-0">
                  <span className="sr-only">{c} kargo ücreti</span>
                  <input name={`rate:${c}`} inputMode="decimal" defaultValue={val(ship.rates[c])} placeholder={`${ship.defaultFee} (varsayılan)`}
                    className={`${field} pr-9 text-right`} />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">₺</span>
                </label>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-end">
          <SubmitButton className={btnPrimary}>Kaydet</SubmitButton>
        </div>
      </form>
    </div>
  );
}
