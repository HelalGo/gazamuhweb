import { appUser, body, fail, json, preflight } from "@/lib/app-api";
import { clientIp } from "@/lib/ratelimit";
import { isSubscribed, setSubscribed } from "@/lib/newsletter";
import { getPrefs, isExpoToken, setPrefs } from "@/lib/push";

export const OPTIONS = preflight;
export const dynamic = "force-dynamic";

// İletişim tercihleri: push (kampanya / sipariş) cihaza ya da üyeye; e-posta kampanya izni yalnızca üyeye
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token");
  const user = await appUser(req);
  const push = await getPrefs({ userId: user?.id, token: token && isExpoToken(token) ? token : null });
  return json({ ...push, email: user ? await isSubscribed(user.email) : null });
}

export async function POST(req: Request) {
  const b = await body(req);
  const user = await appUser(req);
  const token = b.str("token", 255);
  const has = (k: string) => b.str(k, 5) !== "";
  try {
    await setPrefs({ userId: user?.id, token: isExpoToken(token) ? token : null }, {
      ...(has("marketing") ? { marketing: b.bool("marketing") } : {}),
      ...(has("orders") ? { orders: b.bool("orders") } : {}),
    });
    if (user && has("email")) await setSubscribed(user.email, b.bool("email"), await clientIp());
    return json({ ok: true });
  } catch (e) {
    console.error("[tercihler]", (e as Error).message);
    return fail("Tercihleriniz kaydedilemedi.", 500);
  }
}
