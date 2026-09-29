import Link from "next/link";
import { notFound } from "next/navigation";
import type { RowDataPacket } from "mysql2";
import { db } from "@/lib/db";
import type { CampaignLayout } from "@/lib/layouts";
import { DeleteForm } from "../../_ui";
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
      <Link href="/admin/kampanyalar" className="text-sm text-muted hover:text-foreground">← Kampanya Afişleri</Link>
      <h1 className="mb-6 mt-2 text-2xl font-extrabold">{isNew ? "Yeni Kampanya" : "Kampanyayı Düzenle"}</h1>
      <CampaignForm id={isNew ? undefined : id} title={r?.title ?? ""} layout={(r?.layout as CampaignLayout) ?? "half"} items={items} active={r ? !!r.active : true} err={err} />
      {!isNew && <DeleteForm table="campaign_blocks" id={Number(id)} />}
    </div>
  );
}
