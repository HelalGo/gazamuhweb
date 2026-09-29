import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import { AdminList, Notice, PageHead } from "../_ui";

export default async function SliderAdmin({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  const [rows] = await db().query<RowDataPacket[]>("SELECT * FROM hero_slides ORDER BY sort_order, id");
  return (
    <>
      <PageHead title="Ana Sayfa Slider" sub="Ana sayfanın en üstündeki tam ekran slaytlar. Sıra numarasını okla değiştirin. Hiç slayt yoksa ya da hepsi gizliyse yerleşik örnek slaytlar gösterilir." newHref="/admin/slider/new" newLabel="Yeni Slayt" />
      <Notice saved={saved} />
      <AdminList table="hero_slides" base="/admin/slider" empty="Henüz slayt eklenmemiş. Sitede şu an yerleşik örnek slaytlar görünüyor."
        rows={rows.map((r) => ({ id: r.id, thumb: r.image_url, title: r.title, sub: [r.btn1_label, r.btn2_label].filter(Boolean).join(" · ") || "Buton yok", active: r.active }))} />
    </>
  );
}
