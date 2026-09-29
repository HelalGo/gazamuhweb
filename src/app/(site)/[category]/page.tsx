import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductListing } from "@/components/ProductListing";
import { categoryOf, getProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const name = await categoryOf((await params).category);
  return { title: name ? `${name} | GAZ-A Mühendislik` : "GAZ-A Mühendislik" };
}

export default async function CategoryPage({ params }: Props) {
  const name = await categoryOf((await params).category);
  if (!name) notFound();
  const products = (await getProducts()).filter((p) => p.category === name);
  return <ProductListing products={products} crumbs={["Ana Sayfa", name]} hideCategory />;
}
