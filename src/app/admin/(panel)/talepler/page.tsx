import Link from "next/link";
import type { RowDataPacket } from "mysql2";
import { Check, Mail, MessageCircle, Phone, RotateCcw, Trash2 } from "lucide-react";
import { db } from "@/lib/db";
import { deleteLead, toggleLead } from "../../orders-actions";
import { ConfirmButton } from "../_client";
import { Empty, PageHead, SiteTag, card, iconBtn } from "../_ui";

export default async function Leads({ searchParams }: { searchParams: Promise<{ f?: string }> }) {
  const { f } = await searchParams;
  const filter = f === "done" ? 1 : f === "all" ? null : 0;
  let rows: RowDataPacket[] = [];
  let counts = { open: 0, done: 0 };
  try {
    [rows] = await db().query<RowDataPacket[]>(
      `SELECT l.*, p.slug FROM leads l LEFT JOIN products p ON p.id = l.product_id ${filter === null ? "" : "WHERE l.handled = ?"} ORDER BY l.id DESC LIMIT 300`,
      filter === null ? [] : [filter]
    );
    const [[c]] = await db().query<RowDataPacket[]>("SELECT SUM(handled = 0) open, SUM(handled = 1) done FROM leads");
    counts = { open: Number(c.open ?? 0), done: Number(c.done ?? 0) };
  } catch {
    // tablo ilk talep geldiğinde oluşturulur
  }
  const tab = (key: string | undefined, label: string, n?: number) => {
    const active = (f ?? "") === (key ?? "");
    return (
      <Link href={key ? `/admin/talepler?f=${key}` : "/admin/talepler"}
        className={`-mb-px shrink-0 border-b-2 px-3 py-3 text-sm font-semibold ${active ? "border-primary text-primary" : "border-transparent text-muted hover:text-foreground"}`}>
        {label}{n !== undefined && <span className="ml-1 rounded-full bg-surface px-2 py-0.5 text-xs">{n}</span>}
      </Link>
    );
  };

  return (
    <>
      <PageHead title="Bilgi Talepleri" sub="İki sitedeki ve uygulamalardaki “Bilgi Al” formlarından gelen talepler; hangi markadan geldiği etikette yazar. Müşteriye döndüğünüzde “Dönüş yapıldı” olarak işaretleyin." />
      <div className="mb-4 flex gap-1 overflow-x-auto border-b border-border">
        {tab(undefined, "Bekleyen", counts.open)}
        {tab("done", "Dönüş yapılan", counts.done)}
        {tab("all", "Tümü")}
      </div>
      {!rows.length ? (
        <Empty text={filter === 0 ? "Bekleyen talep yok." : "Talep yok."} />
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id} className={`${card} ${r.handled ? "opacity-70" : ""}`}>
              <div className="flex flex-wrap items-start gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-bold">{r.full_name}</span>
                    <SiteTag site={r.site} />
                    <span className="text-xs text-muted">{new Date(r.created_at).toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" })}</span>
                    {r.handled ? <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-bold text-green-700">Dönüş yapıldı</span>
                      : <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700">Bekliyor</span>}
                  </div>
                  <p className="mt-1 text-sm">
                    {r.product_name ? (
                      r.slug ? <a href={`/urun/${r.slug}`} target="_blank" className="font-semibold text-primary hover:underline">{r.product_name}</a> : <span className="font-semibold">{r.product_name}</span>
                    ) : <span className="text-muted">Genel bilgi talebi</span>}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                    <a href={`tel:${r.phone}`} className="inline-flex items-center gap-1.5 hover:text-primary"><Phone size={14} className="text-muted" />{r.phone}</a>
                    <a href={`https://wa.me/${String(r.phone).replace(/\D/g, "").replace(/^0/, "90")}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-primary"><MessageCircle size={14} className="text-muted" />WhatsApp</a>
                    {r.email && <a href={`mailto:${r.email}`} className="inline-flex items-center gap-1.5 hover:text-primary"><Mail size={14} className="text-muted" />{r.email}</a>}
                    {r.city && <span className="text-muted">{r.city}</span>}
                  </div>
                  {r.message && <p className="mt-3 whitespace-pre-line rounded-xl bg-surface p-3 text-sm">{r.message}</p>}
                  <p className="mt-2 text-xs text-muted">Bildirim: e-posta {r.mail_ok ? "✓" : "✗"} · WhatsApp {r.wa_ok ? "✓" : "✗"}</p>
                </div>
                <div className="flex items-center">
                  <form action={toggleLead}><input type="hidden" name="id" value={r.id} />
                    <button className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold ${r.handled ? "text-muted hover:bg-surface" : "bg-green-600 text-white hover:bg-green-700"}`}>
                      {r.handled ? <><RotateCcw size={15} />Geri al</> : <><Check size={15} />Dönüş yapıldı</>}
                    </button>
                  </form>
                  <form action={deleteLead}><input type="hidden" name="id" value={r.id} />
                    <ConfirmButton message="Bu talep kalıcı olarak silinecek. Emin misiniz?" className={`${iconBtn} hover:bg-red-50 hover:text-red-600`} title="Sil" aria-label="Sil"><Trash2 size={16} /></ConfirmButton>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
