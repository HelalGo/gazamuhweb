"use server";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { mailConfigured, sendMail } from "@/lib/mail";
import { sampleMails } from "@/lib/mails";
import { ensureSubscribers } from "@/lib/newsletter";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Seçilen (veya tüm) örnek e-postaları test adresine gönderir; sonuç sayfada gösterilir
export async function sendTestMails(f: FormData) {
  await requireAdmin();
  const to = String(f.get("to") ?? "").trim();
  if (!EMAIL.test(to)) redirect("/admin/e-postalar?err=" + encodeURIComponent("Geçerli bir e-posta adresi yazın."));
  if (!mailConfigured()) redirect("/admin/e-postalar?err=" + encodeURIComponent("E-posta ayarları eksik: .env dosyasındaki SMTP_PASS satırına e-posta hesabının parolasını yazın."));
  const only = f.getAll("key").map(String);
  const list = sampleMails().filter((m) => !only.length || only.includes(m.key));
  let ok = 0;
  for (const m of list) {
    if (await sendMail(to, { ...m.mail, subject: `[TEST] ${m.mail.subject}` }, { from: m.from, tag: "test" })) ok++;
  }
  redirect(`/admin/e-postalar?sent=${ok}&total=${list.length}&to=${encodeURIComponent(to)}`);
}

export async function deleteSubscriber(f: FormData) {
  await requireAdmin();
  await ensureSubscribers();
  await db().query("DELETE FROM subscribers WHERE id = ?", [Number(f.get("id"))]);
  redirect("/admin/aboneler");
}
