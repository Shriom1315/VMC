import { describe, it, expect, vi, beforeEach } from "vitest";
import { getCache, setCache, invalidateCache, isRedisHealthy } from "./redis.js";

describe("Redis Caching Layer", () => {
  it("should handle getCache gracefully when disconnected", async () => {
    const result = await getCache("non_existent_key");
    expect(result).toBeNull();
  });

  it("should handle setCache gracefully when disconnected", async () => {
    await expect(setCache("test_key", { data: "test" }, 300)).resolves.not.toThrow();
  });

  it("should handle invalidateCache gracefully when disconnected", async () => {
    await expect(invalidateCache("test_key*")).resolves.not.toThrow();
  });

  it("should report boolean health status", () => {
    const healthy = isRedisHealthy();
    expect(typeof healthy).toBe("boolean");
  });
});
