import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import { AdminList, Notice, PageHead } from "../_ui";

export default async function TilesAdmin({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const [rows] = await db().query<RowDataPacket[]>("SELECT * FROM showcase_tiles ORDER BY sort_order, id");
  return (
    <>
      <PageHead title="Vitrin Kartları" sub="Ana sayfada ürün gruplarının altındaki dikey görselli kartlar (ör. Kombi, Klima, Isı Pompası). Kart yoksa kategori adlı düz renkli örnek kartlar gösterilir." newHref="/admin/vitrin/new" newLabel="Yeni Kart" />
      <Notice saved={saved} />
      <AdminList table="showcase_tiles" base="/admin/vitrin" empty="Henüz kart eklenmemiş."
        rows={rows.map((r) => ({ id: r.id, thumb: r.image_url, title: r.title, sub: r.url ?? "", active: r.active }))} />
    </>
  );
}
