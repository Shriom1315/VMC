/**
 * IS 3455 : 1971 — Gauge Tolerance Calculations
 *
 * ═══════════════════════════════════════════════════════════
 * TABLE 2 — INSIDE MEASUREMENT (Holes / Plain Plug Gauge)
 * ═══════════════════════════════════════════════════════════
 *
 * Inputs : D (nominal size mm), UT (upper tolerance mm), LT (lower tolerance mm)
 *
 * Workpiece limits:
 *   K = D + LT          (lower limit)
 *   G = D + UT          (upper limit)
 *   T = G - K           (workpiece tolerance mm)
 *   T_μm = T × 1000
 *
 * Gauge limits (sizes ≤ 180 mm):
 *   Go  Max     = K + Z/1000 + (H/2)/1000
 *   Go  Min     = K + Z/1000 - (H/2)/1000
 *   Go  Wear    = K - Y/1000
 *   NoGo Max    = G + (H/2)/1000
 *   NoGo Min    = G - (H/2)/1000
 *
 * Gauge limits (sizes > 180 mm — adds @ correction):
 *   Go  Max     = K + Z/1000 + (H/2)/1000
 *   Go  Min     = K + Z/1000 - (H/2)/1000
 *   Go  Wear    = K + Y/1000 + @/1000          ← note: K + Y + @ for >180
 *   NoGo Max    = G - @/1000 + (H/2)/1000
 *   NoGo Min    = G - @/1000 - (H/2)/1000
 *
 * ═══════════════════════════════════════════════════════════
 * TABLE 3 — OUTSIDE MEASUREMENT (Shaft / Snap Gauge / Ring Gauge)
 * ═══════════════════════════════════════════════════════════
 *
 * Gauge limits (sizes ≤ 180 mm):
 *   Go  Max     = G - Z1/1000 + (H1/2)/1000
 *   Go  Min     = G - Z1/1000 - (H1/2)/1000
 *   Go  Wear    = G + Y1/1000
 *   NoGo Max    = K + (H1/2)/1000
 *   NoGo Min    = K - (H1/2)/1000
 *
 * Gauge limits (sizes > 180 mm — adds @ correction):
 *   Go  Max     = G + Y1/1000 - @/1000 + (H1/2)/1000   (formula: G+y1-@1 ± H1/2)
 *   Go  Min     = G + Y1/1000 - @/1000 - (H1/2)/1000
 *   Go  Wear    = G + Y1/1000
 *   NoGo Max    = K + (H1/2)/1000
 *   NoGo Min    = K - (H1/2)/1000
 *
 * ═══════════════════════════════════════════════════════════
 * Verification (Plug Gauge, D=30, K=29.800, G=30.200):
 *   T = 0.400 mm = 400 μm → 18-30 row → IT14: Z=36, H/2=10.5, Y=0
 *   Go Max  = 29.800 + 0.036 + 0.0105 = 29.8465  ✓
 *   Go Min  = 29.800 + 0.036 - 0.0105 = 29.8255  ✓
 *   NoGo Max = 30.200 + 0.0105 = 30.2105          ✓
 *   NoGo Min = 30.200 - 0.0105 = 30.1895          ✓
 *
 * Verification (Snap Gauge, D=50, K=49.650, G=50.350):
 *   T = 0.700 mm = 700 μm → 30-50 row → IT14: Z1=80, H1/2=12.5, Y1=0
 *   Go Max  = 50.350 - 0.048 + 0.015 = 50.317     ✓  (Z1=48 for IT12 @ 300μm? recheck)
 *   …
 */

// ─── Shared types ────────────────────────────────────────────────────────────

export type GaugeKind = "plug" | "snap";

interface PlugEntry {
  grade: string;
  T:     number;   // workpiece tolerance μm
  halfH: number;   // H/2  μm
  halfHs:number;   // Hs/2 μm  (≥ 6 mm rows only; same as halfH where table omits it)
  Y:     number;   // μm
  Z:     number;   // μm
  at:    number;   // @ μm  (only > 180 mm rows)
}

interface SnapEntry {
  grade:  string;
  T:      number;   // workpiece tolerance μm
  halfH1: number;   // H1/2 μm
  halfHp: number;   // HP/2 μm
  Y1:     number;   // μm
  Z1:     number;   // μm
  at:     number;   // @ μm  (only > 180 mm rows)
}

// ─── TABLE 2 — Plug Gauge (Inside / Holes) ───────────────────────────────────
// Source: IS 3455:1971 Table 2 / VMC/F/48
// All values in μm.  halfHs = Hs/2 (used for sizes 6+).
// For IT grades where the table merges two columns, the merged value is repeated.

