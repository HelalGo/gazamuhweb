import { Mail, MapPin, Phone } from "lucide-react";
import { LeadForm } from "@/components/LeadForm";
import { LegalPage, legalMeta } from "@/components/LegalPage";
import { BrandIcon } from "@/components/SocialIcons";
import { whatsappUrl } from "@/lib/home";
import { Seller } from "@/lib/legal";
import { contact } from "@/lib/site";

export const metadata = legalMeta("iletisim");

const tel = `tel:+9${contact.phone.replace(/\s/g, "")}`;
const channels = [
  { icon: <Phone size={20} />, label: "Telefon", value: contact.phone, href: tel },
  { icon: <BrandIcon name="whatsapp" size={20} />, label: "WhatsApp", value: "Mesaj gönderin", href: whatsappUrl, external: true },
  { icon: <Mail size={20} />, label: "E-posta", value: contact.email, href: `mailto:${contact.email}` },
  { icon: <MapPin size={20} />, label: "Adres", value: contact.address, href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`, external: true },
];

export default function ContactPage() {
  return (
    <LegalPage slug="iletisim">
      <p className="lead">Ürünler, teklif, kurulum veya siparişinizle ilgili her konuda bize aşağıdaki kanallardan ulaşabilirsiniz.</p>

      <ul className="grid !list-none gap-3 !pl-0 sm:grid-cols-2 [&>li]:!mt-0">
        {channels.map((c) => (
          <li key={c.label}>
            <a href={c.href} target={c.external ? "_blank" : undefined} rel={c.external ? "noopener noreferrer" : undefined}
              className="group flex h-full items-start gap-4 rounded-[4px] border border-border p-5 !font-normal !text-foreground !no-underline transition-colors hover:border-primary">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-surface-alt text-primary transition-colors group-hover:bg-primary group-hover:text-white">{c.icon}</span>
              <span className="min-w-0">
                <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">{c.label}</span>
                <span className="mt-1 block break-words font-semibold">{c.value}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>

      <h2>Konum</h2>
      <div className="overflow-hidden rounded-[4px] border border-border">
        <iframe title="GAZA Mühendislik konumu" src={`https://www.google.com/maps?q=${encodeURIComponent(contact.address)}&output=embed`}
          className="h-80 w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
      </div>

      <h2>Bize yazın</h2>
      <LeadForm />

      <Seller title="Şirket Bilgileri" />
    </LegalPage>
  );
}
