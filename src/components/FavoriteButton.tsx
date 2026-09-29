"use client";
import { Heart } from "lucide-react";
import { useSite } from "./SiteProvider";

export function FavoriteButton({ id, className = "" }: { id: string; className?: string }) {
  const { enabled, favs, toggleFav } = useSite();
  if (!enabled) return null;
  const on = favs.has(id);
  return (
    <button
      type="button"
      onClick={() => toggleFav(id)}
      aria-pressed={on}
      aria-label={on ? "Favorilerimden çıkar" : "Favorilerime ekle"}
      className={`grid h-9 w-9 place-items-center rounded-[4px] bg-white/90 shadow-sm backdrop-blur transition hover:scale-110 ${className}`}
    >
      <Heart size={18} className={on ? "fill-red-500 text-red-500" : "text-foreground/70"} />
    </button>
  );
}
