import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Crumb = string | { label: string; href?: string };

export function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  const items = crumbs.map((c, i) =>
    typeof c === "string" ? { label: c, href: i === 0 ? "/" : undefined } : c
  );
  return (
    <nav aria-label="Konum" className="flex flex-wrap items-center gap-2 text-sm">
      {items.map((c, i) => (
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <ChevronRight size={14} className="text-muted" />}
          {i === items.length - 1 || !c.href ? (
            <span className={`${i === items.length - 1 ? "line-clamp-1 font-bold text-primary" : "text-muted"}`}>{c.label}</span>
          ) : (
            <Link href={c.href} className="text-muted hover:text-foreground">{c.label}</Link>
          )}
        </span>
      ))}
    </nav>
  );
}
