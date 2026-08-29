import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

export const pool = new Pool(
  connectionString
    ? {
        connectionString,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 3000,
      }
    : {
        host: process.env.POSTGRES_HOST || "localhost",
        port: parseInt(process.env.POSTGRES_PORT || "5432", 10),
        database: process.env.POSTGRES_DB || "vmc_db",
        user: process.env.POSTGRES_USER || "vmc_user",
        password: process.env.POSTGRES_PASSWORD || "vmc_password",
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 3000,
      }
);

let isDbConnected = false;

pool.on("error", (err) => {
  console.error("❌ Unexpected error on idle PostgreSQL client", err);
});

export async function testConnection(): Promise<boolean> {
  try {
    const client = await pool.connect();
    const res = await client.query("SELECT NOW()");
    client.release();
    isDbConnected = true;
    console.log("✅ Local PostgreSQL connected at:", res.rows[0].now);
    return true;
  } catch (err: any) {
    isDbConnected = false;
    console.warn("⚠️ Local PostgreSQL unavailable:", err.message);
    return false;
  }
}

export function isPostgresConnected(): boolean {
  return isDbConnected;
}
