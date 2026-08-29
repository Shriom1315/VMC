import express from "express";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { pool, testConnection } from "./db.js";
import { initRedis, getCache, setCache, invalidateCache, isRedisHealthy } from "./redis.js";

dotenv.config();

export const app = express();

app.use(express.json({ limit: "50mb" }));

export const ALLOWED_TABLES = new Set([
  "parties",
  "gauges",
  "app_users",
  "calib_jobs",
  "dispatches",
  "invoices",
  "receipts",
  "equipments",
  "equipment_history",
  "quotations",
  "purchase_orders",
  "employees",
  "uncertainty_records",
  "inward_bills",
  "inward_items",
  "firms",
  "instrument_repairs",
  "thread_specs",
  "taper_readings",
  "reading_masters",
  "dial_table",
  "custom_po_rates",
  "rates",
  "scopes",
]);

// Helper to sanitize SQL column names against SQL injection
export function sanitizeIdentifier(name: string): string | null {
  if (/^[a-zA-Z0-9_]+$/.test(name)) {
    return name;
  }
  return null;
}

// API health endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "VMC Backend is running" });
});

// API status endpoint with DB and Redis health
app.get("/api/status", async (req, res) => {
  const pgConnected = await testConnection();
  const redisConnected = isRedisHealthy();
  res.json({
    status: "ok",
    mode: pgConnected ? "offline_local_postgres" : "server_cloud",
    postgresConnected: pgConnected,
    redisConnected: redisConnected,
    cacheTtlSeconds: parseInt(process.env.REDIS_TTL || "300", 10),
  });
});

// Purge cache endpoint
app.delete("/api/cache/:table?", async (req, res) => {
  const { table } = req.params;
  if (table) {
    await invalidateCache(`vmc:cache:${table}*`);
    res.json({ success: true, message: `Cache cleared for table ${table}` });
  } else {
    await invalidateCache("vmc:cache:*");
    res.json({ success: true, message: "All table cache cleared" });
  }
});

// Email delivery endpoint via Gmail SMTP
app.post("/api/send-email", async (req, res) => {
  const gmailUser = (process.env.GMAIL_USER || "").trim();
  const gmailPass = (process.env.GMAIL_APP_PASSWORD || "").trim().replace(/\s+/g, "");

  if (!gmailUser || !gmailPass || gmailUser.includes("your-email")) {
    return res.status(400).json({
      error: "GMAIL_USER and GMAIL_APP_PASSWORD are not configured in environment variables!",
    });
  }

  try {
    const { to, subject, html, attachments } = req.body || {};
    if (!to || !subject || !html) {
      return res.status(400).json({ error: "Missing required parameters (to, subject, html)" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailPass,
      },
    });

    const mailOptions: any = {
      from: `"Vikramaditya Metrology" <${gmailUser}>`,
      to,
      subject,
      html,
    };

    if (Array.isArray(attachments) && attachments.length > 0) {
      mailOptions.attachments = attachments.map((att: any) => ({
        filename: att.filename,
        content: Buffer.from(att.content, "base64"),
        contentType: att.type || "application/pdf",
      }));
    }

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: `Email sent to ${to}` });
  } catch (err: any) {
    console.error("Backend Gmail SMTP Send Error:", err);
    return res.status(500).json({ error: err.message || "Failed to send email via backend SMTP" });
  }
});

