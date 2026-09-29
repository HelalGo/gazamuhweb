import { contentType, readImage } from "@/lib/uploads";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const data = await readImage(name);
  if (!data) return new Response("Bulunamadı", { status: 404 });
  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": contentType(name),
      // dosya adı rastgele olduğundan içeriği değişmez
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
