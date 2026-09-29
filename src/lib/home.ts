import { WHATSAPP_MESSAGE, WHATSAPP_NUMBER } from "./site";

export type Slide = {
  id: string;
  eyebrow: string;
  title: string;
  text: string;
  cta: { label: string; href: string; external?: boolean };
  cta2?: { label: string; href: string };
  // Kendi görselinizi kullanmak için dosyayı public/slides/ içine koyup yolunu yazın (örn. "/slides/klima.jpg").
  // Boş bırakılırsa aşağıdaki "art" adlı yerleşik tasarım gösterilir.
  image?: string;
  art: "klima" | "kombi" | "ankastre" | "proje";
};

const wa = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

export const slides: Slide[] = [
  {
    id: "klima", art: "klima", eyebrow: "Klima",
    title: "Her mekâna uygun iklimlendirme çözümleri",
    text: "Split, salon tipi ve multi klima sistemlerinde geniş model seçeneği.",
    cta: { label: "Klimaları İncele", href: "/klima" }, cta2: { label: "Tüm Ürünler", href: "/urunler" },
  },
  {
    id: "kombi", art: "kombi", eyebrow: "Kombi",
    title: "Konforlu ısınmada güvenilir çözümler",
    text: "Yoğuşmalı kombi modelleri ve ısıtma sistemleri tek adreste.",
    cta: { label: "Kombileri İncele", href: "/kombi" }, cta2: { label: "Tüm Ürünler", href: "/urunler" },
  },
  {
    id: "ankastre", art: "ankastre", eyebrow: "Ankastre",
    title: "Mutfağınıza şık ve fonksiyonel dokunuş",
    text: "Ocak, fırın ve davlumbaz gruplarında seçkin ankastre ürünler.",
    cta: { label: "Ankastreleri İncele", href: "/ankastre" }, cta2: { label: "Tüm Ürünler", href: "/urunler" },
  },
  {
    id: "proje", art: "proje", eyebrow: "Proje ve Kurulum",
    title: "Isıtma ve soğutmada mühendislik desteği",
    text: "Proje yönetimi, kurulum, bakım ve onarım hizmetleri için bize ulaşın.",
    cta: { label: "Teklif Alın", href: wa, external: true }, cta2: { label: "Ürünleri İncele", href: "/urunler" },
  },
];

export const usp = [
  { icon: "clipboard", title: "Proje Yönetimi", text: "Mekâna uygun sistem seçimi" },
  { icon: "wrench", title: "Kurulum ve Montaj", text: "Profesyonel uygulama" },
  { icon: "shield", title: "Bakım ve Onarım", text: "Isıtma ve soğutma sistemleri" },
  { icon: "message", title: "WhatsApp Destek", text: "Hızlı bilgi ve teklif" },
] as const;

export const services = [
  { icon: "clipboard", title: "Proje ve Keşif", text: "Mekânınıza uygun kapasite ve sistem seçimi için proje ve keşif desteği sunuyoruz." },
  { icon: "wrench", title: "Kurulum ve Montaj", text: "Isıtma, havalandırma, soğutma ve iklimlendirme sistemlerinin kurulumunu yapıyoruz." },
  { icon: "shield", title: "Bakım ve Onarım", text: "Kombi, klima ve ilgili sistemlerin periyodik bakım ve onarım hizmetini veriyoruz." },
] as const;

export { wa as whatsappUrl };
