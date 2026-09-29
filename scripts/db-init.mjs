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

await c.query(`CREATE TABLE IF NOT EXISTS hero_slides (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sort_order INT NOT NULL DEFAULT 0,
  active TINYINT(1) NOT NULL DEFAULT 1,
  image_url VARCHAR(500) NULL,
  mobile_image_url VARCHAR(500) NULL,
  overlay TINYINT(1) NOT NULL DEFAULT 1,
  eyebrow VARCHAR(80) NULL,
  title VARCHAR(200) NOT NULL DEFAULT '',
  text VARCHAR(400) NULL,
  btn1_label VARCHAR(60) NULL, btn1_url VARCHAR(500) NULL,
  btn2_label VARCHAR(60) NULL, btn2_url VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4`);

await c.query(`CREATE TABLE IF NOT EXISTS showcase_tiles (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sort_order INT NOT NULL DEFAULT 0,
  active TINYINT(1) NOT NULL DEFAULT 1,
  image_url VARCHAR(500) NULL,
  title VARCHAR(80) NOT NULL DEFAULT '',
  url VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4`);

await c.query(`CREATE TABLE IF NOT EXISTS campaign_blocks (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  sort_order INT NOT NULL DEFAULT 0,
  active TINYINT(1) NOT NULL DEFAULT 1,
  title VARCHAR(120) NULL,
  layout VARCHAR(20) NOT NULL,
  items JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4`);

await c.query(`CREATE TABLE IF NOT EXISTS orders (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  total DECIMAL(12,2) NOT NULL,
  full_name VARCHAR(160) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  email VARCHAR(190) NOT NULL,
  city VARCHAR(80) NOT NULL,
  address TEXT NOT NULL,
  note TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user (user_id),
  INDEX idx_status (status)
) CHARACTER SET utf8mb4`);

await c.query(`CREATE TABLE IF NOT EXISTS order_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NULL,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(12,2) NOT NULL,
  qty INT UNSIGNED NOT NULL,
  INDEX idx_order (order_id),
  INDEX idx_product (product_id)
) CHARACTER SET utf8mb4`);

await c.query(`CREATE TABLE IF NOT EXISTS reviews (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  rating TINYINT UNSIGNED NOT NULL,
  comment TEXT NOT NULL,
  active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_review (product_id, user_id),
  INDEX idx_product (product_id, active)
) CHARACTER SET utf8mb4`);

await c.query(`CREATE TABLE IF NOT EXISTS favorites (
  user_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, product_id)
) CHARACTER SET utf8mb4`);

console.log("Tablolar hazır: products, admins, users, hero_slides, showcase_tiles, campaign_blocks, orders, order_items, reviews, favorites");
await c.end();
