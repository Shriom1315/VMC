import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { renderHook, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext";

describe("AuthContext (Offline & Cloud Fallback)", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  it("should successfully log in with default offline admin credentials", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login("admin@vikramaditya.com", "Admin@VMC2026");
    });

    expect(result.current.user).toBeDefined();
    expect(result.current.user?.email).toBe("admin@vikramaditya.com");
    expect(result.current.user?.role).toBe("admin");
    expect(result.current.isAuthenticated).toBe(true);
  });

  it("should reject invalid credentials with password too short", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    let errorOccurred = false;
    try {
      await act(async () => {
        await result.current.login("user@email.com", "123");
      });
    } catch (_) {
      errorOccurred = true;
    }

    expect(errorOccurred).toBe(true);
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it("should log out and clear session", async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login("admin@vikramaditya.com", "Admin@VMC2026");
    });
    expect(result.current.user).toBeDefined();

    await act(async () => {
      await result.current.logout();
    });
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem("vmc_offline_user")).toBeNull();
  });
});
