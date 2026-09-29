import { randomBytes, scrypt as scryptCb, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { redirect } from "next/navigation";
import type { RowDataPacket } from "mysql2";
import { db } from "./db";
import { clearSession, readSession, setSession } from "./session";

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;
const COOKIE = "gaza_admin";
const MAX_AGE = 60 * 60 * 12; // 12 saat

export async function hashPassword(pw: string) {
  const salt = randomBytes(16);
  const hash = await scrypt(pw, salt, 64);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export async function verifyPassword(pw: string, stored: string) {
  const [, saltHex, hashHex] = stored.split("$");
  if (!saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = await scrypt(pw, Buffer.from(saltHex, "hex"), expected.length);
  return timingSafeEqual(actual, expected);
}

export async function createSession(adminId: number) {
  await setSession(COOKIE, "admin", adminId, MAX_AGE);
}

export async function destroySession() {
  await clearSession(COOKIE);
}

export type Admin = { id: number; email: string; name: string };

export async function getAdmin(): Promise<Admin | null> {
  const id = await readSession(COOKIE, "admin");
  if (!id) return null;
  try {
    const [rows] = await db().query<(RowDataPacket & Admin)[]>("SELECT id, email, name FROM admins WHERE id = ? AND active = 1", [id]);
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

// Her admin sayfasında ve her server action'da çağrılır.
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
