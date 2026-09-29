# Ürün açıklamalarını ve eksik/hatalı fiyatları üretir -> data/katalog-aciklama.json
# Açıklamalar yalnızca ürün adından çıkarılabilen bilgilere ve serinin bilinen özelliklerine dayanır;
# ürün adında olmayan teknik değer (verim, ses seviyesi vb.) yazılmaz.
# Çalıştırma: python scripts/katalog-aciklama.py
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
products = json.loads((ROOT / "data" / "products.json").read_text(encoding="utf-8"))

IGDAS = "İGDAŞ yetkili firması (yetki no: 7005140)"

# Piyasa araştırmasıyla belirlenen fiyatlar (Eylül 2026). Kaynak sitede fiyatı olmayan veya
# yer tutucu (10 TL) görünen ürünler için. Anahtar: ürün adında geçen ayırt edici ifade.
PRICES = [
    ("IO-MM 80 P", 122000), ("IO-MM 100 P", 133500), ("IO-MM 120 P", 149900), ("IO-MM 140 P", 164900),
    ("IO-MM 160 P", 179900), ("IO-MT 160 P", 184900),
    ("İotherm Pro Hava Kaynaklı Isı Pompası 8M", 139400), ("İotherm Pro Hava Kaynaklı Isı Pompası 10M", 152000),
    ("İotherm Pro Hava Kaynaklı Isı Pompası 12M", 167900), ("İotherm Pro Hava Kaynaklı Isı Pompası 16M", 194900),
    ("İotherm Pro Hava Kaynaklı Isı Pompası 16T", 204900),
    ("10-MT 220", 264900), ("10-MT 260", 298900), ("10-MT 300", 334900),
    ("Compress 2000 AWF Monoblok Isı Pompası 8 Kw", 149900), ("Compress 2000 AWF Monoblok Isı Pompası 16 Kw", 229900),
    ("Compress 2000 AWF Monoblok Isı Pompası 22 Kw", 284900), ("Compress 2000 AWF Monoblok Isı Pompası 30 Kw", 344900),
    ("EMPA080A100", 111000), ("EMPA110A100", 127900), ("EMPA160A100", 157900),
    ("aroTHERM Plus Monoblok Isı Pompası 4 kW", 164900), ("aroTHERM Plus Monoblok Isı Pompası 5 kW", 174900),
    ("aroTHERM Plus Monoblok Isı Pompası 8 kW", 194500), ("aroTHERM Plus Monoblok Isı Pompası 12 kW", 267900),
    ("aroTHERM Plus Monoblok Isı Pompası 15 kW", 294900),
    ("VWL 45.6 4 kW", 164900), ("45.6 5 kW", 174900), ("VWL 45.6 8 kW", 194500), ("VWL 45.6 12 kW", 267900),
    ("VWL 45.6 15 kW", 294900),
    ("aroTHERM Split Isı Pompası 14 kW", 229900), ("aroTHERM Split Isı Pompası 16 kW", 244900),
    ("aroTHERM İntro Isı Pompası 8 kW", 189900), ("aroTHERM İntro Isı Pompası 10 kW", 202300),
    ("aroTHERM İntro Isı Pompası 12 kW", 204900), ("aroTHERM İntro Isı Pompası 16 kW", 207500),
    ("MAXIAIR Isı Pompası 8 kW", 127900), ("MAXIAIR Isı Pompası 16 kW", 188700),
    ("MAXIAIR Plus Isı Pompası 5 kW", 117900), ("MAXIAIR Plus Isı Pompası 7 kW", 129900),
    ("MAXIAIR Plus Isı Pompası 12 kW", 171900), ("MAXIAIR Plus Isı Pompası 14 kW", 184900),
    ("MAXIAIR Plus Mono Isı Pompası 5 kW", 124900), ("MAXIAIR Plus Mono Isı Pompası 8 kW", 144900),
    ("MAXIAIR Plus Mono Isı Pompası 12 kW", 179900), ("MAXIAIR Plus Mono Isı Pompası 15 kW", 198900),
    ("Split Isı Pompası 8 kW", 157900), ("Split Isı Pompası 10 kW", 172600), ("Split Isı Pompası 12 kW", 181900),
    ("Split Isı Pompası 16 kW", 198900),
    ("Condens 7000i 24KW", 72500),
    ("On/Off Poly100", 3300), ("MARS S15", 2900), ("MARS S5", 2400),
]


def price_for(name: str):
    n = name.replace("​", "")
    hits = [(k, v) for k, v in PRICES if k in n]
    return max(hits, key=lambda h: len(h[0]))[1] if hits else None


