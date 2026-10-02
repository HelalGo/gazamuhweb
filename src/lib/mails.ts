import { policy } from "./policy";
import { SITE_URL, esc, h, itemsTable, layout, toText, type Line, type Mail, type Sender } from "./mail";
import { orderNo, type Status } from "./orders";
import { bank, company, contact, ibanGroups } from "./site";

const build = (subject: string, preheader: string, body: string, footerNote?: string): Mail => {
  const html = layout({ preheader, body, footerNote });
  return { subject, html, text: toText(html) };
};
const TRANSACTIONAL = "Bu e-posta, sitemizdeki işleminiz nedeniyle gönderilmiştir.";

/* ---------- Üyelik ---------- */
export function welcomeMail(u: { firstName: string; email: string }) {
  return build(
    "GAZ-A Mühendislik'e hoş geldiniz",
    "Üyeliğiniz oluşturuldu. Siparişlerinizi ve favorilerinizi hesabınızdan takip edebilirsiniz.",
    h.eyebrow("Hoş geldiniz") +
      h.title(`Merhaba ${esc(u.firstName)},<br>üyeliğiniz oluşturuldu.`) +
      h.p("GAZ-A Mühendislik ailesine katıldığınız için teşekkür ederiz. Hesabınızla artık siparişlerinizi takip edebilir, beğendiğiniz ürünleri favorilerinize ekleyebilir ve satın aldığınız ürünlere yorum yazabilirsiniz.") +
      h.box([["E-posta", esc(u.email)]], "Hesap bilgileriniz") +
      h.p("Isıtma, soğutma veya doğalgaz projeniz için keşif ve teklife ihtiyacınız olursa bize her zaman ulaşabilirsiniz.") +
      h.button("Hesabıma git", `${SITE_URL}/hesabim`),
    TRANSACTIONAL
  );
}

/* ---------- Sipariş ---------- */
export type OrderMailData = {
  id: number; createdAt: Date; fullName: string; email: string; phone: string; city: string; address: string; note?: string | null;
  total: number; items: Line[];
  subtotal?: number | null; discount?: number; shipping?: number; coupon?: string | null;
  cargo?: string | null; trackingNo?: string | null; trackingUrl?: string | null;
};
const STEPS = ["Alındı", "Ödeme alındı", "Hazırlanıyor", "Kargoda", "Teslim edildi"];

const address = (o: OrderMailData) => `${esc(o.fullName)}<br>${esc(o.address)}<br>${esc(o.city)}<br>${esc(o.phone)}`;

// Müşteriye sipariş onayı. Mesafeli satış mevzuatı gereği sözleşme bilgileri de bu e-postada yer alır.
export function orderReceivedMail(o: OrderMailData) {
  const no = orderNo(o.id);
  return build(
    `Siparişiniz alındı — ${no}`,
    `${no} numaralı siparişiniz bize ulaştı. Ödemeyi havale / EFT ile yapabilirsiniz.`,
    h.eyebrow("Sipariş alındı") +
      h.title(`Teşekkürler ${esc(o.fullName.split(" ")[0])},<br>siparişiniz bize ulaştı.`) +
      h.p(`<strong>${no}</strong> numaralı siparişiniz ${o.createdAt.toLocaleString("tr-TR", { dateStyle: "long", timeStyle: "short" })} tarihinde oluşturuldu. Ödemenizi aşağıdaki hesaba havale / EFT ile yapabilirsiniz; ödemeniz ulaştığında siparişiniz onaylanır ve hazırlanmaya başlar.`) +
      h.steps(STEPS, 0) +
      h.box([["Banka", esc(bank.name)], ["Alıcı", esc(bank.holder)], ["IBAN", esc(ibanGroups(bank.iban))], ["Tutar", `${o.total.toLocaleString("tr-TR")} ₺`], ["Açıklama", no]], "Havale / EFT bilgileri") +
      itemsTable(o.items, o.total, o) +
      h.divider() +
      h.box([["Teslimat adresi", address(o)], ...(o.note ? [["Sipariş notu", esc(o.note)] as [string, string]] : [])], "Teslimat") +
      h.button("Siparişimi görüntüle", `${SITE_URL}/hesabim/siparis/${o.id}`) +
      h.divider() +
      h.eyebrow("Sözleşme bilgileri") +
      h.small(`Satıcı: ${esc(company.title)} · ${esc(contact.address)} · MERSİS: ${esc(company.mersis)} · KEP: ${esc(company.kep)} · ${esc(contact.phone)} · ${esc(contact.email)}`) +
      h.small(`Siparişiniz <a href="${SITE_URL}/on-bilgilendirme-formu" style="color:#2099d0">Ön Bilgilendirme Formu</a> ve <a href="${SITE_URL}/mesafeli-satis-sozlesmesi" style="color:#2099d0">Mesafeli Satış Sözleşmesi</a> kapsamında onaylanmıştır. Ürünü teslim aldığınız tarihten itibaren ${policy.withdrawalDays} gün içinde herhangi bir gerekçe göstermeden cayma hakkınızı kullanabilirsiniz; ayrıntılar <a href="${SITE_URL}/iptal-ve-iade-kosullari" style="color:#2099d0">İptal ve İade Koşulları</a> sayfasındadır. Bu e-postayı sözleşme kaydınız olarak saklayabilirsiniz.`),
    TRANSACTIONAL
  );
}

