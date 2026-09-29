import type { RowDataPacket } from "mysql2";
import { Download, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { ensureSubscribers } from "@/lib/newsletter";
import { deleteSubscriber } from "../../mail-actions";
import { ConfirmButton } from "../_client";
import { Empty, PageHead, btnGhost, card, iconBtn } from "../_ui";

export const dynamic = "force-dynamic";

export default async function Subscribers() {
  await ensureSubscribers();
  const [rows] = await db().query<RowDataPacket[]>("SELECT * FROM subscribers ORDER BY id DESC LIMIT 1000");
  const active = rows.filter((r) => r.active).length;
  return (
    <>
      <PageHead title="Bülten Aboneleri" sub={`Sitenin alt kısmındaki bülten formundan abone olanlar. ${active} aktif abone. Abonelikten çıkanlar listede kalır; onlara kampanya e-postası göndermeyin.`}>
        <a href="/admin/aboneler-csv" download className={btnGhost}><Download size={16} />CSV indir</a>
      </PageHead>
      {!rows.length ? <Empty text="Henüz abone yok." /> : (
        <div className={`${card} !p-0 overflow-x-auto`}>
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wider text-muted">
              <tr><th className="px-5 py-3">E-posta</th><th className="px-5 py-3">Durum</th><th className="px-5 py-3">Onay tarihi</th><th className="px-5 py-3">Onay IP</th><th className="w-12" /></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="px-5 py-3 font-semibold">{r.email}</td>
                  <td className="px-5 py-3">{r.active
                    ? <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-bold text-green-700">Aktif</span>
                    : <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-bold text-muted">Çıktı</span>}</td>
                  <td className="px-5 py-3 text-muted">{r.consent_at ? new Date(r.consent_at).toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" }) : "—"}</td>
                  <td className="px-5 py-3 text-muted">{r.consent_ip ?? "—"}</td>
                  <td className="px-3 py-2">
                    <form action={deleteSubscriber}><input type="hidden" name="id" value={r.id} />
                      <ConfirmButton message="Bu abone kalıcı olarak silinecek. Emin misiniz?" className={`${iconBtn} hover:bg-red-50 hover:text-red-600`} aria-label="Sil"><Trash2 size={16} /></ConfirmButton>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
