/**
 * Vikramaditya Metrology — Full Setup Script
 *
 * Does everything in one run:
 *  1. Creates the admin Supabase Auth account
 *  2. Seeds all tables with current mock data
 *
 * Run AFTER executing scripts/schema.sql in Supabase SQL Editor.
 *
 * Usage:
 *   npx tsx scripts/setup.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config();

const URL     = process.env.VITE_SUPABASE_URL!;
const SVC_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!URL || !SVC_KEY) {
  console.error("❌  Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

// Service-role client — bypasses RLS, used only in this script
const sb = createClient(URL, SVC_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─── helpers ──────────────────────────────────────────────────────────────────

async function upsert(table: string, data: object[], conflictCol = "id") {
  const { error } = await sb.from(table).upsert(data as any, { onConflict: conflictCol });
  if (error) {
    console.error(`  ✗ ${table}:`, error.message);
  } else {
    console.log(`  ✓ ${table}: ${(data as any[]).length} rows seeded`);
  }
}

// ─── 1. Create admin auth account ─────────────────────────────────────────────

async function createAdminAccount() {
  console.log("\n👤  Creating admin auth account...");

  const ADMIN_EMAIL    = process.env.ADMIN_EMAIL || "admin@vikramaditya.com";
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@VMC2026";

  // Check if already exists
  const { data: existing } = await sb.auth.admin.listUsers();
  const alreadyExists = (existing as any)?.users?.some((u: any) => u.email === ADMIN_EMAIL);

  if (alreadyExists) {
    console.log("  ℹ  Admin account already exists — skipping creation");
    return;
  }

  const { data, error } = await sb.auth.admin.createUser({
    email:          ADMIN_EMAIL,
    password:       ADMIN_PASSWORD,
    email_confirm:  true,           // skip email verification
    user_metadata: {
      name:   "Kiran Patil",
      role:   "admin",
      avatar: "KP",
    },
  });

  if (error) {
    console.error("  ✗ Failed to create admin:", error.message);
  } else {
    console.log("  ✓ Admin account created");
    console.log("    Email   :", ADMIN_EMAIL);
    console.log("    Password:", ADMIN_PASSWORD);
    console.log("    User ID :", data.user?.id);
  }
}

// ─── 2. Seed all tables ───────────────────────────────────────────────────────

const ENV = "20°C ± 2°C & Humidity 40 to 60 % Rh.";

async function seedParties() {
  await upsert("parties", [
    { id: 12,  name: "ANWITA ENTERPRISES",                         address: "DR. J.J. MAGDUM HSG. SOC. PLOT NO. 37, MOUJE AGAR JAYSINGPUR, TAL. SHIROL, DIST- KOLHAPUR", contact: "7757865993", gst_no: "27APJPC2174D1Z8",  email: "-",                               gst_type: "CGST/SGST", other_access: "No", billing_rate_type: "Fixed Discount %", discount_rate: "", collab_method: "Lab Method", reporting_method: "Lab Format", collation_method: "By Hand", dispatch_method: "By Hand", compliance: "Required", decision_rule: "Yes", billing_firm: "Vikramaditya Calibration" },
    { id: 56,  name: "Sound Castings Pvt. Ltd. Unit-3",            address: "151/1, Kallapaanna Aavade Textile Park, Tardal, Hatkanangale, Dist. Kolhapur-416121.",        contact: "7744053500", gst_no: "27AACCS5263N1ZW", email: "pratiraj.patil@soundcastings.com", gst_type: "CGST/SGST", other_access: "No", billing_rate_type: "Fixed Discount %", discount_rate: "", collab_method: "Lab Method", reporting_method: "Lab Format", collation_method: "By Hand", dispatch_method: "By Hand", compliance: "Required", decision_rule: "Yes", billing_firm: "Vikramaditya Calibration" },
    { id: 105, name: "SHRI DATTA FOUNDERS AND ENGINEERS PVT.LTD.", address: "B-33, M.I.D.C. SHIROLI, KOLHAPUR-416122",                                                    contact: "9049879305", gst_no: "27AANCS0625R1ZM", email: "vishalpadalkar.sdf@gmail.com",      gst_type: "CGST/SGST", other_access: "No", billing_rate_type: "Fixed Discount %", discount_rate: "", collab_method: "Lab Method", reporting_method: "Lab Format", collation_method: "By Hand", dispatch_method: "By Hand", compliance: "Required", decision_rule: "Yes", billing_firm: "Vikramaditya Calibration" },
    { id: 572, name: "ASHTVINAYAK ENGINEERS",                      address: "KUSHIRE",                                                                                      contact: "-",          gst_no: "-",              email: "-",                               gst_type: "CGST/SGST", other_access: "No", billing_rate_type: "Fixed Discount %", discount_rate: "", collab_method: "Lab Method", reporting_method: "Lab Format", collation_method: "By Hand", dispatch_method: "By Hand", compliance: "Required", decision_rule: "Yes", billing_firm: "Vikramaditya Calibration" },
    { id: 686, name: "SAMRUDDHI ENGINEERS",                        address: "Gat No. 522/1, Plot No. 2, Vijaynagar, Nerli, MIDC Gokul Shirgaon, Kolhapur- 416 234",        contact: "9890249086", gst_no: "27AKYPM5715A1ZY", email: "smruddhi.3@gmail.com",             gst_type: "CGST/SGST", other_access: "No", billing_rate_type: "Fixed Discount %", discount_rate: "", collab_method: "Lab Method", reporting_method: "Lab Format", collation_method: "By Hand", dispatch_method: "By Hand", compliance: "Required", decision_rule: "Yes", billing_firm: "Vikramaditya Calibration" },
    { id: 843, name: "EAGAR STAR",                                 address: "G-95, SHIROLI MIDC, KOLHAPUR",                                                                 contact: "-",          gst_no: "27AAJFE7714N1ZX", email: "-",                               gst_type: "CGST/SGST", other_access: "No", billing_rate_type: "Fixed Discount %", discount_rate: "", collab_method: "Lab Method", reporting_method: "Lab Format", collation_method: "By Hand", dispatch_method: "By Hand", compliance: "Required", decision_rule: "Yes", billing_firm: "Vikramaditya Calibration" },
    { id: 848, name: "Sound Castings Pvt. Ltd. Unit-3 (IFDC)",     address: "151/1, Kallapaanna Aavade Textile Park, Tardal, Hatkanangale, Dist. Kolhapur-416121.",        contact: "9970678872", gst_no: "27AACCS5263N1ZW", email: "Shekhar.Khot@soundcastings.com",   gst_type: "CGST/SGST", other_access: "No", billing_rate_type: "Fixed Discount %", discount_rate: "", collab_method: "Lab Method", reporting_method: "Lab Format", collation_method: "By Hand", dispatch_method: "By Hand", compliance: "Required", decision_rule: "Yes", billing_firm: "Vikramaditya Calibration" },
    { id: 849, name: "QA SOUND CASTING PVT. LTD.",                 address: "151/1, Kallapaanna Aavade Textile Park, Tardal, Hatkanangale, Dist. Kolhapur-416121.",        contact: "8805967627", gst_no: "27AACCS5263N1ZW", email: "paresh.bhagwat@soundcastings.com", gst_type: "CGST/SGST", other_access: "No", billing_rate_type: "Fixed Discount %", discount_rate: "", collab_method: "Lab Method", reporting_method: "Lab Format", collation_method: "By Hand", dispatch_method: "By Hand", compliance: "Required", decision_rule: "Yes", billing_firm: "Vikramaditya Calibration" },
    { id: 850, name: "AATHARV ENTERPRISES",                        address: "G-95, SHIROLI MIDC, KOLHAPUR",                                                                 contact: "8180909007", gst_no: "27EMHPP4751A1Z2",  email: "-",                               gst_type: "CGST/SGST", other_access: "No", billing_rate_type: "Fixed Discount %", discount_rate: "", collab_method: "Lab Method", reporting_method: "Lab Format", collation_method: "By Hand", dispatch_method: "By Hand", compliance: "Required", decision_rule: "Yes", billing_firm: "Vikramaditya Calibration" },
    { id: 859, name: "METACAST AUTO PRIVATE LIMITED",              address: "PLOT NO.T-26 KAGAL - HATKANANGALE FIVE STAR INDUSTRIAL AREA KOLHAPUR",                        contact: "-",          gst_no: "27AAQCM8947H1ZO", email: "-",                               gst_type: "CGST/SGST", other_access: "No", billing_rate_type: "Fixed Discount %", discount_rate: "", collab_method: "Lab Method", reporting_method: "Lab Format", collation_method: "By Hand", dispatch_method: "By Hand", compliance: "Required", decision_rule: "Yes", billing_firm: "Vikramaditya Calibration" },
  ]);
}

async function seedGauges() {
  await upsert("gauges", [
    { id: 2,  gauge_name: "Internal Micrometer",       is_no: "IS:2566",               non_nabl_no: "VMC/F/55, Rev.-00, Rev. Date: --", nabl_no: "VMC/F/55, Rev.-00, Rev. Date: --", raw_datasheet_frmt: "VMC/F/4S-P-26", cert_code: "VMC-IMM",  calibration_method: "Tolerance Method", gauge_type: "External Micrometer",  env_conditions: ENV, datasheet: "VMC/F/4S-P-26", certificate: "VMC-IMM",  calibration: "VMC/P/26"  },
    { id: 3,  gauge_name: "Angle Plate",               is_no: "IS: 2534 OI 1971",     non_nabl_no: "VMC/I/55, Rev.-00, Rev. Date: --", nabl_no: "VMC/I/55, Rev.-00, Rev. Date: --", raw_datasheet_frmt: "VMC/I-45/P-xx", cert_code: "VMC-AP",   calibration_method: "Tolerance Method", gauge_type: "V Block",              env_conditions: ENV, datasheet: "VMC/I-45/P-xx", certificate: "VMC-AP",   calibration: "VMC/P/XXX" },
    { id: 4,  gauge_name: "Ring Gauge",                is_no: "IS-3485",               non_nabl_no: "VMC/F/55, Rev.-00, Rev. Date: --", nabl_no: "VMC/F/55, Rev.-00, Rev. Date: --", raw_datasheet_frmt: "VMC/F/45-P-05", cert_code: "VMC/MRG",  calibration_method: "Tolerance Method", gauge_type: "Master Ring",          env_conditions: ENV, datasheet: "VMC/F/45-P-05", certificate: "VMC/MRG",  calibration: "VMC/P/05"  },
    { id: 5,  gauge_name: "Digital Dial Gauge.",       is_no: "IS-2092",               non_nabl_no: "VMC/I/55, Rev.-00, Rev. Date: --", nabl_no: "VMC/I/55, Rev.-00, Rev. Date: --", raw_datasheet_frmt: "VMC/I/45/P-30", cert_code: "VMC/DDG",  calibration_method: "Tolerance Method", gauge_type: "Digital Dial Gauge",   env_conditions: ENV, datasheet: "VMC/I/45/P-30", certificate: "VMC/DDG",  calibration: "VMC/P/30"  },
    { id: 6,  gauge_name: "Depth Micrometer",          is_no: "BS-6468",               non_nabl_no: "VMC/F/55, Rev.-00, Rev. Date: --", nabl_no: "VMC/F/55, Rev.-00, Rev. Date: --", raw_datasheet_frmt: "VMC/F/45/P-24", cert_code: "VMC/DM",   calibration_method: "Tolerance Method", gauge_type: "External Micrometer",  env_conditions: ENV, datasheet: "VMC/F/45/P-24", certificate: "VMC/DM",   calibration: "VMC/P/24"  },
    { id: 7,  gauge_name: "Plain Taper Plug Gauge",    is_no: "IS-9529",               non_nabl_no: "VMC/I/55, Rev.-00, Rev. Date: --", nabl_no: "VMC/I/55, Rev.-00, Rev. Date: --", raw_datasheet_frmt: "VMC/I/45/P-15", cert_code: "VMC-PTPG", calibration_method: "Tolerance Method", gauge_type: "Taper Plug Gauge",     env_conditions: ENV, datasheet: "VMC/I/45/P-15", certificate: "VMC-PTPG", calibration: "VMC/P/15"  },
    { id: 8,  gauge_name: "Plain Taper Ring Gauge.",   is_no: "IS 9529",               non_nabl_no: "VMC/F/55, Rev.-00, Rev. Date: --", nabl_no: "VMC/F/55, Rev.-00, Rev. Date: --", raw_datasheet_frmt: "VMC/F-45/P-18", cert_code: "VMC-PTRG", calibration_method: "Tolerance Method", gauge_type: "Taper Ring Gauge",     env_conditions: ENV, datasheet: "VMC/F-45/P-18", certificate: "VMC-PTRG", calibration: "VMC/P/18"  },
    { id: 9,  gauge_name: "Comparator Stand.",         is_no: "IS-7599 (PART I, II)", non_nabl_no: "VMC/F/55, Rev.-00, Rev. Date: --", nabl_no: "VMC/F/55, Rev.-00, Rev. Date: --", raw_datasheet_frmt: "VMC/F-45/P-23", cert_code: "VMC-CS",   calibration_method: "Tolerance Method", gauge_type: "Comparator Stand",     env_conditions: ENV, datasheet: "VMC/F-45/P-23", certificate: "VMC-CS",   calibration: "VMC/P/23"  },
    { id: 10, gauge_name: "Plain Plug Gauge.",         is_no: "IS 3455",               non_nabl_no: "VMC/F/55, Rev.-00, Rev. Date: --", nabl_no: "VMC/F/55, Rev.-00, Rev. Date: --", raw_datasheet_frmt: "VMC/F-45/P-01", cert_code: "VMC-PG",   calibration_method: "Tolerance Method", gauge_type: "OD Limit Gauge",       env_conditions: ENV, datasheet: "VMC/F-45/P-01", certificate: "VMC-PG",   calibration: "VMC/P/01"  },
    { id: 11, gauge_name: "Paddle Plug Gauge.",        is_no: "IS 3455",               non_nabl_no: "VMC/F/55, Rev.-00, Rev. Date: --", nabl_no: "VMC/F/55, Rev.-00, Rev. Date: --", raw_datasheet_frmt: "VMC/F-45/P-01", cert_code: "VMC-PPG",  calibration_method: "Tolerance Method", gauge_type: "OD Limit Gauge",       env_conditions: ENV, datasheet: "VMC/F-45/P-01", certificate: "VMC-PPG",  calibration: "VMC/P/01"  },
  ]);
}

async function seedAppUsers() {
  await upsert("app_users", [
    { id: "00000000-0000-0000-0000-000000000001", name: "Kiran Patil",   email: "admin@vikramaditya.com",   role: "admin",   status: "active",   last_login: "2026-05-04", created_by: "admin"   },
    { id: "00000000-0000-0000-0000-000000000002", name: "Rahul Desai",   email: "manager@vikramaditya.com", role: "manager", status: "active",   last_login: "2026-05-04", created_by: "admin"   },
    { id: "00000000-0000-0000-0000-000000000003", name: "Priya Jadhav",  email: "staff@vikramaditya.com",   role: "staff",   status: "active",   last_login: "2026-05-04", created_by: "manager" },
    { id: "00000000-0000-0000-0000-000000000004", name: "Amit Kulkarni", email: "amit@vikramaditya.com",    role: "staff",   status: "inactive", last_login: "2026-03-12", created_by: "manager" },
  ]);
}

async function seedCalibJobs() {
  await upsert("calib_jobs", [
    { id: "00000000-0000-0000-0001-000000000001", lab_id: "26041", name: "Plain Plug Gauge.",  identification_no: "Vmc/19",    specification: "10 ( 0.1 / -0.1 ) mm", manu_sr: "455366",   process: "Calibration", dc_no: "Xxxx", dc_date: "2025-12-28", calib_date: "2025-12-30", next_calib_date: "2025-12-30", cert_no: "26/05/1", cert_issue_date: "2025-12-30", ulr_no: "", sr_no: "75", make: "",          lc: "LC", ref_is_std: "", calib_method_use: "Tolerance Method", standard_equipment: ["COMPARATOR STAND||600X90X95","DIGITAL PLUNGER DIAL||0-12.7"], client_name: "VIKRAMADITYA METROLOGY CENTER LLP.", client_address: "PLOT NO.A-15/1, NEAR ULTRATECH CEMENT MIDC SHIROLI(P), TAL HATKANAGALE, DIST:KOLHAPUR", condition_of_gauge: "Visually Ok", date_received: "2025-12-30", calib_temp: "20°C ± 2°C & Humidity 40 to 60 % Rh.", uncertainty: "± 1 μm.", calib_location: "Permanent Facility", remark: "* Due date given as per customer request..", calibrated_by: "Rohit Patil", approved_by: "Kiran Patil", status: "pending"   },
    { id: "00000000-0000-0000-0001-000000000002", lab_id: "26052", name: "Plain Plug Gauge.",  identification_no: "VMC/PG/19", specification: "Range -,-,-",           manu_sr: "87987895", process: "Calibration", dc_no: "Xxxx", dc_date: "2025-12-28", calib_date: "2025-12-30", next_calib_date: "2025-12-30", cert_no: "26/05/2", cert_issue_date: "2025-12-30", ulr_no: "", sr_no: "80", make: "SHRINIWAS", lc: "",   ref_is_std: "", calib_method_use: "Tolerance Method", standard_equipment: ["COMPARATOR STAND||600X90X95","DIGITAL PLUNGER DIAL||0-12.7"], client_name: "VIKRAMADITYA METROLOGY CENTER LLP.", client_address: "PLOT NO.A-15/1, NEAR ULTRATECH CEMENT MIDC SHIROLI(P), TAL HATKANAGALE, DIST:KOLHAPUR", condition_of_gauge: "Visually Ok", date_received: "2025-12-30", calib_temp: "20°C ± 2°C & Humidity 40 to 60 % Rh.", uncertainty: "± 1 μm.", calib_location: "Permanent Facility", remark: "* Due date given as per customer request..", calibrated_by: "Rohit Patil", approved_by: "Kiran Patil", status: "pending"   },
    { id: "00000000-0000-0000-0001-000000000003", lab_id: "26053", name: "(ILC) Lever Dial..", identification_no: "",          specification: "Range -,-,-",           manu_sr: "",         process: "Calibration", dc_no: "Xxxx", dc_date: "2025-12-28", calib_date: "2025-12-30", next_calib_date: "2025-12-30", cert_no: "26/05/3", cert_issue_date: "2025-12-30", ulr_no: "", sr_no: "",   make: "",          lc: "",   ref_is_std: "", calib_method_use: "Tolerance Method", standard_equipment: ["COMPARATOR STAND||600X90X95"],                                    client_name: "VIKRAMADITYA METROLOGY CENTER LLP.", client_address: "PLOT NO.A-15/1, NEAR ULTRATECH CEMENT MIDC SHIROLI(P), TAL HATKANAGALE, DIST:KOLHAPUR", condition_of_gauge: "Visually Ok", date_received: "2025-12-30", calib_temp: "20°C ± 2°C & Humidity 40 to 60 % Rh.", uncertainty: "± 1 μm.", calib_location: "Permanent Facility", remark: "* Due date given as per customer request..", calibrated_by: "Rohit Patil", approved_by: "Kiran Patil", status: "generated" },
  ]);
}

async function seedDispatches() {
  await upsert("dispatches", [
    { id: "00000000-0000-0000-0002-000000000001", job_id: "JOB-003", party: "Starfleet Command", instruments: "Dial Indicator (DI-1102)",  dc_no: "DC/2026/001", dispatch_date: "2026-05-02", courier: "By Hand", tracking_no: "-",          received_by: "Geordi La Forge", status: "delivered"  },
    { id: "00000000-0000-0000-0002-000000000002", job_id: "JOB-005", party: "Cyberdyne Systems", instruments: "Pressure Gauge (PG-3301)", dc_no: "DC/2026/002", dispatch_date: "2026-05-03", courier: "DTDC",     tracking_no: "DTDC123456", received_by: "",               status: "dispatched" },
  ]);
}

async function seedInvoices() {
  await upsert("invoices", [
    { id: "00000000-0000-0000-0003-000000000001", invoice_no: "INV/2026/001", party: "Starfleet Command",  dc_ref: "DC/2026/001", invoice_date: "2026-05-03", amount: 4500,  gst_amount: 810,  total: 5310,  status: "paid"    },
    { id: "00000000-0000-0000-0003-000000000002", invoice_no: "INV/2026/002", party: "Cyberdyne Systems",  dc_ref: "DC/2026/002", invoice_date: "2026-05-04", amount: 8200,  gst_amount: 1476, total: 9676,  status: "issued"  },
    { id: "00000000-0000-0000-0003-000000000003", invoice_no: "INV/2026/003", party: "Adeptus Mechanicus", dc_ref: "—",           invoice_date: "2026-04-10", amount: 12000, gst_amount: 2160, total: 14160, status: "overdue" },
  ]);
}

async function seedReceipts() {
  await upsert("receipts", [
    { id: "00000000-0000-0000-0004-000000000001", receipt_no: "RCP/2026/001", party: "Starfleet Command", invoice_ref: "INV/2026/001", receipt_date: "2026-05-05", amount: 5310, mode: "upi",    reference: "UPI/2026/TXN001" },
    { id: "00000000-0000-0000-0004-000000000002", receipt_no: "RCP/2026/002", party: "Cyberdyne Systems", invoice_ref: "INV/2026/002", receipt_date: "2026-05-06", amount: 5000, mode: "cheque", reference: "CHQ-004521"      },
  ]);
}

// ─── main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("╔══════════════════════════════════════════════╗");
  console.log("║  Vikramaditya Metrology — Database Setup     ║");
  console.log("╚══════════════════════════════════════════════╝");

  await createAdminAccount();

  console.log("\n📦  Seeding tables...");
  await seedParties();
  await seedGauges();
  await seedAppUsers();
  await seedCalibJobs();
  await seedDispatches();
  await seedInvoices();
  await seedReceipts();

  console.log("\n╔══════════════════════════════════════════════╗");
  console.log("║  ✅  Setup complete!                          ║");
  console.log("╠══════════════════════════════════════════════╣");
  console.log("║  Admin login credentials:                    ║");
  console.log("║  Email   : admin@vikramaditya.com            ║");
  console.log("║  Password: Admin@VMC2026                     ║");
  console.log("╚══════════════════════════════════════════════╝\n");
}

main().catch(err => {
  console.error("\n❌  Setup failed:", err.message ?? err);
  process.exit(1);
});
