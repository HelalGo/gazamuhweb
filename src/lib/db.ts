import mysql from "mysql2/promise";

const g = globalThis as unknown as { __pool?: mysql.Pool };

// Sadece sunucu tarafında (API route / server component) kullanılır.
export function db() {
  return (g.__pool ??= mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 5,
    connectTimeout: 5000,
    charset: "utf8mb4",
  }));
}
