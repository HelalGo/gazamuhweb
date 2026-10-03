import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import { adminSite, ensureSiteColumn } from "@/lib/site-db";
import { AdminList, Notice, PageHead, SiteBadge } from "../_ui";

export default async function TilesAdmin({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const site = await adminSite();
  await ensureSiteColumn("showcase_tiles");
  const [rows] = await db().query<RowDataPacket[]>("SELECT * FROM showcase_tiles WHERE site = ? ORDER BY sort_order, id", [site]);
  return (
    <>
      <PageHead title="Vitrin Kartları" sub="Ana sayfada ürün gruplarının altındaki dikey görselli kartlar (ör. Kombi, Klima, Isı Pompası). Kart yoksa kategori adlı düz renkli örnek kartlar gösterilir." newHref="/admin/vitrin/new" newLabel="Yeni Kart"><SiteBadge site={site} /></PageHead>
      <Notice saved={saved} />
      <AdminList table="showcase_tiles" base="/admin/vitrin" empty="Henüz kart eklenmemiş."
        rows={rows.map((r) => ({ id: r.id, thumb: r.image_url, title: r.title, sub: r.url ?? "", active: r.active }))} />
    </>
  );
}
