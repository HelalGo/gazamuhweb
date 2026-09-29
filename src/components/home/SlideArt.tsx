import type { Slide } from "@/lib/home";

// Görsel yokken slaytın arkasında gösterilen, marka renklerinden oluşan yerleşik tasarımlar.
export function SlideArt({ variant }: { variant: Slide["art"] }) {
  const id = `g-${variant}`;
  const stops: Record<Slide["art"], [string, string, string]> = {
    klima: ["#0b1d45", "#1a3e85", "#2099d0"],
    kombi: ["#0b1d45", "#1a3e85", "#e0793a"],
    proje: ["#0b1d45", "#1a3e85", "#2099d0"],
  };
  const [a, b, c] = stops[variant];
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="0.55" stopColor={b} />
          <stop offset="1" stopColor={c} />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="0.78" cy="0.35" r="0.55">
          <stop offset="0" stopColor={c} stopOpacity="0.55" />
          <stop offset="1" stopColor={c} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1600" height="900" fill={`url(#${id})`} />
      <rect width="1600" height="900" fill={`url(#${id}-glow)`} />

      {variant === "klima" &&
        [120, 200, 280, 360, 440, 520].map((r, i) => (
          <circle key={r} cx="1240" cy="330" r={r} fill="none" stroke="#fff" strokeOpacity={0.22 - i * 0.03} strokeWidth="2" />
        ))}

      {variant === "kombi" &&
        [0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M 0 ${620 + i * 46} C 400 ${520 + i * 46}, 800 ${760 + i * 46}, 1600 ${600 + i * 46}`}
            fill="none" stroke="#fff" strokeOpacity={0.2 - i * 0.03} strokeWidth="2" />
        ))}

      {variant === "proje" &&
        Array.from({ length: 14 }).map((_, i) => (
          <line key={i} x1={700 + i * 70} y1="0" x2={i * 70 - 300 + 700} y2="900" stroke="#fff" strokeOpacity="0.08" strokeWidth="2" />
        ))}
    </svg>
  );
}