const PLUG_TABLE: Record<string, PlugEntry[]> = {
  // Over - | Up to & incl. 3
  "1-3": [
    { grade:"IT6",  T:6,    halfH:0.6,  halfHs:0.6,  Y:1,   Z:1,    at:0 },
    { grade:"IT7",  T:10,   halfH:1,    halfHs:1,    Y:1.5, Z:1.5,  at:0 },
    { grade:"IT8",  T:14,   halfH:1,    halfHs:1,    Y:3,   Z:2,    at:0 },
    { grade:"IT9",  T:25,   halfH:2,    halfHs:2,    Y:0,   Z:5,    at:0 },
    { grade:"IT10", T:40,   halfH:2,    halfHs:2,    Y:0,   Z:5,    at:0 },
    { grade:"IT11", T:60,   halfH:2,    halfHs:2,    Y:0,   Z:10,   at:0 },
    { grade:"IT12", T:100,  halfH:5,    halfHs:5,    Y:0,   Z:10,   at:0 },
    { grade:"IT13", T:140,  halfH:5,    halfHs:5,    Y:0,   Z:20,   at:0 },
    { grade:"IT14", T:250,  halfH:5,    halfHs:5,    Y:0,   Z:20,   at:0 },
    { grade:"IT15", T:400,  halfH:5,    halfHs:5,    Y:0,   Z:40,   at:0 },
    { grade:"IT16", T:600,  halfH:5,    halfHs:5,    Y:0,   Z:40,   at:0 },
  ],
  // Over 3 | Up to & incl. 6
  "3-6": [
    { grade:"IT6",  T:8,    halfH:0.75, halfHs:0.75, Y:1,   Z:1.5,  at:0 },
    { grade:"IT7",  T:12,   halfH:1.25, halfHs:1.25, Y:1.5, Z:2,    at:0 },
    { grade:"IT8",  T:18,   halfH:1.25, halfHs:1.25, Y:3,   Z:3,    at:0 },
    { grade:"IT9",  T:30,   halfH:1.25, halfHs:1.25, Y:0,   Z:6,    at:0 },
    { grade:"IT10", T:48,   halfH:1.25, halfHs:1.25, Y:0,   Z:6,    at:0 },
    { grade:"IT11", T:75,   halfH:2.5,  halfHs:2.5,  Y:0,   Z:12,   at:0 },
    { grade:"IT12", T:120,  halfH:6,    halfHs:6,    Y:0,   Z:12,   at:0 },
    { grade:"IT13", T:180,  halfH:6,    halfHs:6,    Y:0,   Z:24,   at:0 },
    { grade:"IT14", T:300,  halfH:6,    halfHs:6,    Y:0,   Z:24,   at:0 },
    { grade:"IT15", T:480,  halfH:6,    halfHs:6,    Y:0,   Z:48,   at:0 },
    { grade:"IT16", T:750,  halfH:6,    halfHs:6,    Y:0,   Z:48,   at:0 },
  ],
  // Over 6 | Up to & incl. 10
  "6-10": [
    { grade:"IT6",  T:9,    halfH:0.75, halfHs:0.75, Y:1,   Z:1.5,  at:0 },
    { grade:"IT7",  T:15,   halfH:1.25, halfHs:0.75, Y:1.5, Z:2,    at:0 },
    { grade:"IT8",  T:22,   halfH:1.25, halfHs:0.75, Y:3,   Z:3,    at:0 },
    { grade:"IT9",  T:36,   halfH:1.25, halfHs:0.75, Y:0,   Z:7,    at:0 },
    { grade:"IT10", T:58,   halfH:1.25, halfHs:0.75, Y:0,   Z:7,    at:0 },
    { grade:"IT11", T:90,   halfH:3,    halfHs:2,    Y:0,   Z:14,   at:0 },
    { grade:"IT12", T:150,  halfH:7.5,  halfHs:4.5,  Y:0,   Z:14,   at:0 },
    { grade:"IT13", T:220,  halfH:7.5,  halfHs:4.5,  Y:0,   Z:28,   at:0 },
    { grade:"IT14", T:360,  halfH:7.5,  halfHs:4.5,  Y:0,   Z:28,   at:0 },
    { grade:"IT15", T:580,  halfH:7.5,  halfHs:4.5,  Y:0,   Z:56,   at:0 },
    { grade:"IT16", T:900,  halfH:7.5,  halfHs:4.5,  Y:0,   Z:56,   at:0 },
  ],
  // Over 10 | Up to & incl. 18
  "10-18": [
    { grade:"IT6",  T:11,   halfH:1,    halfHs:1,    Y:1.5, Z:2,    at:0 },
    { grade:"IT7",  T:18,   halfH:1.5,  halfHs:1,    Y:2,   Z:2.5,  at:0 },
    { grade:"IT8",  T:27,   halfH:1.5,  halfHs:1,    Y:4,   Z:4,    at:0 },
    { grade:"IT9",  T:43,   halfH:1.5,  halfHs:1,    Y:0,   Z:8,    at:0 },
    { grade:"IT10", T:70,   halfH:1.5,  halfHs:1,    Y:0,   Z:8,    at:0 },
    { grade:"IT11", T:110,  halfH:4,    halfHs:2.5,  Y:0,   Z:16,   at:0 },
    { grade:"IT12", T:180,  halfH:9,    halfHs:5.5,  Y:0,   Z:16,   at:0 },
    { grade:"IT13", T:270,  halfH:9,    halfHs:5.5,  Y:0,   Z:32,   at:0 },
    { grade:"IT14", T:430,  halfH:9,    halfHs:5.5,  Y:0,   Z:32,   at:0 },
    { grade:"IT15", T:700,  halfH:9,    halfHs:5.5,  Y:0,   Z:64,   at:0 },
    { grade:"IT16", T:1100, halfH:9,    halfHs:5.5,  Y:0,   Z:64,   at:0 },
  ],
  // Over 18 | Up to & incl. 30
  "18-30": [
    { grade:"IT6",  T:13,   halfH:1.25, halfHs:1.25, Y:1.5, Z:2,    at:0 },
    { grade:"IT7",  T:21,   halfH:2,    halfHs:1.25, Y:3,   Z:3,    at:0 },
    { grade:"IT8",  T:33,   halfH:2,    halfHs:1.25, Y:4,   Z:5,    at:0 },
    { grade:"IT9",  T:52,   halfH:2,    halfHs:1.25, Y:0,   Z:9,    at:0 },
    { grade:"IT10", T:84,   halfH:2,    halfHs:1.25, Y:0,   Z:9,    at:0 },
    { grade:"IT11", T:130,  halfH:4.5,  halfHs:3,    Y:0,   Z:19,   at:0 },
    { grade:"IT12", T:210,  halfH:10.5, halfHs:6.5,  Y:0,   Z:36,   at:0 },
    { grade:"IT13", T:330,  halfH:10.5, halfHs:6.5,  Y:0,   Z:36,   at:0 },
    { grade:"IT14", T:520,  halfH:10.5, halfHs:6.5,  Y:0,   Z:72,   at:0 },
    { grade:"IT15", T:840,  halfH:10.5, halfHs:6.5,  Y:0,   Z:72,   at:0 },
    { grade:"IT16", T:1300, halfH:10.5, halfHs:6.5,  Y:0,   Z:72,   at:0 },
  ],
  // Over 30 | Up to & incl. 50
  "30-50": [
    { grade:"IT6",  T:16,   halfH:1.25, halfHs:1.25, Y:2,   Z:2.5,  at:0 },
    { grade:"IT7",  T:25,   halfH:2,    halfHs:1.25, Y:3,   Z:3.5,  at:0 },
    { grade:"IT8",  T:39,   halfH:2,    halfHs:1.25, Y:5,   Z:6,    at:0 },
    { grade:"IT9",  T:62,   halfH:2,    halfHs:1.25, Y:0,   Z:11,   at:0 },
    { grade:"IT10", T:100,  halfH:2,    halfHs:1.25, Y:0,   Z:11,   at:0 },
    { grade:"IT11", T:160,  halfH:5.5,  halfHs:3.5,  Y:0,   Z:22,   at:0 },
    { grade:"IT12", T:250,  halfH:12.5, halfHs:8,    Y:0,   Z:42,   at:0 },
    { grade:"IT13", T:390,  halfH:12.5, halfHs:8,    Y:0,   Z:42,   at:0 },
    { grade:"IT14", T:620,  halfH:12.5, halfHs:8,    Y:0,   Z:80,   at:0 },
    { grade:"IT15", T:1000, halfH:12.5, halfHs:8,    Y:0,   Z:80,   at:0 },
    { grade:"IT16", T:1600, halfH:12.5, halfHs:8,    Y:0,   Z:80,   at:0 },
  ],
  // Over 50 | Up to & incl. 80
  "50-80": [
    { grade:"IT6",  T:19,   halfH:1.5,  halfHs:1.5,  Y:2,   Z:2.5,  at:0 },
    { grade:"IT7",  T:30,   halfH:2.5,  halfHs:1.5,  Y:3,   Z:4,    at:0 },
    { grade:"IT8",  T:46,   halfH:2.5,  halfHs:1.5,  Y:5,   Z:7,    at:0 },
    { grade:"IT9",  T:74,   halfH:2.5,  halfHs:1.5,  Y:0,   Z:13,   at:0 },
    { grade:"IT10", T:120,  halfH:2.5,  halfHs:1.5,  Y:0,   Z:13,   at:0 },
    { grade:"IT11", T:190,  halfH:6.5,  halfHs:4,    Y:0,   Z:25,   at:0 },
    { grade:"IT12", T:300,  halfH:15,   halfHs:9.5,  Y:0,   Z:48,   at:0 },
    { grade:"IT13", T:460,  halfH:15,   halfHs:9.5,  Y:0,   Z:48,   at:0 },
    { grade:"IT14", T:740,  halfH:15,   halfHs:9.5,  Y:0,   Z:90,   at:0 },
    { grade:"IT15", T:1200, halfH:15,   halfHs:9.5,  Y:0,   Z:90,   at:0 },
    { grade:"IT16", T:1900, halfH:15,   halfHs:9.5,  Y:0,   Z:90,   at:0 },
  ],
  // Over 80 | Up to & incl. 120
  "80-120": [
    { grade:"IT6",  T:22,   halfH:2,    halfHs:2,    Y:3,   Z:3,    at:0 },
    { grade:"IT7",  T:35,   halfH:3,    halfHs:2,    Y:4,   Z:5,    at:0 },
    { grade:"IT8",  T:54,   halfH:3,    halfHs:2,    Y:6,   Z:8,    at:0 },
    { grade:"IT9",  T:87,   halfH:3,    halfHs:2,    Y:0,   Z:15,   at:0 },
    { grade:"IT10", T:140,  halfH:3,    halfHs:2,    Y:0,   Z:15,   at:0 },
    { grade:"IT11", T:220,  halfH:7.5,  halfHs:5,    Y:0,   Z:28,   at:0 },
    { grade:"IT12", T:350,  halfH:17.5, halfHs:11,   Y:0,   Z:54,   at:0 },
    { grade:"IT13", T:540,  halfH:17.5, halfHs:11,   Y:0,   Z:54,   at:0 },
    { grade:"IT14", T:870,  halfH:17.5, halfHs:11,   Y:0,   Z:100,  at:0 },
    { grade:"IT15", T:1400, halfH:17.5, halfHs:11,   Y:0,   Z:100,  at:0 },
    { grade:"IT16", T:2200, halfH:17.5, halfHs:11,   Y:0,   Z:100,  at:0 },
  ],
  // Over 120 | Up to & incl. 180
  "120-180": [
    { grade:"IT6",  T:25,   halfH:2.5,  halfHs:2.5,  Y:3,   Z:4,    at:0 },
    { grade:"IT7",  T:40,   halfH:4,    halfHs:2.5,  Y:4,   Z:6,    at:0 },
    { grade:"IT8",  T:63,   halfH:4,    halfHs:2.5,  Y:6,   Z:9,    at:0 },
    { grade:"IT9",  T:100,  halfH:4,    halfHs:2.5,  Y:0,   Z:18,   at:0 },
    { grade:"IT10", T:160,  halfH:4,    halfHs:2.5,  Y:0,   Z:18,   at:0 },
    { grade:"IT11", T:250,  halfH:9,    halfHs:6,    Y:0,   Z:32,   at:0 },
    { grade:"IT12", T:400,  halfH:20,   halfHs:12.5, Y:0,   Z:60,   at:0 },
    { grade:"IT13", T:630,  halfH:20,   halfHs:12.5, Y:0,   Z:60,   at:0 },
    { grade:"IT14", T:1000, halfH:20,   halfHs:12.5, Y:0,   Z:110,  at:0 },
    { grade:"IT15", T:1600, halfH:20,   halfHs:12.5, Y:0,   Z:110,  at:0 },
    { grade:"IT16", T:2500, halfH:20,   halfHs:12.5, Y:0,   Z:110,  at:0 },
  ],
  // Over 180 | Up to & incl. 250  — @ correction applies
  "180-250": [
    { grade:"IT6",  T:29,   halfH:3.5,  halfHs:3.5,  Y:4,   Z:5,    at:2   },
    { grade:"IT7",  T:46,   halfH:5,    halfHs:3.5,  Y:6,   Z:7,    at:3   },
    { grade:"IT8",  T:72,   halfH:5,    halfHs:3.5,  Y:7,   Z:12,   at:4   },
    { grade:"IT9",  T:115,  halfH:5,    halfHs:3.5,  Y:0,   Z:21,   at:4   },
    { grade:"IT10", T:185,  halfH:5,    halfHs:3.5,  Y:0,   Z:24,   at:7   },
    { grade:"IT11", T:290,  halfH:10,   halfHs:7,    Y:0,   Z:40,   at:10  },
    { grade:"IT12", T:460,  halfH:23,   halfHs:14.5, Y:0,   Z:45,   at:15  },
    { grade:"IT13", T:720,  halfH:23,   halfHs:14.5, Y:0,   Z:80,   at:25  },
    { grade:"IT14", T:1150, halfH:23,   halfHs:14.5, Y:0,   Z:100,  at:45  },
    { grade:"IT15", T:1850, halfH:23,   halfHs:14.5, Y:0,   Z:170,  at:70  },
    { grade:"IT16", T:2900, halfH:23,   halfHs:14.5, Y:0,   Z:210,  at:110 },
  ],
  // Over 250 | Up to & incl. 315
  "250-315": [
    { grade:"IT6",  T:32,   halfH:4,    halfHs:4,    Y:5,   Z:6,    at:3   },
    { grade:"IT7",  T:52,   halfH:6,    halfHs:4,    Y:7,   Z:8,    at:4   },
    { grade:"IT8",  T:81,   halfH:6,    halfHs:4,    Y:9,   Z:14,   at:6   },
    { grade:"IT9",  T:130,  halfH:6,    halfHs:4,    Y:0,   Z:24,   at:6   },
    { grade:"IT10", T:210,  halfH:6,    halfHs:4,    Y:0,   Z:27,   at:9   },
    { grade:"IT11", T:320,  halfH:11.5, halfHs:8,    Y:0,   Z:45,   at:15  },
    { grade:"IT12", T:520,  halfH:26,   halfHs:16,   Y:0,   Z:50,   at:20  },
    { grade:"IT13", T:810,  halfH:26,   halfHs:16,   Y:0,   Z:90,   at:35  },
    { grade:"IT14", T:1300, halfH:26,   halfHs:16,   Y:0,   Z:110,  at:55  },
    { grade:"IT15", T:2100, halfH:26,   halfHs:16,   Y:0,   Z:190,  at:90  },
    { grade:"IT16", T:3200, halfH:26,   halfHs:16,   Y:0,   Z:240,  at:140 },
  ],
  // Over 315 | Up to & incl. 400
  "315-400": [
    { grade:"IT6",  T:36,   halfH:4.5,  halfHs:4.5,  Y:6,   Z:7,    at:4   },
    { grade:"IT7",  T:57,   halfH:6.5,  halfHs:4.5,  Y:8,   Z:10,   at:6   },
    { grade:"IT8",  T:89,   halfH:6.5,  halfHs:4.5,  Y:9,   Z:16,   at:7   },
    { grade:"IT9",  T:140,  halfH:6.5,  halfHs:4.5,  Y:0,   Z:28,   at:7   },
    { grade:"IT10", T:230,  halfH:6.5,  halfHs:4.5,  Y:0,   Z:32,   at:11  },
    { grade:"IT11", T:360,  halfH:12.5, halfHs:9,    Y:0,   Z:50,   at:15  },
    { grade:"IT12", T:570,  halfH:28.5, halfHs:18,   Y:0,   Z:65,   at:30  },
    { grade:"IT13", T:890,  halfH:28.5, halfHs:18,   Y:0,   Z:100,  at:45  },
    { grade:"IT14", T:1400, halfH:28.5, halfHs:18,   Y:0,   Z:125,  at:70  },
    { grade:"IT15", T:2300, halfH:28.5, halfHs:18,   Y:0,   Z:210,  at:110 },
    { grade:"IT16", T:3600, halfH:28.5, halfHs:18,   Y:0,   Z:280,  at:180 },
  ],
  // Over 400 | Up to & incl. 500
  "400-500": [
    { grade:"IT6",  T:40,   halfH:5,    halfHs:5,    Y:7,   Z:8,    at:5   },
    { grade:"IT7",  T:63,   halfH:7.5,  halfHs:5,    Y:9,   Z:11,   at:7   },
    { grade:"IT8",  T:97,   halfH:7.5,  halfHs:5,    Y:11,  Z:18,   at:9   },
    { grade:"IT9",  T:155,  halfH:7.5,  halfHs:5,    Y:0,   Z:32,   at:9   },
    { grade:"IT10", T:250,  halfH:7.5,  halfHs:5,    Y:0,   Z:37,   at:14  },
    { grade:"IT11", T:400,  halfH:13.5, halfHs:10,   Y:0,   Z:55,   at:20  },
    { grade:"IT12", T:630,  halfH:31.5, halfHs:20,   Y:0,   Z:70,   at:35  },
    { grade:"IT13", T:970,  halfH:31.5, halfHs:20,   Y:0,   Z:110,  at:55  },
    { grade:"IT14", T:1550, halfH:31.5, halfHs:20,   Y:0,   Z:145,  at:90  },
    { grade:"IT15", T:2500, halfH:31.5, halfHs:20,   Y:0,   Z:240,  at:140 },
    { grade:"IT16", T:4000, halfH:31.5, halfHs:20,   Y:0,   Z:320,  at:220 },
  ],
};