def low(s: str):
    return s.replace("İ", "I").lower()  # Python'da "İ".lower() birleşik nokta üretir


def kw(name: str):
    m = re.search(r"(\d+(?:[.,]\d+)?)(?:\s*[-/]\s*(\d+))?\s*kw", name, re.I)
    if not m:
        return None
    a = m.group(1).replace(",", ".")
    return f"{a}/{m.group(2)}" if m.group(2) else a


def btu(name: str):
    m = re.search(r"(\d{1,2}[.,]?\d{3})\s*btu", name, re.I)
    return int(re.sub(r"[.,]", "", m.group(1))) if m else None


def area_for_btu(b: int):
    if b <= 7000: return "yaklaşık 10–15 m²"
    if b <= 9000: return "yaklaşık 15–20 m²"
    if b <= 12000: return "yaklaşık 20–30 m²"
    if b <= 14000: return "yaklaşık 25–35 m²"
    if b <= 18000: return "yaklaşık 30–45 m²"
    if b <= 21000: return "yaklaşık 40–50 m²"
    if b <= 24000: return "yaklaşık 45–60 m²"
    return "geniş salon, mağaza ve ofis gibi büyük hacimli"


def bullets(items):
    return "\n".join(f"• {i}" for i in items if i)


def kombi(p):
    n, b = p["name"], p["brand"]
    series = re.sub(r"\s*\d+\s*(yıl|YIL).*$", "", n, flags=re.I)
    series = re.sub(r"(Tam Yoğu[sş]mal[ıi]|Kombi|Sessiz|Aynı Gün Teslimat|Entegre Wifi Arayüzü|Dokunmatik Ekran|Yeni Nesil|Siyah)", "", series, flags=re.I)
    series = re.sub(r"\s+", " ", series).strip(" .-–")
    k = kw(n)
    premix = "premix" in low(n)
    feats = [
        "Tam yoğuşma teknolojisi: baca gazındaki su buharının ısısını geri kazanarak yakıttan daha fazla ısı elde eder",
        "Premix (ön karışımlı) brülör: gaz ve havayı yanmadan önce karıştırarak dengeli ve temiz bir yanma sağlar" if premix else None,
        f"{k} kW kapasite" if k else None,
        "Entegre Wi-Fi arayüzü ile uzaktan kontrol imkânı" if re.search(r"wifi|wi-fi|connect", n, re.I) else None,
        "Dokunmatik kontrol ekranı" if "dokunmatik" in low(n) else None,
        "Sessiz çalışma odaklı tasarım" if "sessiz" in low(n) else None,
        "Siyah ön panel tasarımı" if "siyah" in low(n) else None,
        "Isıtma ve kullanım sıcak suyunu tek cihazdan karşılayan kombi yapısı",
    ]
    size = ""
    try:
        v = float((k or "0").split("/")[-1])
        if v:
            size = ("daire tipi konutlar" if v <= 26 else "geniş daireler ve dubleksler" if v <= 33 else "büyük konutlar, villalar ve yüksek sıcak su ihtiyacı olan yapılar")
    except ValueError:
        pass
    return (
        f"{series}, {b} markasının tam yoğuşmalı kombi modelidir. Konutunuzun ısıtma ve sıcak su ihtiyacını verimli ve güvenli şekilde karşılamak için tasarlanmıştır.\n\n"
        f"Öne çıkan özellikler\n{bullets(feats)}\n\n"
        + (f"Bu kapasite genellikle {size} için tercih edilir. Doğru kombi kapasitesi; konutun metrekaresi, yalıtımı, cephesi ve sıcak su kullanımına göre belirlenir.\n\n" if size else
           "Doğru kombi kapasitesi; konutun metrekaresi, yalıtımı, cephesi ve sıcak su kullanımına göre belirlenir.\n\n")
        + f"Kurulum: Doğalgazlı cihazların montajı ve gaz açma işlemleri yalnızca yetkili firmalar tarafından yapılabilir. GAZA Mühendislik, {IGDAS} olarak kombi montajı, baca bağlantısı ve devreye alma işlemlerini gerçekleştirir. Ürün, üretici garantisi kapsamında faturalı olarak teslim edilir."
    )