// Optimized GET endpoint for table rows with projection, filtering, pagination, and Redis caching
app.get("/api/db/:table", async (req, res) => {
  const { table } = req.params;
  if (!ALLOWED_TABLES.has(table)) {
    return res.status(400).json({ error: "Invalid table name" });
  }

  // Build a query-aware cache key
  const queryKeys = Object.keys(req.query).sort();
  const queryString = queryKeys.map((k) => `${k}=${req.query[k]}`).join("&");
  const cacheKey = queryString ? `vmc:cache:${table}:${queryString}` : `vmc:cache:${table}`;

  // 1. Check Redis Cache
  try {
    const cachedData = await getCache<any[]>(cacheKey);
    if (cachedData !== null) {
      res.setHeader("X-Cache", "HIT");
      return res.json(cachedData);
    }
  } catch (err: any) {
    console.warn(`[cache]: Error checking cache for ${table}:`, err.message);
  }

  // 2. Build Optimized Parameterized SQL Query
  try {
    // 2.1 Column Projection
    let selectClause = "*";
    if (req.query.select && typeof req.query.select === "string") {
      const cols = req.query.select
        .split(",")
        .map((c) => sanitizeIdentifier(c.trim()))
        .filter((c): c is string => c !== null);
      if (cols.length > 0) {
        selectClause = cols.map((c) => `"${c}"`).join(", ");
      }
    }

    // 2.2 WHERE Filters (?eq_col=val)
    const whereConditions: string[] = [];
    const values: any[] = [];

    for (const key of Object.keys(req.query)) {
      if (key.startsWith("eq_")) {
        const col = sanitizeIdentifier(key.replace("eq_", ""));
        if (col) {
          values.push(req.query[key]);
          whereConditions.push(`"${col}" = $${values.length}`);
        }
      }
    }

    let whereClause = "";
    if (whereConditions.length > 0) {
      whereClause = "WHERE " + whereConditions.join(" AND ");
    }

    // 2.3 ORDER BY
    let orderClause = "ORDER BY created_at DESC NULLS LAST";
    if (req.query.order && typeof req.query.order === "string") {
      const orderCol = sanitizeIdentifier(req.query.order);
      if (orderCol) {
        const isAsc = req.query.ascending === "true" || req.query.ascending === "1";
        orderClause = `ORDER BY "${orderCol}" ${isAsc ? "ASC" : "DESC"} NULLS LAST`;
      }
    }

    // 2.4 Pagination (LIMIT / OFFSET)
    let limitClause = "";
    if (req.query.limit && !isNaN(parseInt(req.query.limit as string, 10))) {
      values.push(parseInt(req.query.limit as string, 10));
      limitClause = `LIMIT $${values.length}`;

      if (req.query.offset && !isNaN(parseInt(req.query.offset as string, 10))) {
        values.push(parseInt(req.query.offset as string, 10));
        limitClause += ` OFFSET $${values.length}`;
      }
    }

    const queryStr = `SELECT ${selectClause} FROM ${table} ${whereClause} ${orderClause} ${limitClause}`.trim();
    const result = await pool.query(queryStr, values);
    const rows = result.rows;

    // Cache the result for 5 minutes (300 seconds)
    await setCache(cacheKey, rows, parseInt(process.env.REDIS_TTL || "300", 10));

    res.setHeader("X-Cache", "MISS");
    res.json(rows);
  } catch (err: any) {
    console.error(`Error querying ${table}:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// Optimized POST endpoint with Single & Bulk multi-row insertion support
app.post("/api/db/:table", async (req, res) => {
  const { table } = req.params;
  if (!ALLOWED_TABLES.has(table)) {
    return res.status(400).json({ error: "Invalid table name" });
  }

  const payload = req.body;
  if (!payload || (Array.isArray(payload) && payload.length === 0)) {
    return res.status(400).json({ error: "Payload cannot be empty" });
  }

  try {
    // 1. Bulk Multi-Row Insertion
    if (Array.isArray(payload)) {
      const firstRow = payload[0];
      const cols = Object.keys(firstRow)
        .map((k) => sanitizeIdentifier(k))
        .filter((k): k is string => k !== null);

      if (cols.length === 0) {
        return res.status(400).json({ error: "Invalid column names in bulk payload" });
      }

      const colsSql = cols.map((c) => `"${c}"`).join(", ");
      const values: any[] = [];
      const rowPlaceholders: string[] = [];

      for (const row of payload) {
        const placeholders: string[] = [];
        for (const col of cols) {
          values.push(row[col] !== undefined ? row[col] : null);
          placeholders.push(`$${values.length}`);
        }
        rowPlaceholders.push(`(${placeholders.join(", ")})`);
      }

      const queryStr = `INSERT INTO ${table} (${colsSql}) VALUES ${rowPlaceholders.join(", ")} RETURNING *`;
      const result = await pool.query(queryStr, values);

      // Invalidate all query caches for this table
      await invalidateCache(`vmc:cache:${table}*`);

      return res.status(201).json(result.rows);
    }

    // 2. Single-Row Insertion
    const keys = Object.keys(payload)
      .map((k) => sanitizeIdentifier(k))
      .filter((k): k is string => k !== null);

    if (keys.length === 0) {
      return res.status(400).json({ error: "Invalid column names in payload" });
    }

    const cols = keys.map((k) => `"${k}"`).join(", ");
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
    const values = keys.map((k) => payload[k]);

    const queryStr = `INSERT INTO ${table} (${cols}) VALUES (${placeholders}) RETURNING *`;
    const result = await pool.query(queryStr, values);

    // Invalidate all query caches for this table
    await invalidateCache(`vmc:cache:${table}*`);

    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    console.error(`Error inserting into ${table}:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// Generic PUT endpoint to update a row by ID and invalidate table cache
app.put("/api/db/:table/:id", async (req, res) => {
  const { table, id } = req.params;
  if (!ALLOWED_TABLES.has(table)) {
    return res.status(400).json({ error: "Invalid table name" });
  }
  const body = { ...req.body };
  delete body.id; // remove id from update payload

  const keys = Object.keys(body)
    .map((k) => sanitizeIdentifier(k))
    .filter((k): k is string => k !== null);

  if (keys.length === 0) {
    return res.status(400).json({ error: "Payload cannot be empty" });
  }

  const setClause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(", ");
  const values = [...keys.map((k) => body[k]), id];
  const idPlaceholder = `$${keys.length + 1}`;

  try {
    const queryStr = `UPDATE ${table} SET ${setClause} WHERE id = ${idPlaceholder} RETURNING *`;
    const result = await pool.query(queryStr, values);

    // Invalidate all query caches for this table
    await invalidateCache(`vmc:cache:${table}*`);

    res.json(result.rows[0] || null);
  } catch (err: any) {
    console.error(`Error updating ${table}:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// Generic DELETE endpoint and invalidate table cache
app.delete("/api/db/:table/:id", async (req, res) => {
  const { table, id } = req.params;
  if (!ALLOWED_TABLES.has(table)) {
    return res.status(400).json({ error: "Invalid table name" });
  }
  try {
    await pool.query(`DELETE FROM ${table} WHERE id = $1`, [id]);

    // Invalidate all query caches for this table
    await invalidateCache(`vmc:cache:${table}*`);

    res.json({ success: true });
  } catch (err: any) {
    console.error(`Error deleting from ${table}:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// Serve frontend static build if available
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const candidates = [
  path.resolve(__dirname, "../../frontend/dist"),
  path.resolve(__dirname, "../../../frontend/dist"),
  path.resolve(process.cwd(), "frontend/dist"),
];

const staticPath = candidates.find((p) => fs.existsSync(p));

if (staticPath) {
  app.use(express.static(staticPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(staticPath, "index.html"));
  });
}
