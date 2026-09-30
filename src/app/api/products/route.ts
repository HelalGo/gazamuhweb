import { getProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

// Web ve mobil uygulama ürünleri buradan okur.
export async function GET() {
  return Response.json(await getProducts(), { headers: { "Access-Control-Allow-Origin": "*" } });
}
