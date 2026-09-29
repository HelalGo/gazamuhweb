import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";
import { company, contact, footerLinks, nav } from "@/lib/site";

const info = [
  ["Ticaret Ünvanı", company.title],
  ["Vergi Dairesi", company.taxOffice],
  ["Vergi Kimlik No", company.taxNo],
  ["MERSİS No", company.mersis],
  ["Ticaret Sicil No", company.tradeRegistryNo],
  ["Sicil Müdürlüğü", company.registry],
];

export function Footer() {
  return (
    <footer className="mt-24 bg-surface">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 md:px-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Image src="/brand/logo.png" alt="GAZ-A Mühendislik Proje Yönetimi" width={242} height={58} className="h-11 w-auto" />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
            Isıtma, havalandırma, soğutma ve iklimlendirme sistemlerinde satış, proje yönetimi, kurulum, bakım ve onarım hizmeti.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            <li className="flex items-center gap-3"><Phone size={16} className="shrink-0 text-primary" /><a href={`tel:+9${contact.phone.replace(/\s/g, "")}`} className="hover:text-primary">{contact.phone}</a></li>
            <li className="flex items-center gap-3"><Mail size={16} className="shrink-0 text-primary" /><a href={`mailto:${contact.email}`} className="hover:text-primary">{contact.email}</a></li>
            <li className="flex items-start gap-3"><MapPin size={16} className="mt-0.5 shrink-0 text-primary" />{contact.address}</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-bold text-primary">Kategoriler</h4>
          <ul className="space-y-2 text-sm text-muted">
            {nav.map((n) => (
              <li key={n.label}><a href={n.href} className="hover:text-foreground">{n.label}</a></li>
            ))}
          </ul>
        </div>

        {Object.entries(footerLinks).slice(0, 2).map(([title, items]) => (
          <div key={title}>
            <h4 className="mb-4 text-sm font-bold text-primary">{title}</h4>
            <ul className="space-y-2 text-sm text-muted">
              {items.map((i) => (
                <li key={i}><a href="#" className="hover:text-foreground">{i}</a></li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 md:px-6">
        <dl className="grid gap-x-8 gap-y-5 border-t border-border py-8 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {info.map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted">{k}</dt>
              <dd className="mt-1 font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="bg-primary text-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs md:flex-row md:px-6">
          <p className="text-center md:text-left">© {new Date().getFullYear()} {company.title}. Tüm hakları saklıdır.</p>
          <ul className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-white/80">
            {footerLinks["Sözleşmeler"].map((i) => (
              <li key={i}><a href="#" className="hover:text-white">{i}</a></li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
