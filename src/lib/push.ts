import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { db } from "./db";
import { SITE_URL } from "./mail";

/*
  Mobil uygulama bildirimleri (Expo Push). Her telefon açılışta kendi Expo push adresini (token) kaydeder;
  giriş yapılmışsa token kullanıcıya bağlanır.
  Tercihler: marketing = kampanya ve duyurular, orders = sipariş durumu bildirimleri.
  Üye tercihleri users tablosunda tutulur ve üyenin tüm cihazlarına uygulanır; üye olmayan cihazın tercihi cihazda durur.
*/

let ready = false;
export async function ensurePushTables() {
  if (ready) return;
  await db().query(`CREATE TABLE IF NOT EXISTS push_tokens (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id INT UNSIGNED NULL,
    platform VARCHAR(10) NULL,
    marketing TINYINT(1) NOT NULL DEFAULT 1,
    orders TINYINT(1) NOT NULL DEFAULT 1,
    active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id)
  ) CHARACTER SET utf8mb4`);
  await db().query(`CREATE TABLE IF NOT EXISTS push_messages (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(120) NOT NULL,
    body VARCHAR(400) NOT NULL,
    image_url VARCHAR(500) NULL,
    target VARCHAR(300) NULL,
    audience VARCHAR(20) NOT NULL DEFAULT 'all',
    sent INT UNSIGNED NOT NULL DEFAULT 0,
    ok INT UNSIGNED NOT NULL DEFAULT 0,
    failed INT UNSIGNED NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) CHARACTER SET utf8mb4`);
  const [cols] = await db().query<RowDataPacket[]>(
    "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'");
  const have = new Set(cols.map((c) => c.COLUMN_NAME as string));
  const add: string[] = [];
  if (!have.has("push_marketing")) add.push("ADD COLUMN push_marketing TINYINT(1) NOT NULL DEFAULT 1");
  if (!have.has("push_orders")) add.push("ADD COLUMN push_orders TINYINT(1) NOT NULL DEFAULT 1");
  if (add.length && have.size) await db().query(`ALTER TABLE users ${add.join(", ")}`);
  ready = true;
}

export const isExpoToken = (t: string) => /^(ExponentPushToken|ExpoPushToken)\[[A-Za-z0-9_-]{10,}\]$/.test(t);

// Cihaz kaydı: token yeni ise eklenir; giriş yapılmışsa kullanıcıya bağlanır ve üyenin tercihlerini alır
export async function registerToken(token: string, platform: string, userId: number | null) {
  await ensurePushTables();
  let prefs: { marketing: number; orders: number } | null = null;
  if (userId) {
    const [u] = await db().query<RowDataPacket[]>("SELECT push_marketing, push_orders FROM users WHERE id = ?", [userId]);
    if (u[0]) prefs = { marketing: u[0].push_marketing, orders: u[0].push_orders };
  }
  await db().query(
    `INSERT INTO push_tokens (token, user_id, platform, marketing, orders) VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE user_id = COALESCE(VALUES(user_id), user_id), platform = VALUES(platform), active = 1, last_seen_at = NOW()
     ${prefs ? ", marketing = VALUES(marketing), orders = VALUES(orders)" : ""}`,
    [token, userId, platform.slice(0, 10), prefs?.marketing ?? 1, prefs?.orders ?? 1]
  );
}

// Çıkış yapınca cihaz kullanıcıdan ayrılır (sipariş bildirimleri artık o telefona gitmez)
export async function unlinkToken(token: string) {
  await ensurePushTables();
  await db().query("UPDATE push_tokens SET user_id = NULL WHERE token = ?", [token]);
}

export type PushPrefs = { marketing: boolean; orders: boolean };

export async function getPrefs(opts: { userId?: number | null; token?: string | null }): Promise<PushPrefs> {
  await ensurePushTables();
  if (opts.userId) {
    const [u] = await db().query<RowDataPacket[]>("SELECT push_marketing, push_orders FROM users WHERE id = ?", [opts.userId]);
    if (u[0]) return { marketing: !!u[0].push_marketing, orders: !!u[0].push_orders };
  }
  if (opts.token) {
    const [t] = await db().query<RowDataPacket[]>("SELECT marketing, orders FROM push_tokens WHERE token = ?", [opts.token]);
    if (t[0]) return { marketing: !!t[0].marketing, orders: !!t[0].orders };
  }
  return { marketing: true, orders: true };
}

