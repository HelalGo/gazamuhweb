import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Ana dizindeki başka bir package-lock.json'un karışmasını engeller
  turbopack: { root: path.resolve(__dirname) },
  // Sunucuya yüklenecek tek klasörlük paket (server.js + gerekli node_modules)
  output: "standalone",
  // Görsel optimizasyonu sharp (işletim sistemine özel) ister; hosting'de sorun çıkmasın diye kapalı
  images: { unoptimized: true },
};

export default nextConfig;
