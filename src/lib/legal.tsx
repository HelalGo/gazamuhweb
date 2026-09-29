import { Fragment } from "react";
import Link from "next/link";
import { CookieSettingsButton } from "@/components/CookieConsent";
import { categories } from "./consent";
import { company, contact, igdas } from "./site";

export { policy } from "./policy";
import { policy } from "./policy";

export type LegalSlug =
  | "hakkimizda" | "iletisim" | "gizlilik-politikasi" | "kvkk-aydinlatma-metni" | "mesafeli-satis-sozlesmesi"
  | "on-bilgilendirme-formu" | "teslimat-ve-iade" | "iptal-ve-iade-kosullari" | "cerez-politikasi" | "kullanim-kosullari";

// Kenar menüsünde ve alt bilgide kullanılan sıra
export const legalNav: { slug: LegalSlug; title: string; group: "Kurumsal" | "Sözleşmeler" }[] = [
  { slug: "hakkimizda", title: "Hakkımızda", group: "Kurumsal" },
  { slug: "iletisim", title: "İletişim", group: "Kurumsal" },
  { slug: "teslimat-ve-iade", title: "Teslimat ve İade", group: "Kurumsal" },
  { slug: "iptal-ve-iade-kosullari", title: "İptal ve İade Koşulları", group: "Kurumsal" },
  { slug: "mesafeli-satis-sozlesmesi", title: "Mesafeli Satış Sözleşmesi", group: "Sözleşmeler" },
  { slug: "on-bilgilendirme-formu", title: "Ön Bilgilendirme Formu", group: "Sözleşmeler" },
  { slug: "gizlilik-politikasi", title: "Gizlilik Politikası", group: "Sözleşmeler" },
  { slug: "kvkk-aydinlatma-metni", title: "KVKK Aydınlatma Metni", group: "Sözleşmeler" },
  { slug: "cerez-politikasi", title: "Çerez Politikası", group: "Sözleşmeler" },
  { slug: "kullanim-kosullari", title: "Kullanım Koşulları", group: "Sözleşmeler" },
];

const L = ({ to, children }: { to: LegalSlug | string; children: React.ReactNode }) => (
  <Link href={to.startsWith("/") ? to : `/${to}`}>{children}</Link>
);

// Satıcı bilgileri tablosu (sözleşmelerde ve iletişim sayfasında ortak)
export function Seller({ title = "Satıcı Bilgileri" }: { title?: string }) {
  const rows: [string, React.ReactNode][] = [
    ["Ticaret unvanı", company.title],
    ["Adres", contact.address],
    ["Telefon", <a key="t" href={`tel:+9${contact.phone.replace(/\s/g, "")}`}>{contact.phone}</a>],
    ["E-posta", <a key="e" href={`mailto:${contact.email}`}>{contact.email}</a>],
    ["Vergi dairesi / No", `${company.taxOffice} / ${company.taxNo}`],
    ["MERSİS No", company.mersis],
    ["Ticaret sicil", `${company.registry} – ${company.tradeRegistryNo}`],
  ];
  return (
    <>
      <h2>{title}</h2>
      <table>
        <tbody>
          {rows.map(([k, v]) => <tr key={k}><th>{k}</th><td>{v}</td></tr>)}
        </tbody>
      </table>
    </>
  );
}

const withdrawal = `${policy.withdrawalDays} (${policy.withdrawalDays === 14 ? "on dört" : policy.withdrawalDays}) gün`;

