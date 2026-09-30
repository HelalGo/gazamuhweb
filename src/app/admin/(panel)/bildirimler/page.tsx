import type { RowDataPacket } from "mysql2";
import { BellRing, Smartphone, Users } from "lucide-react";
import { db } from "@/lib/db";
import { getCategories } from "@/lib/products";
import { ensurePushTables, pushStats } from "@/lib/push";
import { sendPushMessage } from "../../push-actions";
import { SubmitButton } from "../_client";
import { Label, Notice, PageHead, btnPrimary, card, field } from "../_ui";
import { PushComposer } from "./PushComposer";

const targetLabel = (t: string | null) =>
  !t ? "—" : t === "kampanyalar" ? "Kampanyalar" : t.startsWith("kategori:") ? `Kategori: ${t.slice(9)}` : t;

export default async function PushPage({ searchParams }: { searchParams: Promise<{ err?: string; sent?: string; failed?: string; total?: string }> }) {
  const { err, sent, failed, total } = await searchParams;
  await ensurePushTables();
  const [stats, cats, [history]] = await Promise.all([
    pushStats(), getCategories(),
    db().query<RowDataPacket[]>("SELECT * FROM push_messages ORDER BY id DESC LIMIT 30"),
  ]);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHead title="Bildirim Gönder" sub="Mobil uygulamayı yükleyip bildirim izni veren kullanıcılara anlık bildirim gönderin. Kampanya bildirimlerini kapatan kullanıcılara gönderilmez. Sipariş durumu bildirimleri (ödeme alındı, hazırlanıyor, kargoya verildi…) siparişler sayfasından durum değiştirildiğinde otomatik gider." />
      <Notice err={err} saved={sent} text={`Bildirim gönderildi: ${sent} cihaza ulaştı${Number(failed) ? `, ${failed} cihaza ulaşmadı` : ""} (toplam ${total}).`} />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Stat icon={<Smartphone size={18} />} label="Kayıtlı cihaz" value={stats.total} />
        <Stat icon={<BellRing size={18} />} label="Kampanya bildirimi açık" value={stats.marketing} />
        <Stat icon={<Users size={18} />} label="Üye cihazı (kampanya açık)" value={stats.membersMarketing} />
      </div>

      <form action={sendPushMessage}>
        <div className={`${card} space-y-5`}>
          <PushComposer />
          <Label text="Dokununca açılacak yer" hint="Uygulama içindeki bir sayfa seçin ya da aşağıya sitedeki bir adresi yazın.">
            <select name="target" defaultValue="" className={field}>
              <option value="">Uygulama ana sayfası</option>
              <option value="kampanyalar">Kampanyalar sayfası</option>
              {cats.map((c) => <option key={c} value={`kategori:${c}`}>Kategori: {c}</option>)}
            </select>
          </Label>
          <Label text="Ya da site adresi (isteğe bağlı)" hint="Ör. /urun/baymak-... (ürün uygulamada açılır), /blog/... ya da https://...">
            <input name="target_url" maxLength={300} placeholder="/urun/..." className={field} />
          </Label>
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">Kime</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {([["all", "Tüm kullanıcılar", `${stats.marketing} cihaz`], ["members", "Yalnızca üyeler", `${stats.membersMarketing} cihaz`]] as const).map(([v, t, h]) => (
                <label key={v} className="flex cursor-pointer gap-3 rounded-xl border border-border p-3 has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <input type="radio" name="audience" value={v} defaultChecked={v === "all"} className="mt-1 accent-[#1a3e85]" />
                  <span><span className="block text-sm font-semibold">{t}</span><span className="block text-xs text-muted">{h}</span></span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="flex justify-end border-t border-border pt-5">
            <SubmitButton className={btnPrimary}><BellRing size={16} />Bildirimi gönder</SubmitButton>
          </div>
        </div>
      </form>

      <h2 className="mb-3 mt-10 text-lg font-bold">Gönderilen bildirimler</h2>
      {!history.length ? (
        <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted">Henüz bildirim gönderilmedi.</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-white">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-xs uppercase tracking-wider text-muted">
              <tr><th className="px-4 py-3">Bildirim</th><th className="px-4 py-3">Açılacak yer</th><th className="px-4 py-3">Kime</th><th className="px-4 py-3 text-right">Ulaştı</th><th className="px-4 py-3">Tarih</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {history.map((h) => (
                <tr key={h.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {h.image_url && <img src={h.image_url} alt="" className="h-10 w-16 shrink-0 rounded-md object-cover" />}
                      <div className="min-w-0"><p className="font-semibold">{h.title}</p><p className="line-clamp-1 text-xs text-muted">{h.body}</p></div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">{targetLabel(h.target)}</td>
                  <td className="px-4 py-3 text-xs">{h.audience === "members" ? "Üyeler" : "Tümü"}</td>
                  <td className="px-4 py-3 text-right font-semibold">{h.ok}<span className="font-normal text-muted"> / {h.sent}</span></td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-muted">{new Date(h.created_at).toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className={`${card} flex items-center gap-3`}>
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">{icon}</span>
      <div><p className="text-2xl font-extrabold tabular-nums">{value}</p><p className="text-xs text-muted">{label}</p></div>
    </div>
  );
}
