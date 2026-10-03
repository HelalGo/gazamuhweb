import type { RowDataPacket } from "mysql2";
import { ensureOnboardingTable } from "@/lib/cms";
import { db } from "@/lib/db";
import { adminSite, ensureSiteColumn } from "@/lib/site-db";
import { AdminList, Notice, PageHead, SiteBadge } from "../_ui";

export default async function OnboardingAdmin({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { saved } = await searchParams;
  await ensureOnboardingTable();
  const site = await adminSite();
  await ensureSiteColumn("app_onboarding");
  const [rows] = await db().query<RowDataPacket[]>("SELECT * FROM app_onboarding WHERE site = ? ORDER BY sort_order, id", [site]);
  return (
    <>
      <PageHead title="Uygulama Tanıtımı" sub="Mobil uygulamayı ilk kez açan kişiye, açılış ekranından sonra sırayla gösterilen tanıtım sayfaları. Yayındaki sayfaların hepsi bu sırayla gösterilir; kullanıcı en alttaki &quot;Tanıtımı geç&quot; ile atlayabilir. Hiç sayfa yoksa tanıtım gösterilmez." newHref="/admin/uygulama-tanitim/new" newLabel="Yeni Sayfa"><SiteBadge site={site} /></PageHead>
      <Notice saved={saved} />
      <AdminList table="app_onboarding" base="/admin/uygulama-tanitim" empty="Henüz tanıtım sayfası eklenmemiş. Uygulama şu an tanıtım göstermeden açılıyor." contain
        rows={rows.map((r) => ({ id: r.id, thumb: r.image_url, title: r.title, sub: r.text || "Açıklama yok", active: r.active }))} />
    </>
  );
}
