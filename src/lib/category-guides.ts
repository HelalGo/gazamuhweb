// Kategori sayfalarının arama motoru açıklaması ve ürünlerin altında görünen rehber metni.
// Metin ziyaretçiye açıkça gösterilir (gizli metin yoktur); başlıklar ve sorular aramalarda sık geçen ifadelerdir.
export type Guide = {
  title: string; // <title>
  description: string; // meta açıklama (~155 karakter)
  heading: string;
  intro: string;
  sections: { h: string; p: string }[];
  faq: { q: string; a: string }[];
};

export const guides: Record<string, Guide> = {
  Kombi: {
    title: "Kombi Fiyatları ve Modelleri | Yoğuşmalı Kombi | GAZ-A Mühendislik",
    description: "Yoğuşmalı kombi modelleri ve güncel kombi fiyatları. İGDAŞ yetkili bayiden faturalı, garantili kombi; doğalgaz projesi, montaj ve servis İstanbul'da.",
    heading: "Kombi seçerken nelere dikkat etmeli?",
    intro: "Kombi, evinizin hem ısıtma hem sıcak su ihtiyacını karşılayan cihazdır. Doğru kapasite ve verimli bir model seçmek, kışın konforu ve doğalgaz faturasını doğrudan etkiler. İGDAŞ yetkili bayi olarak kombi satışının yanında doğalgaz projesi, montaj ve devreye alma işlemlerini de yapıyoruz.",
    sections: [
      { h: "Kaç kW kombi almalıyım?", p: "100–120 m² bir daire için genellikle 20–24 kW, 150 m²'ye kadar 24–28 kW, daha büyük ve çok banyolu evlerde 30 kW ve üzeri kombiler tercih edilir. Evin yalıtımı, kat durumu ve aynı anda kullanılan musluk sayısı da hesaba katılmalıdır; kesin kapasiteyi keşifte birlikte belirleyebiliriz." },
      { h: "Yoğuşmalı kombinin farkı nedir?", p: "Tam yoğuşmalı (premix) kombiler, baca gazındaki su buharının ısısını geri kazanarak aynı yakıttan daha fazla ısı üretir. Eski tip kombilere göre doğalgaz tüketimi belirgin şekilde düşer. Bugün satılan yeni kombilerin tamamı yoğuşmalıdır." },
      { h: "Montaj ve doğalgaz projesi", p: "Kombi takılabilmesi için onaylı bir doğalgaz projesi ve İGDAŞ'a kayıtlı yetkili bir firma gerekir. Proje, montaj, gaz açma ve ilk çalıştırma işlemlerini tek elden yürütüyoruz." },
    ],
    faq: [
      { q: "Kombi garantisi kaç yıl?", a: "Markaya göre değişmekle birlikte kombiler genellikle 2–3 yıl üretici garantilidir; garanti süresi ürün sayfasında belirtilir." },
      { q: "Kombi bakımı ne sıklıkla yapılmalı?", a: "Verim ve güvenlik için kombinin her yıl ısıtma sezonundan önce bakımının yapılması önerilir." },
    ],
  },
  Klima: {
    title: "Klima Fiyatları ve Modelleri | Inverter Klima | GAZ-A Mühendislik",
    description: "Inverter klima modelleri ve güncel klima fiyatları: 9000, 12000, 18000, 24000 BTU. Faturalı, garantili klima; montaj ve servis İstanbul'da.",
    heading: "Klima seçerken nelere dikkat etmeli?",
    intro: "Klima, yazın serinlik, kışın ek ısıtma sağlar. Doğru BTU ve enerji sınıfı, hem konforu hem elektrik faturasını belirler. Satış, montaj ve bakım işlemlerini tek elden yapıyoruz.",
    sections: [
      { h: "Kaç BTU klima almalıyım?", p: "Kabaca 10–15 m² için 9.000 BTU, 15–25 m² için 12.000 BTU, 25–35 m² için 18.000 BTU, 35–50 m² için 24.000 BTU uygundur. Güneş alan, yüksek tavanlı ya da çok camlı odalarda bir üst kapasite tercih edilmelidir." },
      { h: "Inverter klima neden daha tasarruflu?", p: "Inverter klimalar kompresör hızını ihtiyaca göre ayarlar; sürekli açılıp kapanmadığı için daha az elektrik harcar, daha sessiz çalışır ve odayı daha dengeli ısıtıp soğutur." },
      { h: "Enerji sınıfı ve gaz tipi", p: "A++ ve üzeri enerji sınıfı uzun vadede belirgin tasarruf sağlar. R32 gazlı yeni nesil klimalar hem daha verimli hem çevreye daha duyarlıdır." },
    ],
    faq: [
      { q: "Klima montajı fiyata dahil mi?", a: "Montaj koşulları ürüne ve kampanyaya göre değişir; ürün sayfasından ya da Bilgi Al formundan bize sorabilirsiniz." },
      { q: "Klima bakımı ne zaman yapılmalı?", a: "Filtreler birkaç haftada bir temizlenmeli, genel bakım ise yılda bir kez (tercihen yaz öncesi) yapılmalıdır." },
    ],
  },
  "Isı Pompası": {
    title: "Isı Pompası Fiyatları | Hava Kaynaklı Isı Pompası | GAZ-A Mühendislik",
    description: "Hava kaynaklı ısı pompası modelleri ve fiyatları. Isıtma, soğutma ve sıcak su tek sistemde; proje, montaj ve servis İstanbul'da.",
    heading: "Isı pompası nedir, kimler için uygundur?",
    intro: "Isı pompası, dış havadaki ısıyı elektrikle evinize taşıyarak ısıtma, soğutma ve sıcak su sağlar. Harcadığı her 1 birim elektriğe karşılık 3–5 birim ısı üretebildiği için doğalgaz olmayan ya da fosil yakıttan uzaklaşmak isteyen yapılarda öne çıkar.",
    sections: [
      { h: "Monoblok mu split mi?", p: "Monoblok sistemlerde tüm ünite dışarıdadır, kurulumu daha basittir. Split sistemlerde iç ve dış ünite ayrıdır; soğuk iklimlerde ve uzun boru mesafelerinde avantaj sağlar." },
      { h: "Hangi ısıtma sistemiyle çalışır?", p: "Isı pompaları en verimli şekilde yerden ısıtma ile çalışır; uygun boyutlandırılmış radyatör ve fan-coil sistemleriyle de kullanılabilir. Doğru kapasite, evin ısı kaybı hesabıyla belirlenir." },
    ],
    faq: [
      { q: "Isı pompası kışın yeterli olur mu?", a: "Yeni nesil hava kaynaklı ısı pompaları eksi derecelerde de çalışır; kapasite doğru seçildiğinde tüm kış tek başına yeterli olabilir." },
    ],
  },
  Radyatör: {
    title: "Panel Radyatör Fiyatları ve Ölçüleri | GAZ-A Mühendislik",
    description: "Panel radyatör modelleri, ölçüleri ve fiyatları. Tip 22, Tip 33 ve farklı boy seçenekleri; faturalı ürün, montaj ve tesisat hizmeti İstanbul'da.",
    heading: "Radyatör seçimi ve ölçüleri",
    intro: "Radyatör, kombinin ürettiği ısıyı odalara dağıtır. Odanın büyüklüğüne ve ısı kaybına uygun radyatör seçmek, evin her yerinin eşit ısınmasını ve kombinin verimli çalışmasını sağlar.",
    sections: [
      { h: "Tip 22 ve Tip 33 farkı", p: "Tip 22 radyatörlerde iki panel ve iki konvektör, Tip 33'te üç panel ve üç konvektör bulunur. Aynı boyda Tip 33 daha fazla ısı verir; dar duvarlı ya da soğuk odalarda tercih edilir." },
      { h: "Ne uzunlukta radyatör gerekir?", p: "Gereken ısı gücü odanın m²'si, cephe yönü, yalıtımı ve pencere alanına göre hesaplanır. Ölçüyü keşifte netleştirip uygun boy ve tipi öneriyoruz." },
    ],
    faq: [
      { q: "Radyatör değişimi yapıyor musunuz?", a: "Evet; radyatör satışının yanında söküm, montaj ve tesisat bağlantısını da yapıyoruz." },
    ],
  },
  Şofben: {
    title: "Şofben Fiyatları ve Modelleri | GAZ-A Mühendislik",
    description: "Doğalgazlı şofben modelleri ve fiyatları. Hermetik ve bacalı seçenekler; faturalı, garantili şofben, montaj ve servis İstanbul'da.",
    heading: "Şofben seçerken nelere dikkat etmeli?",
    intro: "Şofben, yalnızca sıcak su ihtiyacı için kullanılan pratik bir çözümdür. Isıtmanın başka bir sistemle yapıldığı evlerde ya da ek sıcak su gereken yerlerde tercih edilir.",
    sections: [
      { h: "Kapasite (litre/dakika)", p: "Tek banyolu evlerde 11 litre/dakika genellikle yeterlidir; aynı anda birden fazla musluk kullanılıyorsa 14 litre/dakika ve üzeri tercih edilmelidir." },
      { h: "Hermetik şofben güvenliği", p: "Hermetik şofbenler yanma havasını dışarıdan alıp atık gazı dışarı verir; iç ortam havasını kullanmadığı için daha güvenlidir ve bacasız mekânlara uygundur." },
    ],
    faq: [
      { q: "Şofben montajı için proje gerekir mi?", a: "Doğalgazlı şofbenlerde de gaz tesisatına bağlantı İGDAŞ yetkili firma tarafından yapılmalıdır; bu işlemleri biz yürütüyoruz." },
    ],
  },
  "Oda Termostatı": {
    title: "Oda Termostatı Fiyatları | Kablosuz ve Akıllı Termostat | GAZ-A Mühendislik",
    description: "Kablolu, kablosuz ve akıllı oda termostatı modelleri ve fiyatları. Kombinizi verimli kullanın, doğalgaz faturasında tasarruf edin.",
    heading: "Oda termostatı neden önemli?",
    intro: "Oda termostatı, kombiyi evin gerçek sıcaklığına göre çalıştırır. Kombi gereksiz yere çalışmadığı için doğalgaz tüketimi düşer, ev daha dengeli ısınır.",
    sections: [
      { h: "Kablolu, kablosuz ya da akıllı", p: "Kablolu termostatlar ekonomiktir; kablosuz modeller ev içinde istediğiniz yere taşınabilir. Akıllı termostatlar telefondan kontrol, haftalık programlama ve uzaktan açıp kapama imkânı sunar." },
    ],
    faq: [
      { q: "Her kombiye termostat takılır mı?", a: "Kombilerin büyük çoğunluğu oda termostatı bağlantısını destekler; uyumluluğu modelinize göre kontrol edebiliriz." },
    ],
  },
  "Sirkülasyon Pompası": {
    title: "Sirkülasyon Pompası Fiyatları | GAZ-A Mühendislik",
    description: "Sirkülasyon pompası modelleri ve fiyatları. Isıtma tesisatı ve sıcak su hatları için verimli pompalar; montaj ve servis İstanbul'da.",
    heading: "Sirkülasyon pompası nedir?",
    intro: "Sirkülasyon pompası, ısıtma tesisatındaki ya da sıcak su hattındaki suyun düzenli dolaşmasını sağlar. Uzak odaların geç ısınması veya sıcak suyun geç gelmesi gibi sorunlarda çözüm sunar.",
    sections: [
      { h: "Doğru pompa nasıl seçilir?", p: "Seçim; tesisatın uzunluğu, debi ve basma yüksekliği ihtiyacına göre yapılır. Frekans kontrollü (elektronik) pompalar ihtiyaca göre hız ayarladığı için daha az elektrik harcar." },
    ],
    faq: [
      { q: "Sirkülasyon pompası montajı yapıyor musunuz?", a: "Evet; pompa seçimi, montajı ve tesisata bağlantısını yapıyoruz." },
    ],
  },
};