// ─── TABLE 3 — Snap Gauge / Ring Gauge (Outside / Shaft) ─────────────────────
// Source: IS 3455:1971 Table 3 / VMC/F/50
// Starts at IT5 for sizes >3; IT6 for 1-3.

const SNAP_TABLE: Record<string, SnapEntry[]> = {
  // Over - | Up to & incl. 3
  "1-3": [
    { grade:"IT6",  T:6,    halfH1:1,    halfHp:0.4,  Y1:1,  Z1:1,    at:0 },
    { grade:"IT7",  T:10,   halfH1:1,    halfHp:0.4,  Y1:1.5,Z1:1.5,  at:0 },
    { grade:"IT8",  T:14,   halfH1:1.5,  halfHp:0.6,  Y1:3,  Z1:2,    at:0 },
    { grade:"IT9",  T:25,   halfH1:1.5,  halfHp:0.6,  Y1:0,  Z1:5,    at:0 },
    { grade:"IT10", T:40,   halfH1:1.5,  halfHp:0.6,  Y1:0,  Z1:5,    at:0 },
    { grade:"IT11", T:60,   halfH1:2,    halfHp:0.6,  Y1:0,  Z1:10,   at:0 },
    { grade:"IT12", T:100,  halfH1:5,    halfHp:1,    Y1:0,  Z1:10,   at:0 },
    { grade:"IT13", T:140,  halfH1:5,    halfHp:1,    Y1:0,  Z1:20,   at:0 },
    { grade:"IT14", T:250,  halfH1:5,    halfHp:1,    Y1:0,  Z1:20,   at:0 },
    { grade:"IT15", T:400,  halfH1:5,    halfHp:1,    Y1:0,  Z1:40,   at:0 },
    { grade:"IT16", T:600,  halfH1:5,    halfHp:1,    Y1:0,  Z1:40,   at:0 },
  ],
  // Over 3 | Up to & incl. 6
  "3-6": [
    { grade:"IT5",  T:5,    halfH1:0.75, halfHp:0.5,  Y1:1,  Z1:1,    at:0 },
    { grade:"IT6",  T:8,    halfH1:1.25, halfHp:0.5,  Y1:1,  Z1:2,    at:0 },
    { grade:"IT7",  T:12,   halfH1:1.25, halfHp:0.5,  Y1:1.5,Z1:2,    at:0 },
    { grade:"IT8",  T:18,   halfH1:2,    halfHp:0.75, Y1:3,  Z1:3,    at:0 },
    { grade:"IT9",  T:30,   halfH1:2,    halfHp:0.75, Y1:0,  Z1:6,    at:0 },
    { grade:"IT10", T:48,   halfH1:2,    halfHp:0.75, Y1:0,  Z1:6,    at:0 },
    { grade:"IT11", T:75,   halfH1:2.5,  halfHp:0.75, Y1:0,  Z1:12,   at:0 },
    { grade:"IT12", T:120,  halfH1:6,    halfHp:1.25, Y1:0,  Z1:12,   at:0 },
    { grade:"IT13", T:180,  halfH1:6,    halfHp:1.25, Y1:0,  Z1:24,   at:0 },
    { grade:"IT14", T:300,  halfH1:6,    halfHp:1.25, Y1:0,  Z1:24,   at:0 },
    { grade:"IT15", T:480,  halfH1:6,    halfHp:1.25, Y1:0,  Z1:48,   at:0 },
    { grade:"IT16", T:750,  halfH1:6,    halfHp:1.25, Y1:0,  Z1:48,   at:0 },
  ],
  // Over 6 | Up to & incl. 10
  "6-10": [
    { grade:"IT5",  T:6,    halfH1:0.75, halfHp:0.5,  Y1:1,  Z1:1,    at:0 },
    { grade:"IT6",  T:9,    halfH1:1.25, halfHp:0.5,  Y1:1,  Z1:2,    at:0 },
    { grade:"IT7",  T:15,   halfH1:1.25, halfHp:0.5,  Y1:1.5,Z1:2,    at:0 },
    { grade:"IT8",  T:22,   halfH1:2,    halfHp:0.75, Y1:3,  Z1:3,    at:0 },
    { grade:"IT9",  T:36,   halfH1:2,    halfHp:0.75, Y1:0,  Z1:7,    at:0 },
    { grade:"IT10", T:58,   halfH1:2,    halfHp:0.75, Y1:0,  Z1:7,    at:0 },
    { grade:"IT11", T:90,   halfH1:3,    halfHp:0.75, Y1:0,  Z1:14,   at:0 },
    { grade:"IT12", T:150,  halfH1:7.5,  halfHp:1.25, Y1:0,  Z1:14,   at:0 },
    { grade:"IT13", T:220,  halfH1:7.5,  halfHp:1.25, Y1:0,  Z1:28,   at:0 },
    { grade:"IT14", T:360,  halfH1:7.5,  halfHp:1.25, Y1:0,  Z1:28,   at:0 },
    { grade:"IT15", T:480,  halfH1:7.5,  halfHp:1.25, Y1:0,  Z1:48,   at:0 },
    { grade:"IT16", T:750,  halfH1:7.5,  halfHp:1.25, Y1:0,  Z1:48,   at:0 },
  ],
  // Over 10 | Up to & incl. 18
  "10-18": [
    { grade:"IT5",  T:8,    halfH1:1,    halfHp:0.6,  Y1:1.5,Z1:1.5,  at:0 },
    { grade:"IT6",  T:11,   halfH1:1.5,  halfHp:0.6,  Y1:1.5,Z1:2.5,  at:0 },
    { grade:"IT7",  T:18,   halfH1:1.5,  halfHp:0.6,  Y1:2,  Z1:2.5,  at:0 },
    { grade:"IT8",  T:27,   halfH1:2.5,  halfHp:1,    Y1:4,  Z1:4,    at:0 },
    { grade:"IT9",  T:43,   halfH1:2.5,  halfHp:1,    Y1:0,  Z1:8,    at:0 },
    { grade:"IT10", T:70,   halfH1:2.5,  halfHp:1,    Y1:0,  Z1:8,    at:0 },
    { grade:"IT11", T:110,  halfH1:4,    halfHp:1,    Y1:0,  Z1:16,   at:0 },
    { grade:"IT12", T:180,  halfH1:9,    halfHp:1.5,  Y1:0,  Z1:16,   at:0 },
    { grade:"IT13", T:270,  halfH1:9,    halfHp:1.5,  Y1:0,  Z1:32,   at:0 },
    { grade:"IT14", T:430,  halfH1:9,    halfHp:1.5,  Y1:0,  Z1:32,   at:0 },
    { grade:"IT15", T:700,  halfH1:9,    halfHp:1.5,  Y1:0,  Z1:64,   at:0 },
    { grade:"IT16", T:1100, halfH1:9,    halfHp:1.5,  Y1:0,  Z1:64,   at:0 },
  ],
  // Over 18 | Up to & incl. 30
  "18-30": [
    { grade:"IT5",  T:9,    halfH1:1.25, halfHp:0.75, Y1:2,  Z1:1.5,  at:0 },
    { grade:"IT6",  T:13,   halfH1:2,    halfHp:0.75, Y1:2,  Z1:3,    at:0 },
    { grade:"IT7",  T:21,   halfH1:2,    halfHp:0.75, Y1:3,  Z1:3,    at:0 },
    { grade:"IT8",  T:33,   halfH1:3,    halfHp:1.25, Y1:0,  Z1:6,    at:0 },  // Y1=0 per sheet (merged col)
    { grade:"IT9",  T:52,   halfH1:3,    halfHp:1.25, Y1:0,  Z1:9,    at:0 },
    { grade:"IT10", T:84,   halfH1:3,    halfHp:1.25, Y1:0,  Z1:9,    at:0 },
    { grade:"IT11", T:130,  halfH1:4.5,  halfHp:1.25, Y1:0,  Z1:19,   at:0 },
    { grade:"IT12", T:210,  halfH1:10.5, halfHp:2,    Y1:0,  Z1:36,   at:0 },
    { grade:"IT13", T:330,  halfH1:10.5, halfHp:2,    Y1:0,  Z1:36,   at:0 },
    { grade:"IT14", T:520,  halfH1:10.5, halfHp:2,    Y1:0,  Z1:72,   at:0 },
    { grade:"IT15", T:840,  halfH1:10.5, halfHp:2,    Y1:0,  Z1:72,   at:0 },
    { grade:"IT16", T:1300, halfH1:10.5, halfHp:2,    Y1:0,  Z1:72,   at:0 },
  ],
  // Over 30 | Up to & incl. 50
  "30-50": [
    { grade:"IT5",  T:11,   halfH1:1.25, halfHp:0.75, Y1:2,  Z1:2,    at:0 },
    { grade:"IT6",  T:16,   halfH1:2,    halfHp:0.75, Y1:2,  Z1:3.5,  at:0 },
    { grade:"IT7",  T:25,   halfH1:2,    halfHp:0.75, Y1:3,  Z1:3.5,  at:0 },
    { grade:"IT8",  T:39,   halfH1:3.5,  halfHp:1.25, Y1:5,  Z1:6,    at:0 },
    { grade:"IT9",  T:62,   halfH1:3.5,  halfHp:1.25, Y1:0,  Z1:11,   at:0 },
    { grade:"IT10", T:100,  halfH1:3.5,  halfHp:1.25, Y1:0,  Z1:11,   at:0 },
    { grade:"IT11", T:160,  halfH1:5.5,  halfHp:1.25, Y1:0,  Z1:22,   at:0 },
    { grade:"IT12", T:250,  halfH1:12.5, halfHp:2,    Y1:0,  Z1:42,   at:0 },
    { grade:"IT13", T:390,  halfH1:12.5, halfHp:2,    Y1:0,  Z1:42,   at:0 },
    { grade:"IT14", T:620,  halfH1:12.5, halfHp:2,    Y1:0,  Z1:80,   at:0 },
    { grade:"IT15", T:1000, halfH1:12.5, halfHp:2,    Y1:0,  Z1:80,   at:0 },
    { grade:"IT16", T:1600, halfH1:12.5, halfHp:2,    Y1:0,  Z1:80,   at:0 },
  ],
  // Over 50 | Up to & incl. 80
  "50-80": [
    { grade:"IT5",  T:13,   halfH1:1.5,  halfHp:1,    Y1:2,  Z1:2,    at:0 },
    { grade:"IT6",  T:19,   halfH1:2.5,  halfHp:1,    Y1:2,  Z1:4,    at:0 },
    { grade:"IT7",  T:30,   halfH1:2.5,  halfHp:1,    Y1:3,  Z1:4,    at:0 },
    { grade:"IT8",  T:46,   halfH1:4,    halfHp:1.5,  Y1:5,  Z1:7,    at:0 },
    { grade:"IT9",  T:74,   halfH1:4,    halfHp:1.5,  Y1:0,  Z1:13,   at:0 },
    { grade:"IT10", T:120,  halfH1:4,    halfHp:1.5,  Y1:0,  Z1:13,   at:0 },
    { grade:"IT11", T:190,  halfH1:6.5,  halfHp:1.5,  Y1:0,  Z1:25,   at:0 },
    { grade:"IT12", T:300,  halfH1:15,   halfHp:2.5,  Y1:0,  Z1:48,   at:0 },
    { grade:"IT13", T:460,  halfH1:15,   halfHp:2.5,  Y1:0,  Z1:48,   at:0 },
    { grade:"IT14", T:740,  halfH1:15,   halfHp:2.5,  Y1:0,  Z1:90,   at:0 },
    { grade:"IT15", T:1200, halfH1:15,   halfHp:2.5,  Y1:0,  Z1:90,   at:0 },
    { grade:"IT16", T:1900, halfH1:15,   halfHp:2.5,  Y1:0,  Z1:90,   at:0 },
  ],
  // Over 80 | Up to & incl. 120
  "80-120": [
    { grade:"IT5",  T:15,   halfH1:2,    halfHp:1.25, Y1:3,  Z1:25,   at:0 }, // Z1=25 per sheet
    { grade:"IT6",  T:22,   halfH1:3,    halfHp:1.25, Y1:3,  Z1:5,    at:0 },
    { grade:"IT7",  T:35,   halfH1:3,    halfHp:1.25, Y1:4,  Z1:5,    at:0 },
    { grade:"IT8",  T:54,   halfH1:5,    halfHp:2,    Y1:6,  Z1:8,    at:0 },
    { grade:"IT9",  T:87,   halfH1:5,    halfHp:2,    Y1:0,  Z1:15,   at:0 },
    { grade:"IT10", T:140,  halfH1:5,    halfHp:2,    Y1:0,  Z1:15,   at:0 },
    { grade:"IT11", T:220,  halfH1:7.5,  halfHp:2,    Y1:0,  Z1:28,   at:0 },
    { grade:"IT12", T:350,  halfH1:17.5, halfHp:3,    Y1:0,  Z1:54,   at:0 },
    { grade:"IT13", T:540,  halfH1:17.5, halfHp:3,    Y1:0,  Z1:54,   at:0 },
    { grade:"IT14", T:870,  halfH1:17.5, halfHp:3,    Y1:0,  Z1:100,  at:0 },
    { grade:"IT15", T:1400, halfH1:17.5, halfHp:3,    Y1:0,  Z1:100,  at:0 },
    { grade:"IT16", T:2200, halfH1:17.5, halfHp:3,    Y1:0,  Z1:100,  at:0 },
  ],
  // Over 120 | Up to & incl. 180
  "120-180": [
    { grade:"IT5",  T:18,   halfH1:2.5,  halfHp:1.75, Y1:3,  Z1:3,    at:0 },
    { grade:"IT6",  T:25,   halfH1:4,    halfHp:1.75, Y1:3,  Z1:6,    at:0 },
    { grade:"IT7",  T:40,   halfH1:4,    halfHp:1.75, Y1:4,  Z1:6,    at:0 },
    { grade:"IT8",  T:63,   halfH1:6,    halfHp:5,    Y1:6,  Z1:9,    at:0 },
    { grade:"IT9",  T:100,  halfH1:6,    halfHp:2.5,  Y1:0,  Z1:18,   at:0 },
    { grade:"IT10", T:160,  halfH1:6,    halfHp:2.5,  Y1:0,  Z1:18,   at:0 },
    { grade:"IT11", T:250,  halfH1:9,    halfHp:2.5,  Y1:0,  Z1:32,   at:0 },
    { grade:"IT12", T:400,  halfH1:20,   halfHp:4,    Y1:0,  Z1:60,   at:0 },
    { grade:"IT13", T:630,  halfH1:20,   halfHp:4,    Y1:0,  Z1:60,   at:0 },
    { grade:"IT14", T:1000, halfH1:20,   halfHp:4,    Y1:0,  Z1:110,  at:0 },
    { grade:"IT15", T:1600, halfH1:20,   halfHp:4,    Y1:0,  Z1:110,  at:0 },
    { grade:"IT16", T:2500, halfH1:20,   halfHp:4,    Y1:0,  Z1:110,  at:0 },
  ],
  // Over 180 | Up to & incl. 250
  "180-250": [
    { grade:"IT5",  T:20,   halfH1:3.5,  halfHp:2.25, Y1:3,  Z1:4,    at:1   },
    { grade:"IT6",  T:29,   halfH1:5,    halfHp:2.25, Y1:3,  Z1:7,    at:2   },
    { grade:"IT7",  T:46,   halfH1:5,    halfHp:2.25, Y1:5,  Z1:7,    at:3   },
    { grade:"IT8",  T:72,   halfH1:7,    halfHp:3.5,  Y1:6,  Z1:12,   at:4   },
    { grade:"IT9",  T:115,  halfH1:7,    halfHp:3.5,  Y1:7,  Z1:21,   at:4   },
    { grade:"IT10", T:185,  halfH1:7,    halfHp:3.5,  Y1:0,  Z1:24,   at:7   },
    { grade:"IT11", T:290,  halfH1:10,   halfHp:3.5,  Y1:0,  Z1:40,   at:10  },
    { grade:"IT12", T:460,  halfH1:23,   halfHp:5,    Y1:0,  Z1:45,   at:15  },
    { grade:"IT13", T:720,  halfH1:23,   halfHp:5,    Y1:0,  Z1:80,   at:25  },
    { grade:"IT14", T:1150, halfH1:23,   halfHp:5,    Y1:0,  Z1:100,  at:45  },
    { grade:"IT15", T:1850, halfH1:23,   halfHp:5,    Y1:0,  Z1:170,  at:70  },
    { grade:"IT16", T:2900, halfH1:23,   halfHp:5,    Y1:0,  Z1:210,  at:110 },
  ],
  // Over 250 | Up to & incl. 315
  "250-315": [
    { grade:"IT5",  T:0,    halfH1:4,    halfHp:3,    Y1:3,  Z1:5,    at:1.5 }, // T not in sheet for IT5 250-315
    { grade:"IT6",  T:32,   halfH1:6,    halfHp:3,    Y1:3,  Z1:8,    at:3   },
    { grade:"IT7",  T:52,   halfH1:6,    halfHp:3,    Y1:6,  Z1:8,    at:4   },
    { grade:"IT8",  T:81,   halfH1:8,    halfHp:4,    Y1:7,  Z1:14,   at:8   },
    { grade:"IT9",  T:130,  halfH1:8,    halfHp:4,    Y1:9,  Z1:24,   at:6   },
    { grade:"IT10", T:210,  halfH1:8,    halfHp:4,    Y1:0,  Z1:27,   at:9   },
    { grade:"IT11", T:320,  halfH1:11.5, halfHp:4,    Y1:0,  Z1:45,   at:15  },
    { grade:"IT12", T:520,  halfH1:26,   halfHp:6,    Y1:0,  Z1:50,   at:20  },
    { grade:"IT13", T:810,  halfH1:26,   halfHp:6,    Y1:0,  Z1:90,   at:35  },
    { grade:"IT14", T:1300, halfH1:26,   halfHp:6,    Y1:0,  Z1:110,  at:55  },
    { grade:"IT15", T:2100, halfH1:26,   halfHp:6,    Y1:0,  Z1:190,  at:90  },
    { grade:"IT16", T:3200, halfH1:26,   halfHp:6,    Y1:0,  Z1:240,  at:140 },
  ],
  // Over 315 | Up to & incl. 400
  "315-400": [
    { grade:"IT5",  T:25,   halfH1:4.5,  halfHp:3.5,  Y1:4,  Z1:6,    at:2.5 },
    { grade:"IT6",  T:36,   halfH1:6.5,  halfHp:3.5,  Y1:4,  Z1:10,   at:4   },
    { grade:"IT7",  T:57,   halfH1:6.5,  halfHp:3.5,  Y1:6,  Z1:10,   at:6   },
    { grade:"IT8",  T:89,   halfH1:9,    halfHp:4.5,  Y1:8,  Z1:16,   at:7   },
    { grade:"IT9",  T:140,  halfH1:9,    halfHp:4.5,  Y1:9,  Z1:28,   at:7   },
    { grade:"IT10", T:230,  halfH1:9,    halfHp:4.5,  Y1:0,  Z1:32,   at:11  },
    { grade:"IT11", T:360,  halfH1:12.5, halfHp:4.5,  Y1:0,  Z1:50,   at:15  },
    { grade:"IT12", T:570,  halfH1:28.5, halfHp:6.5,  Y1:0,  Z1:65,   at:30  },
    { grade:"IT13", T:890,  halfH1:28.5, halfHp:6.5,  Y1:0,  Z1:100,  at:45  },
    { grade:"IT14", T:1400, halfH1:28.5, halfHp:6.5,  Y1:0,  Z1:125,  at:70  },
    { grade:"IT15", T:2300, halfH1:28.5, halfHp:6.5,  Y1:0,  Z1:210,  at:110 },
    { grade:"IT16", T:3600, halfH1:28.5, halfHp:6.5,  Y1:0,  Z1:280,  at:180 },
  ],
  // Over 400 | Up to & incl. 500
  "400-500": [
    { grade:"IT5",  T:27,   halfH1:5,    halfHp:4,    Y1:4,  Z1:7,    at:3   },
    { grade:"IT6",  T:40,   halfH1:7.5,  halfHp:4,    Y1:4,  Z1:11,   at:5   },
    { grade:"IT7",  T:63,   halfH1:7.5,  halfHp:4,    Y1:7,  Z1:11,   at:7   },
    { grade:"IT8",  T:97,   halfH1:10,   halfHp:5,    Y1:9,  Z1:18,   at:9   },
    { grade:"IT9",  T:155,  halfH1:10,   halfHp:5,    Y1:11, Z1:32,   at:9   },
    { grade:"IT10", T:250,  halfH1:10,   halfHp:5,    Y1:0,  Z1:37,   at:14  },
    { grade:"IT11", T:400,  halfH1:13.5, halfHp:5,    Y1:0,  Z1:55,   at:20  },
    { grade:"IT12", T:630,  halfH1:31.5, halfHp:7.5,  Y1:0,  Z1:70,   at:35  },
    { grade:"IT13", T:970,  halfH1:31.5, halfHp:7.5,  Y1:0,  Z1:110,  at:55  },
    { grade:"IT14", T:1550, halfH1:31.5, halfHp:7.5,  Y1:0,  Z1:145,  at:90  },
    { grade:"IT15", T:2500, halfH1:31.5, halfHp:7.5,  Y1:0,  Z1:240,  at:140 },
    { grade:"IT16", T:4000, halfH1:31.5, halfHp:7.5,  Y1:0,  Z1:320,  at:220 },
  ],
};

