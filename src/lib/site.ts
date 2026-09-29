export const WHATSAPP_NUMBER = "905331944952";
export const WHATSAPP_MESSAGE = "Merhaba, bilgi almak istiyorum.";

export const nav = [
  { label: "Tüm Ürünler", href: "/urunler", groups: [] },
  {
    label: "Klima",
    href: "/klima",
    groups: [
      { title: "Tip", items: ["Split Klima", "Salon Tipi Klima", "Multi Split", "Hava Temizleme Cihazları"] },
      { title: "Kapasite", items: ["9.000 BTU", "12.000 BTU", "18.000 BTU", "24.000 BTU"] },
      { title: "Markalar", items: ["Örnek Marka 1", "Örnek Marka 2", "Örnek Marka 3"] },
    ],
  },
  { label: "Kombi", href: "/kombi", groups: [] },
  { label: "Ankastre", href: "/ankastre", groups: [] },
  { label: "Şofben", href: "/sofben", groups: [] },
  { label: "Radyatör", href: "/radyator", groups: [] },
  { label: "Oda Termostatı", href: "/oda-termostati", groups: [] },
  { label: "Isı Pompası", href: "/isi-pompasi", groups: [] },
  { label: "Sirkülasyon Pompası", href: "/sirkulasyon-pompasi", groups: [] },
];

export const contact = {
  phone: "0533 194 49 52",
  email: "destek@gazamuhendislik.com.tr",
  address: "Eyüp Sultan Mah. Merkez Cad. No: 18 A Sancaktepe / İstanbul",
};

export const footerLinks = {
  Kurumsal: ["Hakkımızda", "İletişim", "Sıkça Sorulan Sorular", "Blog"],
  "Müşteri Hizmetleri": ["Sipariş Takibi", "Teslimat ve İade", "Kurulum ve Servis", "Ödeme Seçenekleri"],
  Sözleşmeler: ["Mesafeli Satış Sözleşmesi", "Gizlilik Politikası", "KVKK Aydınlatma Metni", "Çerez Politikası"],
};

// Ticaret sicil tasdiknamesi ve vergi levhasındaki resmi bilgiler
export const company = {
  title: "GAZA Mühendislik İnşaat Taahhüt ve Ticaret Limited Şirketi",
  taxOffice: "Sultanbeyli Vergi Dairesi",
  taxNo: "3891513900",
  mersis: "0389151390000001",
  tradeRegistryNo: "237673-5",
  registry: "İstanbul Ticaret Sicili Müdürlüğü",
};
