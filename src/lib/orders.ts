// Sipariş akışı (havale / EFT): ödeme bekleniyor → ödeme alındı → hazırlanıyor → kargoya verildi → teslim edildi
export const STATUS = {
  pending: { label: "Ödeme bekleniyor", cls: "bg-amber-100 text-amber-800" },
  confirmed: { label: "Ödeme alındı", cls: "bg-blue-100 text-blue-800" },
  preparing: { label: "Hazırlanıyor", cls: "bg-sky-100 text-sky-800" },
  shipped: { label: "Kargoya verildi", cls: "bg-indigo-100 text-indigo-800" },
  delivered: { label: "Teslim edildi", cls: "bg-green-100 text-green-800" },
  cancelled: { label: "İptal edildi", cls: "bg-surface-alt text-muted" },
} as const;
export type Status = keyof typeof STATUS;
export const isStatus = (s: unknown): s is Status => typeof s === "string" && s in STATUS;

// Yorum yapabilmek için siparişin bu durumda olması gerekir.
// Daha erken izin vermek isterseniz listeye "shipped" ekleyin.
export const REVIEW_STATUSES: Status[] = ["delivered"];

export const orderNo = (id: number) => `GZ-${String(id).padStart(6, "0")}`;

// Kargo firmaları ve takip adresleri (takip numarası sona eklenir)
export const CARGO: Record<string, string> = {
  "Yurtiçi Kargo": "https://www.yurticikargo.com/tr/online-servisler/gonderi-sorgula?code=",
  "Aras Kargo": "https://kargotakip.araskargo.com.tr/mainpage.aspx?code=",
  "MNG Kargo": "https://www.mngkargo.com.tr/gonderi-takip/?gonderino=",
  "PTT Kargo": "https://gonderitakip.ptt.gov.tr/Track/Verify?q=",
  "Sürat Kargo": "https://suratkargo.com.tr/KargoTakip/?kargotakipno=",
  "Kendi aracımızla": "",
};
export const trackingUrl = (company?: string | null, no?: string | null) =>
  company && no && CARGO[company] ? CARGO[company] + encodeURIComponent(no) : null;
