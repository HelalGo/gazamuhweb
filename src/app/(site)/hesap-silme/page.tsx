import type { Metadata } from "next";
import Link from "next/link";
import { CircleCheck, Trash2 } from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { DeleteAccountForm } from "@/components/DeleteAccountForm";
import { getUser } from "@/lib/customer";
import { contact } from "@/lib/site";

export const metadata: Metadata = {
  title: "Hesap Silme | GAZ-A Mühendislik",
  description: "GAZ-A Mühendislik web sitesi ve mobil uygulama hesabınızı ve kişisel verilerinizi nasıl silebileceğiniz.",
};
export const dynamic = "force-dynamic";

// Herkese açık hesap silme sayfası (Google Play'deki "hesap silme bağlantısı" da budur).
// Giriş yapmış üye hesabını burada siler; diğerleri giriş yapmaya ya da e-postayla talepte bulunmaya yönlendirilir.
export default async function DeleteAccount({ searchParams }: { searchParams: Promise<{ silindi?: string }> }) {
  const { silindi } = await searchParams;
  const u = silindi ? null : await getUser();

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-8 pt-40 md:px-6">
      <Breadcrumb crumbs={[{ label: "Ana Sayfa", href: "/" }, { label: "Hesap Silme" }]} />
      <h1 className="mt-6 flex items-center gap-3 text-2xl font-extrabold"><Trash2 size={24} className="text-red-600" />Hesap Silme</h1>

      {silindi ? (
        <p role="status" className="mt-8 flex items-center gap-2 rounded-[4px] bg-green-50 px-5 py-4 text-sm font-semibold text-green-700">
          <CircleCheck size={18} />Hesabınız silindi. Bizi tercih ettiğiniz için teşekkür ederiz.
        </p>
      ) : (
        <>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            GAZ-A Mühendislik web sitesi ve mobil uygulaması aynı hesabı kullanır. Hesabınızı sildiğinizde hem sitede hem uygulamada kullanılamaz hâle gelir.
          </p>

          <section className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[4px] border border-border p-5">
              <h2 className="font-bold">Silinen veriler</h2>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-muted">
                <li>Üyelik bilgileriniz (ad, soyad, e-posta, telefon, parola)</li>
                <li>Favorileriniz</li>
                <li>Ürün yorumlarınız ve puanlarınız</li>
                <li>Telefonunuzun hesabınızla bağlantısı (bildirimler)</li>
                <li>E-posta kampanya izniniz (kapatılır)</li>
              </ul>
            </div>
            <div className="rounded-[4px] border border-border p-5">
              <h2 className="font-bold">Saklanan veriler</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Verdiğiniz siparişlerin kayıtları (sipariş, fatura ve teslimat bilgileri) vergi ve ticaret mevzuatı gereği yasal saklama süresi (10 yıl) boyunca saklanır; hesabınızla bağlantısı kaldırılır. Süre dolduğunda silinir ya da anonim hâle getirilir.
              </p>
            </div>
          </section>

          <section className="mt-8 rounded-[4px] border border-red-200 bg-red-50/40 p-6">
            {u ? (
              <DeleteAccountForm email={u.email} />
            ) : (
              <div className="space-y-4 text-sm leading-relaxed">
                <p><strong>Web sitesinden:</strong> Hesabınızla giriş yapın; bu sayfada hesabınızı parolanızla silebilirsiniz.</p>
                <Link href="/giris?next=/hesap-silme" className="inline-block rounded-[4px] bg-primary px-6 py-3 font-semibold text-white hover:bg-primary/90">Giriş yap ve hesabımı sil</Link>
                <p><strong>Mobil uygulamadan:</strong> Hesabım → Ayarlar → Hesabımı sil.</p>
                <p>
                  <strong>E-posta ile:</strong> Hesabınıza kayıtlı e-posta adresinden{" "}
                  <a href={`mailto:${contact.email}?subject=Hesap%20silme%20talebi`} className="font-semibold text-primary hover:underline">{contact.email}</a>{" "}
                  adresine &quot;Hesap silme talebi&quot; konulu bir e-posta gönderin. Talebiniz en geç 30 gün içinde sonuçlandırılır.
                </p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
