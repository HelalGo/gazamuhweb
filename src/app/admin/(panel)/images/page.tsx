import { BulkForm } from "./BulkForm";

export default function BulkImages() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-extrabold tracking-tight">Toplu Görsel Yükleme</h1>
      <p className="mb-6 mt-1 text-sm leading-relaxed text-muted">
        Birden fazla görseli aynı anda seçin. Her dosyanın adı, ürünün <strong>ürün kodu (SKU)</strong> ile aynı olmalı;
        örneğin <code className="rounded bg-surface px-1.5 py-0.5">OK-DUO0124.jpg</code> dosyası, kodu OK-DUO0124 olan ürüne atanır.
        Ürün kodlarını ürün düzenleme sayfasında görebilirsiniz. JPG, PNG veya WebP · dosya başına en fazla 5 MB.
      </p>
      <div className="rounded-2xl border border-border bg-white p-5 shadow-sm md:p-6"><BulkForm /></div>
    </div>
  );
}
