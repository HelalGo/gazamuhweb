import Link from "next/link";
import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import { Stars } from "@/components/Stars";
import { deleteReview, toggleReview } from "../../orders-actions";

export default async function AdminReviews() {
  const [rows] = await db().query<RowDataPacket[]>(
    `SELECT r.id, r.rating, r.comment, r.active, r.created_at, p.name AS product, p.slug, u.first_name, u.last_name, u.email
     FROM reviews r JOIN products p ON p.id = r.product_id JOIN users u ON u.id = r.user_id
     ORDER BY r.id DESC LIMIT 200`
  );
  return (
    <>
      <h1 className="text-2xl font-extrabold">Yorumlar</h1>
      <p className="mb-6 mt-1 text-sm text-muted">Yalnızca ürünü satın alan müşteriler yorum yapabilir. Uygunsuz yorumları gizleyebilir ya da silebilirsiniz.</p>
      {!rows.length ? (
        <p className="rounded-2xl bg-surface p-8 text-center text-sm text-muted">Henüz yorum yok.</p>
      ) : (
        <ul className="divide-y divide-border">
          {rows.map((r) => (
            <li key={r.id} className={`py-5 ${r.active ? "" : "opacity-60"}`}>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <Stars value={r.rating} />
                <Link href={`/urun/${r.slug}#yorumlar`} target="_blank" className="font-semibold hover:text-primary">{r.product}</Link>
                <span className="text-muted">{r.first_name} {r.last_name} · {r.email}</span>
                <span className="text-xs text-muted">{new Date(r.created_at).toLocaleDateString("tr-TR")}</span>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm text-foreground/85">{r.comment}</p>
              <div className="mt-3 flex gap-4 text-sm font-semibold">
                <form action={toggleReview}><input type="hidden" name="id" value={r.id} /><button className="text-accent hover:underline">{r.active ? "Gizle" : "Yayınla"}</button></form>
                <form action={deleteReview}><input type="hidden" name="id" value={r.id} /><button className="text-red-600 hover:underline">Sil</button></form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
