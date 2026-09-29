import type { RowDataPacket } from "mysql2";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureSubscribers } from "@/lib/newsletter";

// Aboneleri Excel'de açılabilen CSV olarak indirir
export async function GET() {
  await requireAdmin();
  await ensureSubscribers();
  const [rows] = await db().query<RowDataPacket[]>("SELECT email, active, consent_at, consent_ip, unsubscribed_at FROM subscribers ORDER BY id");
  const cell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const date = (d: Date | null) => (d ? new Date(d).toISOString().replace("T", " ").slice(0, 19) : "");
  const lines = [
    ["E-posta", "Durum", "Onay tarihi", "Onay IP", "Çıkış tarihi"].map(cell).join(";"),
    ...rows.map((r) => [r.email, r.active ? "Aktif" : "Çıktı", date(r.consent_at), r.consent_ip, date(r.unsubscribed_at)].map(cell).join(";")),
  ];
  return new Response("﻿" + lines.join("\r\n"), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="bulten-aboneleri.csv"` },
  });
}
