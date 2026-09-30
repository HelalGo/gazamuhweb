import Image from "next/image";
import { BellRing, PackageCheck, Percent } from "lucide-react";
import { appLinks } from "@/lib/site";

// Footer'ın hemen üstündeki "Uygulamamızı indirin" bölümü: App Store ve Google Play rozetleri
const perks = [
  { icon: Percent, text: "Uygulamaya özel kampanyalar" },
  { icon: PackageCheck, text: "Sipariş ve kargo takibi" },
  { icon: BellRing, text: "Anlık bildirimler" },
];

export function AppDownload() {
  return (
    <section aria-labelledby="app-download" className="mx-auto mt-24 w-full max-w-7xl px-4 md:px-6">
      <div className="relative overflow-hidden rounded-[4px] bg-gradient-to-br from-primary to-[#12285c] px-6 pt-10 text-white sm:px-10 md:px-14 md:pt-0">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/5" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 right-40 h-80 w-80 rounded-full bg-accent/10" />

        <div className="relative grid items-center gap-10 md:grid-cols-[1.1fr_1fr]">
          <div className="md:py-14">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-accent">Mobil uygulama</p>
            <h2 id="app-download" className="mt-3 text-3xl font-light tracking-tight md:text-4xl">
              GAZ-A Mühendislik <span className="font-bold">cebinizde</span>
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75">
              Kombi, klima ve ısı pompası modellerini inceleyin, kampanyalardan ilk siz haberdar olun, siparişinizi kolayca verip takip edin.
            </p>
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm">
              {perks.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2 text-white/90"><Icon size={16} className="text-accent" />{text}</li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <StoreBadge href={appLinks.ios} label="App Store'dan indirin" top="App Store'dan" bottom="İndirin" icon={<AppleIcon />} />
              <StoreBadge href={appLinks.android} label="Google Play'den alın" top="GOOGLE PLAY'DEN" bottom="ALIN" icon={<PlayIcon />} />
            </div>
          </div>

          {/* iki telefon ekranı; küçük ekranda altta, kısmen görünür */}
          <div className="relative mx-auto h-[300px] w-full max-w-[420px] md:h-[420px]">
            <Phone src="/brand/app-campaigns.webp" alt="Uygulamada kampanyalar ekranı" className="absolute bottom-[-120px] left-0 w-[46%] rotate-[-6deg] opacity-90 md:bottom-[-150px] md:left-6 md:w-[38%]" />
            <Phone src="/brand/app-home.webp" alt="GAZ-A Mühendislik uygulaması ana sayfa" className="absolute bottom-[-80px] right-4 w-[52%] md:bottom-[-90px] md:right-10 md:w-[42%]" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Phone({ src, alt, className }: { src: string; alt: string; className: string }) {
  return (
    <div className={`rounded-[28px] border-[6px] border-[#0b1633] bg-[#0b1633] shadow-2xl ${className}`}>
      <Image src={src} alt={alt} width={540} height={1170} className="h-auto w-full rounded-[22px]" />
    </div>
  );
}

function StoreBadge({ href, label, top, bottom, icon }: { href: string; label: string; top: string; bottom: string; icon: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
      className="inline-flex h-14 items-center gap-3 rounded-[10px] border border-white/25 bg-black px-4 pr-5 transition hover:-translate-y-0.5 hover:border-white/60">
      {icon}
      <span className="flex flex-col leading-none">
        <span className="text-[11px] font-medium tracking-wide text-white/85">{top}</span>
        <span className="mt-1 text-[19px] font-semibold tracking-tight">{bottom}</span>
      </span>
    </a>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden>
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden>
      <path fill="#2196F3" d="M3.6 1.8 13.5 12l-9.9 10.2c-.36-.2-.6-.6-.6-1.1V2.9c0-.5.24-.9.6-1.1z" />
      <path fill="#00D26A" d="M3.6 1.8c.37-.21.83-.21 1.22.01L16.9 8.7 13.5 12z" />
      <path fill="#FF3D57" d="M13.5 12l3.4 3.3-12.08 6.89c-.39.22-.85.22-1.22.01z" />
      <path fill="#FFC400" d="M16.9 8.7l3.62 2.07c.9.52.9 1.93 0 2.45L16.9 15.3 13.5 12z" />
    </svg>
  );
}
