import { notFound } from "next/navigation";
import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import { ensurePricingTables } from "@/lib/pricing";
import { saveCoupon } from "../../../shop-actions";
import { SubmitButton } from "../../_client";
import { Label, Notice, PageHead, Toggle, btnPrimary, card, field } from "../../_ui";

const day = (v: unknown) => (v ? new Date(v as string).toLocaleDateString("sv-SE") : "");
const TYPES = [
  ["percent", "Yüzde indirim (%)", "Ör. %10 → 20.000 ₺ sepette 2.000 ₺ indirim"],
  ["amount", "Sabit tutar (₺)", "Ör. 500 ₺ → sepetten 500 ₺ düşer"],
] as const;

export default async function CouponForm({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ err?: string }> }) {
  const { id } = await params;
  const { err } = await searchParams;
  const isNew = id === "new";
  await ensurePricingTables();
  let r: RowDataPacket = { type: "percent", active: 1, min_total: 0 } as RowDataPacket;
  if (!isNew) {
    const [rows] = await db().query<RowDataPacket[]>("SELECT * FROM coupons WHERE id = ?", [Number(id)]);
    if (!rows[0]) notFound();
    r = rows[0];
  }
  return (
    <div className="mx-auto max-w-3xl">
      <PageHead title={isNew ? "Yeni İndirim Kuponu" : "Kuponu Düzenle"} back={{ href: "/admin/kuponlar", label: "İndirim Kuponları" }} />
      <Notice err={err} />
      <form action={saveCoupon} className={`${card} space-y-6`}>
        {!isNew && <input type="hidden" name="id" value={id} />}
        <Label text="Kupon kodu" hint="Müşterinin sepete yazacağı kod. Büyük/küçük harf fark etmez; boşluk kullanılamaz. Ör. HOSGELDIN10, KIS2026">
          <input name="code" required defaultValue={r.code ?? ""} maxLength={40} className={`${field} font-mono text-base font-bold uppercase tracking-wide`} />
        </Label>

        <fieldset>
          <legend className="mb-2 text-sm font-semibold">İndirim türü</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {TYPES.map(([v, t, h]) => (
              <label key={v} className="flex cursor-pointer gap-3 rounded-xl border border-border p-4 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                <input type="radio" name="type" value={v} defaultChecked={r.type === v} className="mt-1 accent-[#1a3e85]" />
                <span><span className="block text-sm font-semibold">{t}</span><span className="block text-xs text-muted">{h}</span></span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-5 sm:grid-cols-2">
          <Label text="İndirim değeri" hint="Yüzde için 1–100 arası; tutar için ₺.">
            <input name="value" required inputMode="decimal" defaultValue={r.value != null ? Number(r.value) : ""} className={field} placeholder="10" />
          </Label>
          <Label text="En az sepet tutarı (₺)" hint="Boş ya da 0: sınır yok.">
            <input name="min_total" inputMode="decimal" defaultValue={Number(r.min_total) || ""} className={field} placeholder="0" />
          </Label>
          <Label text="Toplam kullanım sınırı" hint="Kupon kaç siparişte kullanılabilir? Boş: sınırsız.">
            <input name="max_uses" inputMode="numeric" defaultValue={r.max_uses ?? ""} className={field} placeholder="Sınırsız" />
          </Label>
          <div className="flex items-end text-sm text-muted">{!isNew && <p>Şu ana kadar <strong className="text-foreground">{r.used_count}</strong> siparişte kullanıldı.</p>}</div>
          <Label text="Başlangıç tarihi" hint="Boş: hemen geçerli.">
            <input type="date" name="starts_at" defaultValue={day(r.starts_at)} className={field} />
          </Label>
          <Label text="Bitiş tarihi" hint="Bu gün dahil geçerlidir. Boş: süresiz.">
            <input type="date" name="ends_at" defaultValue={day(r.ends_at)} className={field} />
          </Label>
        </div>

        <Label text="Not (yalnızca admin görür)" hint="Ör. Instagram kampanyası, bayi indirimi">
          <input name="note" defaultValue={r.note ?? ""} maxLength={200} className={field} />
        </Label>
        <Toggle name="active" defaultChecked={!!r.active} label="Aktif" hint="Kapalıyken müşteriler bu kuponu kullanamaz." />

        <div className="flex justify-end border-t border-border pt-5">
          <SubmitButton className={btnPrimary}>{isNew ? "Kuponu oluştur" : "Kaydet"}</SubmitButton>
        </div>
      </form>
    </div>
  );
}
