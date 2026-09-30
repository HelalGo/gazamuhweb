import { Fragment, isValidElement, type ReactNode } from "react";
import { fail, json, preflight } from "@/lib/app-api";
import { legal, legalNav, policy, type LegalSlug } from "@/lib/legal";

export const OPTIONS = preflight;

// Kurumsal ve yasal sayfaların metni, uygulamanın kendi tasarımıyla çizebileceği bloklar halinde.
// Kaynak sitedeki metnin kendisidir; sitede güncellenen metin uygulamada da güncel olur.
export type Block =
  | { t: "h2" | "h3" | "p"; text: string }
  | { t: "li"; text: string; n?: number }
  | { t: "row"; k: string; v: string };

const decode = (s: string) =>
  s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'");
const text = (html: string) => decode(html.replace(/<br\s*\/?>/g, "\n").replace(/<[^>]+>/g, "")).replace(/[ \t]+/g, " ").trim();

// React ağacını basit HTML'e çevirir (react-dom/server rota dosyalarında kullanılamıyor).
// Yalnızca metin etiketleri korunur; bağlantı gibi bileşenlerin içeriği alınır, kanca kullanan bileşenler atlanır.
function toHtml(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node).replace(/</g, "&lt;").replace(/>/g, "&gt;");
  if (Array.isArray(node)) return node.map(toHtml).join("");
  if (!isValidElement(node)) return "";
  const { type, props } = node as { type: unknown; props: { children?: ReactNode } };
  if (typeof type === "string") return `<${type}>${toHtml(props.children)}</${type}>`;
  if (type === Fragment) return toHtml(props.children);
  if (typeof type === "function") {
    try {
      return toHtml((type as (p: unknown) => ReactNode)(props));
    } catch {
      return ""; // örn. çerez tercihleri butonu (kanca kullanır)
    }
  }
  return toHtml(props.children); // next/link vb.
}

function toBlocks(html: string): Block[] {
  const out: Block[] = [];
  // tablo satırları: <tr><th>k</th><td>v</td></tr>
  const re = /<(h2|h3|p|li|tr)\b[^>]*>([\s\S]*?)<\/\1>|<(ol|ul)\b[^>]*>|<\/(ol|ul)>/g;
  const lists: { ordered: boolean; n: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    if (m[3]) { lists.push({ ordered: m[3] === "ol", n: 0 }); continue; }
    if (m[4]) { lists.pop(); continue; }
    const tag = m[1], inner = m[2];
    if (tag === "tr") {
      const cells = [...inner.matchAll(/<t[hd]\b[^>]*>([\s\S]*?)<\/t[hd]>/g)].map((c) => text(c[1]));
      if (cells.length >= 2) out.push({ t: "row", k: cells[0], v: cells.slice(1).join(" · ") });
      else if (cells[0]) out.push({ t: "p", text: cells[0] });
      continue;
    }
    const t = text(inner);
    if (!t) continue;
    if (tag === "li") {
      const l = lists[lists.length - 1];
      out.push(l?.ordered ? { t: "li", text: t, n: ++l.n } : { t: "li", text: t });
    } else out.push({ t: tag as "h2" | "h3" | "p", text: t });
  }
  return out;
}

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!(slug in legal)) return fail("Sayfa bulunamadı.", 404);
  const page = legal[slug as LegalSlug];
  const html = toHtml(page.body);
  return json({
    slug,
    title: page.title,
    updated: policy.updated,
    blocks: toBlocks(html),
    nav: legalNav.map((n) => ({ slug: n.slug, title: n.title, group: n.group })),
  });
}
