"use client";
import { useActionState } from "react";
import { bulkUploadImages, type BulkResult } from "../../actions";

export function BulkForm() {
  const [res, action, pending] = useActionState<BulkResult, FormData>(bulkUploadImages, null);
  return (
    <form action={action} className="space-y-5">
      <input
        type="file" name="images" multiple required accept="image/jpeg,image/png,image/webp"
        className="block w-full text-sm file:mr-4 file:rounded-full file:border-0 file:bg-surface file:px-4 file:py-2 file:text-sm file:font-semibold hover:file:bg-surface-alt"
      />
      <button disabled={pending} className="rounded-xl bg-primary px-8 py-3 text-sm font-bold text-white disabled:opacity-60">
        {pending ? "Yükleniyor…" : "Yükle ve eşleştir"}
      </button>
      {res && (
        <div role="status" className="space-y-3 rounded-2xl bg-surface p-5 text-sm">
          <p className="font-bold text-green-700">{res.matched} görsel ürünlere atandı.</p>
          {res.unmatched.length > 0 && (
            <div><p className="font-semibold">Eşleşen ürün bulunamadı ({res.unmatched.length}):</p><p className="text-muted">{res.unmatched.join(", ")}</p></div>
          )}
          {res.failed.length > 0 && (
            <div><p className="font-semibold text-red-700">Yüklenemedi ({res.failed.length}):</p><p className="text-muted">{res.failed.join(", ")}</p></div>
          )}
        </div>
      )}
    </form>
  );
}
