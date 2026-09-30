"use server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { ensureAppBannerTable, ensureBrandTable, ensureOnboardingTable } from "@/lib/cms";
import { db } from "@/lib/db";
import { APP_BANNER_REQ, BRAND_REQ, CAMPAIGN_LAYOUTS, ONBOARD_REQ, HERO_MOBILE_REQ, HERO_REQ, TILE_REQ, safeUrl, type CampaignLayout } from "@/lib/layouts";
import { removeImage, saveImage, type Req } from "@/lib/uploads";

const str = (f: FormData, k: string, max: number) => String(f.get(k) ?? "").trim().slice(0, max) || null;
const back = (path: string, err: string): never => redirect(`${path}?err=${encodeURIComponent(err)}`);

type Table = "hero_slides" | "showcase_tiles" | "campaign_blocks" | "brand_logos" | "app_onboarding" | "app_banners";

async function nextOrder(table: Table) {
  const [r] = await db().query<RowDataPacket[]>(`SELECT COALESCE(MAX(sort_order), 0) + 1 AS n FROM ${table}`);
  return r[0].n as number;
}

// Dosya seçildiyse doğrular ve kaydeder. Seçilmediyse null döner.
async function upload(f: FormData, key: string, req: Req, errPath: string): Promise<string | null> {
  const file = f.get(key);
  if (!(file instanceof File) || file.size === 0) return null;
  const res = await saveImage(file, req);
  if ("error" in res) return back(errPath, res.error);
  return res.url;
}

/* ---------- Slider ---------- */
export async function saveSlide(f: FormData) {
  await requireAdmin();
  const id = Number(f.get("id")) || null;
  const errPath = id ? `/admin/slider/${id}` : "/admin/slider/new";
  const [old] = id ? await db().query<RowDataPacket[]>("SELECT image_url, mobile_image_url FROM hero_slides WHERE id = ?", [id]) : [[] as RowDataPacket[]];

  const image = await upload(f, "image", HERO_REQ, errPath);
  const mobile = await upload(f, "mobile_image", HERO_MOBILE_REQ, errPath);
  if (!id && !image) back(errPath, "Slayt için bir görsel yüklemelisiniz.");

  const btn = (n: 1 | 2) => {
    const label = str(f, `btn${n}_label`, 60);
    const url = safeUrl(f.get(`btn${n}_url`));
    return label && url ? [label, url] : [null, null];
  };
  const [b1l, b1u] = btn(1);
  const [b2l, b2u] = btn(2);
  const v: Record<string, unknown> = {
    eyebrow: str(f, "eyebrow", 80), title: str(f, "title", 200) ?? "", text: str(f, "text", 400),
    btn1_label: b1l, btn1_url: b1u, btn2_label: b2l, btn2_url: b2u,
    overlay: f.get("overlay") ? 1 : 0, active: f.get("active") ? 1 : 0,
  };
  if (image) { v.image_url = image; await removeImage(old[0]?.image_url); }
  if (mobile) { v.mobile_image_url = mobile; await removeImage(old[0]?.mobile_image_url); }
  if (f.get("remove_mobile") && !mobile) { await removeImage(old[0]?.mobile_image_url); v.mobile_image_url = null; }

  if (id) await db().query("UPDATE hero_slides SET ? WHERE id = ?", [v, id]);
  else await db().query("INSERT INTO hero_slides SET ?", [{ ...v, sort_order: await nextOrder("hero_slides") }]);
  redirect("/admin/slider?saved=1");
}

/* ---------- Vitrin kartları ---------- */
export async function saveTile(f: FormData) {
  await requireAdmin();
  const id = Number(f.get("id")) || null;
  const errPath = id ? `/admin/vitrin/${id}` : "/admin/vitrin/new";
  const [old] = id ? await db().query<RowDataPacket[]>("SELECT image_url FROM showcase_tiles WHERE id = ?", [id]) : [[] as RowDataPacket[]];

  const image = await upload(f, "image", TILE_REQ, errPath);
  if (!id && !image) back(errPath, "Kart için bir görsel yüklemelisiniz.");
  const title = str(f, "title", 80);
  if (!title) back(errPath, "Başlık zorunlu.");

  const v: Record<string, unknown> = { title, url: safeUrl(f.get("url")) ?? "/urunler", active: f.get("active") ? 1 : 0 };
  if (image) { v.image_url = image; await removeImage(old[0]?.image_url); }

  if (id) await db().query("UPDATE showcase_tiles SET ? WHERE id = ?", [v, id]);
  else await db().query("INSERT INTO showcase_tiles SET ?", [{ ...v, sort_order: await nextOrder("showcase_tiles") }]);
  redirect("/admin/vitrin?saved=1");
}

