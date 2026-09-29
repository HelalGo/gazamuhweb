import type { Metadata } from "next";
import { Breadcrumb } from "@/components/Breadcrumb";
import { CartView } from "@/components/CartView";

export const metadata: Metadata = { title: "Sepetim | GAZ-A Mühendislik" };

export default function CartPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-8 pt-40 md:px-6">
      <Breadcrumb crumbs={["Ana Sayfa", "Sepetim"]} />
      <h1 className="mb-8 mt-6 text-2xl font-extrabold">Sepetim</h1>
      <CartView />
    </div>
  );
}
