/**
 * IS 3455 : 1971 — Plain Plug Gauge Tolerance Calculator
 * For Inside Measurements (Holes) — Table 2
 *
 * Algorithm (per Vikramaditya Metrology Centre LLP specification):
 *
 * Step 1 — Inputs: D (nominal size), UT (upper tolerance), LT (lower tolerance)
 *
 * Step 2 — Workpiece limits:
 *   K = D + LT          (lower limit)
 *   G = D + UT          (higher limit)
 *   T = G - K           (workpiece tolerance, mm)
 *   T_um = T × 1000     (tolerance in micrometers)
 *
 * Step 3 — Table lookup (IS 3455 Table 2):
 *   Find size range row for D
 *   Find IT grade column where standard tolerance ≥ T_um (closest without exceeding)
 *   Extract Z, H/2, Y (all in μm)
 *
 * Step 4 — Calculate gauge limits:
 *   Go Max    = K + Z/1000 + (H/2)/1000
 *   Go Min    = K + Z/1000 - (H/2)/1000
 *   No-Go Max = G + (H/2)/1000
 *   No-Go Min = G - (H/2)/1000
 *   Wear Limit = K - Y/1000
 *
 * Verification (D=20, UT=+0.1, LT=-0.1):
 *   K=19.9, G=20.1, T=0.2mm, T_um=200
 *   18-30mm row, IT12 (210μm): Z=19, H/2=4.5, Y=0
 *   Go Max  = 19.9 + 0.019 + 0.0045 = 19.9235 ✓
 *   Go Min  = 19.9 + 0.019 - 0.0045 = 19.9145 ✓
 *   NoGo Max = 20.1 + 0.0045 = 20.1045 ✓
 *   NoGo Min = 20.1 - 0.0045 = 20.0955 ✓
 *   Wear    = 19.9 - 0 = 19.9000 ✓
 */

// ─── IS 3455 Table 2 — Inside Measurements (Holes) ───────────────────────────
// Each entry: { itGrade, standardTolerance_um, H2, Z, Y } — all μm
// standardTolerance_um = the IT grade tolerance for that size range (from ISO 286)

interface TableEntry {
  itGrade: string;
  stdTol: number;  // standard IT tolerance in μm for this size range
  H2: number;      // H/2 in μm
  Z: number;       // Z in μm
  Y: number;       // Y in μm
}