/* ---------- Marka logoları ---------- */
export async function saveBrand(f: FormData) {
  await requireAdmin();
  await ensureBrandTable();
  const id = Number(f.get("id")) || null;
  const errPath = id ? `/admin/markalar/${id}` : "/admin/markalar/new";
  const [old] = id ? await db().query<RowDataPacket[]>("SELECT image_url FROM brand_logos WHERE id = ?", [id]) : [[] as RowDataPacket[]];

  const name = str(f, "name", 80);
  if (!name) back(errPath, "Marka adı zorunlu.");
  const image = await upload(f, "image", BRAND_REQ, errPath);
  if (!id && !image) back(errPath, "Marka için bir logo yüklemelisiniz.");

  const v: Record<string, unknown> = { name, active: f.get("active") ? 1 : 0 };
  if (image) { v.image_url = image; await removeImage(old[0]?.image_url); }

  if (id) await db().query("UPDATE brand_logos SET ? WHERE id = ?", [v, id]);
  else await db().query("INSERT INTO brand_logos SET ?", [{ ...v, sort_order: await nextOrder("brand_logos") }]);
  redirect("/admin/markalar?saved=1");
}

/* ---------- Mobil uygulama tanıtım ekranları ---------- */
export async function saveOnboarding(f: FormData) {
  await requireAdmin();
  await ensureOnboardingTable();
  const id = Number(f.get("id")) || null;
  const errPath = id ? `/admin/uygulama-tanitim/${id}` : "/admin/uygulama-tanitim/new";
  const [old] = id ? await db().query<RowDataPacket[]>("SELECT image_url FROM app_onboarding WHERE id = ?", [id]) : [[] as RowDataPacket[]];

  const title = str(f, "title", 120);
  if (!title) back(errPath, "Başlık zorunlu.");
  const image = await upload(f, "image", ONBOARD_REQ, errPath);
  if (!id && !image) back(errPath, "Tanıtım sayfası için bir görsel yüklemelisiniz.");

  const v: Record<string, unknown> = { title, text: str(f, "text", 400), active: f.get("active") ? 1 : 0 };
  if (image) { v.image_url = image; await removeImage(old[0]?.image_url); }

  if (id) await db().query("UPDATE app_onboarding SET ? WHERE id = ?", [v, id]);
  else await db().query("INSERT INTO app_onboarding SET ?", [{ ...v, sort_order: await nextOrder("app_onboarding") }]);
  redirect("/admin/uygulama-tanitim?saved=1");
}

/* ---------- Mobil uygulama ana sayfa bannerları ---------- */
export async function saveAppBanner(f: FormData) {
  await requireAdmin();
  await ensureAppBannerTable();
  const id = Number(f.get("id")) || null;
  const errPath = id ? `/admin/uygulama-banner/${id}` : "/admin/uygulama-banner/new";
  const [old] = id ? await db().query<RowDataPacket[]>("SELECT image_url FROM app_banners WHERE id = ?", [id]) : [[] as RowDataPacket[]];

  const image = await upload(f, "image", APP_BANNER_REQ, errPath);
  if (!id && !image) back(errPath, "Banner için bir görsel yüklemelisiniz.");

  // Bağlantı: özel site adresi yazıldıysa o, yoksa listeden seçilen uygulama sayfası
  const custom = String(f.get("target_url") ?? "").trim();
  let target = String(f.get("target") ?? "");
  if (custom) {
    const url = safeUrl(custom);
    if (!url) back(errPath, "Site adresi / ile başlamalı (örn. /urun/...) ya da https:// ile tam adres olmalı.");
    target = url!;
  } else if (target !== "kampanyalar" && !target.startsWith("kategori:")) target = "";

  const v: Record<string, unknown> = { title: str(f, "title", 120), text: str(f, "text", 200), target: target.slice(0, 300) || null, active: f.get("active") ? 1 : 0 };
  if (image) { v.image_url = image; await removeImage(old[0]?.image_url); }

  if (id) await db().query("UPDATE app_banners SET ? WHERE id = ?", [v, id]);
  else await db().query("INSERT INTO app_banners SET ?", [{ ...v, sort_order: await nextOrder("app_banners") }]);
  redirect("/admin/uygulama-banner?saved=1");
}

