import { Send } from "lucide-react";
import { adminInbox, mailConfigured, orderInbox, senderReady, type Sender } from "@/lib/mail";
import { sampleMails } from "@/lib/mails";
import { mailboxes } from "@/lib/site";
import { sendTestMails } from "../../mail-actions";
import { SubmitButton } from "../_client";
import { Notice, PageHead, btnPrimary, card, field } from "../_ui";

export const dynamic = "force-dynamic";

// Otomatik e-postaların önizlemesi ve test gönderimi
export default async function MailsAdmin({ searchParams }: { searchParams: Promise<{ sent?: string; total?: string; to?: string; err?: string }> }) {
  const { sent, total, to, err } = await searchParams;
  const mails = sampleMails();
  const ready = mailConfigured();
  return (
    <>
      <PageHead title="E-postalar" sub="Sitenin otomatik gönderdiği e-postalar. Önizlemeler örnek verilerle hazırlanır; test gönderiminde konu satırına [TEST] eklenir." />
      <Notice err={err} saved={sent !== undefined ? "1" : undefined} text={`${sent}/${total} test e-postası ${to} adresine gönderildi.${sent !== total ? " Gönderilemeyenler için sunucu günlüğüne bakın." : ""}`} />
      {!ready && (
        <p className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong>E-posta ayarları eksik.</strong> Sunucudaki .env dosyasında <code>SMTP_PASS</code> satırına {adminInbox()} hesabının gerçek parolasını yazıp uygulamayı yeniden başlatın. O zamana kadar hiçbir e-posta gönderilmez.
        </p>
      )}

      <section className={`${card} mb-6`}>
        <h2 className="font-bold">Gönderen hesaplar</h2>
        <p className="mt-1 text-sm text-muted">Parolası girilmemiş hesabın e-postaları destek@ hesabından gönderilir.</p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-3">
          {(["noreply", "siparis", "destek"] as Sender[]).map((k) => (
            <li key={k} className="rounded-xl border border-border p-4">
              <p className="truncate text-sm font-bold">{mailboxes[k]}</p>
              <p className="mt-1 text-xs text-muted">{{ noreply: "Üyelik, bilgi talebi onayı, bülten ve size gelen bildirimler", siparis: "Sipariş onayı ve sipariş durumu", destek: "Yedek gönderici; müşteri yanıtları buraya gelir" }[k]}</p>
              <p className={`mt-3 inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold ${senderReady(k) ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                {senderReady(k) ? "Bağlı" : "Parola girilmemiş"}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-muted">Bildirimler: bilgi talepleri <strong>{adminInbox()}</strong>, siparişler <strong>{orderInbox()}</strong> adresine gelir.</p>
      </section>

      <form action={sendTestMails} className={`${card} mb-8`}>
        <h2 className="font-bold">Test gönderimi</h2>
        <p className="mt-1 text-sm text-muted">Seçtiğiniz e-postalar bu adrese gönderilir. Hiçbirini seçmezseniz hepsi gönderilir.</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input name="to" type="email" required defaultValue="yusudhan@gmail.com" className={`${field} sm:max-w-sm`} />
          <SubmitButton className={btnPrimary}><Send size={16} />Test e-postalarını gönder</SubmitButton>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {mails.map((m) => (
            <label key={m.key} className="flex cursor-pointer items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-semibold has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-white">
              <input type="checkbox" name="key" value={m.key} className="sr-only" />{m.label}
            </label>
          ))}
        </div>
      </form>

      <div className="grid gap-6 xl:grid-cols-2">
        {mails.map((m) => (
          <section key={m.key} className={`${card} !p-0 overflow-hidden`}>
            <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-4">
              <div className="min-w-0">
                <p className="font-bold">{m.label}</p>
                <p className="truncate text-xs text-muted">Konu: {m.mail.subject}</p>
                <p className="truncate text-xs text-muted">Gönderen: {mailboxes[m.from]}</p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${m.to === "Size" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"}`}>
                {m.to === "Size" ? `Size (${m.key === "order-admin" ? orderInbox() : adminInbox()})` : "Müşteriye"}
              </span>
            </header>
            <iframe title={m.label} srcDoc={m.mail.html} className="h-[640px] w-full bg-surface" sandbox="" loading="lazy" />
          </section>
        ))}
      </div>
    </>
  );
}
