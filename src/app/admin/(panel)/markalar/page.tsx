import type { RowDataPacket } from "mysql2";
import { ensureBrandTable } from "@/lib/cms";
import { db } from "@/lib/db";
import { AdminList, Notice, PageHead } from "../_ui";

export default async function BrandsAdmin({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  await ensureBrandTable();
  const [rows] = await db().query<RowDataPacket[]>("SELECT * FROM brand_logos ORDER BY sort_order, id");
  return (
    <>
      <PageHead title="Markalar" sub="Ana sayfadaki &quot;Çalıştığımız Markalar&quot; bölümünde görünen logolar. Logoya tıklayan ziyaretçi o markanın ürünlerine gider. Hiç logo eklenmezse en çok ürünü olan markaların adları yazıyla gösterilir." newHref="/admin/markalar/new" newLabel="Yeni Marka" />
      <Notice saved={saved} />
      <AdminList table="brand_logos" base="/admin/markalar" empty="Henüz marka logosu eklenmemiş." contain
        rows={rows.map((r) => ({ id: r.id, thumb: r.image_url, title: r.name, sub: `/urunler?marka=${r.name}`, active: r.active }))} />
    </>
  );
}