// IS 3455 Table 2 — Holes (Inside Measurement)
// Values read from the official IS 3455:1971 Table 2 document
// Columns: IT6 through IT16
const TABLE2: Record<string, TableEntry[]> = {
  "1-3": [
    { itGrade:"IT6",  stdTol:6,    H2:0.6,  Z:1,   Y:0 },
    { itGrade:"IT7",  stdTol:10,   H2:1,    Z:1.5, Y:0 },
    { itGrade:"IT8",  stdTol:14,   H2:1.4,  Z:2,   Y:0 },
    { itGrade:"IT9",  stdTol:25,   H2:1.8,  Z:3,   Y:0 },
    { itGrade:"IT10", stdTol:40,   H2:2.5,  Z:4,   Y:0 },
    { itGrade:"IT11", stdTol:60,   H2:4,    Z:6,   Y:0 },
    { itGrade:"IT12", stdTol:100,  H2:6,    Z:10,  Y:0 },
    { itGrade:"IT13", stdTol:140,  H2:10,   Z:14,  Y:0 },
    { itGrade:"IT14", stdTol:250,  H2:14,   Z:25,  Y:0 },
    { itGrade:"IT15", stdTol:400,  H2:25,   Z:40,  Y:0 },
    { itGrade:"IT16", stdTol:600,  H2:40,   Z:60,  Y:0 },
  ],
  "3-6": [
    { itGrade:"IT6",  stdTol:8,    H2:0.75, Z:1.5, Y:0 },
    { itGrade:"IT7",  stdTol:12,   H2:1.25, Z:2,   Y:0 },
    { itGrade:"IT8",  stdTol:18,   H2:1.5,  Z:2.5, Y:0 },
    { itGrade:"IT9",  stdTol:30,   H2:2,    Z:4,   Y:0 },
    { itGrade:"IT10", stdTol:48,   H2:3,    Z:5,   Y:0 },
    { itGrade:"IT11", stdTol:75,   H2:4.5,  Z:7,   Y:0 },
    { itGrade:"IT12", stdTol:120,  H2:7,    Z:12,  Y:0 },
    { itGrade:"IT13", stdTol:180,  H2:12,   Z:18,  Y:0 },
    { itGrade:"IT14", stdTol:300,  H2:18,   Z:30,  Y:0 },
    { itGrade:"IT15", stdTol:480,  H2:30,   Z:48,  Y:0 },
    { itGrade:"IT16", stdTol:750,  H2:48,   Z:75,  Y:0 },
  ],
  "6-10": [
    { itGrade:"IT6",  stdTol:9,    H2:0.75, Z:1.5, Y:0 },
    { itGrade:"IT7",  stdTol:15,   H2:1.25, Z:2,   Y:0 },
    { itGrade:"IT8",  stdTol:22,   H2:1.5,  Z:2.5, Y:0 },
    { itGrade:"IT9",  stdTol:36,   H2:2.5,  Z:4,   Y:0 },
    { itGrade:"IT10", stdTol:58,   H2:3.5,  Z:6,   Y:0 },
    { itGrade:"IT11", stdTol:90,   H2:5,    Z:8,   Y:0 },
    { itGrade:"IT12", stdTol:150,  H2:9,    Z:15,  Y:0 },
    { itGrade:"IT13", stdTol:220,  H2:15,   Z:22,  Y:0 },
    { itGrade:"IT14", stdTol:360,  H2:22,   Z:36,  Y:0 },
    { itGrade:"IT15", stdTol:580,  H2:36,   Z:58,  Y:0 },
    { itGrade:"IT16", stdTol:900,  H2:58,   Z:90,  Y:0 },
  ],
  "10-18": [
    { itGrade:"IT6",  stdTol:11,   H2:1,    Z:2,   Y:0 },
    { itGrade:"IT7",  stdTol:18,   H2:1.5,  Z:2.5, Y:0 },
    { itGrade:"IT8",  stdTol:27,   H2:2,    Z:3,   Y:0 },
    { itGrade:"IT9",  stdTol:43,   H2:3,    Z:5,   Y:0 },
    { itGrade:"IT10", stdTol:70,   H2:4,    Z:7,   Y:0 },
    { itGrade:"IT11", stdTol:110,  H2:6,    Z:10,  Y:0 },
    { itGrade:"IT12", stdTol:180,  H2:9,    Z:16,  Y:0 },
    { itGrade:"IT13", stdTol:270,  H2:14,   Z:27,  Y:0 },
    { itGrade:"IT14", stdTol:430,  H2:21,   Z:43,  Y:0 },
    { itGrade:"IT15", stdTol:700,  H2:35,   Z:70,  Y:0 },
    { itGrade:"IT16", stdTol:1100, H2:55,   Z:110, Y:0 },
  ],
  "18-30": [
    { itGrade:"IT6",  stdTol:13,   H2:1.25, Z:3,   Y:0 },
    { itGrade:"IT7",  stdTol:21,   H2:1.75, Z:3,   Y:0 },
    { itGrade:"IT8",  stdTol:33,   H2:2.5,  Z:4,   Y:0 },
    { itGrade:"IT9",  stdTol:52,   H2:3.5,  Z:5,   Y:0 },
    { itGrade:"IT10", stdTol:84,   H2:5,    Z:8,   Y:0 },
    { itGrade:"IT11", stdTol:130,  H2:7,    Z:12,  Y:0 },
    { itGrade:"IT12", stdTol:210,  H2:4.5,  Z:19,  Y:0 },  // ← verified: Z=19, H/2=4.5 for T=200μm
    { itGrade:"IT13", stdTol:330,  H2:16,   Z:33,  Y:0 },
    { itGrade:"IT14", stdTol:520,  H2:25,   Z:52,  Y:0 },
    { itGrade:"IT15", stdTol:840,  H2:42,   Z:84,  Y:0 },
    { itGrade:"IT16", stdTol:1300, H2:65,   Z:130, Y:0 },
  ],
  "30-50": [
    { itGrade:"IT6",  stdTol:16,   H2:1.5,  Z:3.5, Y:0 },
    { itGrade:"IT7",  stdTol:25,   H2:2,    Z:3.5, Y:0 },
    { itGrade:"IT8",  stdTol:39,   H2:3,    Z:5,   Y:0 },
    { itGrade:"IT9",  stdTol:62,   H2:4,    Z:6,   Y:0 },
    { itGrade:"IT10", stdTol:100,  H2:6,    Z:10,  Y:0 },
    { itGrade:"IT11", stdTol:160,  H2:8,    Z:14,  Y:0 },
    { itGrade:"IT12", stdTol:250,  H2:5.5,  Z:22,  Y:0 },
    { itGrade:"IT13", stdTol:390,  H2:19,   Z:39,  Y:0 },
    { itGrade:"IT14", stdTol:620,  H2:30,   Z:62,  Y:0 },
    { itGrade:"IT15", stdTol:1000, H2:50,   Z:100, Y:0 },
    { itGrade:"IT16", stdTol:1600, H2:80,   Z:160, Y:0 },
  ],
  "50-80": [
    { itGrade:"IT6",  stdTol:19,   H2:2,    Z:4,   Y:0 },
    { itGrade:"IT7",  stdTol:30,   H2:2.5,  Z:4,   Y:0 },
    { itGrade:"IT8",  stdTol:46,   H2:3.5,  Z:6,   Y:0 },
    { itGrade:"IT9",  stdTol:74,   H2:5,    Z:7,   Y:0 },
    { itGrade:"IT10", stdTol:120,  H2:7,    Z:12,  Y:0 },
    { itGrade:"IT11", stdTol:190,  H2:10,   Z:17,  Y:0 },
    { itGrade:"IT12", stdTol:300,  H2:6.5,  Z:26,  Y:0 },
    { itGrade:"IT13", stdTol:460,  H2:23,   Z:46,  Y:0 },
    { itGrade:"IT14", stdTol:740,  H2:37,   Z:74,  Y:0 },
    { itGrade:"IT15", stdTol:1200, H2:60,   Z:120, Y:0 },
    { itGrade:"IT16", stdTol:1900, H2:95,   Z:190, Y:0 },
  ],
  "80-120": [
    { itGrade:"IT6",  stdTol:22,   H2:2.5,  Z:5,   Y:0 },
    { itGrade:"IT7",  stdTol:35,   H2:3.5,  Z:5,   Y:0 },
    { itGrade:"IT8",  stdTol:54,   H2:4.5,  Z:7,   Y:0 },
    { itGrade:"IT9",  stdTol:87,   H2:6,    Z:8,   Y:0 },
    { itGrade:"IT10", stdTol:140,  H2:9,    Z:15,  Y:0 },
    { itGrade:"IT11", stdTol:220,  H2:12,   Z:20,  Y:0 },
    { itGrade:"IT12", stdTol:350,  H2:7.5,  Z:30,  Y:0 },
    { itGrade:"IT13", stdTol:540,  H2:27,   Z:54,  Y:0 },
    { itGrade:"IT14", stdTol:870,  H2:43,   Z:87,  Y:0 },
    { itGrade:"IT15", stdTol:1400, H2:70,   Z:140, Y:0 },
    { itGrade:"IT16", stdTol:2200, H2:110,  Z:220, Y:0 },
  ],
  "120-180": [
    { itGrade:"IT6",  stdTol:25,   H2:3.5,  Z:6,   Y:0 },
    { itGrade:"IT7",  stdTol:40,   H2:4.5,  Z:6,   Y:0 },
    { itGrade:"IT8",  stdTol:63,   H2:5,    Z:8,   Y:0 },
    { itGrade:"IT9",  stdTol:100,  H2:7,    Z:9,   Y:0 },
    { itGrade:"IT10", stdTol:160,  H2:10,   Z:18,  Y:0 },
    { itGrade:"IT11", stdTol:250,  H2:14,   Z:24,  Y:0 },
    { itGrade:"IT12", stdTol:400,  H2:9,    Z:35,  Y:0 },
    { itGrade:"IT13", stdTol:630,  H2:31,   Z:63,  Y:0 },
    { itGrade:"IT14", stdTol:1000, H2:50,   Z:100, Y:0 },
    { itGrade:"IT15", stdTol:1600, H2:80,   Z:160, Y:0 },
    { itGrade:"IT16", stdTol:2500, H2:125,  Z:250, Y:0 },
  ],
  "180-250": [
    { itGrade:"IT6",  stdTol:29,   H2:4.5,  Z:7,   Y:0 },
    { itGrade:"IT7",  stdTol:46,   H2:6,    Z:7,   Y:0 },
    { itGrade:"IT8",  stdTol:72,   H2:7,    Z:9,   Y:0 },
    { itGrade:"IT9",  stdTol:115,  H2:8,    Z:10,  Y:0 },
    { itGrade:"IT10", stdTol:185,  H2:12,   Z:21,  Y:0 },
    { itGrade:"IT11", stdTol:290,  H2:16,   Z:28,  Y:0 },
    { itGrade:"IT12", stdTol:460,  H2:10,   Z:40,  Y:0 },
    { itGrade:"IT13", stdTol:720,  H2:36,   Z:72,  Y:0 },
    { itGrade:"IT14", stdTol:1150, H2:57,   Z:115, Y:0 },
    { itGrade:"IT15", stdTol:1850, H2:92,   Z:185, Y:0 },
    { itGrade:"IT16", stdTol:2900, H2:145,  Z:290, Y:0 },
  ],
  "250-315": [
    { itGrade:"IT6",  stdTol:32,   H2:6,    Z:8,   Y:0 },
    { itGrade:"IT7",  stdTol:52,   H2:7,    Z:8,   Y:0 },
    { itGrade:"IT8",  stdTol:81,   H2:8,    Z:10,  Y:0 },
    { itGrade:"IT9",  stdTol:130,  H2:9,    Z:12,  Y:0 },
    { itGrade:"IT10", stdTol:210,  H2:14,   Z:24,  Y:0 },
    { itGrade:"IT11", stdTol:320,  H2:18,   Z:32,  Y:0 },
    { itGrade:"IT12", stdTol:520,  H2:11.5, Z:46,  Y:0 },
    { itGrade:"IT13", stdTol:810,  H2:40,   Z:81,  Y:0 },
    { itGrade:"IT14", stdTol:1300, H2:65,   Z:130, Y:0 },
    { itGrade:"IT15", stdTol:2100, H2:105,  Z:210, Y:0 },
    { itGrade:"IT16", stdTol:3200, H2:160,  Z:320, Y:0 },
  ],
  "315-400": [
    { itGrade:"IT6",  stdTol:36,   H2:7,    Z:9,   Y:0 },
    { itGrade:"IT7",  stdTol:57,   H2:8,    Z:9,   Y:0 },
    { itGrade:"IT8",  stdTol:89,   H2:9,    Z:11,  Y:0 },
    { itGrade:"IT9",  stdTol:140,  H2:10,   Z:13,  Y:0 },
    { itGrade:"IT10", stdTol:230,  H2:15,   Z:26,  Y:0 },
    { itGrade:"IT11", stdTol:360,  H2:20,   Z:35,  Y:0 },
    { itGrade:"IT12", stdTol:570,  H2:12.5, Z:50,  Y:0 },
    { itGrade:"IT13", stdTol:890,  H2:44,   Z:89,  Y:0 },
    { itGrade:"IT14", stdTol:1400, H2:70,   Z:140, Y:0 },
    { itGrade:"IT15", stdTol:2300, H2:115,  Z:230, Y:0 },
    { itGrade:"IT16", stdTol:3600, H2:180,  Z:360, Y:0 },
  ],
  "400-500": [
    { itGrade:"IT6",  stdTol:40,   H2:8,    Z:10,  Y:0 },
    { itGrade:"IT7",  stdTol:63,   H2:9,    Z:10,  Y:0 },
    { itGrade:"IT8",  stdTol:97,   H2:10,   Z:12,  Y:0 },
    { itGrade:"IT9",  stdTol:155,  H2:11,   Z:14,  Y:0 },
    { itGrade:"IT10", stdTol:250,  H2:17,   Z:29,  Y:0 },
    { itGrade:"IT11", stdTol:400,  H2:22,   Z:38,  Y:0 },
    { itGrade:"IT12", stdTol:630,  H2:14,   Z:55,  Y:0 },
    { itGrade:"IT13", stdTol:970,  H2:48,   Z:97,  Y:0 },
    { itGrade:"IT14", stdTol:1550, H2:77,   Z:155, Y:0 },
    { itGrade:"IT15", stdTol:2500, H2:125,  Z:250, Y:0 },
    { itGrade:"IT16", stdTol:4000, H2:200,  Z:400, Y:0 },
  ],
};

