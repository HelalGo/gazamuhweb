import { Star } from "lucide-react";

export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex" role="img" aria-label={`5 üzerinden ${value.toFixed(1)}`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} className={value >= n - 0.25 ? "fill-amber-400 text-amber-400" : value >= n - 0.75 ? "fill-amber-200 text-amber-400" : "text-border"} />
      ))}
    </span>
  );
}
