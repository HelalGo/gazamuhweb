import Image from "next/image";
import { igdas } from "@/lib/site";

// "İGDAŞ Yetkili Bayi · Yetki No" rozeti
export function IgdasBadge({ className = "", size = "sm" }: { className?: string; size?: "sm" | "md" }) {
  const md = size === "md";
  return (
    <div className={`flex items-center gap-3 ${className}`} title={`${igdas.title} · Yetki No: ${igdas.no}`}>
      <Image src={igdas.logo} alt="İGDAŞ" width={250} height={269} className={md ? "h-14 w-auto" : "h-10 w-auto"} />
      <div className="leading-tight">
        <p className={`font-bold text-primary ${md ? "text-sm" : "text-[13px]"}`}>{igdas.title}</p>
        <p className={`text-muted ${md ? "text-sm" : "text-xs"}`}>Yetki No: <span className="font-semibold tabular-nums text-foreground">{igdas.no}</span></p>
      </div>
    </div>
  );
}