def klima(p):
    n, b = p["name"], p["brand"]
    if "hava temizleme" in low(n):
        model = re.search(r"(MC\w+)", n).group(1)
        humid = model.startswith("MCK")
        feats = [
            "Ortam havasındaki toz, polen ve benzeri partikülleri filtreleyerek iç mekân hava kalitesini iyileştirir",
            "Nemlendirme fonksiyonu ile kuru havada konforu artırır" if humid else None,
            "Farklı fan kademeleriyle ihtiyaca göre çalışma",
            "Ev, ofis ve yatak odası gibi kapalı alanlarda kullanıma uygun",
        ]
        return (
            f"Daikin {model}, Daikin'in {'nemlendirme özellikli ' if humid else ''}hava temizleme cihazıdır. Yaşam alanlarınızda daha temiz ve konforlu bir hava ortamı sağlamak için tasarlanmıştır.\n\n"
            f"Öne çıkan özellikler\n{bullets(feats)}\n\n"
            "Filtrelerin kullanım kılavuzunda belirtilen aralıklarla temizlenmesi ve değiştirilmesi cihazın performansını korur. Ürün, üretici garantisi kapsamında faturalı olarak teslim edilir."
        )
    B = btu(n)
    inverter = "inverter" in low(n) or "İnverter" in n
    salon = "salon" in low(n)
    color = next((c for c in ("Beyaz", "Gri", "Siyah") if c in n), None)
    series = re.sub(r"(\d{1,2}[.,]?\d{3})\s*BTU(/H)?", "", n, flags=re.I)
    series = re.sub(r"\b(Inverter|İnverter|Klima|A\+\+\+|Beyaz|Gri|Siyah|Split|Duvar Tipi|Salon Tipi|R32)\b", "", series, flags=re.I)
    series = re.sub(r"\s+", " ", series.replace("A+++", "")).strip(" .-–")
    feats = [
        f"{B:,} BTU/h soğutma kapasitesi".replace(",", ".") if B else None,
        "Inverter kompresör: ortam sıcaklığına göre devrini ayarlayarak dengeli konfor ve düşük enerji tüketimi sağlar" if inverter else None,
        "A+++ enerji sınıfı" if "A+++" in n else None,
        "Salon (dolap) tipi iç ünite: geniş hacimlerde güçlü hava dağılımı" if salon else "Duvar tipi split iç ünite" if ("split" in low(n) or "duvar" in low(n) or not salon) else None,
        "Nemlendirme özelliği ile kış aylarında daha konforlu ortam" if "ururu" in low(n) else None,
        "Tasarım odaklı iç ünite" if "emura" in low(n) else None,
        f"{color} renk seçeneği" if color else None,
        "Soğutma ve ısıtma modlarında çalışabilme",
    ]
    for k, v in (p.get("specs") or {}).items():
        if k == "Enerji Sınıfı" and "A+++" not in n:
            feats.insert(2, f"{v} enerji sınıfı")
    area = f"Bu kapasite, {area_for_btu(B)} alanlar için uygundur" if B else ""
    return (
        f"{series} {f'{B:,}'.replace(',', '.') + ' BTU ' if B else ''}{'salon tipi ' if salon else ''}klima, {b} markasının {'inverter ' if inverter else ''}iklimlendirme çözümüdür. Yaz aylarında serinlik, geçiş dönemlerinde ise ısıtma desteği sunar.\n\n"
        f"Öne çıkan özellikler\n{bullets(feats)}\n\n"
        + (f"{area}; gerçek ihtiyaç yalıtım, cephe, tavan yüksekliği ve kullanım şekline göre değişir. Keşif sırasında mekânınıza uygun kapasiteyi birlikte belirliyoruz.\n\n" if area else "")
        + "Kurulum: GAZA Mühendislik, klimanın keşif, montaj ve devreye alma işlemlerini uzman ekibiyle gerçekleştirir. Ürün, üretici garantisi kapsamında faturalı olarak teslim edilir."
    )


