import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import { app, sanitizeIdentifier } from "./app.js";

describe("Backend API Endpoints", () => {
  describe("Helper: sanitizeIdentifier", () => {
    it("should accept valid alphanumeric and underscore column names", () => {
      expect(sanitizeIdentifier("created_at")).toBe("created_at");
      expect(sanitizeIdentifier("party_name123")).toBe("party_name123");
    });

    it("should reject malicious SQL injection characters", () => {
      expect(sanitizeIdentifier("id; DROP TABLE parties;")).toBeNull();
      expect(sanitizeIdentifier("name--")).toBeNull();
      expect(sanitizeIdentifier("col' OR '1'='1")).toBeNull();
    });
  });

  describe("GET /api/health", () => {
    it("should return status ok and healthy message", async () => {
      const res = await request(app).get("/api/health");
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        status: "ok",
        message: "VMC Backend is running",
      });
    });
  });

  describe("GET /api/status", () => {
    it("should return status payload with connection details", async () => {
      const res = await request(app).get("/api/status");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("status", "ok");
      expect(res.body).toHaveProperty("postgresConnected");
      expect(res.body).toHaveProperty("redisConnected");
      expect(res.body).toHaveProperty("cacheTtlSeconds", 300);
    });
  });

  describe("Table Whitelisting Security", () => {
    it("should reject queries to unapproved tables", async () => {
      const res = await request(app).get("/api/db/secret_passwords");
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "Invalid table name");
    });

    it("should reject POST requests to unapproved tables", async () => {
      const res = await request(app)
        .post("/api/db/secret_passwords")
        .send({ foo: "bar" });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "Invalid table name");
    });
  });

  describe("Cache Purge API", () => {
    it("should allow purging table-specific cache", async () => {
      const res = await request(app).delete("/api/cache/parties");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });

    it("should allow purging all cache", async () => {
      const res = await request(app).delete("/api/cache");
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
    });
  });
});