// Size gelen yeni sipariş bildirimi
export function orderAdminMail(o: OrderMailData) {
  const no = orderNo(o.id);
  return build(
    `Yeni sipariş: ${no} — ${o.total.toLocaleString("tr-TR")} ₺`,
    `${o.fullName} yeni bir sipariş verdi.`,
    h.eyebrow("Yeni sipariş") +
      h.title(`${no}`) +
      h.p(`<strong>${esc(o.fullName)}</strong> sitemizden yeni bir sipariş verdi. Müşteriyle iletişime geçip siparişi onaylayabilirsiniz.`) +
      itemsTable(o.items, o.total, o) +
      h.box([["Ad soyad", esc(o.fullName)], ["Telefon", esc(o.phone)], ["E-posta", esc(o.email)], ["Adres", `${esc(o.address)}<br>${esc(o.city)}`], ...(o.note ? [["Not", esc(o.note)] as [string, string]] : [])], "Müşteri") +
      h.button("Siparişi panelde aç", `${SITE_URL}/admin/orders/${o.id}`)
  );
}

const STATUS_TEXT: Partial<Record<Status, { subject: string; eyebrow: string; title: string; text: string; step: number }>> = {
  confirmed: { subject: "Ödemeniz alındı", eyebrow: "Ödeme alındı", title: "Ödemeniz alındı, siparişiniz onaylandı.", text: "Ödemeniz hesabımıza ulaştı ve siparişiniz onaylandı. Ürünleriniz hazırlanmaya başladığında size haber vereceğiz.", step: 1 },
  preparing: { subject: "Siparişiniz hazırlanıyor", eyebrow: "Hazırlanıyor", title: "Siparişiniz hazırlanıyor.", text: "Ürünleriniz özenle hazırlanıyor; kargoya verildiğinde takip bilgisiyle size ayrıca haber vereceğiz.", step: 2 },
  shipped: { subject: "Siparişiniz kargoya verildi", eyebrow: "Kargoda", title: "Siparişiniz yola çıktı.", text: "Siparişiniz kargoya teslim edildi. Teslim alırken paketi görevli önünde kontrol etmenizi, hasar varsa tutanak tutturmanızı rica ederiz.", step: 3 },
  delivered: { subject: "Siparişiniz teslim edildi", eyebrow: "Teslim edildi", title: "Siparişiniz teslim edildi.", text: "Ürünlerinizi güle güle kullanın. Kurulum veya kullanımla ilgili bir sorunuz olursa bize ulaşabilirsiniz. Deneyiminizi ürün sayfasına yorum olarak yazarsanız diğer kullanıcılara da yardımcı olursunuz.", step: 4 },
  cancelled: { subject: "Siparişiniz iptal edildi", eyebrow: "Sipariş iptal edildi", title: "Siparişiniz iptal edildi.", text: `Siparişiniz iptal edilmiştir. Ödeme yaptıysanız ücret iadesi en geç ${policy.refundDays} gün içinde ödemede kullandığınız yöntemle yapılır. Bir yanlışlık olduğunu düşünüyorsanız lütfen bizimle iletişime geçin.`, step: -1 },
};
export const statusMailFor = (s: Status) => !!STATUS_TEXT[s];

