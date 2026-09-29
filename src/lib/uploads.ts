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

// Görselin istenen boyutlara uyup uymadığını denetler.
// w×h "önerilen" boyuttur; ratio=true ise oran da (±%3) zorunludur. En az önerilen genişliğin %75'i gerekir.
export type Req = { w: number; h: number; ratio?: boolean; portrait?: boolean };

function imageSize(b: Buffer, ext: string): { w: number; h: number } | null {
  try {
    if (ext === "png") return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
    if (ext === "webp") {
      const kind = b.subarray(12, 16).toString();
      if (kind === "VP8 ") return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
      if (kind === "VP8L") {
        const v = b.readUInt32LE(21);
        return { w: (v & 0x3fff) + 1, h: ((v >> 14) & 0x3fff) + 1 };
      }
      if (kind === "VP8X") return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
      return null;
    }
    // jpg: SOF işaretçisini ara
    let i = 2;
    while (i < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const m = b[i + 1];
      if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
      i += 2 + b.readUInt16BE(i + 2);
    }
  } catch {}
  return null;
}

function checkReq(size: { w: number; h: number } | null, req: Req): string | null {
  if (!size) return "Görselin boyutu okunamadı.";
  const need = `${req.w}×${req.h} px`;
  const got = `yüklediğiniz: ${size.w}×${size.h} px`;
  if (size.w < req.w * 0.75) return `Görsel çok küçük. Gerekli boyut ${need} (${got}).`;
  if (req.portrait && size.h <= size.w) return `Görsel dikey olmalı. Gerekli boyut ${need} (${got}).`;
  if (req.ratio !== false && Math.abs(size.w / size.h / (req.w / req.h) - 1) > 0.03)
    return `Görselin oranı uyumsuz. Gerekli boyut ${need} (${got}).`;
  return null;
}

export type SaveResult = { url: string } | { error: string };

export async function saveImage(file: File, req?: Req): Promise<SaveResult> {
  if (file.size === 0) return { error: "Dosya boş." };
  if (file.size > MAX_BYTES) return { error: "Dosya 5 MB'tan büyük." };
  const buf = Buffer.from(await file.arrayBuffer());
  const ext = detectExt(buf);
  if (!ext) return { error: "Yalnızca JPG, PNG veya WebP yüklenebilir." };
  if (req) {
    const problem = checkReq(imageSize(buf, ext), req);
    if (problem) return { error: problem };
  }
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
