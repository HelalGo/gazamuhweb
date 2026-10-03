// gazamuhendislik.com.tr ve kombiklimago.com aynı veritabanını kullanır. Markaya özel kayıtlar (slider, vitrin,
// kampanyalar, uygulama bannerları ve tanıtım ekranları, bilgi talepleri, siparişler) "site" sütunuyla ayrılır.
export const SITES = {
  gazamuh: { label: "GAZ-A Mühendislik", url: "https://gazamuhendislik.com.tr" },
  kombiklimago: { label: "Kombi Klima GO", url: "https://kombiklimago.com" },
} as const;

export type SiteKey = keyof typeof SITES;

// Bu kodun ait olduğu site (kombiklimagoweb'de "kombiklimago")
export const SITE_KEY: SiteKey = "gazamuh";

export const isSiteKey = (v: unknown): v is SiteKey => typeof v === "string" && v in SITES;
// "site" sütunu eklenmeden önceki kayıtlar GAZ-A'nındır
export const siteOf = (v: unknown): SiteKey => (isSiteKey(v) ? v : "gazamuh");