def isi_pompasi(p):
    n, b = p["name"].replace("​", ""), p["brand"]
    k = kw(n)
    mono = "monoblok" in low(n) or "mono " in low(n) or "EMPA" in n or "AWF" in n or "IO-M" in n or "VWL" in n or re.search(r"\d+M\b", n)
    split = "split" in low(n) or "intro" in low(n) or "İntro" in n or "MAXIAIR Isı" in n
    tri = bool(re.search(r"IO-MT|10-MT|\d+T\b", n)) or (k and float(k.split('/')[-1]) >= 22)
    lw = low(n)
    gas = ("R290 (propan) doğal soğutucu akışkan" if ("arotherm plus" in lw or "plus mono" in lw)
           else "R32 soğutucu akışkan" if ("r32" in lw or "iotherm plus" in lw) else None)
    feats = [
        "Hava kaynaklı ısı pompası: dış havadaki ısı enerjisini kullanarak binayı ısıtır",
        f"{k} kW nominal kapasite" if k else None,
        "Monoblok yapı: soğutucu akışkan devresi dış ünitede kapalıdır, iç mekânda yalnızca su bağlantısı yapılır" if mono and not split else None,
        "Split yapı: dış ünite ve iç ünite ayrı olarak konumlandırılır" if split else None,
        "Inverter kompresör ile ihtiyaca göre kapasite ayarı" if ("inverter" in low(n) or "İnverter" in n) else None,
        gas,
        "Trifaze (380 V) elektrik bağlantısı" if tri else None,
        "Yerden ısıtma, fan-coil ve uygun boyutlandırılmış radyatör sistemleriyle kullanım",
        "Uygun sistem bileşenleriyle kullanım sıcak suyu ve soğutma desteği",
    ]
    return (
        f"{n}, {b} markasının hava kaynaklı ısı pompası çözümüdür. Isıtma enerjisinin önemli bir kısmını dış havadan elde ettiği için fosil yakıtlı sistemlere göre daha düşük işletme maliyeti ve daha düşük karbon salımı hedefleyen yapılar için uygundur.\n\n"
        f"Öne çıkan özellikler\n{bullets(feats)}\n\n"
        "Doğru ısı pompası kapasitesi; binanın ısı kaybı hesabı, iklim bölgesi, ısıtma sistemi tipi ve sıcak su ihtiyacına göre belirlenir. Hatalı boyutlandırma verimi doğrudan etkilediği için keşif ve proje aşaması büyük önem taşır.\n\n"
        "Proje ve kurulum: GAZA Mühendislik; ısı kaybı hesabı, sistem tasarımı, dış ünite yerleşimi, hidrolik bağlantılar ve devreye alma dahil tüm süreci mühendislik desteğiyle yürütür. Ürün, üretici garantisi kapsamında faturalı olarak teslim edilir."
    )


def radyator(p):
    n, b = p["name"], p["brand"]
    m = re.search(r"(\d{3})\s*[×x]\s*(\d{3,4})", n)
    h, w = (m.group(1), m.group(2)) if m else (None, None)
    feats = [
        "Tip 22 (PKKP): çift panelli ve çift konvektörlü yapı ile yüksek ısı yayımı",
        f"Ölçü: {h} mm yükseklik × {w} mm uzunluk" if h else None,
        "Kombi, kazan ve ısı pompası destekli kalorifer sistemleriyle uyumlu",
        "Kolay temizlenebilir düz ön yüzey",
    ]
    return (
        f"{b} {h}×{w} Tip 22 panel radyatör, konut ve iş yerlerinde kalorifer sistemleri için tasarlanmış çelik panel radyatördür. Ortamı hem ışıma hem de konveksiyon yoluyla dengeli şekilde ısıtır.\n\n"
        f"Öne çıkan özellikler\n{bullets(feats)}\n\n"
        "Bir oda için gereken radyatör uzunluğu; odanın hacmi, yalıtımı, cephesi ve pencere oranına göre ısı kaybı hesabıyla belirlenir. Keşif sırasında her oda için doğru ölçüyü birlikte hesaplıyoruz.\n\n"
        "Montaj: GAZA Mühendislik, radyatör montajı, tesisat bağlantısı ve sistem dengelemesi hizmeti sunar. Ürün, üretici garantisi kapsamında faturalı olarak teslim edilir."
    )


def sofben(p):
    n, b = p["name"], p["brand"]
    m = re.search(r"(\d+)\s*lt", n, re.I)
    lt = m.group(1) if m else None
    herm = "hermatik" in low(n) or "turbomag" in low(n)
    feats = [
        f"{lt} litre/dakika sıcak su kapasitesi" if lt else None,
        "Hermetik yapı: yanma havasını dışarıdan alır, atık gazı dışarı atar; yanma odası yaşam alanından ayrıdır" if herm else None,
        "Doğalgaz ile anlık sıcak su üretimi",
        "Tek banyo ve mutfak gibi orta düzey sıcak su ihtiyacı için uygun",
    ]
    return (
        f"{n}, {b} markasının doğalgazlı anlık su ısıtıcısıdır. Musluk açıldığı anda sıcak su üreterek depolama kaybı olmadan ekonomik kullanım sağlar.\n\n"
        f"Öne çıkan özellikler\n{bullets(feats)}\n\n"
        f"Kurulum: Doğalgazlı cihazların montajı ve gaz açma işlemleri yalnızca yetkili firmalar tarafından yapılabilir. GAZA Mühendislik, {IGDAS} olarak şofben montajı ve baca bağlantısını mevzuata uygun şekilde gerçekleştirir. Ürün, üretici garantisi kapsamında faturalı olarak teslim edilir."
    )


