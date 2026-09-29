// Çerez onayı: kategoriler, çerez listesi ve tarayıcıdaki kaydı okuma/yazma yardımcıları.
// Yeni bir analiz/pazarlama aracı eklendiğinde çerezlerini ilgili kategorinin "cookies" listesine yazın
// ve betiğini <ConsentScript category="..."> ile yükleyin; izin verilmedikçe çalışmaz.

export type Category = "necessary" | "analytics" | "marketing";
export type Choices = Record<Category, boolean>;
export type Consent = { v: number; id: string; at: string; choices: Choices };

export const CONSENT_COOKIE = "gaza_consent";
export const CONSENT_VERSION = 1; // metin/kategoriler değişirse artırın, herkese yeniden sorulur
const MAX_AGE = 60 * 60 * 24 * 180; // 6 ay
const EVENT = "gaza:consent";
export const OPEN_EVENT = "gaza:cookie-settings";

type CookieInfo = { name: string; provider: string; purpose: string; duration: string };

export const categories: { key: Category; title: string; text: string; locked?: boolean; cookies: CookieInfo[] }[] = [
  {
    key: "necessary",
    title: "Zorunlu çerezler",
    text: "Sitenin çalışması için gereklidir: sepetinizin korunması, üye girişinin açık kalması ve çerez tercihinizin hatırlanması. Kapatılamaz.",
    locked: true,
    cookies: [
      { name: CONSENT_COOKIE, provider: "GAZA Mühendislik", purpose: "Çerez tercihlerinizi hatırlar.", duration: "6 ay" },
      { name: "gaza_user", provider: "GAZA Mühendislik", purpose: "Üye girişi yaptığınızda oturumunuzu açık tutar.", duration: "12 saat (\"Beni hatırla\" ile 30 gün)" },
      { name: "gaza_admin", provider: "GAZA Mühendislik", purpose: "Yalnızca site yöneticilerinin panel oturumu.", duration: "12 saat" },
      { name: "gaza-cart", provider: "GAZA Mühendislik", purpose: "Sepetinizdeki ürünleri tarayıcınızda saklar (yerel depolama).", duration: "Siz silene kadar" },
    ],
  },
  {
    key: "analytics",
    title: "Analiz çerezleri",
    text: "Ziyaretçilerin siteyi nasıl kullandığını anonim olarak ölçerek siteyi geliştirmemize yardımcı olur.",
    cookies: [],
  },
  {
    key: "marketing",
    title: "Pazarlama çerezleri",
    text: "İlgi alanlarınıza uygun reklamlar göstermek ve kampanyaların etkisini ölçmek için kullanılır.",
    cookies: [],
  },
];

export const allOn: Choices = { necessary: true, analytics: true, marketing: true };
export const allOff: Choices = { necessary: true, analytics: false, marketing: false };

function readRaw(): string {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=([^;]*)`));
  return m ? m[1] : "";
}

export function parseConsent(raw: string): Consent | null {
  if (!raw) return null;
  try {
    const c = JSON.parse(decodeURIComponent(raw)) as Consent;
    if (c.v !== CONSENT_VERSION || !c.choices) return null;
    return { ...c, choices: { ...allOff, ...c.choices, necessary: true } };
  } catch {
    return null;
  }
}

export const getConsent = () => parseConsent(readRaw());
export const hasConsent = (cat: Category) => cat === "necessary" || !!getConsent()?.choices[cat];

export function saveConsent(choices: Choices) {
  const prev = getConsent();
  const c: Consent = {
    v: CONSENT_VERSION,
    id: prev?.id ?? (crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)).slice(0, 8).toUpperCase(),
    at: new Date().toISOString(),
    choices: { ...choices, necessary: true },
  };
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(c))}; Max-Age=${MAX_AGE}; Path=/; SameSite=Lax${secure}`;
  window.dispatchEvent(new Event(EVENT));
}

// useSyncExternalStore için: çerez metni değişince bileşenler yeniden çizilir
export function subscribeConsent(cb: () => void) {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}
export const consentSnapshot = () => readRaw();
export const openCookieSettings = () => window.dispatchEvent(new Event(OPEN_EVENT));
