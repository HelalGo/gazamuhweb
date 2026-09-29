import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...i: ClassValue[]) => twMerge(clsx(i));
export const tl = (n: number) => n.toLocaleString("tr-TR") + " ₺";

import { WHATSAPP_NUMBER } from "./site";

// Fiyatı 0 olan ürünlerde fiyat gösterilmez, WhatsApp'tan bilgi istenir.
export const waLink = (productName: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Merhaba, "${productName}" ürünü hakkında fiyat bilgisi almak istiyorum.`)}`;