def pompa(p):
    n = p["name"]
    m = re.search(r"(HMD?)-(\d+)-(\d+)-(\d+)", n)
    twin = m and m.group(1) == "HMD"
    feats = [
        f"Bağlantı ölçüsü: DN{m.group(2)}" if m else None,
        f"Gövde boyu: {m.group(4)} mm" if m else None,
        "İkiz (çift) pompa yapısı: yedekli ve dönüşümlü çalışma imkânı" if twin else None,
        "Frekans kontrollü, enerji verimli ıslak rotorlu yapı" if not twin else None,
        "Kalorifer, yerden ısıtma ve soğutma devrelerinde su sirkülasyonu",
    ]
    return (
        f"{n}, ısıtma ve soğutma tesisatlarında suyun sistem içinde düzenli dolaşımını sağlayan sirkülasyon pompasıdır. Model kodundaki ikinci değer bağlantı çapını, üçüncü değer basma yüksekliği sınıfını, son değer ise gövde boyunu ifade eder.\n\n"
        f"Öne çıkan özellikler\n{bullets(feats)}\n\n"
        "Pompa seçimi; tesisatın debisi, basınç kaybı ve boru çapına göre yapılmalıdır. GAZA Mühendislik, doğru pompa seçimi, montajı ve devreye alma konusunda mühendislik desteği sunar. Ürün, üretici garantisi kapsamında faturalı olarak teslim edilir."
    )


def termostat(p):
    n, b = p["name"], p["brand"]
    smart = "akıllı" in low(n) or "connect" in low(n)
    feats = [
        "Kablosuz (RF) bağlantı: kombi ile arasında kablo çekmeye gerek kalmaz" if "kablosuz" in low(n) else None,
        "Akıllı telefon uygulaması ile uzaktan kontrol" if smart else None,
        "Açma/kapama (on/off) kontrollü çalışma" if "on/off" in low(n) else None,
        "Ortam sıcaklığını ayarlanan değerde tutarak gereksiz çalışmayı ve yakıt tüketimini azaltır",
        "Kombinin bulunduğu yerden bağımsız olarak yaşam alanına yerleştirilebilir",
    ]
    return (
        f"{n}, {b} markasının oda termostatıdır. Isıtma sistemini, kombinin değil yaşadığınız odanın sıcaklığına göre yöneterek daha konforlu ve tasarruflu bir kullanım sağlar.\n\n"
        f"Öne çıkan özellikler\n{bullets(feats)}\n\n"
        "Uyumluluk: Termostatın kombinizle uyumu, kombinin marka ve modeline göre değişebilir. Satın almadan önce kombinizin modelini bize iletirseniz uyumu kontrol ederiz. GAZA Mühendislik termostat montajı ve kombiye bağlantısını yapar. Ürün, üretici garantisi kapsamında faturalı olarak teslim edilir."
    )


out = {}
for p in products:
    n = p["name"]
    cat = p["category"]
    real_cat = "Isı Pompası" if ("Isı" in n and "Pompas" in n and "iotherm" in low(n)) or "Isı Pompası" in n else cat
    fn = {"Kombi": kombi, "Klima": klima, "Isı Pompası": isi_pompasi, "Radyatör": radyator, "Şofben": sofben,
          "Sirkülasyon Pompası": pompa, "Oda Termostatı": termostat}[real_cat]
    # origHash: sunucuda açıklama hâlâ kazınan orijinal metinse değiştirilir; adminden düzenlendiyse dokunulmaz
    orig = (p.get("description") or "").strip()
    entry = {"description": fn(p), "origHash": hashlib.sha1(orig.encode("utf-8")).hexdigest()[:16]}
    if real_cat != cat:
        entry["category"] = real_cat
    pr = price_for(n)
    if (p.get("price") or 0) <= 10 and pr:
        entry["price"] = pr
    elif (p.get("price") or 0) <= 10:
        print("FİYAT BULUNAMADI:", n)
    out[p["source_url"]] = entry

(ROOT / "data" / "katalog-aciklama.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
print(len(out), "ürün;", sum(1 for e in out.values() if "price" in e), "fiyat;", sum(1 for e in out.values() if "category" in e), "kategori düzeltmesi")
