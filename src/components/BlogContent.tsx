import Link from "next/link";
import { AlertTriangle, Info, Lightbulb, Quote } from "lucide-react";
import { NOTE_TONES, parseInline, type BlogBlock } from "@/lib/blog-types";

// Blog yazısının gövdesi: sitede ve admin önizlemesinde aynı görünür (stiller globals.css → .blog)
export function BlogContent({ blocks }: { blocks: BlogBlock[] }) {
  return <div className="blog">{blocks.map((b, i) => <Block key={i} b={b} />)}</div>;
}

export function InlineText({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((x, i) =>
        x.bold ? <strong key={i}>{x.text}</strong>
          : x.href ? (x.href.startsWith("/") ? <Link key={i} href={x.href}>{x.text}</Link> : <a key={i} href={x.href} target="_blank" rel="noopener noreferrer">{x.text}</a>)
          : <span key={i}>{x.text}</span>
      )}
    </>
  );
}

const TONE = {
  info: { icon: Info, cls: "border-accent/30 bg-accent/5 text-accent" },
  tip: { icon: Lightbulb, cls: "border-emerald-300 bg-emerald-50 text-emerald-700" },
  warn: { icon: AlertTriangle, cls: "border-amber-300 bg-amber-50 text-amber-700" },
};

function Block({ b }: { b: BlogBlock }) {
  switch (b.t) {
    case "h2": return <h2>{b.text}</h2>;
    case "h3": return <h3>{b.text}</h3>;
    case "p": return <p><InlineText text={b.text} /></p>;
    case "ul": return <ul>{b.items.map((x, i) => <li key={i}><InlineText text={x} /></li>)}</ul>;
    case "ol": return <ol>{b.items.map((x, i) => <li key={i}><InlineText text={x} /></li>)}</ol>;
    case "img":
      return (
        <figure>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={b.url} alt={b.caption || ""} loading="lazy" />
          {b.caption && <figcaption>{b.caption}</figcaption>}
        </figure>
      );
    case "table": {
      const [first, ...rest] = b.rows;
      return (
        <div className="blog-table">
          <table>
            {b.head && <thead><tr>{first.map((c, i) => <th key={i}><InlineText text={c} /></th>)}</tr></thead>}
            <tbody>
              {(b.head ? rest : b.rows).map((r, i) => <tr key={i}>{r.map((c, k) => <td key={k}><InlineText text={c} /></td>)}</tr>)}
            </tbody>
          </table>
        </div>
      );
    }
    case "quote":
      return (
        <blockquote>
          <Quote size={22} className="mb-2 text-accent" aria-hidden />
          <p><InlineText text={b.text} /></p>
          {b.by && <cite>— {b.by}</cite>}
        </blockquote>
      );
    case "note": {
      const { icon: Icon, cls } = TONE[b.tone];
      return (
        <aside className={`blog-note ${cls}`}>
          <Icon size={20} className="mt-0.5 shrink-0" aria-hidden />
          <div>
            <p className="blog-note-title">{b.title || NOTE_TONES[b.tone]}</p>
            <p className="blog-note-text"><InlineText text={b.text} /></p>
          </div>
        </aside>
      );
    }
    case "hr": return <hr />;
  }
}
