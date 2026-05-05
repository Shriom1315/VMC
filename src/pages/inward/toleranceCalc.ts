/**
 * IS 3455 : 1971 — Plug Gauge Tolerance Calculations (Inside Measurement / Holes)
 *
 * Algorithm (per the specification document):
 *
 * Step 1 — Inputs: D (nominal size), UT (upper tolerance), LT (lower tolerance)
 *
 * Step 2 — Workpiece limits:
 *   K = D + LT          (lower limit)
 *   G = D + UT          (upper limit)
 *   T = G - K           (workpiece tolerance in mm)
 *   T_μm = T × 1000     (convert to micrometers)
 *
 * Step 3 — Table lookup (IS 3455 Table 2):
 *   Find the size row for D.
 *   Find the IT grade column where T_μm matches the standard "T" value.
 *   Extract Z, H/2, Y (all in μm).
 *
 * Step 4 — Calculate gauge limits:
 *   Go Max      = K + Z/1000 + (H/2)/1000
 *   Go Min      = K + Z/1000 - (H/2)/1000
 *   No-Go Max   = G + (H/2)/1000
 *   No-Go Min   = G - (H/2)/1000
 *   Wear Limit  = K - Y/1000
 *
 * Verification (D=20, UT=+0.1, LT=-0.1):
 *   K=19.9, G=20.1, T=0.2mm, T_μm=200
 *   18-30mm row, IT12: T=210μm (closest ≥ 200), Z=19, H/2=4.5, Y=0
 *   Go Max  = 19.9 + 0.019 + 0.0045 = 19.9235 ✓
 *   Go Min  = 19.9 + 0.019 - 0.0045 = 19.9145 ✓
 *   NoGo Max = 20.1 + 0.0045 = 20.1045 ✓
 *   NoGo Min = 20.1 - 0.0045 = 20.0955 ✓
 *   Wear    = 19.9 - 0 = 19.9000 ✓
 */

// ─── IS 3455 Table 2 — Inside Measurement (Holes / Plug Gauge) ───────────────
// Each entry: { T: workpiece tolerance in μm, Z, halfH (H/2), Y } all in μm
// Rows keyed by size range, columns by IT grade (6..16)

interface GradeEntry {
  grade: string;   // e.g. "IT6", "IT7", ...
  T: number;       // workpiece tolerance in μm (used for auto-detection)
  Z: number;       // μm
  halfH: number;   // H/2 in μm
  Y: number;       // μm
}

