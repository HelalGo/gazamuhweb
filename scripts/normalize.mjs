// Kazınan ürünlerde marka yazımlarını birleştirir ve kategorisiz ürünleri sınıflandırır.
// Kullanım: node scripts/normalize.mjs   (data/products.json'ı yerinde günceller)
import { readFile, writeFile } from "node:fs/promises";

const BRANDS = {
  "demir döküm": "Demirdöküm", demirdöküm: "Demirdöküm",
  "e.c.a.": "ECA", eca: "ECA",
};

export function normalize(p) {
  const b = (p.brand || "").trim();
  p.brand = BRANDS[b.toLocaleLowerCase("tr")] ?? b;
  if (!p.category) {
    const n = p.name.toLocaleLowerCase("tr");
    p.category = /ısı pompası/.test(n) ? "Isı Pompası" : /pompa/.test(n) ? "Sirkülasyon Pompası" : "Diğer";
  }
  return p;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const items = JSON.parse(await readFile("data/products.json", "utf8")).map(normalize);
  await writeFile("data/products.json", JSON.stringify(items, null, 2));
  console.log(`${items.length} ürün normalize edildi`);
}