export async function setPrefs(opts: { userId?: number | null; token?: string | null }, p: Partial<PushPrefs>) {
  await ensurePushTables();
  const v: Record<string, number> = {};
  if (p.marketing !== undefined) v.marketing = p.marketing ? 1 : 0;
  if (p.orders !== undefined) v.orders = p.orders ? 1 : 0;
  if (!Object.keys(v).length) return;
  if (opts.userId) {
    const uv: Record<string, number> = {};
    if (v.marketing !== undefined) uv.push_marketing = v.marketing;
    if (v.orders !== undefined) uv.push_orders = v.orders;
    await db().query("UPDATE users SET ? WHERE id = ?", [uv, opts.userId]);
    await db().query("UPDATE push_tokens SET ? WHERE user_id = ?", [v, opts.userId]);
  }
  if (opts.token) await db().query("UPDATE push_tokens SET ? WHERE token = ?", [v, opts.token]);
}

export type PushMessage = { title: string; body: string; image?: string | null; url?: string | null };

// Expo Push API'sine 100'lük gruplar hâlinde gönderir; kayıtlı olmayan cihazları pasifler
export async function sendPush(tokens: string[], m: PushMessage) {
  const list = [...new Set(tokens)].filter(isExpoToken);
  let ok = 0, failed = 0;
  const image = m.image ? (m.image.startsWith("http") ? m.image : SITE_URL + m.image) : undefined;
  for (let i = 0; i < list.length; i += 100) {
    const chunk = list.slice(i, i + 100);
    const payload = chunk.map((to) => ({
      to, title: m.title, body: m.body, sound: "default", channelId: "default",
      data: { url: m.url ?? "" },
      ...(image ? { richContent: { image }, mutableContent: true } : {}),
    }));
    try {
      const res = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", Accept: "application/json",
          ...(process.env.EXPO_ACCESS_TOKEN ? { Authorization: `Bearer ${process.env.EXPO_ACCESS_TOKEN}` } : {}),
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(20_000),
      });
      const json = (await res.json().catch(() => ({}))) as { data?: { status: string; details?: { error?: string } }[] };
      const data = json.data ?? [];
      const dead: string[] = [];
      chunk.forEach((t, k) => {
        const r = data[k];
        if (r?.status === "ok") ok++;
        else { failed++; if (r?.details?.error === "DeviceNotRegistered") dead.push(t); }
      });
      if (dead.length) await db().query("UPDATE push_tokens SET active = 0 WHERE token IN (?)", [dead]);
    } catch (e) {
      console.error("[push]", (e as Error).message);
      failed += chunk.length;
    }
  }
  return { sent: list.length, ok, failed };
}

// Admin panelinden toplu bildirim: kampanya bildirimlerini kapatanlara gitmez
export async function broadcast(m: PushMessage & { audience: "all" | "members" }) {
  await ensurePushTables();
  const [rows] = await db().query<RowDataPacket[]>(
    `SELECT token FROM push_tokens WHERE active = 1 AND marketing = 1 ${m.audience === "members" ? "AND user_id IS NOT NULL" : ""}`);
  const r = await sendPush(rows.map((x) => x.token), m);
  await db().query<ResultSetHeader>(
    "INSERT INTO push_messages (title, body, image_url, target, audience, sent, ok, failed) VALUES (?,?,?,?,?,?,?,?)",
    [m.title, m.body, m.image ?? null, m.url ?? null, m.audience, r.sent, r.ok, r.failed]);
  return r;
}

// Sipariş durumu bildirimi: yalnızca siparişin sahibinin, sipariş bildirimlerini açık bırakmış cihazlarına
export async function pushToUser(userId: number, m: PushMessage) {
  await ensurePushTables();
  const [rows] = await db().query<RowDataPacket[]>("SELECT token FROM push_tokens WHERE active = 1 AND orders = 1 AND user_id = ?", [userId]);
  if (!rows.length) return { sent: 0, ok: 0, failed: 0 };
  return sendPush(rows.map((x) => x.token), m);
}

export async function pushStats() {
  await ensurePushTables();
  const [r] = await db().query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total, SUM(marketing = 1) AS marketing, SUM(user_id IS NOT NULL) AS members,
            SUM(marketing = 1 AND user_id IS NOT NULL) AS members_marketing
     FROM push_tokens WHERE active = 1`);
  return { total: Number(r[0].total ?? 0), marketing: Number(r[0].marketing ?? 0), members: Number(r[0].members ?? 0), membersMarketing: Number(r[0].members_marketing ?? 0) };
}
