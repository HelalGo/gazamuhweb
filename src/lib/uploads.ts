import { randomBytes } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

// Yüklenen görsellerin durduğu klasör. Sunucuda uygulama klasörünün DIŞINDA bir yol vermeniz önerilir
// (örn. /home/helalkol/gaza-uploads); böylece yeni sürüm yüklerken silinmezler.
export const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(/* turbopackIgnore: true */ process.cwd(), "uploads");
export const MAX_BYTES = 5 * 1024 * 1024;

const TYPES: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };
export const contentType = (name: string) => TYPES[name.split(".").pop() ?? ""] ?? "application/octet-stream";

// Dosya uzantısına değil, gerçek içeriğine (ilk baytlara) bakar.
function detectExt(b: Buffer): "jpg" | "png" | "webp" | null {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (b.subarray(0, 4).toString() === "RIFF" && b.subarray(8, 12).toString() === "WEBP") return "webp";
  return null;
}

export type SaveResult = { url: string } | { error: string };

export async function saveImage(file: File): Promise<SaveResult> {
  if (file.size === 0) return { error: "Dosya boş." };
  if (file.size > MAX_BYTES) return { error: "Dosya 5 MB'tan büyük." };
  const buf = Buffer.from(await file.arrayBuffer());
  const ext = detectExt(buf);
  if (!ext) return { error: "Yalnızca JPG, PNG veya WebP yüklenebilir." };
  const name = `${randomBytes(12).toString("hex")}.${ext}`;
  await mkdir(/* turbopackIgnore: true */ UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(/* turbopackIgnore: true */ UPLOAD_DIR, name), buf);
  return { url: `/uploads/${name}` };
}

export async function readImage(name: string) {
  if (!/^[a-f0-9]{24}\.(jpg|png|webp)$/.test(name)) return null;
  try {
    return await readFile(path.join(/* turbopackIgnore: true */ UPLOAD_DIR, name));
  } catch {
    return null;
  }
}

// Yalnızca kendi yüklediğimiz dosyaları siler (dışarıdan verilmiş URL'lere dokunmaz).
export async function removeImage(url: string | null | undefined) {
  const m = url?.match(/^\/uploads\/([a-f0-9]{24}\.(?:jpg|png|webp))$/);
  if (m) await unlink(path.join(/* turbopackIgnore: true */ UPLOAD_DIR, m[1])).catch(() => {});
}
