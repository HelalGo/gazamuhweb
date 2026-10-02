import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { getUser } from "@/lib/customer";
import { safeUrl } from "@/lib/layouts";

export const metadata: Metadata = { title: "Giriş Yap | GAZ-A Mühendislik", robots: { index: false, follow: true } };
export const dynamic = "force-dynamic";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const raw = safeUrl((await searchParams).next);
  const next = raw && raw.startsWith("/") ? raw : undefined;
  if (await getUser()) redirect(next ?? "/hesabim");
  return <AuthForm mode="login" next={next} />;
}
