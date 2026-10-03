import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import { adminSite, ensureSiteColumn } from "@/lib/site-db";
import { AdminList, Notice, PageHead, SiteBadge } from "../_ui";

export default async function SliderAdmin({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const site = await adminSite();
  await ensureSiteColumn("hero_slides");
  const [rows] = await db().query<RowDataPacket[]>("SELECT * FROM hero_slides WHERE site = ? ORDER BY sort_order, id", [site]);
  return (
    <>
      <PageHead title="Ana Sayfa Slider" sub="Ana sayfanın en üstündeki tam ekran slaytlar. Sıra numarasını okla değiştirin. Hiç slayt yoksa ya da hepsi gizliyse yerleşik örnek slaytlar gösterilir." newHref="/admin/slider/new" newLabel="Yeni Slayt"><SiteBadge site={site} /></PageHead>
      <Notice saved={saved} />
      <AdminList table="hero_slides" base="/admin/slider" empty="Henüz slayt eklenmemiş. Sitede şu an yerleşik örnek slaytlar görünüyor."
        rows={rows.map((r) => ({ id: r.id, thumb: r.image_url, title: r.title, sub: [r.btn1_label, r.btn2_label].filter(Boolean).join(" · ") || "Buton yok", active: r.active }))} />
    </>
  );
}
