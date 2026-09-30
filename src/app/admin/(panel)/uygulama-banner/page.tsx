import type { RowDataPacket } from "mysql2";
import { ensureAppBannerTable } from "@/lib/cms";
import { db } from "@/lib/db";
import { AdminList, Notice, PageHead } from "../_ui";

const targetLabel = (t: string | null) =>
  !t ? "Bağlantı yok" : t === "kampanyalar" ? "Kampanyalar sayfası" : t.startsWith("kategori:") ? `Kategori: ${t.slice(9)}` : `Site: ${t}`;

export default async function AppBannersAdmin({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  await ensureAppBannerTable();
  const [rows] = await db().query<RowDataPacket[]>("SELECT * FROM app_banners ORDER BY sort_order, id");
  return (
    <>
      <PageHead title="Uygulama Ana Sayfa Bannerları" sub="Mobil uygulamada arama çubuğunun hemen altında kayan bannerlar. Sıra numarasını okla değiştirin. Hiç banner eklenmezse sitenin Ana Sayfa → Slider görselleri, o da yoksa uygulamanın hazır bannerları gösterilir." newHref="/admin/uygulama-banner/new" newLabel="Yeni Banner" />
      <Notice saved={saved} />
      <AdminList table="app_banners" base="/admin/uygulama-banner" empty="Henüz uygulama bannerı eklenmemiş. Uygulama şu an sitenin slider görsellerini gösteriyor."
        rows={rows.map((r) => ({ id: r.id, thumb: r.image_url, title: r.title || "(başlıksız banner)", sub: targetLabel(r.target), active: r.active }))} />
    </>
  );
}
