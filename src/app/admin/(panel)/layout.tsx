import Image from "next/image";
import Link from "next/link";
import { logout } from "../actions";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <>
      <header className="bg-surface">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-6 px-4 md:px-6">
          <Link href="/admin/products"><Image src="/brand/logo.png" alt="GAZ-A" width={242} height={58} className="h-9 w-auto" /></Link>
          <nav className="flex gap-1 text-sm font-semibold">
            <Link href="/admin/products" className="rounded-lg px-3 py-2 hover:bg-white">Ürünler</Link>
            <Link href="/" target="_blank" className="rounded-lg px-3 py-2 text-muted hover:bg-white">Siteyi gör ↗</Link>
          </nav>
          <div className="ml-auto flex items-center gap-4 text-sm">
            <span className="hidden text-muted sm:block">{admin.name || admin.email}</span>
            <form action={logout}><button className="font-semibold text-accent hover:underline">Çıkış</button></form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6">{children}</main>
    </>
  );
}
