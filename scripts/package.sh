#!/usr/bin/env bash
# Kullanım: npm run package  → ../gaza-web-build.zip (Güzel Hosting'e yüklenecek paket)
set -euo pipefail
cd "$(dirname "$0")/.."
npm run build
OUT="$(cd .. && pwd)/gaza-web-build.zip"
ST="$(mktemp -d)"
cp -R .next/standalone/. "$ST/"
mkdir -p "$ST/.next" && cp -R .next/static "$ST/.next/static"
cp -R public "$ST/public"
# node_modules pakete girmez: cPanel Node.js App paketleri kendi sanal ortamına kurar ("Run NPM Install")
# ve uygulama klasöründe gerçek bir node_modules klasörü olursa uygulama çalışmaz.
rm -rf "$ST/node_modules"
# Katalog düzeltmesi: ankastre temizliği + ürün görselleri (app.js açılışta bir kez çalıştırır)
cp scripts/katalog-duzelt.mjs "$ST/katalog-duzelt.mjs"
cp -R data/katalog-gorselleri "$ST/katalog-gorselleri"
cp data/katalog-galeri.json "$ST/katalog-galeri.json"
cp data/katalog-cikar.json "$ST/katalog-cikar.json"
cat > "$ST/app.js" <<'JS'
// Başlangıç dosyası: .env dosyasını okuyup Next.js sunucusunu çalıştırır.
const path = require("path");
try {
  process.loadEnvFile(path.join(__dirname, ".env"));
} catch {
  // .env yoksa ortam değişkenleri panelden verilmiş olmalı
}
require("./server.js");
// Tek seferlik katalog düzeltmesi; bittiğinde yüklenenler klasörüne işaret bırakır ve bir daha çalışmaz
import("./katalog-duzelt.mjs").then((m) => m.run()).catch((e) => console.error("[katalog]", e.message));
JS
# .env pakete girmez: sunucudaki .env dosyası (veritabanı, e-posta, CallMeBot ayarları) olduğu gibi kalır
rm -f "$OUT"
(cd "$ST" && zip -rq "$OUT" . -x ".DS_Store")
rm -rf "$ST"
echo "Hazır: $OUT ($(du -h "$OUT" | cut -f1))"
