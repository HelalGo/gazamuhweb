"use client";
import { useActionState, useState } from "react";
import { Star } from "lucide-react";
import { submitReview } from "@/app/(site)/actions";

export function ReviewForm({ productId }: { productId: string }) {
  const [error, action, pending] = useActionState(submitReview, null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  return (
    <form action={action} className="space-y-4 rounded-[4px] bg-surface p-6">
      <input type="hidden" name="product_id" value={productId} />
      <input type="hidden" name="rating" value={rating || ""} />
      <div>
        <p className="mb-2 text-sm font-semibold">Puanınız</p>
        <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)} onMouseEnter={() => setHover(n)} aria-label={`${n} yıldız`} aria-pressed={rating === n}>
              <Star size={28} className={(hover || rating) >= n ? "fill-amber-400 text-amber-400" : "text-border"} />
            </button>
          ))}
        </div>
      </div>
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Yorumunuz</span>
        <textarea name="comment" required minLength={10} maxLength={1000} rows={4} placeholder="Ürünü kullanım deneyiminizi paylaşın…" className="w-full rounded-[4px] bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/50" />
      </label>
      {error && <p role="alert" className="rounded-[4px] bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
      <button disabled={pending} className="rounded-[4px] bg-primary px-7 py-3 text-sm font-semibold text-white disabled:opacity-60">
        {pending ? "Gönderiliyor…" : "Yorumu Gönder"}
      </button>
    </form>
  );
}
