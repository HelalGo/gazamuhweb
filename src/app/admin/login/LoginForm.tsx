"use client";
import { useActionState } from "react";
import { login } from "../actions";

const cls = "w-full rounded-xl bg-surface px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-accent/50";

export function LoginForm() {
  const [error, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="space-y-4">
      <input name="email" type="email" required autoComplete="username" placeholder="E-posta" className={cls} />
      <input name="password" type="password" required autoComplete="current-password" placeholder="Parola" className={cls} />
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <button disabled={pending} className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white disabled:opacity-60">
        {pending ? "Giriş yapılıyor…" : "Giriş Yap"}
      </button>
    </form>
  );
}
