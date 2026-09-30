import type { Metadata } from "next";
import { Bell, CircleCheck, Mail, PackageCheck, Smartphone } from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { requireUser } from "@/lib/customer";
import { isSubscribed } from "@/lib/newsletter";
import { getPrefs } from "@/lib/push";
import { savePrefs } from "../../actions";

export const metadata: Metadata = { title: "İletişim Tercihleri | GAZ-A Mühendislik" };
export const dynamic = "force-dynamic";

// Üyenin e-posta ve uygulama bildirimi izinleri. Push tercihleri üyenin tüm telefonlarına uygulanır.
export default async function Prefs({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const u = await requireUser("/hesabim/iletisim-tercihleri");
  const { saved } = await searchParams;
  const [push, email] = await Promise.all([getPrefs({ userId: u.id }), isSubscribed(u.email)]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-8 pt-40 md:px-6">
      <Breadcrumb crumbs={[{ label: "Ana Sayfa", href: "/" }, { label: "Hesabım", href: "/hesabim" }, { label: "İletişim Tercihleri" }]} />
      <h1 className="mt-6 text-2xl font-extrabold">İletişim Tercihleri</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">Size hangi kanallardan ulaşabileceğimizi seçin. Sipariş, ödeme ve üyelikle ilgili zorunlu bilgilendirme e-postaları bu tercihlerden bağımsız olarak gönderilir.</p>
      {saved && <p role="status" className="mt-6 flex items-center gap-2 rounded-[4px] bg-green-50 px-4 py-3 text-sm font-semibold text-green-700"><CircleCheck size={18} />Tercihleriniz kaydedildi.</p>}

      <form action={savePrefs} className="mt-8 space-y-8">
        <Group icon={<Mail size={18} />} title="E-posta">
          <Row name="email_marketing" checked={email} title="Kampanya ve duyurular" text={`Kampanya, indirim ve yeni ürün e-postaları (${u.email}). Ticari elektronik ileti onayıdır; dilediğiniz zaman kapatabilirsiniz.`} />
        </Group>
        <Group icon={<Smartphone size={18} />} title="Mobil uygulama bildirimleri (push)">
          <Row name="push_marketing" checked={push.marketing} icon={<Bell size={16} />} title="Kampanya ve duyurular" text="Kampanya, indirim ve duyuru bildirimleri." />
          <Row name="push_orders" checked={push.orders} icon={<PackageCheck size={16} />} title="Sipariş durumu" text="Ödemeniz alındığında, siparişiniz hazırlandığında, kargoya verildiğinde ve teslim edildiğinde bildirim." />
          <p className="px-5 pb-4 text-xs text-muted">Bu ayarlar, GAZ-A Mühendislik uygulamasında hesabınızla giriş yaptığınız tüm telefonlara uygulanır. Telefonunuzun ayarlarından uygulamanın bildirim iznini ayrıca kapatabilirsiniz.</p>
        </Group>
        <button className="rounded-[4px] bg-primary px-8 py-3 text-sm font-semibold text-white hover:bg-primary/90">Kaydet</button>
      </form>
    </div>
  );
}

function Group({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-[4px] border border-border">
      <h2 className="flex items-center gap-2 border-b border-border bg-surface px-5 py-3 text-sm font-bold"><span className="text-primary">{icon}</span>{title}</h2>
      {children}
    </section>
  );
}

function Row({ name, checked, title, text, icon }: { name: string; checked: boolean; title: string; text: string; icon?: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-6 px-5 py-4 [&+&]:border-t [&+&]:border-border">
      <span>
        <span className="flex items-center gap-2 font-semibold">{icon}{title}</span>
        <span className="mt-1 block text-sm leading-relaxed text-muted">{text}</span>
      </span>
      <input type="checkbox" name={name} defaultChecked={checked} className="peer sr-only" />
      <span className="relative mt-1 h-6 w-11 shrink-0 rounded-full bg-slate-300 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-primary peer-checked:after:translate-x-5 peer-focus-visible:ring-4 peer-focus-visible:ring-accent/30" />
    </label>
  );
}