export function orderStatusMail(o: OrderMailData, status: Status) {
  const t = STATUS_TEXT[status]!;
  const no = orderNo(o.id);
  return build(
    `${t.subject} — ${no}`,
    t.text,
    h.eyebrow(t.eyebrow) +
      h.title(esc(t.title)) +
      h.p(`Merhaba ${esc(o.fullName.split(" ")[0])}, ${t.text.charAt(0).toLocaleLowerCase("tr")}${t.text.slice(1)}`) +
      (t.step >= 0 ? h.steps(STEPS, t.step) : "") +
      h.box([["Sipariş no", no], ["Toplam", `${o.total.toLocaleString("tr-TR")} ₺`],
        ...(status === "shipped" && o.cargo ? [["Kargo", esc(o.cargo)] as [string, string]] : []),
        ...(status === "shipped" && o.trackingNo ? [["Takip no", o.trackingUrl ? `<a href="${esc(o.trackingUrl)}" style="color:#1a3e85">${esc(o.trackingNo)}</a>` : esc(o.trackingNo)] as [string, string]] : []),
      ]) +
      itemsTable(o.items, o.total, o) +
      h.button("Siparişimi görüntüle", `${SITE_URL}/hesabim/siparis/${o.id}`),
    TRANSACTIONAL
  );
}

/* ---------- Bilgi talebi ---------- */
export type LeadMailData = { fullName: string; phone: string; email: string; city: string; message: string; product: { name: string; brand: string; price: number; url: string } | null };

export function leadCustomerMail(l: LeadMailData) {
  return build(
    "Bilgi talebiniz bize ulaştı",
    "Uzman ekibimiz en kısa sürede sizinle iletişime geçecek.",
    h.eyebrow("Talebiniz alındı") +
      h.title(`Teşekkürler ${esc(l.fullName.split(" ")[0])},<br>talebiniz bize ulaştı.`) +
      h.p("Uzman ekibimiz talebinizi inceleyip en kısa sürede sizi arayacak. Acil durumlar için bize telefon veya WhatsApp üzerinden de ulaşabilirsiniz.") +
      h.box([
        ...(l.product ? [["İlgilendiğiniz ürün", `<a href="${esc(l.product.url)}" style="color:#1a3e85">${esc(l.product.name)}</a>`] as [string, string]] : []),
        ["Telefon", esc(l.phone)],
        ...(l.message ? [["Mesajınız", esc(l.message)] as [string, string]] : []),
      ], "Talep özeti") +
      h.button("Ürünleri incele", `${SITE_URL}/urunler`),
    TRANSACTIONAL
  );
}

export function leadAdminMail(l: LeadMailData) {
  return build(
    `Bilgi talebi: ${l.product?.name ?? "Genel"} — ${l.fullName}`,
    `${l.fullName} (${l.phone}) bilgi talebi gönderdi.`,
    h.eyebrow("Yeni bilgi talebi") +
      h.title(esc(l.fullName)) +
      h.box([
        ["Telefon", `<a href="tel:${esc(l.phone.replace(/\s/g, ""))}" style="color:#1a3e85">${esc(l.phone)}</a>`],
        ...(l.email ? [["E-posta", esc(l.email)] as [string, string]] : []),
        ...(l.city ? [["Şehir / ilçe", esc(l.city)] as [string, string]] : []),
        ...(l.message ? [["Mesaj", esc(l.message)] as [string, string]] : []),
      ], "Müşteri") +
      (l.product ? h.box([["Ürün", esc(l.product.name)], ["Marka", esc(l.product.brand)], ["Fiyat", l.product.price > 0 ? `${l.product.price.toLocaleString("tr-TR")} ₺` : "—"]], "İlgilendiği ürün") : h.p("Genel bilgi talebi (ürün seçilmedi).")) +
      h.button("Talepleri panelde aç", `${SITE_URL}/admin/talepler`)
  );
}

