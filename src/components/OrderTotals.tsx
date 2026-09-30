import { tl } from "@/lib/utils";

// Siparişin ara toplam / kargo / indirim satırları; bu bilgiler eklenmeden önceki siparişlerde görünmez
export function OrderTotals({ o: row }: { o: object }) {
  const o = row as { subtotal?: unknown; shipping?: unknown; discount?: unknown; coupon_code?: string | null };
  if (o.subtotal == null) return null;
  const discount = Number(o.discount ?? 0), shipping = Number(o.shipping ?? 0);
  return (
    <dl className="mt-2 space-y-2 border-t border-border pt-4 text-sm">
      <div className="flex justify-between"><dt className="text-muted">Ara toplam</dt><dd className="font-semibold">{tl(Number(o.subtotal))}</dd></div>
      <div className="flex justify-between"><dt className="text-muted">Kargo</dt><dd className="font-semibold">{shipping > 0 ? tl(shipping) : "Ücretsiz"}</dd></div>
      {discount > 0 && (
        <div className="flex justify-between text-green-700"><dt>İndirim{o.coupon_code ? ` (${o.coupon_code})` : ""}</dt><dd className="font-semibold">−{tl(discount)}</dd></div>
      )}
    </dl>
  );
}
