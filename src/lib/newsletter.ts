import { randomBytes } from "node:crypto";
import type { RowDataPacket } from "mysql2";
import { db } from "./db";

// Bülten aboneleri. Tablo ilk kullanımda oluşturulur. Açık rıza zamanı ve IP, ticari ileti mevzuatı gereği saklanır.
let ready = false;
export async function ensureSubscribers() {
  if (ready) return;
  await db().query(`CREATE TABLE IF NOT EXISTS subscribers (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(190) NOT NULL UNIQUE,
    token CHAR(32) NOT NULL,
    active TINYINT(1) NOT NULL DEFAULT 1,
    consent_ip VARCHAR(64) NULL,
    consent_at TIMESTAMP NULL,
    unsubscribed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) CHARACTER SET utf8mb4`);
  ready = true;
}

// Yeni abone veya daha önce çıkmış birinin yeniden katılımı. Zaten aktifse "exists" döner.
export async function subscribe(email: string, ip: string): Promise<{ status: "new" | "exists"; token: string }> {
  await ensureSubscribers();
  const [rows] = await db().query<RowDataPacket[]>("SELECT token, active FROM subscribers WHERE email = ?", [email]);
  if (rows[0]?.active) return { status: "exists", token: rows[0].token };
  const token = rows[0]?.token ?? randomBytes(16).toString("hex");
  await db().query(
    `INSERT INTO subscribers (email, token, active, consent_ip, consent_at) VALUES (?, ?, 1, ?, NOW())
     ON DUPLICATE KEY UPDATE active = 1, consent_ip = VALUES(consent_ip), consent_at = NOW(), unsubscribed_at = NULL`,
    [email, token, ip]
  );
  return { status: "new", token };
}

export async function unsubscribe(token: string) {
  if (!/^[a-f0-9]{32}$/.test(token)) return false;
  await ensureSubscribers();
  const [res] = await db().query<import("mysql2").ResultSetHeader>(
    "UPDATE subscribers SET active = 0, unsubscribed_at = NOW() WHERE token = ? AND active = 1", [token]);
  return res.affectedRows > 0;
}
