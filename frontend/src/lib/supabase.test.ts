import { describe, it, expect, vi, beforeEach } from "vitest";
import { supabase } from "./supabase";

describe("Frontend Smart Database Client (supabase Proxy)", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("should provide fluent chainable methods for select, eq, order, and limit", () => {
    const query = supabase
      .from("parties")
      .select("id, name")
      .eq("status", "active")
      .order("name", { ascending: true })
      .limit(10);

    expect(query).toBeDefined();
    expect(typeof query.then).toBe("function");
  });

  it("should fetch data and fallback gracefully to empty array on network failure", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network down"));

    const { data, error } = await supabase.from("gauges").select("*");
    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
  });

  it("should return cached data from localStorage when offline", async () => {
    const mockGauges = [
      { id: 1, gauge_name: "Vernier Caliper" },
      { id: 2, gauge_name: "External Micrometer" },
    ];
    localStorage.setItem("vmc_offline_gauges", JSON.stringify(mockGauges));

    global.fetch = vi.fn().mockRejectedValue(new Error("Network offline"));

    const { data } = await supabase.from("gauges").select("*");
    expect(data).toEqual(mockGauges);
  });

  it("should clear client cache on insert/update/delete mutations", async () => {
    localStorage.setItem("vmc_offline_parties", JSON.stringify([{ id: 1, name: "Old Party" }]));

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: 2, name: "New Party" }),
    } as Response);

    await supabase.from("parties").insert({ name: "New Party" });
    expect(localStorage.getItem("vmc_offline_parties")).toBeNull();
  });
});
