import { createClient } from "@supabase/supabase-js";

const rawSupabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || "";
const rawSupabaseKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || "";

const hasValidSupabaseKeys = Boolean(
  rawSupabaseUrl &&
  rawSupabaseKey &&
  !rawSupabaseUrl.includes("placeholder")
);

const supabaseUrl = hasValidSupabaseKeys ? rawSupabaseUrl : "https://placeholder.supabase.co";
const supabaseKey = hasValidSupabaseKeys ? rawSupabaseKey : "placeholder-anon-key";

export const realSupabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// In-flight query deduplication map to prevent redundant concurrent fetches
const inFlightRequests = new Map<string, Promise<any>>();

// Smart Query Builder that bridges Supabase Cloud and Local PostgreSQL API with Redis acceleration
class SmartQueryBuilder {
  private table: string;
  private action: "select" | "insert" | "update" | "delete" | "upsert" = "select";
  private payload: any = null;
  private selectCols: string = "*";
  private eqCol: string | null = null;
  private eqVal: any = null;
  private orderCol: string | null = null;
  private isAscending: boolean | null = null;
  private limitCount: number | null = null;
  private isSingle: boolean = false;
  private realQuery: any;

  constructor(table: string) {
    this.table = table;
    this.realQuery = realSupabase.from(table);
  }

  select(columns: string = "*") {
    this.action = "select";
    this.selectCols = columns;
    this.realQuery = this.realQuery.select(columns);
    return this;
  }

  insert(values: any) {
    this.action = "insert";
    this.payload = values;
    this.realQuery = this.realQuery.insert(values);
    return this;
  }

  update(values: any) {
    this.action = "update";
    this.payload = values;
    this.realQuery = this.realQuery.update(values);
    return this;
  }

  delete() {
    this.action = "delete";
    this.realQuery = this.realQuery.delete();
    return this;
  }

  upsert(values: any, options?: any) {
    this.action = "upsert";
    this.payload = values;
    this.realQuery = this.realQuery.upsert(values, options);
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderCol = column;
    this.isAscending = options?.ascending ?? true;
    this.realQuery = this.realQuery.order(column, options);
    return this;
  }

  eq(column: string, value: any) {
    this.eqCol = column;
    this.eqVal = value;
    this.realQuery = this.realQuery.eq(column, value);
    return this;
  }

  neq(column: string, value: any) {
    this.realQuery = this.realQuery.neq(column, value);
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    this.realQuery = this.realQuery.limit(count);
    return this;
  }

  single() {
    this.isSingle = true;
    this.realQuery = this.realQuery.single();
    return this;
  }

  // Promise then-able interface for async/await & .then() support
  then(resolve: (res: { data: any; error: any }) => void, reject?: (reason: any) => void) {
    this.execute().then(resolve, reject);
  }

  async execute(): Promise<{ data: any; error: any }> {
    // Invalidate client caches on mutation
    if (this.action !== "select") {
      inFlightRequests.clear();
      try {
        localStorage.removeItem(`vmc_offline_${this.table}`);
      } catch (_) {}
    }

    // 1. Try Supabase Cloud if valid credentials are present
    if (hasValidSupabaseKeys) {
      try {
        const res = await this.realQuery;
        if (!res.error) {
          return res;
        }
      } catch (_) {
        // Fallback to local API on fetch error
      }
    }

    // 2. Fallback to Local Express / PostgreSQL API (Accelerated by Redis)
    try {
      if (this.action === "select") {
        const params = new URLSearchParams();
        if (this.selectCols && this.selectCols !== "*") {
          params.append("select", this.selectCols);
        }
        if (this.eqCol && this.eqVal !== undefined) {
          params.append(`eq_${this.eqCol}`, String(this.eqVal));
        }
        if (this.orderCol) {
          params.append("order", this.orderCol);
          if (this.isAscending !== null) {
            params.append("ascending", String(this.isAscending));
          }
        }
        if (this.limitCount) {
          params.append("limit", String(this.limitCount));
        }

        const queryString = params.toString();
        const url = queryString ? `/api/db/${this.table}?${queryString}` : `/api/db/${this.table}`;
        const cacheKey = `select:${this.table}:${queryString}`;

        let fetchPromise = inFlightRequests.get(cacheKey);

        if (!fetchPromise) {
          fetchPromise = fetch(url)
            .then(async (res) => {
              if (res.ok) return await res.json();
              return [];
            })
            .finally(() => {
              setTimeout(() => inFlightRequests.delete(cacheKey), 1000);
            });
          inFlightRequests.set(cacheKey, fetchPromise);
        }

        let rows = await fetchPromise;

        if (Array.isArray(rows)) {
          if (rows.length > 0 && !queryString) {
            try {
              localStorage.setItem(`vmc_offline_${this.table}`, JSON.stringify(rows));
            } catch (_) {}
          }
          if (this.isSingle) {
            return { data: rows[0] || null, error: null };
          }
          return { data: rows, error: null };
        }
      } else if (this.action === "insert") {
        const res = await fetch(`/api/db/${this.table}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(this.payload),
        });
        if (res.ok) {
          const inserted = await res.json();
          return { data: inserted, error: null };
        }
      } else if (this.action === "update" || this.action === "upsert") {
        const id = this.eqVal || (this.payload && !Array.isArray(this.payload) ? this.payload.id : null);
        const url = id ? `/api/db/${this.table}/${id}` : `/api/db/${this.table}`;
        const method = id ? "PUT" : "POST";
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(this.payload),
        });
        if (res.ok) {
          const updated = await res.json();
          return { data: updated, error: null };
        }
      } else if (this.action === "delete") {
        if (this.eqVal) {
          const res = await fetch(`/api/db/${this.table}/${this.eqVal}`, { method: "DELETE" });
          if (res.ok) {
            return { data: null, error: null };
          }
        }
      }
    } catch (e: any) {
      console.warn(`Local API query failed for ${this.table}:`, e.message);
    }

    // 3. Fallback to localStorage Cache for SELECT
    if (this.action === "select") {
      const cached = localStorage.getItem(`vmc_offline_${this.table}`);
      if (cached) {
        try {
          const rows = JSON.parse(cached);
          return { data: this.isSingle ? rows[0] : rows, error: null };
        } catch (_) {}
      }
    }

    return { data: [], error: null };
  }
}

// Transparent Supabase Proxy export
export const supabase = {
  auth: realSupabase.auth,
  from: (table: string) => new SmartQueryBuilder(table),
};

// Database types
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
