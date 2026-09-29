"use client";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown, Cookie, Lock, X } from "lucide-react";
import {
  OPEN_EVENT, allOff, allOn, categories, consentSnapshot, parseConsent, saveConsent, subscribeConsent, type Category, type Choices,
} from "@/lib/consent";

const SSR = "__ssr__";
const btn = "inline-flex h-11 items-center justify-center whitespace-nowrap rounded-[4px] px-3 text-[11px] font-bold uppercase tracking-[0.08em] transition-colors";
const primary = `${btn} bg-primary text-white hover:bg-primary/90`;
const outline = `${btn} border border-primary text-primary hover:bg-primary hover:text-white`;

// Sade logo; etrafında yavaşça dönen ince halka
function Mark({ size = 56 }: { size?: number }) {
  return (
    <span className="relative grid shrink-0 place-items-center rounded-full bg-surface" style={{ width: size, height: size }}>
      <motion.span aria-hidden className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent border-r-primary/40"
        animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }} />
      <Image src="/brand/mark.png" alt="GAZ-A" width={size} height={size} className="h-[58%] w-auto" />
    </span>
  );
}

function Switch({ on, locked, onChange, label }: { on: boolean; locked?: boolean; onChange: () => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} disabled={locked} onClick={onChange}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${on ? "bg-primary" : "bg-surface-alt"} ${locked ? "cursor-not-allowed opacity-70" : ""}`}>
      <motion.span layout transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className={`absolute top-1 grid h-5 w-5 place-items-center rounded-full bg-white shadow ${on ? "right-1" : "left-1"}`}>
        {locked && <Lock size={10} className="text-primary" />}
      </motion.span>
    </button>
  );
}

export function CookieConsent() {
  const raw = useSyncExternalStore(subscribeConsent, consentSnapshot, () => SSR);
  const consent = raw === SSR ? null : parseConsent(raw);
  const showBanner = raw !== SSR && !consent;

  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Choices>(allOff);
  const [expanded, setExpanded] = useState<Category | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  const openSettings = useCallback(() => {
    setDraft(parseConsent(consentSnapshot())?.choices ?? allOff);
    setExpanded(null);
    setOpen(true);
  }, []);

  // Alt bilgideki / politika sayfasındaki "Çerez tercihleri" bağlantısı bu olayı tetikler
  useEffect(() => {
    window.addEventListener(OPEN_EVENT, openSettings);
    return () => window.removeEventListener(OPEN_EVENT, openSettings);
  }, [openSettings]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    dialogRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open]);

  const decide = (c: Choices) => { saveConsent(c); setOpen(false); };

  return (
    <>
      {/* İlk ziyaret kartı */}
      <AnimatePresence>
        {showBanner && !open && (
          <motion.div role="region" aria-label="Çerez bildirimi"
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
            className="fixed inset-x-3 bottom-3 z-[60] rounded-[4px] border border-border bg-white p-5 shadow-2xl shadow-primary/15 sm:inset-x-auto sm:bottom-6 sm:left-6 sm:w-[430px] sm:p-6">
            <div className="flex items-start gap-4">
              <Mark />
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-accent">Gizliliğiniz</p>
                <h2 className="mt-1 text-lg font-bold">Çerez tercihleriniz</h2>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              Sitemizin çalışması için zorunlu çerezler kullanıyoruz. Analiz ve pazarlama çerezleri yalnızca izin verirseniz
              çalışır. Ayrıntılar için <Link href="/cerez-politikasi" className="font-semibold text-accent hover:underline">Çerez Politikası</Link>.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button onClick={() => decide(allOff)} className={outline}>Yalnızca zorunlu</button>
              <button onClick={() => decide(allOn)} className={primary}>Tümünü kabul et</button>
            </div>
            <button onClick={openSettings} className="mt-3 w-full text-center text-xs font-semibold text-primary underline-offset-4 hover:underline">
              Tercihleri yönet
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tercih verildikten sonra sol altta kalan buton (WhatsApp butonunun karşısı) */}
      <AnimatePresence>
        {consent && !open && (
          <motion.button onClick={openSettings} aria-label="Çerez tercihleri" title="Çerez tercihleri"
            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: "spring", delay: 0.8 }}
            whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
            className="group fixed bottom-5 left-5 z-50 grid h-14 w-14 place-items-center rounded-[4px] bg-white text-primary shadow-lg shadow-black/20 ring-1 ring-border">
            <Cookie size={26} />
            <span className="pointer-events-none absolute left-full ml-3 hidden whitespace-nowrap rounded-[4px] bg-primary px-3 py-1.5 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 md:block">
              Çerez tercihleri
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Ayrıntılı tercihler */}
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[70] flex items-end justify-center bg-[#0b1d45]/50 p-0 backdrop-blur-sm sm:items-center sm:p-6"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
            <motion.div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="cookie-title" tabIndex={-1}
              initial={{ opacity: 0, y: 40, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} onClick={(e) => e.stopPropagation()}
              className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[4px] bg-white shadow-2xl outline-none sm:rounded-[4px]">
              <header className="flex items-center gap-4 border-b border-border px-5 py-5 sm:px-7">
                <Mark size={48} />
                <div className="min-w-0 flex-1">
                  <h2 id="cookie-title" className="text-lg font-bold sm:text-xl">Çerez tercihlerini yönet</h2>
                  <p className="text-xs text-muted">Hangi çerezlerin kullanılacağını siz seçin.</p>
                </div>
                <button onClick={() => setOpen(false)} aria-label="Kapat" className="grid h-10 w-10 place-items-center rounded-[4px] text-muted hover:bg-surface hover:text-foreground">
                  <X size={20} />
                </button>
              </header>

              <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7" data-lenis-prevent>
                <p className="text-sm leading-relaxed text-muted">
                  Çerezler, sitemizi ziyaret ettiğinizde tarayıcınıza kaydedilen küçük dosyalardır. Zorunlu çerezler dışındaki
                  kategorileri dilediğiniz zaman açıp kapatabilirsiniz; tercihiniz 6 ay boyunca hatırlanır.
                </p>
                <ul className="mt-5 space-y-3">
                  {categories.map((c) => {
                    const on = c.locked || draft[c.key];
                    const isOpen = expanded === c.key;
                    return (
                      <li key={c.key} className={`rounded-[4px] border transition-colors ${on ? "border-primary/30 bg-surface/60" : "border-border"}`}>
                        <div className="flex items-center gap-3 p-4">
                          <button onClick={() => setExpanded(isOpen ? null : c.key)} aria-expanded={isOpen} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                            <ChevronDown size={18} className={`shrink-0 text-muted transition-transform ${isOpen ? "rotate-180" : ""}`} />
                            <span className="min-w-0">
                              <span className="flex flex-wrap items-center gap-2 font-semibold">
                                {c.title}
                                {c.locked && <span className="rounded-[4px] bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">Her zaman açık</span>}
                              </span>
                              <span className="mt-0.5 block text-xs text-muted">{c.cookies.length ? `${c.cookies.length} çerez` : "Şu anda kullanılmıyor"}</span>
                            </span>
                          </button>
                          <Switch on={on} locked={c.locked} label={c.title} onChange={() => setDraft((d) => ({ ...d, [c.key]: !d[c.key] }))} />
                        </div>
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
                              <div className="border-t border-border px-4 pb-4 pt-3">
                                <p className="text-sm leading-relaxed text-muted">{c.text}</p>
                                {c.cookies.length ? (
                                  <>
                                  <ul className="mt-3 space-y-2 sm:hidden">
                                    {c.cookies.map((k) => (
                                      <li key={k.name} className="rounded-[4px] bg-white p-3 text-xs">
                                        <p className="flex flex-wrap items-baseline justify-between gap-2"><span className="font-mono font-semibold">{k.name}</span><span className="text-muted">{k.duration}</span></p>
                                        <p className="mt-1">{k.purpose}</p>
                                      </li>
                                    ))}
                                  </ul>
                                  <div className="mt-3 hidden sm:block">
                                    <table className="w-full text-left text-xs">
                                      <thead className="text-[10px] uppercase tracking-wider text-muted">
                                        <tr><th className="py-2 pr-3 font-semibold">Ad</th><th className="py-2 pr-3 font-semibold">Amaç</th><th className="py-2 font-semibold">Süre</th></tr>
                                      </thead>
                                      <tbody>
                                        {c.cookies.map((k) => (
                                          <tr key={k.name} className="border-t border-border align-top">
                                            <td className="py-2 pr-3 font-mono font-semibold">{k.name}<span className="block font-sans font-normal text-muted">{k.provider}</span></td>
                                            <td className="py-2 pr-3">{k.purpose}</td>
                                            <td className="whitespace-nowrap py-2">{k.duration}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                  </>
                                ) : (
                                  <p className="mt-3 rounded-[4px] bg-surface px-3 py-2 text-xs text-muted">
                                    Sitemizde şu anda bu kategoride çerez kullanılmıyor. İleride eklenirse yalnızca izin vermişseniz çalışır.
                                  </p>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </li>
                    );
                  })}
                </ul>
                {consent && (
                  <p className="mt-5 flex items-center gap-2 text-xs text-muted">
                    <Check size={14} className="text-green-600" />
                    Son tercihiniz {new Date(consent.at).toLocaleString("tr-TR", { dateStyle: "long", timeStyle: "short" })} tarihinde kaydedildi · Onay kimliği: <span className="font-mono">{consent.id}</span>
                  </p>
                )}
              </div>

              <footer className="grid grid-cols-2 gap-2 border-t border-border px-5 py-4 sm:grid-cols-3 sm:px-7">
                <button onClick={() => decide(allOff)} className={outline}>Tümünü reddet</button>
                <button onClick={() => decide(draft)} className={outline}>Seçimleri kaydet</button>
                <button onClick={() => decide(allOn)} className={`${primary} col-span-2 sm:col-span-1`}>Tümünü kabul et</button>
              </footer>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Alt bilgi ve politika sayfasında tercihleri yeniden açan bağlantı
export function CookieSettingsButton({ className, children = "Çerez tercihleri" }: { className?: string; children?: React.ReactNode }) {
  return <button type="button" onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))} className={className}>{children}</button>;
}
