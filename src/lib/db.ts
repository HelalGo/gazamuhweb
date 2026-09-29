import mysql from "mysql2/promise";

const g = globalThis as unknown as { __pool?: mysql.Pool };

// Sadece sunucu tarafında (API route / server component) kullanılır.
// Paylaşımlı hosting'lerde MySQL sunucusu boştaki bağlantıları kapatır; havuz bunu şöyle karşılar:
// - boşta kalan bağlantılar 30 sn sonra kendisi kapatılır (sunucudan önce),
// - açık bağlantılara keep-alive gönderilir,
// - bağlantı kopması hatasında sorgu bir kez yeni bağlantıyla tekrarlanır.
function makePool() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 5,
    maxIdle: 2,
    idleTimeout: 30_000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10_000,
    connectTimeout: 5000,
    charset: "utf8mb4",
  });

  const retriable = (e: unknown) =>
    ["ECONNRESET", "PROTOCOL_CONNECTION_LOST", "EPIPE", "ETIMEDOUT"].includes((e as { code?: string }).code ?? "");

  const query = pool.query.bind(pool) as (...a: unknown[]) => Promise<unknown>;
  (pool as unknown as { query: unknown }).query = async (...args: unknown[]) => {
    try {
      return await query(...args);
    } catch (e) {
      if (!retriable(e)) throw e;
      return query(...args);
    }
  };
  return pool;
}

export function db() {
  return (g.__pool ??= makePool());
}