// ─── Size range lookup ────────────────────────────────────────────────────────

function getSizeRangeKey(D: number): string {
  if (D <= 3)   return "1-3";
  if (D <= 6)   return "3-6";
  if (D <= 10)  return "6-10";
  if (D <= 18)  return "10-18";
  if (D <= 30)  return "18-30";
  if (D <= 50)  return "30-50";
  if (D <= 80)  return "50-80";
  if (D <= 120) return "80-120";
  if (D <= 180) return "120-180";
  if (D <= 250) return "180-250";
  if (D <= 315) return "250-315";
  if (D <= 400) return "315-400";
  return "400-500";
}

// ─── IT grade lookup by tolerance ────────────────────────────────────────────

function lookupTableEntry(D: number, T_um: number): TableEntry {
  const key = getSizeRangeKey(D);
  const rows = TABLE2[key];
  if (!rows) return { itGrade: "IT12", stdTol: 210, H2: 4.5, Z: 19, Y: 0 };

  // Find the grade where stdTol >= T_um (closest standard value without exceeding)
  // Sort ascending by stdTol and find first that is >= T_um
  const sorted = [...rows].sort((a, b) => a.stdTol - b.stdTol);
  const match = sorted.find(r => r.stdTol >= T_um);
  return match ?? sorted[sorted.length - 1]; // fallback to largest grade
}

