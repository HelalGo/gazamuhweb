import { AirVent, ClipboardCheck, CookingPot, Flame, Heater, MessageCircle, RefreshCcw, ShieldCheck, ShowerHead, Thermometer, Wind, Wrench, type LucideProps } from "lucide-react";

const map = {
  clipboard: ClipboardCheck, wrench: Wrench, shield: ShieldCheck, message: MessageCircle,
  Klima: AirVent, Kombi: Flame, Ankastre: CookingPot, Şofben: ShowerHead, Radyatör: Heater,
  "Oda Termostatı": Thermometer, "Isı Pompası": Wind, "Sirkülasyon Pompası": RefreshCcw,
} as const;

export function Icon({ name, ...p }: { name: string } & LucideProps) {
  const C = (map as Record<string, typeof Wrench>)[name] ?? Flame;
  return <C {...p} />;
}