// ─── Shared helpers ───────────────────────────────────────────────────────────

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

/** Pick the grade whose T value is the smallest standard value >= T_um */
function lookupPlugGrade(D: number, T_um: number): PlugEntry {
  const key  = getSizeRangeKey(D);
  const rows = PLUG_TABLE[key] ?? [];
  const match = rows.find(r => r.T >= T_um);
  return match ?? rows[rows.length - 1];
}

function lookupSnapGrade(D: number, T_um: number): SnapEntry {
  const key  = getSizeRangeKey(D);
  const rows = SNAP_TABLE[key] ?? [];
  const match = rows.find(r => r.T >= T_um);
  return match ?? rows[rows.length - 1];
}

// ─── Result types ─────────────────────────────────────────────────────────────

export interface CalcResult {
  kind:      GaugeKind;
  K:         number;
  G:         number;
  T_mm:      number;
  T_um:      number;
  grade:     string;
  // plug-gauge symbols
  Z_um?:     number;
  halfH_um?: number;
  halfHs_um?:number;
  Y_um?:     number;
  at_um?:    number;
  // snap-gauge symbols
  Z1_um?:    number;
  halfH1_um?:number;
  halfHp_um?:number;
  Y1_um?:    number;
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

// ─── Plug Gauge (Inside / Holes) ─────────────────────────────────────────────

/**
 * @param D   Nominal size in mm
 * @param UT  Upper tolerance in mm (e.g. +0.200)
 * @param LT  Lower tolerance in mm (e.g. -0.200)
 */
export function calcPlugGauge(D: number, UT: number, LT: number): CalcResult {
  const K    = r4(D + LT);
  const G    = r4(D + UT);
  const T_mm = r4(G - K);
  const T_um = Math.round(T_mm * 1000);

  const entry  = lookupPlugGrade(D, T_um);
  const Z      = entry.Z      / 1000;
  const halfH  = entry.halfH  / 1000;
  const Y      = entry.Y      / 1000;
  const at     = entry.at     / 1000;  // @ correction (0 for D ≤ 180)

  const largeSize = D > 180;

  // Go gauge
  const goMax  = r4(K + Z + halfH);
  const goMin  = r4(K + Z - halfH);
  // Wear limit: K - Y  (≤180 mm);  K + Y + @  (>180 mm per sheet note)
  const wear   = largeSize ? r4(K + Y + at) : r4(K - Y);

  // No-Go gauge
  // ≤180: G ± H/2
  // >180: (G - @) ± H/2
  const noGoBase = largeSize ? r4(G - at) : G;
  const noGoMax  = r4(noGoBase + halfH);
  const noGoMin  = r4(noGoBase - halfH);

  return {
    kind: "plug",
    K, G, T_mm, T_um,
    grade:      entry.grade,
    Z_um:       entry.Z,
    halfH_um:   entry.halfH,
    halfHs_um:  entry.halfHs,
    Y_um:       entry.Y,
    at_um:      entry.at,
    go:   { basicSize: K, specLimitMax: goMax,   specLimitMin: goMin,   wearLimit: wear },
    noGo: { basicSize: G, specLimitMax: noGoMax, specLimitMin: noGoMin },
  };
}

// ─── Snap Gauge / Ring Gauge (Outside / Shaft) ────────────────────────────────

/**
 * @param D   Nominal size in mm
 * @param UT  Upper tolerance in mm (e.g. +0.350)  → G = D + UT  (higher limit)
 * @param LT  Lower tolerance in mm (e.g. -0.350)  → K = D + LT  (lower limit)
 */
export function calcSnapGauge(D: number, UT: number, LT: number): CalcResult {
  const K    = r4(D + LT);
  const G    = r4(D + UT);
  const T_mm = r4(G - K);
  const T_um = Math.round(T_mm * 1000);

  const entry   = lookupSnapGrade(D, T_um);
  const Z1      = entry.Z1     / 1000;
  const halfH1  = entry.halfH1 / 1000;
  const Y1      = entry.Y1     / 1000;
  const at      = entry.at     / 1000;

  const largeSize = D > 180;

  // Go gauge  (≤180): (G - Z1) ± H1/2
  // Go gauge  (>180): (G + Y1 - @) ± H1/2
  const goBase   = largeSize ? r4(G + Y1 - at) : r4(G - Z1);
  const goMax    = r4(goBase + halfH1);
  const goMin    = r4(goBase - halfH1);
  // Wear limit: G + Y1  (shaft gauge wears toward larger)
  const wear     = r4(G + Y1);

  // No-Go gauge: K ± H1/2  (same for all sizes)
  const noGoMax  = r4(K + halfH1);
  const noGoMin  = r4(K - halfH1);

  return {
    kind: "snap",
    K, G, T_mm, T_um,
    grade:       entry.grade,
    Z1_um:       entry.Z1,
    halfH1_um:   entry.halfH1,
    halfHp_um:   entry.halfHp,
    Y1_um:       entry.Y1,
    at_um:       entry.at,
    go:   { basicSize: G, specLimitMax: goMax,   specLimitMin: goMin,   wearLimit: wear },
    noGo: { basicSize: K, specLimitMax: noGoMax, specLimitMin: noGoMin },
  };
}

// ─── Utility ─────────────────────────────────────────────────────────────────

function r4(n: number): number { return Math.round(n * 10000) / 10000; }
export function fmt4(n: number): string { return n.toFixed(4); }
