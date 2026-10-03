import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import { adminSite, ensureSiteColumn } from "@/lib/site-db";
import { CAMPAIGN_LAYOUTS, type CampaignLayout } from "@/lib/layouts";
import { AdminList, Notice, PageHead, SiteBadge } from "../_ui";

export default async function CampaignsAdmin({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const site = await adminSite();
  await ensureSiteColumn("campaign_blocks");
  const [rows] = await db().query<RowDataPacket[]>("SELECT * FROM campaign_blocks WHERE site = ? ORDER BY sort_order, id", [site]);
  return (
    <>
      <PageHead title="Kampanya Afişleri" sub="Ana sayfada gösterilen afiş blokları. Her blok için bir yerleşim seçersiniz (tek geniş, ikili, üçlü…); yerleşime göre yüklemeniz gereken görsel boyutları formda yazar." newHref="/admin/kampanyalar/new" newLabel="Yeni Kampanya"><SiteBadge site={site} /></PageHead>
      <Notice saved={saved} />
      <AdminList table="campaign_blocks" base="/admin/kampanyalar" empty="Henüz kampanya eklenmemiş."
        rows={rows.map((r) => {
          const items = typeof r.items === "string" ? JSON.parse(r.items) : r.items;
          return { id: r.id, thumb: items[0]?.image_url ?? null, title: r.title || "(başlıksız)", sub: CAMPAIGN_LAYOUTS[r.layout as CampaignLayout]?.label ?? r.layout, active: r.active };
        })} />
    </>
  );
}
