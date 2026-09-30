import { getOnboarding } from "@/lib/cms";

export const dynamic = "force-dynamic";

// Mobil uygulama, ilk açılışta göstereceği tanıtım sayfalarını buradan okur.
export async function GET() {
  // herkese açık veri; tarayıcıdaki uygulama önizlemesi de okuyabilsin
  return Response.json(await getOnboarding(), { headers: { "Access-Control-Allow-Origin": "*" } });
}
