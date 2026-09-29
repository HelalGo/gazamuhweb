import Image from "next/image";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLogin() {
  if (await getAdmin()) redirect("/admin");
  return (
    <main className="grid min-h-screen place-items-center bg-gradient-to-br from-[#0b1d45] via-primary to-accent px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl">
        <Image src="/brand/logo.png" alt="GAZ-A" width={242} height={58} className="mb-6 h-11 w-auto" />
        <h1 className="text-xl font-extrabold">Yönetim Paneli</h1>
        <p className="mb-6 mt-1 text-sm text-muted">Devam etmek için giriş yapın.</p>
        <LoginForm />
      </div>
    </main>
  );
}
