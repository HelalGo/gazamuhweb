// Ürün açıklaması: boş satırla ayrılmış bloklar; "• " ile başlayan satırlar liste,
// listeden önceki kısa satır alt başlık, "Kurulum:" gibi etiketli paragraflar kalın etiketle gösterilir.
export function Description({ text }: { text: string }) {
  const blocks = text.split(/\n\s*\n/).map((b) => b.split("\n").map((l) => l.trim()).filter(Boolean)).filter((b) => b.length);
  return (
    <div className="space-y-4 text-sm leading-relaxed text-foreground/80">
      {blocks.map((lines, i) => {
        const bullets = lines.filter((l) => l.startsWith("• "));
        if (bullets.length) {
          const head = lines.find((l) => !l.startsWith("• "));
          return (
            <div key={i}>
              {head && <h3 className="mb-2 font-bold text-foreground">{head}</h3>}
              <ul className="space-y-1.5">
                {bullets.map((b) => (
                  <li key={b} className="flex gap-2.5"><span className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />{b.slice(2)}</li>
                ))}
              </ul>
            </div>
          );
        }
        const para = lines.join(" ");
        const m = para.match(/^([A-ZÇĞİÖŞÜ][\wçğıöşüÇĞİÖŞÜ ]{2,30}):\s(.+)$/);
        return m
          ? <p key={i}><strong className="text-foreground">{m[1]}:</strong> {m[2]}</p>
          : <p key={i} className="whitespace-pre-line">{para}</p>;
      })}
    </div>
  );
}
