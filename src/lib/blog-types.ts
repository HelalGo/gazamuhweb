// Blog içeriği bloklar halinde saklanır; site, admin önizlemesi ve mobil uygulama aynı yapıyı kendi tasarımıyla çizer.
// Paragraf, liste, tablo ve kutu metinlerinde: **kalın** ve [bağlantı metni](/adres ya da https://...)
export type BlogBlock =
  | { t: "h2" | "h3"; text: string }
  | { t: "p"; text: string }
  | { t: "ul" | "ol"; items: string[] }
  | { t: "img"; url: string; caption: string }
  | { t: "table"; head: boolean; rows: string[][] }
  | { t: "quote"; text: string; by: string }
  | { t: "note"; tone: "info" | "tip" | "warn"; title: string; text: string }
  | { t: "hr" };

export type BlogType = BlogBlock["t"];

export const BLOCK_LABELS: Record<BlogType, string> = {
  h2: "Başlık",
  h3: "Alt başlık",
  p: "Paragraf",
  ul: "Madde listesi",
  ol: "Numaralı liste",
  img: "Görsel",
  table: "Tablo",
  quote: "Alıntı",
  note: "Bilgi kutusu",
  hr: "Ayırıcı",
};

export const NOTE_TONES = { info: "Bilgi", tip: "İpucu", warn: "Dikkat" } as const;

export function emptyBlock(t: BlogType): BlogBlock {
  switch (t) {
    case "h2": case "h3": case "p": return { t, text: "" };
    case "ul": case "ol": return { t, items: [""] };
    case "img": return { t, url: "", caption: "" };
    case "table": return { t, head: true, rows: [["", ""], ["", ""]] };
    case "quote": return { t, text: "", by: "" };
    case "note": return { t, tone: "info", title: "", text: "" };
    case "hr": return { t };
  }
}

// Satır içi biçim: **kalın** ve [metin](adres). Adres yalnızca / ile başlayan site içi ya da http(s) olabilir.
export type Inline = { text: string; bold?: boolean; href?: string };
export function parseInline(src: string): Inline[] {
  const out: Inline[] = [];
  const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(((?:\/(?!\/)|https?:\/\/)[^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    if (m.index > last) out.push({ text: src.slice(last, m.index) });
    out.push(m[1] ? { text: m[1], bold: true } : { text: m[2], href: m[3] });
    last = re.lastIndex;
  }
  if (last < src.length) out.push({ text: src.slice(last) });
  return out;
}

const plain = (s: string) => s.replace(/\*\*(.+?)\*\*/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

// Okuma süresi (dakika): dakikada ~200 kelime, görsel başına ~10 sn
export function readingMinutes(blocks: BlogBlock[]) {
  let words = 0, images = 0;
  for (const b of blocks) {
    if ("text" in b) words += plain(b.text).split(/\s+/).filter(Boolean).length;
    if (b.t === "ul" || b.t === "ol") words += b.items.join(" ").split(/\s+/).length;
    if (b.t === "table") words += b.rows.flat().join(" ").split(/\s+/).length;
    if (b.t === "img") images++;
  }
  return Math.max(1, Math.round(words / 200 + images / 6));
}

// Özet yazılmadıysa ilk paragraftan üretilir
export const autoExcerpt = (blocks: BlogBlock[]) => {
  const p = blocks.find((b) => b.t === "p") as { text: string } | undefined;
  const t = p ? plain(p.text) : "";
  return t.length > 180 ? `${t.slice(0, 177).replace(/\s+\S*$/, "")}…` : t;
};

// Admin'den gelen içeriği doğrular ve kırpar (bilinmeyen alanlar atılır)
export function cleanBlocks(input: unknown): BlogBlock[] {
  if (!Array.isArray(input)) return [];
  const s = (v: unknown, max: number) => String(v ?? "").slice(0, max);
  const url = (v: unknown) => {
    const u = s(v, 500).trim();
    return /^\/uploads\/[a-f0-9]{24}\.(jpg|png|webp)$/.test(u) || /^https:\/\//.test(u) ? u : "";
  };
  const out: BlogBlock[] = [];
  for (const raw of input.slice(0, 300)) {
    const b = raw as Record<string, unknown>;
    switch (b?.t) {
      case "h2": case "h3": { const text = s(b.text, 200).trim(); if (text) out.push({ t: b.t, text }); break; }
      case "p": { const text = s(b.text, 5000).trim(); if (text) out.push({ t: "p", text }); break; }
      case "ul": case "ol": {
        const items = (Array.isArray(b.items) ? b.items : []).map((x) => s(x, 1000).trim()).filter(Boolean).slice(0, 100);
        if (items.length) out.push({ t: b.t, items });
        break;
      }
      case "img": { const u = url(b.url); if (u) out.push({ t: "img", url: u, caption: s(b.caption, 300).trim() }); break; }
      case "table": {
        const rows = (Array.isArray(b.rows) ? b.rows : []).slice(0, 60).map((r) => (Array.isArray(r) ? r : []).slice(0, 8).map((c) => s(c, 500).trim()));
        const width = Math.max(0, ...rows.map((r) => r.length));
        const filled = rows.filter((r) => r.some(Boolean)).map((r) => [...r, ...Array(width - r.length).fill("")]);
        if (filled.length && width) out.push({ t: "table", head: !!b.head, rows: filled });
        break;
      }
      case "quote": { const text = s(b.text, 1500).trim(); if (text) out.push({ t: "quote", text, by: s(b.by, 120).trim() }); break; }
      case "note": {
        const text = s(b.text, 2000).trim();
        const tone = b.tone === "tip" || b.tone === "warn" ? b.tone : "info";
        if (text) out.push({ t: "note", tone, title: s(b.title, 120).trim(), text });
        break;
      }
      case "hr": out.push({ t: "hr" }); break;
    }
  }
  return out;
}

export const blogImages = (blocks: BlogBlock[]) => blocks.flatMap((b) => (b.t === "img" ? [b.url] : []));