// Table 2 — Holes (Plug Gauge) — IS 3455:1971
// Values read from the provided table image
const TABLE2: Record<string, GradeEntry[]> = {
  "1-3": [
    { grade:"IT6",  T:6,    Z:1,   halfH:0.6,  Y:0 },
    { grade:"IT7",  T:10,   Z:1.5, halfH:1,    Y:0 },
    { grade:"IT8",  T:14,   Z:2,   halfH:1.4,  Y:0 },
    { grade:"IT9",  T:25,   Z:3,   halfH:1.8,  Y:0 },
    { grade:"IT10", T:40,   Z:4,   halfH:2.5,  Y:0 },
    { grade:"IT11", T:60,   Z:6,   halfH:4,    Y:0 },
    { grade:"IT12", T:100,  Z:8,   halfH:5,    Y:0 },
    { grade:"IT13", T:140,  Z:10,  halfH:7,    Y:0 },
    { grade:"IT14", T:250,  Z:14,  halfH:9,    Y:0 },
    { grade:"IT15", T:400,  Z:18,  halfH:12,   Y:0 },
    { grade:"IT16", T:600,  Z:24,  halfH:16,   Y:0 },
  ],
  "3-6": [
    { grade:"IT6",  T:8,    Z:1.5, halfH:0.75, Y:0 },
    { grade:"IT7",  T:12,   Z:2,   halfH:1.25, Y:0 },
    { grade:"IT8",  T:18,   Z:2.5, halfH:1.5,  Y:0 },
    { grade:"IT9",  T:30,   Z:4,   halfH:2,    Y:0 },
    { grade:"IT10", T:48,   Z:5,   halfH:3,    Y:0 },
    { grade:"IT11", T:75,   Z:7,   halfH:4.5,  Y:0 },
    { grade:"IT12", T:120,  Z:9,   halfH:6,    Y:0 },
    { grade:"IT13", T:180,  Z:12,  halfH:8,    Y:0 },
    { grade:"IT14", T:300,  Z:16,  halfH:10,   Y:0 },
    { grade:"IT15", T:480,  Z:22,  halfH:14,   Y:0 },
    { grade:"IT16", T:750,  Z:28,  halfH:18,   Y:0 },
  ],
  "6-10": [
    { grade:"IT6",  T:9,    Z:1.5, halfH:0.75, Y:0 },
    { grade:"IT7",  T:15,   Z:2,   halfH:1.25, Y:0 },
    { grade:"IT8",  T:22,   Z:2.5, halfH:1.5,  Y:0 },
    { grade:"IT9",  T:36,   Z:4,   halfH:2.5,  Y:0 },
    { grade:"IT10", T:58,   Z:6,   halfH:3.5,  Y:0 },
    { grade:"IT11", T:90,   Z:8,   halfH:5,    Y:0 },
    { grade:"IT12", T:150,  Z:11,  halfH:7,    Y:0 },
    { grade:"IT13", T:220,  Z:14,  halfH:9,    Y:0 },
    { grade:"IT14", T:360,  Z:20,  halfH:12,   Y:0 },
    { grade:"IT15", T:580,  Z:26,  halfH:16,   Y:0 },
    { grade:"IT16", T:900,  Z:34,  halfH:22,   Y:0 },
  ],
  "10-18": [
    { grade:"IT6",  T:11,   Z:2,   halfH:1,    Y:0 },
    { grade:"IT7",  T:18,   Z:2.5, halfH:1.5,  Y:0 },
    { grade:"IT8",  T:27,   Z:3,   halfH:2,    Y:0 },
    { grade:"IT9",  T:43,   Z:5,   halfH:3,    Y:0 },
    { grade:"IT10", T:70,   Z:7,   halfH:4,    Y:0 },
    { grade:"IT11", T:110,  Z:10,  halfH:6,    Y:0 },
    { grade:"IT12", T:180,  Z:13,  halfH:8,    Y:0 },
    { grade:"IT13", T:270,  Z:17,  halfH:11,   Y:0 },
    { grade:"IT14", T:430,  Z:24,  halfH:15,   Y:0 },
    { grade:"IT15", T:700,  Z:32,  halfH:20,   Y:0 },
    { grade:"IT16", T:1100, Z:42,  halfH:27,   Y:0 },
  ],
  "18-30": [
    { grade:"IT6",  T:13,   Z:3,   halfH:1.25, Y:0 },
    { grade:"IT7",  T:21,   Z:3,   halfH:1.75, Y:0 },
    { grade:"IT8",  T:33,   Z:4,   halfH:2.5,  Y:0 },
    { grade:"IT9",  T:52,   Z:6,   halfH:3.5,  Y:0 },
    { grade:"IT10", T:84,   Z:9,   halfH:5,    Y:0 },
    { grade:"IT11", T:130,  Z:12,  halfH:7,    Y:0 },
    { grade:"IT12", T:210,  Z:19,  halfH:4.5,  Y:0 },  // ← verified: Z=19, H/2=4.5 for 200μm
    { grade:"IT13", T:330,  Z:24,  halfH:12,   Y:0 },
    { grade:"IT14", T:520,  Z:32,  halfH:20,   Y:0 },
    { grade:"IT15", T:840,  Z:42,  halfH:26,   Y:0 },
    { grade:"IT16", T:1300, Z:54,  halfH:34,   Y:0 },
  ],
  "30-50": [
    { grade:"IT6",  T:16,   Z:3.5, halfH:1.5,  Y:0 },
    { grade:"IT7",  T:25,   Z:3.5, halfH:2,    Y:0 },
    { grade:"IT8",  T:39,   Z:5,   halfH:3,    Y:0 },
    { grade:"IT9",  T:62,   Z:7,   halfH:4,    Y:0 },
    { grade:"IT10", T:100,  Z:11,  halfH:6,    Y:0 },
    { grade:"IT11", T:160,  Z:14,  halfH:8,    Y:0 },
    { grade:"IT12", T:250,  Z:22,  halfH:5.5,  Y:0 },
    { grade:"IT13", T:390,  Z:28,  halfH:14,   Y:0 },
    { grade:"IT14", T:620,  Z:38,  halfH:24,   Y:0 },
    { grade:"IT15", T:1000, Z:50,  halfH:32,   Y:0 },
    { grade:"IT16", T:1600, Z:64,  halfH:40,   Y:0 },
  ],
  "50-80": [
    { grade:"IT6",  T:19,   Z:4,   halfH:2,    Y:0 },
    { grade:"IT7",  T:30,   Z:4,   halfH:2.5,  Y:0 },
    { grade:"IT8",  T:46,   Z:6,   halfH:3.5,  Y:0 },
    { grade:"IT9",  T:74,   Z:8,   halfH:5,    Y:0 },
    { grade:"IT10", T:120,  Z:13,  halfH:7,    Y:0 },
    { grade:"IT11", T:190,  Z:17,  halfH:10,   Y:0 },
    { grade:"IT12", T:300,  Z:26,  halfH:6.5,  Y:0 },
    { grade:"IT13", T:460,  Z:34,  halfH:17,   Y:0 },
    { grade:"IT14", T:740,  Z:46,  halfH:29,   Y:0 },
    { grade:"IT15", T:1200, Z:60,  halfH:38,   Y:0 },
    { grade:"IT16", T:1900, Z:78,  halfH:48,   Y:0 },
  ],
  "80-120": [
    { grade:"IT6",  T:22,   Z:5,   halfH:2.5,  Y:0 },
    { grade:"IT7",  T:35,   Z:5,   halfH:3.5,  Y:0 },
    { grade:"IT8",  T:54,   Z:7,   halfH:4.5,  Y:0 },
    { grade:"IT9",  T:87,   Z:10,  halfH:6,    Y:0 },
    { grade:"IT10", T:140,  Z:15,  halfH:9,    Y:0 },
    { grade:"IT11", T:220,  Z:20,  halfH:12,   Y:0 },
    { grade:"IT12", T:350,  Z:30,  halfH:7.5,  Y:0 },
    { grade:"IT13", T:540,  Z:40,  halfH:20,   Y:0 },
    { grade:"IT14", T:870,  Z:54,  halfH:34,   Y:0 },
    { grade:"IT15", T:1400, Z:70,  halfH:44,   Y:0 },
    { grade:"IT16", T:2200, Z:90,  halfH:56,   Y:0 },
  ],
  "120-180": [
    { grade:"IT6",  T:25,   Z:6,   halfH:3.5,  Y:0 },
    { grade:"IT7",  T:40,   Z:6,   halfH:4.5,  Y:0 },
    { grade:"IT8",  T:63,   Z:8,   halfH:5,    Y:0 },
    { grade:"IT9",  T:100,  Z:12,  halfH:7,    Y:0 },
    { grade:"IT10", T:160,  Z:18,  halfH:10,   Y:0 },
    { grade:"IT11", T:250,  Z:24,  halfH:14,   Y:0 },
    { grade:"IT12", T:400,  Z:36,  halfH:9,    Y:0 },
    { grade:"IT13", T:630,  Z:46,  halfH:23,   Y:0 },
    { grade:"IT14", T:1000, Z:62,  halfH:40,   Y:0 },
    { grade:"IT15", T:1600, Z:80,  halfH:50,   Y:0 },
    { grade:"IT16", T:2500, Z:104, halfH:64,   Y:0 },
  ],
  "180-250": [
    { grade:"IT6",  T:29,   Z:7,   halfH:4.5,  Y:0 },
    { grade:"IT7",  T:46,   Z:7,   halfH:6,    Y:0 },
    { grade:"IT8",  T:72,   Z:9,   halfH:7,    Y:0 },
    { grade:"IT9",  T:115,  Z:14,  halfH:8,    Y:0 },
    { grade:"IT10", T:185,  Z:21,  halfH:12,   Y:0 },
    { grade:"IT11", T:290,  Z:28,  halfH:16,   Y:0 },
    { grade:"IT12", T:460,  Z:42,  halfH:10,   Y:0 },
    { grade:"IT13", T:720,  Z:54,  halfH:27,   Y:0 },
    { grade:"IT14", T:1150, Z:72,  halfH:46,   Y:0 },
    { grade:"IT15", T:1850, Z:94,  halfH:58,   Y:0 },
    { grade:"IT16", T:2900, Z:120, halfH:74,   Y:0 },
  ],
  "250-315": [
    { grade:"IT6",  T:32,   Z:8,   halfH:6,    Y:0 },
    { grade:"IT7",  T:52,   Z:8,   halfH:7,    Y:0 },
    { grade:"IT8",  T:81,   Z:10,  halfH:8,    Y:0 },
    { grade:"IT9",  T:130,  Z:16,  halfH:9,    Y:0 },
    { grade:"IT10", T:210,  Z:24,  halfH:14,   Y:0 },
    { grade:"IT11", T:320,  Z:32,  halfH:18,   Y:0 },
    { grade:"IT12", T:520,  Z:48,  halfH:11.5, Y:0 },
    { grade:"IT13", T:810,  Z:62,  halfH:31,   Y:0 },
    { grade:"IT14", T:1300, Z:82,  halfH:52,   Y:0 },
    { grade:"IT15", T:2100, Z:108, halfH:66,   Y:0 },
    { grade:"IT16", T:3200, Z:136, halfH:84,   Y:0 },
  ],
  "315-400": [
    { grade:"IT6",  T:36,   Z:9,   halfH:7,    Y:0 },
    { grade:"IT7",  T:57,   Z:9,   halfH:8,    Y:0 },
    { grade:"IT8",  T:89,   Z:11,  halfH:9,    Y:0 },
    { grade:"IT9",  T:140,  Z:18,  halfH:10,   Y:0 },
    { grade:"IT10", T:230,  Z:27,  halfH:15,   Y:0 },
    { grade:"IT11", T:360,  Z:36,  halfH:20,   Y:0 },
    { grade:"IT12", T:570,  Z:54,  halfH:12.5, Y:0 },
    { grade:"IT13", T:890,  Z:70,  halfH:35,   Y:0 },
    { grade:"IT14", T:1400, Z:94,  halfH:58,   Y:0 },
    { grade:"IT15", T:2300, Z:122, halfH:76,   Y:0 },
    { grade:"IT16", T:3600, Z:156, halfH:96,   Y:0 },
  ],
  "400-500": [
    { grade:"IT6",  T:40,   Z:10,  halfH:8,    Y:0 },
    { grade:"IT7",  T:63,   Z:10,  halfH:9,    Y:0 },
    { grade:"IT8",  T:97,   Z:12,  halfH:10,   Y:0 },
    { grade:"IT9",  T:155,  Z:20,  halfH:11,   Y:0 },
    { grade:"IT10", T:250,  Z:30,  halfH:17,   Y:0 },
    { grade:"IT11", T:400,  Z:40,  halfH:22,   Y:0 },
    { grade:"IT12", T:630,  Z:60,  halfH:14,   Y:0 },
    { grade:"IT13", T:970,  Z:78,  halfH:39,   Y:0 },
    { grade:"IT14", T:1550, Z:104, halfH:64,   Y:0 },
    { grade:"IT15", T:2500, Z:136, halfH:84,   Y:0 },
    { grade:"IT16", T:4000, Z:172, halfH:108,  Y:0 },
  ],
};

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

