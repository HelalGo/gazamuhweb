import { getAppBanners, getSlides } from "@/lib/cms";

export const dynamic = "force-dynamic";

// Mobil uygulamanın ana sayfa bannerları: admin → Mobil Uygulama → Ana Sayfa Bannerları.
// Orada hiç banner yoksa sitenin slider görselleri (yatay masaüstü görseli) kullanılır.
// target: "" | "kampanyalar" | "kategori:<ad>" | site adresi
export async function GET() {
  const own = await getAppBanners();
  const slides = own.length
    ? own.map((b) => ({ id: `a${b.id}`, image: b.image, eyebrow: "", title: b.title, text: b.text, target: b.target }))
    : (await getSlides())
        .filter((s) => s.image || s.mobileImage)
        .map((s) => ({ id: s.id, image: s.image || s.mobileImage, eyebrow: s.eyebrow, title: s.title, text: s.text, target: s.buttons[0]?.url ?? "" }));
  return Response.json(slides, { headers: { "Access-Control-Allow-Origin": "*" } });
}
