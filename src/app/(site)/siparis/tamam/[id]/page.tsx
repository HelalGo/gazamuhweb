import Link from "next/link";
import { notFound } from "next/navigation";
import type { RowDataPacket } from "mysql2";
import { CheckCircle2 } from "lucide-react";
import { ClearCart } from "@/components/ClearCart";
import { requireUser } from "@/lib/customer";
import { db } from "@/lib/db";
import { orderNo } from "@/lib/orders";
import { tl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OrderDone({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const u = await requireUser(`/siparis/tamam/${id}`);
  const [rows] = await db().query<RowDataPacket[]>("SELECT id, total FROM orders WHERE id = ? AND user_id = ?", [id, u.id]);
  if (!rows[0]) notFound();

  return (
    <div className="mx-auto w-full max-w-xl px-4 pb-8 pt-44 text-center md:px-6">
      <ClearCart />
      <CheckCircle2 size={56} className="mx-auto text-green-600" />
      <h1 className="mt-6 text-2xl font-extrabold">Siparişiniz alındı</h1>
      <p className="mt-2 text-muted">Sipariş numaranız <strong className="text-foreground">{orderNo(id)}</strong> · Toplam <strong className="text-foreground">{tl(Number(rows[0].total))}</strong></p>
      <p className="mt-4 text-sm leading-relaxed text-muted">Ödeme ve teslimat ayrıntıları için sizinle iletişime geçeceğiz. Siparişinizin durumunu hesabınızdan takip edebilirsiniz.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href={`/hesabim/siparis/${id}`} className="rounded-[4px] bg-primary px-7 py-3 text-sm font-semibold text-white">Siparişimi Görüntüle</Link>
        <Link href="/urunler" className="rounded-[4px] bg-surface px-7 py-3 text-sm font-semibold hover:bg-surface-alt">Alışverişe Devam Et</Link>
      </div>
    </div>
  );
}
