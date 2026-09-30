"use client";
import { useActionState } from "react";
import { deleteMyAccount } from "@/app/(site)/actions";

const inputCls = "w-full rounded-[4px] bg-white px-4 py-3 text-sm outline-none transition-shadow placeholder:text-muted focus:ring-2 focus:ring-accent/50";

// Parola + onay kutusu ile hesabı kalıcı olarak siler
export function DeleteAccountForm({ email }: { email: string }) {
  const [error, action, pending] = useActionState(deleteMyAccount, null);
  return (
    <form action={action} className="space-y-5">
      <p className="text-sm">Silinecek hesap: <strong>{email}</strong></p>
      <label className="block">
        <span className="mb-1.5 block text-sm font-semibold">Parolanız</span>
        <input name="password" type="password" required autoComplete="current-password" className={inputCls} />
      </label>
      <label className="flex cursor-pointer items-start gap-2.5 text-sm">
        <input type="checkbox" name="confirm" required className="mt-0.5 h-4 w-4 shrink-0 accent-red-600" />
        Hesabımın ve yukarıda belirtilen verilerimin kalıcı olarak silineceğini, bu işlemin geri alınamayacağını anladım.
      </label>
      {error && <p role="alert" className="rounded-[4px] bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
      <button disabled={pending} className="rounded-[4px] bg-red-600 px-8 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
        {pending ? "Siliniyor…" : "Hesabımı kalıcı olarak sil"}
      </button>
    </form>
  );
}
