// Kullanım: npm run db:init  — tabloları oluşturur (varsa dokunmaz)
import mysql from "mysql2/promise";

const c = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: "utf8mb4",
});

await c.query(`CREATE TABLE IF NOT EXISTS products (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(255) NOT NULL UNIQUE,
  sku VARCHAR(80) NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(80) NULL,
  category VARCHAR(80) NULL,
  product_group VARCHAR(80) NULL,
  price DECIMAL(12,2) NOT NULL DEFAULT 0, -- 0 = "fiyat için arayın"
  old_price DECIMAL(12,2) NULL,
  in_stock TINYINT(1) NOT NULL DEFAULT 1,
  description TEXT NULL,
  specs JSON NULL,
  image_url VARCHAR(500) NULL,
  source_image_url VARCHAR(500) NULL,
  source_url VARCHAR(500) NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_brand (brand)
) CHARACTER SET utf8mb4`);

await c.query(`CREATE TABLE IF NOT EXISTS admins (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(190) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL DEFAULT '',
  password_hash VARCHAR(255) NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4`);

await c.query(`CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  phone VARCHAR(30) NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4`);

console.log("Tablolar hazır: products, admins, users");
await c.end();
