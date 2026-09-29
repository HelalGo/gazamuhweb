import type { Product } from "./data";

// Türkçe karakter ve büyük/küçük harf farkını yok sayar: "Isı", "ısı", "ISI", "isi" hepsi eşleşir.
export const norm = (s: string) =>
  s
    .toLocaleLowerCase("tr")
    .replace(/[ıi̇]/g, "i")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();

// Aranan her kelime ürün adı, marka, kategori, grup veya kodunda geçmeli.
export function searchProducts(products: Product[], q: string) {
  const words = norm(q).split(" ").filter(Boolean);
  if (!words.length) return [];
  return products
    .map((p) => {
      const name = norm(p.name);
      const hay = `${name} ${norm(p.brand)} ${norm(p.category)} ${norm(p.productGroup ?? "")} ${norm(p.sku ?? "")}`;
      if (!words.every((w) => hay.includes(w))) return null;
      // Adın başında geçenler ve görseli olanlar öne
      const score = (name.startsWith(words[0]) ? 2 : 0) + (words.every((w) => name.includes(w)) ? 1 : 0) + (p.imageUrl ? 0.5 : 0);
      return { p, score };
    })
    .filter((x): x is { p: Product; score: number } => !!x)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p);
}