export const legal: Record<LegalSlug, { title: string; description: string; body: React.ReactNode }> = {
  /* ------------------------------------------------------------------ */
  hakkimizda: {
    title: "Hakkımızda",
    description: "GAZA Mühendislik; ısıtma, soğutma, havalandırma ve iklimlendirme sistemlerinde satış, proje, kurulum ve bakım hizmeti verir.",
    body: (
      <>
        <p className="lead">
          {company.title}, ısıtma, havalandırma, soğutma ve iklimlendirme sistemlerinde ürün satışı, proje yönetimi, kurulum,
          bakım ve onarım hizmetleri sunan bir mühendislik firmasıdır. 2020 yılından bu yana İstanbul Sancaktepe merkezimizden
          konut ve iş yerlerine hizmet veriyoruz.
        </p>
        <h2>Ne yapıyoruz?</h2>
        <ul>
          <li><strong>Ürün satışı:</strong> Kombi, klima, ısı pompası, radyatör, şofben, oda termostatı ve sirkülasyon pompası gibi ürünlerde önde gelen markaların modellerini sunuyoruz.</li>
          <li><strong>Proje ve keşif:</strong> Mekânınıza uygun kapasite ve sistem seçimi için yerinde keşif ve proje desteği veriyoruz.</li>
          <li><strong>Kurulum ve montaj:</strong> Satın aldığınız sistemlerin kurulumunu ve devreye alınmasını yapıyoruz.</li>
          <li><strong>Bakım ve onarım:</strong> Kombi, klima ve ilgili sistemlerin periyodik bakımını ve arıza onarımını gerçekleştiriyoruz.</li>
        </ul>
        <h2>{igdas.title}</h2>
        <p>
          Firmamız, İGDAŞ yetki numarası <strong>{igdas.no}</strong> ile İGDAŞ yetkili bayisidir. Doğalgaz projesi çizimi ve onay
          süreçleri, daire içi ve kolon tesisatı, gaz açma başvurusu ve sızdırmazlık testlerini yetkili firma olarak yürütüyoruz.
        </p>
        <h2>Neden GAZA Mühendislik?</h2>
        <ul>
          <li>Keşiften satış sonrası servise kadar tüm süreci tek ekiple yönetiriz.</li>
          <li>İhtiyacınıza uygun olmayan ürünü satmayız; kapasite ve maliyet hesabını sizinle birlikte yaparız.</li>
          <li>Ürünlerimiz üretici/distribütör garantisiyle, faturalı olarak satılır.</li>
        </ul>
        <Seller title="Şirket Bilgileri" />
      </>
    ),
  },

  /* ------------------------------------------------------------------ */
  iletisim: {
    title: "İletişim",
    description: "GAZA Mühendislik iletişim bilgileri: telefon, e-posta, WhatsApp ve adres.",
    body: null, // sayfa kendi düzenini kullanır (app/(site)/iletisim)
  },

  /* ------------------------------------------------------------------ */
  "gizlilik-politikasi": {
    title: "Gizlilik Politikası",
    description: "Kişisel bilgilerinizin sitemizde nasıl toplandığı, kullanıldığı ve korunduğu.",
    body: (
      <>
        <p className="lead">
          Bu politika, {policy.site} alan adlı internet sitesini (&quot;Site&quot;) kullanan ziyaretçilerimizin ve müşterilerimizin
          bilgilerinin {company.title} (&quot;GAZA Mühendislik&quot;) tarafından nasıl toplandığını, kullanıldığını ve korunduğunu açıklar.
          Kişisel verilerin işlenmesine ilişkin ayrıntılı bilgi <L to="kvkk-aydinlatma-metni">KVKK Aydınlatma Metni</L>&apos;nde yer alır.
        </p>
        <h2>1. Topladığımız bilgiler</h2>
        <ul>
          <li><strong>Üyelik ve sipariş bilgileri:</strong> Ad soyad, e-posta, telefon, teslimat ve fatura adresi, sipariş içeriği.</li>
          <li><strong>Bilgi talebi formu:</strong> Ad soyad, telefon, e-posta (isteğe bağlı), mesajınız ve ilgilendiğiniz ürün.</li>
          <li><strong>Teknik bilgiler:</strong> IP adresi, tarayıcı türü, ziyaret zamanı gibi güvenlik ve işlem kayıtları.</li>
          <li><strong>Ödeme bilgileri:</strong> Kart bilgileriniz Site&apos;de işlenmez ve saklanmaz; ödemeler {policy.paymentProvider} güvenli ödeme altyapısı üzerinden alınır.</li>
        </ul>
        <h2>2. Bilgileri kullanma amaçlarımız</h2>
        <ul>
          <li>Siparişinizi almak, ödemesini tamamlamak, teslim etmek ve faturalandırmak,</li>
          <li>Bilgi ve teklif taleplerinize dönüş yapmak, kurulum ve servis randevusu planlamak,</li>
          <li>Üyelik hesabınızı, favorilerinizi ve sipariş geçmişinizi yönetmek,</li>
          <li>Site güvenliğini sağlamak ve yasal yükümlülüklerimizi yerine getirmek.</li>
        </ul>
        <p>Açık izniniz olmadan size ticari elektronik ileti (kampanya e-postası, SMS vb.) gönderilmez.</p>
        <h2>3. Bilgilerin paylaşılması</h2>
        <p>Bilgileriniz satılmaz ve kiralanmaz. Yalnızca hizmetin gerektirdiği ölçüde şu taraflarla paylaşılır:</p>
        <ul>
          <li>Siparişin teslimi için kargo ve lojistik firmaları,</li>
          <li>Ödeme işlemleri için {policy.paymentProvider} ve bankalar,</li>
          <li>Site barındırma, e-posta ve mesajlaşma hizmeti aldığımız tedarikçiler,</li>
          <li>Doğalgaz projelerinde İGDAŞ; garanti ve servis işlemlerinde ilgili üretici veya yetkili servis,</li>
          <li>Kanunen yetkili kamu kurum ve kuruluşları.</li>
        </ul>
        <h2>4. Güvenlik</h2>
        <p>
          Site&apos;ye tüm bağlantılar SSL (HTTPS) ile şifrelenir. Üyelik parolaları geri döndürülemez biçimde (hash) saklanır.
          Bilgilerinize yalnızca yetkili personelimiz erişebilir.
        </p>
        <h2>5. Çerezler</h2>
        <p>Site&apos;de kullanılan çerezler hakkında bilgi için <L to="cerez-politikasi">Çerez Politikası</L>&apos;nı inceleyebilirsiniz.</p>
        <h2>6. Haklarınız</h2>
        <p>
          Kişisel verilerinize ilişkin haklarınızı (bilgi alma, düzeltme, silme vb.) kullanmak için{" "}
          <a href={`mailto:${contact.email}`}>{contact.email}</a> adresine yazabilirsiniz. Ayrıntılar{" "}
          <L to="kvkk-aydinlatma-metni">KVKK Aydınlatma Metni</L>&apos;nde yer alır.
        </p>
        <h2>7. Değişiklikler</h2>
        <p>Bu politika gerektiğinde güncellenebilir. Güncel metin her zaman bu sayfada yayımlanır.</p>
      </>
    ),
  },

  /* ------------------------------------------------------------------ */
  "kvkk-aydinlatma-metni": {
    title: "KVKK Aydınlatma Metni",
    description: "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında aydınlatma metni.",
    body: (
      <>
        <p className="lead">
          {company.title} (&quot;Şirket&quot;) olarak, 6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) kapsamında veri
          sorumlusu sıfatıyla, kişisel verilerinizi aşağıda açıklanan amaçlar ve hukuki sebepler çerçevesinde işlemekteyiz.
        </p>
        <h2>1. Veri sorumlusu</h2>
        <p>{company.title} – {contact.address} – {contact.email}</p>
        <h2>2. İşlenen kişisel veriler</h2>
        <ul>
          <li><strong>Kimlik:</strong> Ad, soyad; fatura için gerektiğinde T.C. kimlik numarası.</li>
          <li><strong>İletişim:</strong> Telefon, e-posta, teslimat ve fatura adresi.</li>
          <li><strong>Müşteri işlem:</strong> Sipariş, talep, yorum, favori ve fatura bilgileri.</li>
          <li><strong>Finans:</strong> Ödeme tutarı ve işlem sonucu (kart bilgileri Şirket tarafından işlenmez; ödeme kuruluşu tarafından işlenir).</li>
          <li><strong>İşlem güvenliği:</strong> IP adresi, oturum ve işlem kayıtları, üyelik parolası (şifrelenmiş olarak).</li>
        </ul>
        <h2>3. İşleme amaçları</h2>
        <ul>
          <li>Mesafeli satış sözleşmesinin kurulması ve ifası; siparişin hazırlanması, teslimi ve faturalandırılması,</li>
          <li>Bilgi, teklif, keşif, kurulum ve servis taleplerinin karşılanması,</li>
          <li>Üyelik işlemlerinin yürütülmesi, müşteri ilişkilerinin ve iade/cayma süreçlerinin yönetilmesi,</li>
          <li>Doğalgaz projelerinde İGDAŞ nezdindeki başvuru ve onay süreçlerinin yürütülmesi,</li>
          <li>Bilgi güvenliği süreçlerinin yürütülmesi ve yasal yükümlülüklerin yerine getirilmesi.</li>
        </ul>
        <h2>4. Hukuki sebepler</h2>
        <p>Kişisel verileriniz KVKK&apos;nın 5. maddesinde yer alan şu hukuki sebeplere dayanılarak işlenir:</p>
        <ul>
          <li>Bir sözleşmenin kurulması veya ifasıyla doğrudan ilgili olması (m.5/2-c),</li>
          <li>Veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi (m.5/2-ç) – ör. vergi ve tüketici mevzuatı,</li>
          <li>Bir hakkın tesisi, kullanılması veya korunması (m.5/2-e),</li>
          <li>İlgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla veri sorumlusunun meşru menfaati (m.5/2-f),</li>
          <li>Ticari elektronik ileti gönderimi gibi hâllerde açık rızanız (m.5/1).</li>
        </ul>
        <h2>5. Kişisel verilerin aktarılması</h2>
        <p>
          Kişisel verileriniz, yukarıdaki amaçlarla sınırlı olarak; kargo ve lojistik firmalarına, ödeme kuruluşu {policy.paymentProvider}
          ve bankalara, barındırma/e-posta/mesajlaşma hizmeti sağlayıcılarına, garanti ve servis kapsamında üretici ve yetkili servislere,
          doğalgaz projelerinde İGDAŞ&apos;a, mali müşavirlik hizmeti alınan kişilere ve kanunen yetkili kamu kurumlarına KVKK&apos;nın 8. ve 9.
          maddelerine uygun olarak aktarılabilir. E-posta ve mesajlaşma gibi bazı hizmet sağlayıcılarının sunucuları yurt dışında
          bulunabilir; bu aktarımlar KVKK&apos;nın 9. maddesindeki şartlara uygun olarak yapılır.
        </p>
        <h2>6. Toplama yöntemi</h2>
        <p>
          Kişisel verileriniz; Site üzerindeki üyelik, sipariş ve bilgi talebi formları, e-posta, telefon, WhatsApp ve yüz yüze
          görüşmeler aracılığıyla elektronik veya fiziki ortamda toplanır.
        </p>
        <h2>7. Saklama süresi</h2>
        <p>
          Veriler, işleme amacının gerektirdiği süre ve ilgili mevzuatta öngörülen süreler (ör. Vergi Usul Kanunu ve Türk Ticaret
          Kanunu kapsamında 10 yıl) boyunca saklanır; sürenin sonunda silinir, yok edilir veya anonim hâle getirilir.
        </p>
        <h2>8. Haklarınız (KVKK m.11)</h2>
        <ul>
          <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme ve işlenmişse bilgi talep etme,</li>
          <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
          <li>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme,</li>
          <li>Eksik veya yanlış işlenmişse düzeltilmesini, KVKK m.7 şartları çerçevesinde silinmesini veya yok edilmesini isteme ve bu işlemlerin aktarıldığı üçüncü kişilere bildirilmesini isteme,</li>
          <li>Münhasıran otomatik sistemlerle analiz edilmesi sonucu aleyhinize bir sonuç çıkmasına itiraz etme,</li>
          <li>Kanuna aykırı işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme.</li>
        </ul>
        <h2>9. Başvuru</h2>
        <p>
          Haklarınıza ilişkin taleplerinizi, Veri Sorumlusuna Başvuru Usul ve Esasları Hakkında Tebliğ&apos;e uygun olarak; kimliğinizi
          tespit edici bilgilerle birlikte yazılı olarak <strong>{contact.address}</strong> adresine iletebilir ya da sistemimizde kayıtlı
          e-posta adresinizden <a href={`mailto:${contact.email}`}>{contact.email}</a> adresine gönderebilirsiniz. Başvurunuz en geç
          30 gün içinde ücretsiz olarak sonuçlandırılır.
        </p>
      </>
    ),
  },

  /* ------------------------------------------------------------------ */
  "mesafeli-satis-sozlesmesi": {
    title: "Mesafeli Satış Sözleşmesi",
    description: "6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği kapsamında satış sözleşmesi.",
    body: (
      <>
        <h2>Madde 1 – Taraflar</h2>
        <p><strong>1.1 Satıcı:</strong> Aşağıda bilgileri yer alan {company.title} (&quot;SATICI&quot;).</p>
        <p>
          <strong>1.2 Alıcı:</strong> {policy.site} internet sitesi üzerinden sipariş veren ve sipariş formunda adı, adresi ve iletişim
          bilgileri yer alan kişi (&quot;ALICI&quot;). Alıcı bilgileri sipariş sırasında beyan edilen bilgilerdir.
        </p>
        <Seller />
        <h2>Madde 2 – Konu</h2>
        <p>
          İşbu sözleşmenin konusu, ALICI&apos;nın SATICI&apos;ya ait {policy.site} internet sitesinden elektronik ortamda siparişini verdiği,
          nitelikleri ve satış fiyatı sipariş özetinde belirtilen ürün veya hizmetin satışı ve teslimi ile ilgili olarak 6502 sayılı
          Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği hükümleri gereğince tarafların hak ve
          yükümlülüklerinin belirlenmesidir.
        </p>
        <h2>Madde 3 – Sözleşme konusu ürün, fiyat ve ödeme</h2>
        <p>
          Ürünün türü, markası, modeli, adedi, vergiler dahil satış fiyatı, varsa teslimat ücreti ve ödeme şekli sipariş özetinde ve
          ALICI&apos;nın hesabındaki sipariş detayında yer alır. Sitede ilan edilen fiyatlar ve kampanyalar güncelleme yapılana kadar
          geçerlidir; süreli kampanyalar belirtilen süre sonuna kadar geçerlidir. Kredi/banka kartı ile yapılan ödemeler{" "}
          {policy.paymentProvider} altyapısı üzerinden alınır; kart bilgileri SATICI tarafından görülmez ve saklanmaz.
        </p>
        <h2>Madde 4 – Teslimat</h2>
        <p>
          Ürün, ALICI&apos;nın sipariş formunda belirttiği teslimat adresine, stokta olan ürünlerde ödeme onayından itibaren en geç{" "}
          {policy.shipDays} iş günü içinde kargoya verilir. Teslimat süresi her hâlükârda yasal {policy.maxDeliveryDays} günlük süreyi
          aşamaz. Ayrıntılar <L to="teslimat-ve-iade">Teslimat ve İade</L> sayfasında yer alır. ALICI dışında bir kişiye teslimat
          yapılacaksa, teslim alan kişinin teslimatı kabul etmemesinden SATICI sorumlu tutulamaz.
        </p>
        <h2>Madde 5 – Satıcının yükümlülükleri</h2>
        <ul>
          <li>SATICI, ürünü sağlam, eksiksiz, siparişte belirtilen niteliklere uygun ve varsa garanti belgesi ve kullanım kılavuzu ile teslim etmekle yükümlüdür.</li>
          <li>SATICI, siparişi verilen ürünün temininin imkânsızlaşması hâlinde bunu öğrendiği tarihten itibaren 3 gün içinde ALICI&apos;ya bildirir ve tahsil edilen tüm bedeli en geç 14 gün içinde iade eder.</li>
          <li>Ürünün montaj ve kurulumu ayrıca kararlaştırılmışsa, SATICI veya üreticinin yetkili servisi tarafından yapılır.</li>
        </ul>
        <h2>Madde 6 – Alıcının yükümlülükleri</h2>
        <ul>
          <li>ALICI, sitede yer alan ürünün temel nitelikleri, satış fiyatı, ödeme şekli ve teslimata ilişkin <L to="on-bilgilendirme-formu">Ön Bilgilendirme Formu</L>&apos;nu okuyup bilgi sahibi olduğunu ve elektronik ortamda onay verdiğini kabul eder.</li>
          <li>ALICI, teslim aldığı ürünü kontrol etmeli; kargo paketinde hasar varsa tutanak tutturarak teslim almamalıdır.</li>
          <li>Kombi, doğalgazlı cihaz ve klima gibi ürünlerin garanti kapsamında kalabilmesi için kurulum ve ilk çalıştırmanın yetkili servis veya yetkili firma tarafından yapılması gerekebilir; bu koşullar üreticinin garanti belgesinde yer alır.</li>
        </ul>
        <h2>Madde 7 – Cayma hakkı</h2>
        <p>
          ALICI, ürünün kendisine veya gösterdiği kişiye teslim tarihinden itibaren {withdrawal} içinde hiçbir gerekçe göstermeksizin ve
          cezai şart ödemeksizin sözleşmeden cayma hakkına sahiptir. Hizmet sözleşmelerinde bu süre sözleşmenin kurulduğu gün başlar.
          Cayma bildirimi yazılı olarak veya kalıcı veri saklayıcısı ile (ör. <a href={`mailto:${contact.email}`}>{contact.email}</a>)
          süresi içinde SATICI&apos;ya yöneltilmelidir. Cayma hakkının kullanılmasına ve iadeye ilişkin usul{" "}
          <L to="iptal-ve-iade-kosullari">İptal ve İade Koşulları</L> sayfasında açıklanmıştır.
        </p>
        <h2>Madde 8 – Cayma hakkının kullanılamayacağı hâller</h2>
        <p>Mesafeli Sözleşmeler Yönetmeliği&apos;nin 15. maddesi uyarınca aşağıdaki hâllerde cayma hakkı kullanılamaz:</p>
        <ul>
          <li>ALICI&apos;nın istekleri veya kişisel ihtiyaçları doğrultusunda hazırlanan, özel ölçüye göre üretilen ürünler,</li>
          <li>Tesliminden sonra ambalajı açılmış olan; iadesi sağlık ve hijyen açısından uygun olmayan ürünler,</li>
          <li>Tesliminden sonra başka ürünlerle karışan ve doğası gereği ayrıştırılması mümkün olmayan ürünler,</li>
          <li>Cayma hakkı süresi sona ermeden önce, ALICI&apos;nın onayı ile ifasına başlanan hizmetler (ör. tamamlanmış keşif, montaj, bakım hizmeti).</li>
        </ul>
        <h2>Madde 9 – Temerrüt hâli</h2>
        <p>
          Kredi kartı ile yapılan ödemelerde ALICI&apos;nın kartı ile ilgili banka ile kendi arasındaki sözleşmeden doğan yükümlülüklerini
          yerine getirmemesi hâlinde ALICI, ilgili banka ile arasındaki sözleşme hükümlerine tabidir.
        </p>
        <h2>Madde 10 – Garanti</h2>
        <p>
          Satılan ürünler, üretici veya ithalatçının garanti belgesi kapsamında en az 2 yıl garantilidir. Ayıplı ürünlerde ALICI,
          6502 sayılı Kanun&apos;un 11. maddesinde sayılan seçimlik haklarını (sözleşmeden dönme, bedel indirimi, ücretsiz onarım veya
          ayıpsız misli ile değiştirme) kullanabilir.
        </p>
        <h2>Madde 11 – Uyuşmazlıkların çözümü</h2>
        <p>
          İşbu sözleşmeden doğan uyuşmazlıklarda, Ticaret Bakanlığı tarafından her yıl ilan edilen parasal sınırlar dahilinde ALICI&apos;nın
          veya SATICI&apos;nın yerleşim yerindeki Tüketici Hakem Heyetleri, bu sınırları aşan uyuşmazlıklarda Tüketici Mahkemeleri
          yetkilidir. ALICI, başvurularını ayrıca Tüketici Bilgi Sistemi (TÜBİS) üzerinden de yapabilir.
        </p>
        <h2>Madde 12 – Yürürlük</h2>
        <p>
          ALICI, siparişi onaylamadan önce işbu sözleşmeyi okuyup tüm koşullarını kabul ettiğini beyan eder. Sözleşme, ALICI
          tarafından siparişin onaylanması ile yürürlüğe girer. Sözleşme metni bu sayfada kalıcı olarak yayımlanır ve
          SATICI tarafından saklanır; ALICI talep ettiğinde bir örneği e-posta ile gönderilir.
        </p>
      </>
    ),
  },

  /* ------------------------------------------------------------------ */
  "on-bilgilendirme-formu": {
    title: "Ön Bilgilendirme Formu",
    description: "Mesafeli Sözleşmeler Yönetmeliği uyarınca sipariş öncesi bilgilendirme.",
    body: (
      <>
        <p className="lead">
          İşbu form, 6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği uyarınca, siparişiniz
          onaylanmadan önce bilgilendirilmeniz amacıyla hazırlanmıştır.
        </p>
        <Seller />
        <h2>1. Ürün ve hizmetin temel nitelikleri</h2>
        <p>
          Sipariş verilen ürünün türü, markası, modeli, teknik özellikleri ve adedi ürün sayfasında ve sipariş özetinde yer alır.
          Ürün görselleri temsilidir; renk ve görünümde üretici kaynaklı küçük farklılıklar olabilir.
        </p>
        <h2>2. Fiyat ve ödeme</h2>
        <ul>
          <li>Ürün fiyatlarına KDV dahildir. Toplam bedel ve varsa teslimat ücreti sipariş özetinde gösterilir.</li>
          <li>Ödemeler kredi kartı / banka kartı ile {policy.paymentProvider} güvenli ödeme altyapısı üzerinden alınır. Taksit seçenekleri ödeme adımında kart türüne göre gösterilir.</li>
          <li>Fiyatı &quot;Fiyat için arayın&quot; olarak belirtilen ürünler için satış, teklif sonrası ayrıca kararlaştırılan fiyat üzerinden yapılır.</li>
        </ul>
        <h2>3. Teslimat</h2>
        <p>
          Stokta olan ürünler ödeme onayından itibaren en geç {policy.shipDays} iş günü içinde kargoya verilir; teslimat süresi yasal
          {" "}{policy.maxDeliveryDays} günü aşamaz. Teslimat, siparişte belirtilen adrese yapılır. Ayrıntılar için{" "}
          <L to="teslimat-ve-iade">Teslimat ve İade</L> sayfasına bakınız.
        </p>
        <h2>4. Cayma hakkı</h2>
        <p>
          Ürünü teslim aldığınız tarihten itibaren {withdrawal} içinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin
          cayma hakkınızı kullanabilirsiniz. Cayma bildiriminizi <a href={`mailto:${contact.email}`}>{contact.email}</a> adresine
          veya {contact.phone} numaralı telefona iletebilirsiniz. Cayma hâlinde ürün bedeli, bildirimin SATICI&apos;ya ulaşmasından
          itibaren en geç {policy.refundDays} gün içinde ödemede kullanılan yöntemle iade edilir.
        </p>
        <p>
          Özel sipariş üzerine hazırlanan ürünler, ambalajı açılmış olup iadesi sağlık ve hijyen açısından uygun olmayan ürünler ve
          onayınızla ifasına başlanan hizmetler (keşif, montaj, bakım) için cayma hakkı kullanılamaz. Ayrıntılar{" "}
          <L to="iptal-ve-iade-kosullari">İptal ve İade Koşulları</L> sayfasındadır.
        </p>
        <h2>5. Şikâyet ve itiraz</h2>
        <p>
          Şikâyetlerinizi yukarıdaki iletişim kanallarından bize iletebilirsiniz. Uyuşmazlık hâlinde, Ticaret Bakanlığı&apos;nca ilan
          edilen parasal sınırlar dahilinde Tüketici Hakem Heyetlerine, bu sınırları aşan durumlarda Tüketici Mahkemelerine
          başvurabilirsiniz.
        </p>
        <p>
          Siparişinizi onaylamanız, bu formu okuduğunuzu ve <L to="mesafeli-satis-sozlesmesi">Mesafeli Satış Sözleşmesi</L>&apos;ni
          kabul ettiğinizi gösterir.
        </p>
      </>
    ),
  },

  /* ------------------------------------------------------------------ */
  "teslimat-ve-iade": {
    title: "Teslimat ve İade",
    description: "Sipariş teslimat süreleri, kargo, teslim alma ve iade süreci.",
    body: (
      <>
        <h2>Teslimat süresi</h2>
        <ul>
          <li>Stokta olan ürünler, ödeme onayından itibaren en geç <strong>{policy.shipDays} iş günü</strong> içinde kargoya verilir.</li>
          <li>Tedarik gerektiren ürünlerde tahmini süre sipariş sonrası tarafınıza bildirilir. Teslimat süresi her durumda yasal <strong>{policy.maxDeliveryDays} günü</strong> aşamaz.</li>
          <li>Siparişiniz kargoya verildiğinde durum hesabınızdaki &quot;Siparişlerim&quot; bölümünde &quot;Kargoda&quot; olarak güncellenir.</li>
        </ul>
        <h2>Teslimat bölgesi ve ücreti</h2>
        <p>
          Türkiye genelindeki adreslere teslimat yapılmaktadır. Varsa teslimat ücreti sipariş özetinde ayrıca gösterilir; özette
          gösterilmeyen hiçbir ek ücret talep edilmez. Büyük hacimli ürünlerde (ör. dış ünite, ısı pompası) teslimat, anlaşmalı
          nakliye firmasıyla ve sizinle randevu oluşturularak yapılabilir.
        </p>
        <h2>Teslim alırken</h2>
        <ul>
          <li>Paketi teslim almadan önce görevli önünde kontrol ediniz.</li>
          <li>Pakette ezilme, yırtılma veya ıslanma varsa <strong>hasar tespit tutanağı</strong> tutturarak paketi teslim almayınız ve bize bildiriniz.</li>
          <li>Tutanak tutulmadan teslim alınan hasarlı paketlerde kargo firması sorumluluğu reddedebilir; bu durumda da bize hemen ulaşınız.</li>
        </ul>
        <h2>Kurulum</h2>
        <p>
          Kombi, klima ve ısı pompası gibi ürünlerin kurulumu için ayrıca talep oluşturabilirsiniz. Doğalgazlı cihazlarda kurulum ve
          gaz açma işlemleri yalnızca yetkili firmalar tarafından yapılabilir; firmamız {igdas.title} olarak bu hizmeti vermektedir.
        </p>
        <h2>İade</h2>
        <p>
          Ürünü teslim aldığınız tarihten itibaren <strong>{withdrawal}</strong> içinde cayma hakkınızı kullanarak iade edebilirsiniz.
          İade şartları ve adımları için <L to="iptal-ve-iade-kosullari">İptal ve İade Koşulları</L> sayfasını inceleyiniz.
        </p>
      </>
    ),
  },

  /* ------------------------------------------------------------------ */
  "iptal-ve-iade-kosullari": {
    title: "İptal ve İade Koşulları",
    description: "Sipariş iptali, cayma hakkı, iade süreci ve ücret iadesi.",
    body: (
      <>
        <h2>Sipariş iptali</h2>
        <p>
          Siparişiniz kargoya verilmeden önce <a href={`tel:+9${contact.phone.replace(/\s/g, "")}`}>{contact.phone}</a> numarasından
          veya <a href={`mailto:${contact.email}`}>{contact.email}</a> adresinden bize ulaşarak iptal edebilirsiniz. İptal edilen
          siparişin bedeli en geç {policy.refundDays} gün içinde ödemede kullandığınız yöntemle iade edilir.
        </p>
        <h2>Cayma hakkı</h2>
        <p>
          Ürünü teslim aldığınız tarihten itibaren <strong>{withdrawal}</strong> içinde hiçbir gerekçe göstermeden ve cezai şart
          ödemeden cayma hakkınızı kullanabilirsiniz. Birden fazla ürün içeren siparişlerde süre son ürünün teslim tarihinden başlar.
        </p>
        <h2>İade adımları</h2>
        <ol>
          <li>Cayma süresi içinde sipariş numaranızı belirterek <a href={`mailto:${contact.email}`}>{contact.email}</a> adresine veya telefonla bildirimde bulununuz.</li>
          <li>Size bildirilen anlaşmalı kargo firmasıyla, bildiriminizden itibaren en geç 10 gün içinde ürünü gönderiniz. Anlaşmalı kargo ile yapılan iadelerde kargo ücreti firmamıza aittir.</li>
          <li>Ürünü mümkünse orijinal kutusu, aksesuarları, garanti belgesi ve faturası ile birlikte gönderiniz.</li>
          <li>Cayma bildiriminizin bize ulaşmasından itibaren en geç <strong>{policy.refundDays} gün</strong> içinde ürün bedeli, ödemede kullandığınız yöntemle iade edilir. Kartınıza yansıma süresi bankanıza göre değişebilir.</li>
        </ol>
        <h2>Cayma hakkının kullanılamayacağı durumlar</h2>
        <ul>
          <li>Sizin istekleriniz doğrultusunda özel olarak hazırlanan veya sipariş üzerine getirtilen, kişiselleştirilen ürünler,</li>
          <li>Ambalajı açılmış olup iadesi sağlık ve hijyen açısından uygun olmayan ürünler,</li>
          <li>Onayınızla ifasına başlanan keşif, montaj, kurulum, bakım ve onarım hizmetleri.</li>
        </ul>
        <p>
          Ürünün olağan kullanımı dışında kullanılması veya kurulum sonrası kullanılmış olması nedeniyle oluşan değer kaybından,
          Mesafeli Sözleşmeler Yönetmeliği uyarınca tüketici sorumludur.
        </p>
        <h2>Ayıplı (arızalı) ürünler</h2>
        <p>
          Teslim aldığınız ürün ayıplı ise 6502 sayılı Kanun kapsamındaki seçimlik haklarınızı (sözleşmeden dönme, bedel indirimi,
          ücretsiz onarım veya ayıpsız misli ile değiştirme) kullanabilirsiniz. Garanti süresi içindeki arızalarda üreticinin yetkili
          servisine başvurabilir veya servis sürecini sizin adınıza takip etmemiz için bize ulaşabilirsiniz.
        </p>
      </>
    ),
  },

  /* ------------------------------------------------------------------ */
  "cerez-politikasi": {
    title: "Çerez Politikası",
    description: "Sitemizde kullanılan çerezler ve tarayıcı depolama alanları.",
    body: (
      <>
        <p className="lead">
          Çerezler, bir internet sitesini ziyaret ettiğinizde tarayıcınıza kaydedilen küçük metin dosyalarıdır. Bu politika,{" "}
          {policy.site} sitesinde hangi çerezlerin neden kullanıldığını açıklar.
        </p>
        <h2>Çerez tercihleriniz</h2>
        <p>
          Siteyi ilk ziyaretinizde çıkan bildirimden çerez tercihlerinizi seçebilirsiniz. Zorunlu çerezler dışındaki kategoriler
          yalnızca izin vermeniz hâlinde çalışır. Tercihiniz 6 ay boyunca saklanır; dilediğiniz zaman aşağıdaki butondan veya sayfanın
          sol altındaki çerez butonundan değiştirebilirsiniz.
        </p>
        <p>
          <CookieSettingsButton className="inline-flex h-11 items-center rounded-[4px] bg-primary px-6 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-primary/90">
            Çerez tercihlerini aç
          </CookieSettingsButton>
        </p>
        {categories.map((c) => (
          <Fragment key={c.key}>
            <h2>{c.title}</h2>
            <p>{c.text}</p>
            {c.cookies.length ? (
              <table>
                <thead><tr><th>Ad</th><th>Amaç</th><th>Süre</th></tr></thead>
                <tbody>
                  {c.cookies.map((k) => <tr key={k.name}><td>{k.name}</td><td>{k.purpose}</td><td>{k.duration}</td></tr>)}
                </tbody>
              </table>
            ) : (
              <p>Sitemizde şu anda bu kategoride çerez kullanılmamaktadır. İleride kullanılması hâlinde bu sayfada listelenir ve yalnızca izninizle çalışır.</p>
            )}
          </Fragment>
        ))}
        <h2>Üçüncü taraflar</h2>
        <p>
          Ödeme adımında {policy.paymentProvider} tarafından sunulan güvenli ödeme sayfası, ödeme güvenliği için kendi çerezlerini
          kullanabilir. Bu çerezler ilgili kuruluşun politikalarına tabidir.
        </p>
        <h2>Hukuki sebep</h2>
        <p>
          Zorunlu çerezler, talep ettiğiniz hizmetin sunulabilmesi için gereklidir ve KVKK m.5/2-c (sözleşmenin ifası) ile m.5/2-f
          (meşru menfaat) hukuki sebeplerine dayanır; bu nedenle ayrıca onay alınmaz. Analiz ve pazarlama çerezleri ise yalnızca
          açık rızanıza (m.5/1) dayanılarak kullanılır ve rızanızı dilediğiniz zaman geri alabilirsiniz.
        </p>
        <h2>Çerezleri yönetme</h2>
        <p>
          Tarayıcınızın ayarlarından çerezleri silebilir veya engelleyebilirsiniz. Zorunlu çerezleri engellemeniz hâlinde üye girişi
          gibi bazı özellikler çalışmayabilir. Kişisel verilerinize ilişkin ayrıntılar için{" "}
          <L to="kvkk-aydinlatma-metni">KVKK Aydınlatma Metni</L>&apos;ni inceleyebilirsiniz.
        </p>
      </>
    ),
  },

  /* ------------------------------------------------------------------ */
  "kullanim-kosullari": {
    title: "Kullanım Koşulları",
    description: "Sitemizin kullanımına ilişkin koşullar.",
    body: (
      <>
        <p className="lead">
          {policy.site} internet sitesi (&quot;Site&quot;) {company.title} tarafından işletilmektedir. Site&apos;yi kullanan herkes
          aşağıdaki koşulları kabul etmiş sayılır.
        </p>
        <h2>1. Hizmetin kapsamı</h2>
        <p>
          Site; ısıtma, soğutma ve iklimlendirme ürünlerinin tanıtımı ve satışı, bilgi/teklif talebi alınması ve üyelik hizmetleri
          için kullanılır. Satışlar <L to="mesafeli-satis-sozlesmesi">Mesafeli Satış Sözleşmesi</L> hükümlerine tabidir.
        </p>
        <h2>2. Üyelik</h2>
        <ul>
          <li>Üyelik sırasında verilen bilgilerin doğru ve güncel olması kullanıcının sorumluluğundadır.</li>
          <li>Hesap parolasının gizliliğinden kullanıcı sorumludur; hesabın yetkisiz kullanımı fark edildiğinde derhal bize bildirilmelidir.</li>
          <li>Koşullara aykırı kullanım durumunda üyelik askıya alınabilir veya sonlandırılabilir.</li>
        </ul>
        <h2>3. Ürün bilgileri ve fiyatlar</h2>
        <p>
          Ürün açıklamaları, teknik özellikler ve görseller üretici bilgilerine dayanır ve doğru olması için özen gösterilir.
          Açık bir yazım veya sistem hatası sonucu yanlış fiyat gösterilmesi hâlinde, SATICI siparişi iptal etme ve tahsil edilen
          bedeli iade etme hakkını saklı tutar.
        </p>
        <h2>4. Yorumlar ve kullanıcı içerikleri</h2>
        <p>
          Yorumların içeriğinden yorumu yazan kullanıcı sorumludur. Hakaret, reklam, yanıltıcı bilgi veya hukuka aykırı içerik
          barındıran yorumlar bildirim beklenmeksizin kaldırılabilir.
        </p>
        <h2>5. Fikri mülkiyet</h2>
        <p>
          Site&apos;deki tasarım, metin, logo ve yazılımlar {company.title}&apos;ne veya ilgili hak sahiplerine aittir; izinsiz
          kopyalanamaz ve ticari amaçla kullanılamaz. Marka adları ve logoları ilgili üreticilerin tescilli markalarıdır.
        </p>
        <h2>6. Yasak kullanımlar</h2>
        <p>
          Site&apos;nin güvenliğini tehlikeye atacak, işleyişini bozacak, otomatik yollarla veri toplayacak veya başkalarının haklarını
          ihlal edecek şekilde kullanılması yasaktır.
        </p>
        <h2>7. Sorumluluk</h2>
        <p>
          Site&apos;de başka sitelere verilen bağlantıların içeriğinden {company.title} sorumlu değildir. Site&apos;nin kesintisiz ve
          hatasız çalışması için özen gösterilir; bakım ve teknik arızalardan kaynaklanan geçici kesintiler olabilir.
        </p>
        <h2>8. Gizlilik</h2>
        <p>
          Kişisel verileriniz <L to="gizlilik-politikasi">Gizlilik Politikası</L>, <L to="kvkk-aydinlatma-metni">KVKK Aydınlatma Metni</L>{" "}
          ve <L to="cerez-politikasi">Çerez Politikası</L> kapsamında işlenir.
        </p>
        <h2>9. Uygulanacak hukuk</h2>
        <p>
          Bu koşullar Türkiye Cumhuriyeti hukukuna tabidir. Tüketici işlemlerinden doğan uyuşmazlıklarda Tüketici Hakem Heyetleri ve
          Tüketici Mahkemeleri yetkilidir.
        </p>
        <h2>10. Değişiklikler</h2>
        <p>Koşullar gerektiğinde güncellenebilir; güncel metin bu sayfada yayımlandığı andan itibaren geçerlidir.</p>
      </>
    ),
  },
};