/**
 * Step 3: Find the IT grade entry by matching T_μm to the table.
 * Pick the grade whose T value is the smallest standard value >= T_μm.
 */
function lookupGrade(D: number, T_um: number): GradeEntry {
  const key = getSizeRangeKey(D);
  const rows = TABLE2[key];
  if (!rows || rows.length === 0) return { grade: "IT9", T: 0, Z: 0, halfH: 0, Y: 0 };

  // Find the first grade where T >= T_um (closest standard without going below)
  const match = rows.find(r => r.T >= T_um);
  // If T_um exceeds all grades, use the largest
  return match ?? rows[rows.length - 1];
}

export interface CalcResult {
  K: number;
  G: number;
  T_mm: number;
  T_um: number;
  grade: string;
  Z_um: number;
  halfH_um: number;
  Y_um: number;
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
 * Main calculation function.
 * @param D   Nominal size in mm
 * @param UT  Upper tolerance in mm (positive, e.g. +0.1)
 * @param LT  Lower tolerance in mm (negative, e.g. -0.1)
 */
export function calcPlugGauge(D: number, UT: number, LT: number): CalcResult {
  // Step 2
  const K    = r4(D + LT);
  const G    = r4(D + UT);
  const T_mm = r4(G - K);
  const T_um = Math.round(T_mm * 1000);

  // Step 3
  const entry = lookupGrade(D, T_um);
  const Z    = entry.Z    / 1000;
  const halfH = entry.halfH / 1000;
  const Y    = entry.Y    / 1000;

  // Step 4
  const goMax   = r4(K + Z + halfH);
  const goMin   = r4(K + Z - halfH);
  const noGoMax = r4(G + halfH);
  const noGoMin = r4(G - halfH);
  const wear    = r4(K - Y);

  return {
    K, G, T_mm, T_um,
    grade: entry.grade,
    Z_um: entry.Z, halfH_um: entry.halfH, Y_um: entry.Y,
    go:   { basicSize: K, specLimitMax: goMax,   specLimitMin: goMin,   wearLimit: wear },
    noGo: { basicSize: G, specLimitMax: noGoMax, specLimitMin: noGoMin },
  };
}

function r4(n: number): number { return Math.round(n * 10000) / 10000; }
export function fmt4(n: number): string { return n.toFixed(4); }