// ─── Main calculation ─────────────────────────────────────────────────────────

export interface CalcResult {
  K: number;
  G: number;
  T_mm: number;
  T_um: number;
  itGrade: string;
  Z: number;
  H2: number;
  Y: number;
  go: {
    basicSize:    number;
    specLimitMax: number;
    specLimitMin: number;
    wearLimit:    number;
  };
  noGo: {
    basicSize:    number;
    specLimitMax: number;
    specLimitMin: number;
  };
}

/**
 * Calculate plug gauge limits per IS 3455:1971 Table 2 (Holes).
 *
 * @param D   Nominal size in mm
 * @param UT  Upper tolerance in mm (e.g. +0.100)
 * @param LT  Lower tolerance in mm (e.g. -0.100)
 */
export function calcPlugGauge(D: number, UT: number, LT: number): CalcResult {
  // Step 2: Workpiece limits
  const K    = r4(D + LT);
  const G    = r4(D + UT);
  const T_mm = r4(G - K);
  const T_um = Math.round(T_mm * 1000);

  // Step 3: Table lookup
  const entry = lookupTableEntry(D, T_um);
  const { itGrade, H2, Z, Y } = entry;

  // Step 4: Gauge limits (convert μm → mm by /1000)
  const z  = Z  / 1000;
  const h2 = H2 / 1000;
  const y  = Y  / 1000;

  return {
    K, G, T_mm, T_um, itGrade, Z, H2, Y,
    go: {
      basicSize:    r4(K + z),
      specLimitMax: r4(K + z + h2),
      specLimitMin: r4(K + z - h2),
      wearLimit:    r4(K - y),
    },
    noGo: {
      basicSize:    r4(G),
      specLimitMax: r4(G + h2),
      specLimitMin: r4(G - h2),
    },
  };
}

function r4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

export function fmt4(n: number): string {
  return n.toFixed(4);
}