/* ---------- Bülten ---------- */
export function newsletterWelcomeMail(email: string, unsubscribeUrl: string) {
  return build(
    "Bültenimize hoş geldiniz",
    "Kampanya ve yeniliklerden ilk siz haberdar olacaksınız.",
    h.eyebrow("Bülten") +
      h.title("Aramıza hoş geldiniz.") +
      h.p("Bültenimize abone olduğunuz için teşekkür ederiz. Kombi, klima ve ısı pompası kampanyalarımızdan, sezon önerilerimizden ve yeni ürünlerimizden ilk siz haberdar olacaksınız.") +
      h.p("Size yalnızca gerçekten işinize yarayacak içerikler göndereceğiz; e-posta kutunuzu doldurmayacağız.") +
      h.button("Kampanyalı ürünler", `${SITE_URL}/urunler`) +
      h.small(`Bu adrese (${esc(email)}) açık rızanızla ticari elektronik ileti gönderilmektedir.`),
    `Abonelikten çıkmak için <a href="${esc(unsubscribeUrl)}" style="color:#64748b">buraya tıklayın</a>. ${esc(company.title)}`
  );
}

/* ---------- Admin önizleme ve test için örnek veriler ---------- */
export function sampleMails(): { key: string; label: string; to: "Müşteri" | "Size"; from: Sender; mail: Mail }[] {
  const items: Line[] = [
    { name: "Vaillant ecoTEC Pure 236/7-2 Tam Yoğuşmalı Kombi", qty: 1, price: 38900, image: null },
    { name: "Vaillant VRT36F Kablosuz Termostat", qty: 1, price: 4500, image: null },
  ];
  const o: OrderMailData = { id: 1024, createdAt: new Date(), fullName: "Ayşe Yılmaz", email: "ornek@ornek.com", phone: "0532 000 00 00", city: "İstanbul / Sancaktepe", address: "Örnek Mah. Deneme Sok. No: 1 D: 3", note: "Hafta içi 18:00'den sonra teslim edilebilir.", total: 43400, items };
  const l: LeadMailData = { fullName: "Mehmet Demir", phone: "0533 000 00 00", email: "ornek@ornek.com", city: "Ümraniye", message: "120 m² daire için kurulum dahil fiyat almak istiyorum.", product: { name: "Daikin Sensira 12000 BTU Inverter Klima", brand: "Daikin", price: 36990, url: `${SITE_URL}/urunler` } };
  return [
    { key: "welcome", label: "Üyelik: hoş geldiniz", to: "Müşteri", from: "noreply", mail: welcomeMail({ firstName: "Ayşe", email: "ornek@ornek.com" }) },
    { key: "order", label: "Sipariş alındı", to: "Müşteri", from: "siparis", mail: orderReceivedMail(o) },
    { key: "order-admin", label: "Yeni sipariş bildirimi", to: "Size", from: "noreply", mail: orderAdminMail(o) },
    { key: "confirmed", label: "Sipariş onaylandı", to: "Müşteri", from: "siparis", mail: orderStatusMail(o, "confirmed") },
    { key: "shipped", label: "Sipariş kargoya verildi", to: "Müşteri", from: "siparis", mail: orderStatusMail(o, "shipped") },
    { key: "delivered", label: "Sipariş teslim edildi", to: "Müşteri", from: "siparis", mail: orderStatusMail(o, "delivered") },
    { key: "cancelled", label: "Sipariş iptal edildi", to: "Müşteri", from: "siparis", mail: orderStatusMail(o, "cancelled") },
    { key: "lead", label: "Bilgi talebi alındı", to: "Müşteri", from: "noreply", mail: leadCustomerMail(l) },
    { key: "lead-admin", label: "Yeni bilgi talebi bildirimi", to: "Size", from: "noreply", mail: leadAdminMail(l) },
    { key: "newsletter", label: "Bülten aboneliği", to: "Müşteri", from: "noreply", mail: newsletterWelcomeMail("ornek@ornek.com", `${SITE_URL}/abonelik?iptal=ornek`) },
  ];
}
