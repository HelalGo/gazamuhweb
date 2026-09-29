import type { RowDataPacket } from "mysql2";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { Sidebar } from "./Sidebar";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  let pending = 0;
  let leads = 0;
  try {
    const [[r]] = await db().query<RowDataPacket[]>("SELECT COUNT(*) AS n FROM orders WHERE status = 'pending'");
    pending = r.n;
  } catch {}
  try {
    const [[r]] = await db().query<RowDataPacket[]>("SELECT COUNT(*) AS n FROM leads WHERE handled = 0");
    leads = r.n;
  } catch {} // tablo ilk talep geldiğinde oluşur
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar name={admin.name} email={admin.email} pendingOrders={pending} openLeads={leads} />
      <main className="px-4 py-6 md:px-8 md:py-8 lg:ml-64">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
