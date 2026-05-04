import { createContext, useContext, useState, ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Role = "admin" | "manager" | "staff";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: Role) => Promise<void>;
  logout: () => void;
}

// ─── Mock users ───────────────────────────────────────────────────────────────

const MOCK_USERS: Record<string, AuthUser> = {
  "admin@vikramaditya.com": {
    id: "u-001", name: "Kiran Patil",   email: "admin@vikramaditya.com",   role: "admin",   avatar: "KP",
  },
  "manager@vikramaditya.com": {
    id: "u-002", name: "Rahul Desai",   email: "manager@vikramaditya.com", role: "manager", avatar: "RD",
  },
  "staff@vikramaditya.com": {
    id: "u-003", name: "Priya Jadhav",  email: "staff@vikramaditya.com",   role: "staff",   avatar: "PJ",
  },
};

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = sessionStorage.getItem("vmc_user");
      return stored ? (JSON.parse(stored) as AuthUser) : null;
    } catch { return null; }
  });

  const login = async (email: string, _password: string, role: Role) => {
    const found = MOCK_USERS[email.toLowerCase()];
    if (!found) throw new Error("User not found. Use one of the demo accounts.");
    const loggedIn: AuthUser = { ...found, role };
    setUser(loggedIn);
    sessionStorage.setItem("vmc_user", JSON.stringify(loggedIn));
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("vmc_user");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

// ─── Permission table ─────────────────────────────────────────────────────────
//
//  Based on real calibration lab role analysis:
//  - Admin    : Lab owner / director — full access including financials & system config
//  - Manager  : Lab manager / senior tech — operations, approvals, billing; no system config
//  - Staff    : Calibration technician — hands-on work only; no billing, no rates, no reports
//
// ─────────────────────────────────────────────────────────────────────────────

export const ROLE_PERMISSIONS = {
  // ── Basic Registration ──────────────────────────────────────────────────────
  "party:read":           ["admin", "manager", "staff"]  as Role[],
  "party:write":          ["admin", "manager"]           as Role[],

  "gauge:read":           ["admin", "manager", "staff"]  as Role[],
  "gauge:write":          ["admin", "manager"]           as Role[],

  "equipment:read":       ["admin", "manager", "staff"]  as Role[],
  "equipment:write":      ["admin", "manager"]           as Role[],

  // Uncertainty: staff can READ (needs values for certificates), cannot write
  "uncertainty:read":     ["admin", "manager", "staff"]  as Role[],
  "uncertainty:write":    ["admin", "manager"]           as Role[],

  // Scope: staff has no access (accreditation scope is management-level)
  "scope:read":           ["admin", "manager"]           as Role[],
  "scope:write":          ["admin"]                      as Role[],

  // Rates: commercially sensitive — staff must not see what clients are charged
  "rate:read":            ["admin", "manager"]           as Role[],
  "rate:write":           ["admin", "manager"]           as Role[],

  // Firm: legal/financial identity of the lab — owner only
  "firm:read":            ["admin"]                      as Role[],
  "firm:write":           ["admin"]                      as Role[],

  // ── Daily Transactions ──────────────────────────────────────────────────────
  // Quotation: staff cannot see (quotation shows rates/prices)
  "quotation:read":       ["admin", "manager"]           as Role[],
  "quotation:write":      ["admin", "manager"]           as Role[],
  "quotation:approve":    ["admin", "manager"]           as Role[],

  // PO: staff read-only (need to know which jobs are authorized)
  "po:read":              ["admin", "manager", "staff"]  as Role[],
  "po:write":             ["admin", "manager"]           as Role[],
  "po:approve":           ["admin", "manager"]           as Role[],

  // Material Inward: technician's entry point — full access
  "inward:read":          ["admin", "manager", "staff"]  as Role[],
  "inward:write":         ["admin", "manager", "staff"]  as Role[],

  // Calibration Status: technician's primary work page — full access
  "calib:read":           ["admin", "manager", "staff"]  as Role[],
  "calib:write":          ["admin", "manager", "staff"]  as Role[],

  // Dispatch: staff can CREATE (pack & hand over), not edit/delete past records
  "dispatch:read":        ["admin", "manager", "staff"]  as Role[],
  "dispatch:create":      ["admin", "manager", "staff"]  as Role[],
  "dispatch:write":       ["admin", "manager"]           as Role[], // edit/delete

  // Invoice & Receipt: billing — no staff access
  "invoice:read":         ["admin", "manager"]           as Role[],
  "invoice:write":        ["admin", "manager"]           as Role[],
  "receipt:read":         ["admin", "manager"]           as Role[],
  "receipt:write":        ["admin", "manager"]           as Role[],

  // ── Reports ─────────────────────────────────────────────────────────────────
  "reports:quotations":   ["admin", "manager"]           as Role[],
  "reports:pos":          ["admin", "manager"]           as Role[],
  // Certificate history: staff may need to reprint a certificate
  "reports:certificates": ["admin", "manager", "staff"]  as Role[],
  "reports:outstanding":  ["admin", "manager"]           as Role[],
  "reports:ledger":       ["admin", "manager"]           as Role[],
  // GST report: owner-level financial — admin only
  "reports:gst":          ["admin"]                      as Role[],

  // ── System ──────────────────────────────────────────────────────────────────
  "users:manage":         ["admin"]                      as Role[],
} as const;

export type Permission = keyof typeof ROLE_PERMISSIONS;

export function can(role: Role, permission: Permission): boolean {
  return (ROLE_PERMISSIONS[permission] as Role[]).includes(role);
}

export function usePermission(permission: Permission): boolean {
  const { user } = useAuth();
  if (!user) return false;
  return can(user.role, permission);
}
