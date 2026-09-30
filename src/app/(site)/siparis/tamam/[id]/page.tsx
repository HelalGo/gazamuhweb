import Link from "next/link";
import { notFound } from "next/navigation";
import type { RowDataPacket } from "mysql2";
import { CheckCircle2 } from "lucide-react";
import { BankCard } from "@/components/BankCard";
import { ClearCart } from "@/components/ClearCart";
import { BrandIcon } from "@/components/SocialIcons";
import { requireUser } from "@/lib/customer";
import { db } from "@/lib/db";
import { orderNo } from "@/lib/orders";
import { PAYMENT_SOON, WHATSAPP_NUMBER } from "@/lib/site";
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
      <p className="mt-4 text-sm leading-relaxed text-muted">Ödemenizi aşağıdaki hesaba havale / EFT ile yapabilirsiniz; açıklamaya sipariş numaranızı yazmayı unutmayın. Ödemeniz ulaştığında siparişiniz hazırlanmaya başlar. Durumunu hesabınızdan takip edebilirsiniz.</p>
      <div className="mt-6"><BankCard amount={tl(Number(rows[0].total))} reference={orderNo(id)} /></div>
      <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Merhaba, ${orderNo(id)} numaralı siparişimin ödemesini yaptım. Dekontu gönderiyorum.`)}`} target="_blank" rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#128C7E] hover:underline">
        <BrandIcon name="whatsapp" size={16} />Dekontu WhatsApp&apos;tan gönderin
      </a>
      <p className="mt-2 text-[11px] text-muted">{PAYMENT_SOON}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href={`/hesabim/siparis/${id}`} className="rounded-[4px] bg-primary px-7 py-3 text-sm font-semibold text-white">Siparişimi Görüntüle</Link>
        <Link href="/urunler" className="rounded-[4px] bg-surface px-7 py-3 text-sm font-semibold hover:bg-surface-alt">Alışverişe Devam Et</Link>
      </div>
    </div>
  );
}
