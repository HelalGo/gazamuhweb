// Kullanım: npm run admin:create -- <eposta> <parola> "<Ad Soyad>"
import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import mysql from "mysql2/promise";

const [email, password, name = ""] = process.argv.slice(2);
if (!email || !password || password.length < 8) {
  console.error('Kullanım: npm run admin:create -- eposta@ornek.com "en-az-8-karakter" "Ad Soyad"');
  process.exit(1);
}

const salt = randomBytes(16);
const hash = await promisify(scrypt)(password, salt, 64);
const stored = `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;

const c = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});
await c.query(
  "INSERT INTO admins (email, name, password_hash) VALUES (?,?,?) ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash), name = VALUES(name), active = 1",
  [email.toLowerCase(), name, stored]
);
console.log(`Admin hazır: ${email}`);
await c.end();
