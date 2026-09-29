export const STATUS = {
  pending: { label: "Beklemede", cls: "bg-amber-100 text-amber-800" },
  confirmed: { label: "Onaylandı", cls: "bg-blue-100 text-blue-800" },
  shipped: { label: "Kargoda", cls: "bg-indigo-100 text-indigo-800" },
  delivered: { label: "Teslim edildi", cls: "bg-green-100 text-green-800" },
  cancelled: { label: "İptal edildi", cls: "bg-surface-alt text-muted" },
} as const;
export type Status = keyof typeof STATUS;
export const isStatus = (s: unknown): s is Status => typeof s === "string" && s in STATUS;

// Yorum yapabilmek için siparişin bu durumda olması gerekir.
// Daha erken izin vermek isterseniz listeye "shipped" ekleyin.
export const REVIEW_STATUSES: Status[] = ["delivered"];

export const orderNo = (id: number) => `GZ-${String(id).padStart(6, "0")}`;