/* ---------- Kampanya blokları ---------- */
export async function saveCampaign(f: FormData) {
  await requireAdmin();
  const id = Number(f.get("id")) || null;
  const errPath = id ? `/admin/kampanyalar/${id}` : "/admin/kampanyalar/new";
  const layout = String(f.get("layout")) as CampaignLayout;
  const def = CAMPAIGN_LAYOUTS[layout];
  if (!def) back(errPath, "Geçersiz yerleşim.");

  const [old] = id ? await db().query<RowDataPacket[]>("SELECT layout, items FROM campaign_blocks WHERE id = ?", [id]) : [[] as RowDataPacket[]];
  const oldItems: { image_url: string }[] = old[0] ? (typeof old[0].items === "string" ? JSON.parse(old[0].items) : old[0].items) : [];
  const oldSame = !!old[0] && old[0].layout === layout;

  const items = [];
  for (let i = 0; i < def.slots.length; i++) {
    const uploaded = await upload(f, `image_${i}`, def.slots[i].req, errPath);
    const keep = oldSame ? oldItems[i]?.image_url : undefined;
    const image_url = uploaded ?? keep;
    if (!image_url) back(errPath, `"${def.slots[i].name}" için görsel yüklemelisiniz (${def.slots[i].req.w}×${def.slots[i].req.h} px).`);
    if (uploaded && keep) await removeImage(keep);
    items.push({ image_url: image_url!, url: safeUrl(f.get(`url_${i}`)), alt: str(f, `alt_${i}`, 120) ?? "" });
  }
  // yerleşim değişip eski görseller kullanılmadıysa temizle
  if (!oldSame) for (const o of oldItems) await removeImage(o.image_url);

  const v = { title: str(f, "title", 120), layout, items: JSON.stringify(items), active: f.get("active") ? 1 : 0 };
  if (id) await db().query("UPDATE campaign_blocks SET ? WHERE id = ?", [v, id]);
  else await db().query("INSERT INTO campaign_blocks SET ?", [{ ...v, sort_order: await nextOrder("campaign_blocks") }]);
  redirect("/admin/kampanyalar?saved=1");
}

/* ---------- Ortak: sil / sırala / göster-gizle ---------- */
const PATHS: Record<Table, string> = {
  hero_slides: "/admin/slider", showcase_tiles: "/admin/vitrin", campaign_blocks: "/admin/kampanyalar", brand_logos: "/admin/markalar",
  app_onboarding: "/admin/uygulama-tanitim", app_banners: "/admin/uygulama-banner",
};
const isTable = (t: unknown): t is Table => typeof t === "string" && t in PATHS;

async function imagesOf(table: Table, id: number): Promise<string[]> {
  const [r] = await db().query<RowDataPacket[]>(`SELECT * FROM ${table} WHERE id = ?`, [id]);
  const row = r[0];
  if (!row) return [];
  if (table === "campaign_blocks") return (typeof row.items === "string" ? JSON.parse(row.items) : row.items).map((i: { image_url: string }) => i.image_url);
  return [row.image_url, row.mobile_image_url].filter(Boolean);
}

export async function deleteItem(f: FormData) {
  await requireAdmin();
  const table = f.get("table");
  const id = Number(f.get("id"));
  if (!isTable(table)) return;
  for (const url of await imagesOf(table, id)) await removeImage(url);
  await db().query(`DELETE FROM ${table} WHERE id = ?`, [id]);
  redirect(PATHS[table]);
}

export async function moveItem(f: FormData) {
  await requireAdmin();
  const table = f.get("table");
  if (!isTable(table)) return;
  const id = Number(f.get("id"));
  const dir = f.get("dir") === "up" ? -1 : 1;
  const [rows] = await db().query<RowDataPacket[]>(`SELECT id FROM ${table} ORDER BY sort_order, id`);
  const ids = rows.map((r) => r.id as number);
  const i = ids.indexOf(id);
  const j = i + dir;
  if (i < 0 || j < 0 || j >= ids.length) return redirect(PATHS[table]);
  [ids[i], ids[j]] = [ids[j], ids[i]];
  for (let k = 0; k < ids.length; k++) await db().query(`UPDATE ${table} SET sort_order = ? WHERE id = ?`, [k + 1, ids[k]]);
  redirect(PATHS[table]);
}

export async function toggleItem(f: FormData) {
  await requireAdmin();
  const table = f.get("table");
  if (!isTable(table)) return;
  await db().query(`UPDATE ${table} SET active = 1 - active WHERE id = ?`, [Number(f.get("id"))]);
  redirect(PATHS[table]);
}
