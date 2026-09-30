import { json, preflight } from "@/lib/app-api";
import { company, contact, igdas, WHATSAPP_NUMBER } from "@/lib/site";

export const OPTIONS = preflight;

// İletişim ekranı için firma ve iletişim bilgileri (tek kaynak: sitedeki site.ts)
export function GET() {
  return json({ contact, company, igdas: { title: igdas.title, no: igdas.no }, whatsapp: WHATSAPP_NUMBER });
}
