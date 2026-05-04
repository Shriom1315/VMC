import { createClient } from "@supabase/supabase-js";

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  as string;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnon) {
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env");
}

export const supabase = createClient(supabaseUrl, supabaseAnon);

// ── Database types (mirrors the SQL schema) ───────────────────────────────────

export interface DbParty {
  id: number;
  name: string;
  address: string;
  contact: string;
  gst_no: string;
  email: string;
  gst_type: string;
  other_access: string;
  billing_rate_type: string;
  discount_rate: string;
  collab_method: string;
  reporting_method: string;
  collation_method: string;
  dispatch_method: string;
  compliance: string;
  decision_rule: string;
  billing_firm: string;
  created_at?: string;
}

export interface DbGauge {
  id: number;
  gauge_name: string;
  is_no: string;
  non_nabl_no: string;
  nabl_no: string;
  raw_datasheet_frmt: string;
  cert_code: string;
  calibration_method: string;
  gauge_type: string;
  env_conditions: string;
  datasheet: string;
  certificate: string;
  calibration: string;
  created_at?: string;
}

export interface DbUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "staff";
  status: "active" | "inactive";
  last_login: string;
  created_by: string;
  created_at?: string;
}

export interface DbCalibJob {
  id: string;
  lab_id: string;
  name: string;
  identification_no: string;
  specification: string;
  manu_sr: string;
  process: string;
  dc_no: string;
  dc_date: string;
  calib_date: string;
  next_calib_date: string;
  cert_no: string;
  cert_issue_date: string;
  ulr_no: string;
  sr_no: string;
  make: string;
  lc: string;
  ref_is_std: string;
  calib_method_use: string;
  standard_equipment: string[];
  client_name: string;
  client_address: string;
  condition_of_gauge: string;
  date_received: string;
  calib_temp: string;
  uncertainty: string;
  calib_location: string;
  remark: string;
  calibrated_by: string;
  approved_by: string;
  status: "pending" | "generated";
  created_at?: string;
}
