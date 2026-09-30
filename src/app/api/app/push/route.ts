import { appUser, body, fail, json, preflight } from "@/lib/app-api";
import { isExpoToken, registerToken, unlinkToken } from "@/lib/push";

export const OPTIONS = preflight;

// Telefonun push adresini kaydeder (giriş yapılmışsa kullanıcıya bağlar). { token, platform, logout? }
export async function POST(req: Request) {
  const b = await body(req);
  const token = b.str("token", 255);
  if (!isExpoToken(token)) return fail("Geçersiz bildirim adresi.");
  try {
    if (b.bool("logout")) await unlinkToken(token);
    else await registerToken(token, b.str("platform", 10), (await appUser(req))?.id ?? null);
    return json({ ok: true });
  } catch (e) {
    console.error("[push kayıt]", (e as Error).message);
    return fail("Bildirim kaydı yapılamadı.", 500);
  }
}
