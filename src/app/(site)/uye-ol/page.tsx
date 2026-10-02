import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { getUser } from "@/lib/customer";
import { safeUrl } from "@/lib/layouts";

export const metadata: Metadata = { title: "Üye Ol | GAZ-A Mühendislik", robots: { index: false, follow: true } };
export const dynamic = "force-dynamic";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const raw = safeUrl((await searchParams).next);
  const next = raw && raw.startsWith("/") ? raw : undefined;
  if (await getUser()) redirect(next ?? "/hesabim");
  return <AuthForm mode="register" next={next} />;
}
