import type { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { CheckoutForm } from "@/components/CheckoutForm";
import { requireUser } from "@/lib/customer";

export const metadata: Metadata = { title: "Siparişi Tamamla | GAZ-A Mühendislik", robots: { index: false, follow: true } };
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const u = await requireUser("/siparis");
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-8 pt-40 md:px-6">
      <Breadcrumb crumbs={[{ label: "Ana Sayfa", href: "/" }, { label: "Sepetim", href: "/sepet" }, { label: "Siparişi Tamamla" }]} />
      <h1 className="mb-8 mt-6 text-2xl font-extrabold">Siparişi Tamamla</h1>
      <CheckoutForm defaults={{ name: `${u.firstName} ${u.lastName}`, phone: u.phone ?? "", email: u.email }} />
    </div>
  );
}
