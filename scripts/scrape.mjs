// Kullanım: node scripts/scrape.mjs [limit]
// sitemap.xml'deki adresleri gezer, ürün sayfalarını data/products.json'a yazar.
// robots.txt'e uyar (sorgu parametreli adreslere gitmez), yavaş ve tek tek istek atar.
import * as cheerio from "cheerio";
import { mkdir, writeFile } from "node:fs/promises";
import { normalize } from "./normalize.mjs";

const BASE = "https://onlinekombi.com";
const LIMIT = Number(process.argv[2]) || Infinity;
const DELAY_MS = 800;
const UA = "Mozilla/5.0 (compatible; GazaMuhCatalogImport/1.0)";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url, tries = 3) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
      if (res.ok) return await res.text();
      if (res.status === 404) return null;
    } catch {}
    await sleep(1500 * (i + 1));
  }
  return null;
}

const txt = (s) => (s || "").replace(/\s+/g, " ").trim();

// Onlinekombi'nin kendi mağazasına ait reklam cümlelerini ayıklar (teslimat, mağaza, telefon vb.)
const PROMO = /online\s*kombi|mağaza|filo|arayın|telefon|sipariş verebilir|teslimat|montaj hakkında|hemen|bizde|bulabilirsiniz/i;
function cleanDescription(t) {
  return txt(t)
    .replace(/([.!?])(?=[A-ZÇĞİÖŞÜ])/g, "$1 ")
    .split(/(?<=[.!?])\s+/)
    .filter((s) => !PROMO.test(s))
    .join(" ")
    .trim();
}

function parse(html, url) {
  const $ = cheerio.load(html);
  if (!$('[itemtype="http://schema.org/Product"]').length) return null;

  const crumbs = $(".breadcrumb-item [itemprop=name], .breadcrumb-item strong").map((_, e) => txt($(e).text())).get();
  const priceMeta = $("meta[itemprop=price]").attr("content");
  const price = priceMeta ? Number(priceMeta) : null;
  const oldRaw = txt($(".old-price").first().text()).replace(/[^\d,]/g, "").replace(",", ".");
  const stockText = txt($(".stock .value").first().text());

  const specs = {};
  $("#desc table tr").each((_, tr) => {
    const td = $(tr).find("td");
    if (td.length >= 2) specs[txt($(td[0]).text())] = txt($(td[1]).text());
  });
  $("#spec tr.spec").each((_, tr) => {
    const k = txt($(tr).find(".spec-name").text()).replace(/:$/, "");
    const v = txt($(tr).find(".spec-value").text());
    if (k && v) specs[k] = v;
  });

  const img = $("meta[property='og:image']").attr("content");
  const descExtra = cleanDescription($("#desc").clone().find("table,iframe").remove().end().text());
  const description = cleanDescription($(".short-description").text()) || descExtra;

  return {
    source_url: url,
    sku: txt($("[itemprop=sku]").first().text()) || null,
    name: txt($("h1[itemprop=name]").first().text()),
    brand: txt($(".manufacturers .value a").first().text()) || specs["Marka"] || txt($("h1[itemprop=name]").first().text()).split(" ")[0] || null,
    category: crumbs[1] && crumbs[1] !== crumbs[crumbs.length - 1] ? crumbs[1] : null,
    product_group: specs["Ürün Grubu"] || null,
    price,
    old_price: oldRaw ? Number(oldRaw) : null,
    in_stock: !/tükendi|yok/i.test(stockText),
    description,
    specs,
    source_image_url: img ? new URL(img, BASE).href : null,
  };
}

const sitemap = await get(`${BASE}/sitemap.xml`);
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace("://www.", "://")).filter((u) => !u.includes("?"));
console.log(`${urls.length} adres taranacak`);

const seen = new Set();
const out = [];
let i = 0;
for (const url of urls) {
  if (out.length >= LIMIT) break;
  i++;
  const html = await get(url);
  await sleep(DELAY_MS);
  if (!html) continue;
  const p = parse(html, url);
  if (!p || !p.name || seen.has(p.sku || p.source_url)) continue;
  seen.add(p.sku || p.source_url);
  out.push(p);
  if (out.length % 10 === 0) console.log(`  ${i}/${urls.length} tarandı, ${out.length} ürün`);
}

await mkdir("data", { recursive: true });
await writeFile("data/products.json", JSON.stringify(out.map(normalize), null, 2));
console.log(`Bitti: ${out.length} ürün -> data/products.json`);
