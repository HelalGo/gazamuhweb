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
# sharp/@img işletim sistemine özeldir (Mac'te derlendi, hosting Linux); görsel optimizasyonu kapalı olduğundan gerekmez
rm -rf "$ST/node_modules/sharp" "$ST/node_modules/@img"
cat > "$ST/app.js" <<'JS'
// Başlangıç dosyası: .env dosyasını okuyup Next.js sunucusunu çalıştırır.
const path = require("path");
try {
  process.loadEnvFile(path.join(__dirname, ".env"));
} catch {
  // .env yoksa ortam değişkenleri panelden verilmiş olmalı
}
require("./server.js");
JS
cat > "$ST/.env.ornek" <<'ENV'
# Bu dosyanın adını ".env" yapıp doldurun (Dosya Yöneticisi > Yeniden adlandır)
# Güzel Hosting'in kendi sunucusunda veritabanı adresi "localhost" olur.
DB_HOST=localhost
DB_PORT=3306
DB_USER=helalkol_gaza_muh_admin
DB_NAME=helalkol_gazamuh
DB_PASSWORD=BURAYA_VERITABANI_PAROLASI
# Admin oturum imzası: en az 32 karakterlik rastgele bir metin (harf ve rakam)
ADMIN_SESSION_SECRET=BURAYA_RASTGELE_UZUN_METIN
# Yüklenen ürün görsellerinin klasörü. Uygulama klasörünün DIŞINDA olmalı ki yeni sürüm yüklerken silinmesin.
UPLOAD_DIR=/home/helalkol/gaza-uploads
ENV
rm -f "$OUT"
(cd "$ST" && zip -rq "$OUT" . -x ".DS_Store")
rm -rf "$ST"
echo "Hazır: $OUT ($(du -h "$OUT" | cut -f1))"
