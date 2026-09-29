import Image from "next/image";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLogin() {
  if (await getAdmin()) redirect("/admin/products");
  return (
    <main className="mx-auto grid min-h-screen w-full max-w-sm content-center px-4">
      <Image src="/brand/logo.png" alt="GAZ-A" width={242} height={58} className="mb-8 h-12 w-auto" />
      <h1 className="mb-6 text-xl font-extrabold">Yönetim Paneli</h1>
      <LoginForm />
    </main>
  );
}
