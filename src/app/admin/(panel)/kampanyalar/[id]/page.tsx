import { notFound } from "next/navigation";
import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import type { CampaignLayout } from "@/lib/layouts";
import { DeleteForm, PageHead } from "../../_ui";
import { CampaignForm } from "./CampaignForm";

export default async function CampaignPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ err?: string }> }) {
  const { id } = await params;
  const { err } = await searchParams;
  const isNew = id === "new";
  let r: RowDataPacket | null = null;
  if (!isNew) {
    const [rows] = await db().query<RowDataPacket[]>("SELECT * FROM campaign_blocks WHERE id = ?", [Number(id)]);
    if (!rows[0]) notFound();
    r = rows[0];
  }
  const items = r ? (typeof r.items === "string" ? JSON.parse(r.items) : r.items) : [];
  return (
    <div className="mx-auto max-w-3xl">
      <PageHead title={isNew ? "Yeni Kampanya" : "Kampanyayı Düzenle"} back={{ href: "/admin/kampanyalar", label: "Kampanya Afişleri" }} />
      <CampaignForm id={isNew ? undefined : id} title={r?.title ?? ""} layout={(r?.layout as CampaignLayout) ?? "half"} items={items} active={r ? !!r.active : true} err={err} />
      {!isNew && <DeleteForm table="campaign_blocks" id={Number(id)} />}
    </div>
  );
}
