import express from "express";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { pool, testConnection } from "./db.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

app.use(express.json({ limit: "50mb" }));

const ALLOWED_TABLES = new Set([
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

// API health endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "VMC Backend is running" });
});

// API status endpoint
app.get("/api/status", async (req, res) => {
  const pgConnected = await testConnection();
  res.json({
    status: "ok",
    mode: pgConnected ? "offline_local_postgres" : "server_cloud",
    postgresConnected: pgConnected,
  });
});

// Generic GET endpoint for table rows
app.get("/api/db/:table", async (req, res) => {
  const { table } = req.params;
  if (!ALLOWED_TABLES.has(table)) {
    return res.status(400).json({ error: "Invalid table name" });
  }
  try {
    const result = await pool.query(`SELECT * FROM ${table} ORDER BY created_at DESC NULLS LAST`);
    res.json(result.rows);
  } catch (err: any) {
    console.error(`Error querying ${table}:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// Generic POST endpoint to insert a row
app.post("/api/db/:table", async (req, res) => {
  const { table } = req.params;
  if (!ALLOWED_TABLES.has(table)) {
    return res.status(400).json({ error: "Invalid table name" });
  }
  const body = req.body;
  const keys = Object.keys(body);
  if (keys.length === 0) {
    return res.status(400).json({ error: "Payload cannot be empty" });
  }
  const cols = keys.map((k) => `"${k}"`).join(", ");
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
  const values = keys.map((k) => body[k]);

  try {
    const queryStr = `INSERT INTO ${table} (${cols}) VALUES (${placeholders}) RETURNING *`;
    const result = await pool.query(queryStr, values);
    res.status(201).json(result.rows[0]);
  } catch (err: any) {
    console.error(`Error inserting into ${table}:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// Generic PUT endpoint to update a row by ID
app.put("/api/db/:table/:id", async (req, res) => {
  const { table, id } = req.params;
  if (!ALLOWED_TABLES.has(table)) {
    return res.status(400).json({ error: "Invalid table name" });
  }
  const body = { ...req.body };
  delete body.id; // remove id from update payload

  const keys = Object.keys(body);
  if (keys.length === 0) {
    return res.status(400).json({ error: "Payload cannot be empty" });
  }

  const setClause = keys.map((k, i) => `"${k}" = $${i + 1}`).join(", ");
  const values = [...keys.map((k) => body[k]), id];
  const idPlaceholder = `$${keys.length + 1}`;

  try {
    const queryStr = `UPDATE ${table} SET ${setClause} WHERE id = ${idPlaceholder} RETURNING *`;
    const result = await pool.query(queryStr, values);
    res.json(result.rows[0] || null);
  } catch (err: any) {
    console.error(`Error updating ${table}:`, err.message);
    res.status(500).json({ error: err.message });
  }
});

// Generic DELETE endpoint
app.delete("/api/db/:table/:id", async (req, res) => {
  const { table, id } = req.params;
  if (!ALLOWED_TABLES.has(table)) {
    return res.status(400).json({ error: "Invalid table name" });
  }
  try {
    await pool.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
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
  console.log(`📁 Serving frontend static files from: ${staticPath}`);
  app.use(express.static(staticPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(staticPath, "index.html"));
  });
}

const server = app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  testConnection();
});

server.on("error", (err: any) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ Port ${port} is already in use. Try setting a different PORT, e.g., PORT=5002 npm run start:backend`);
  } else {
    console.error("❌ Server error:", err);
  }
});
