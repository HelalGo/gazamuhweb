import Link from "next/link";
import type { RowDataPacket } from "mysql2";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { Stars } from "@/components/Stars";
import { deleteReview, toggleReview } from "../../orders-actions";
import { ConfirmButton } from "../_client";
import { Badge, Empty, PageHead, card, iconBtn } from "../_ui";

export default async function AdminReviews() {
  const [rows] = await db().query<RowDataPacket[]>(
    `SELECT r.id, r.rating, r.comment, r.active, r.created_at, p.name AS product, p.slug, u.first_name, u.last_name, u.email
     FROM reviews r JOIN products p ON p.id = r.product_id JOIN users u ON u.id = r.user_id
     ORDER BY r.id DESC LIMIT 200`
  );
  return (
    <>
      <PageHead title="Yorumlar" sub="Yalnızca ürünü satın alan müşteriler yorum yapabilir. Uygunsuz yorumları gizleyebilir ya da silebilirsiniz." />
      {!rows.length ? (
        <Empty text="Henüz yorum yok." />
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id} className={`${card} ${r.active ? "" : "opacity-70"}`}>
              <div className="flex flex-wrap items-start gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface text-sm font-bold uppercase text-primary">{String(r.first_name).charAt(0)}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    <span className="font-semibold">{r.first_name} {r.last_name}</span>
                    <Stars value={r.rating} />
                    <span className="text-xs text-muted">{new Date(r.created_at).toLocaleDateString("tr-TR")}</span>
                    <Badge on={!!r.active} />
                  </div>
                  <Link href={`/urun/${r.slug}#yorumlar`} target="_blank" className="mt-0.5 line-clamp-1 text-xs text-muted hover:text-primary">{r.product} · {r.email}</Link>
                  <p className="mt-2 whitespace-pre-line text-sm text-foreground/85">{r.comment}</p>
                </div>
                <div className="flex">
                  <form action={toggleReview}><input type="hidden" name="id" value={r.id} />
                    <button className={iconBtn} title={r.active ? "Gizle" : "Yayınla"} aria-label={r.active ? "Gizle" : "Yayınla"}>{r.active ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                  </form>
                  <form action={deleteReview}><input type="hidden" name="id" value={r.id} />
                    <ConfirmButton message="Bu yorum kalıcı olarak silinecek. Emin misiniz?" className={`${iconBtn} hover:bg-red-50 hover:text-red-600`} title="Sil" aria-label="Sil"><Trash2 size={16} /></ConfirmButton>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
