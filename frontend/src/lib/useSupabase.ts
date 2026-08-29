import { useState, useEffect } from "react";
import { supabase } from "./supabase";

/** Generic hook: fetch all rows from a table, with dual-mode fallback for server and offline storage */
export function useTable<T>(
  table: string,
  options?: {
    orderBy?: string;
    ascending?: boolean;
    searchCol?: string;
    searchVal?: string;
  }
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTableData = async () => {
    setLoading(true);
    let rows: T[] | null = null;
    let fetchErr: string | null = null;

    // 1. Try Supabase Cloud
    try {
      let q = supabase.from(table).select("*");
      if (options?.orderBy) {
        q = q.order(options.orderBy, { ascending: options?.ascending ?? true });
      }
      const res = await q;
      if (!res.error && res.data && res.data.length > 0) {
        rows = res.data as T[];
      } else if (res.error) {
        fetchErr = res.error.message;
      }
    } catch (e: any) {
      fetchErr = e.message;
    }

    // 2. If Supabase is offline or empty, fallback to local Express / Postgres API
    if (!rows || rows.length === 0) {
      try {
        const localRes = await fetch(`/api/db/${table}`);
        if (localRes.ok) {
          const apiRows = await localRes.json();
          if (Array.isArray(apiRows) && apiRows.length > 0) {
            rows = apiRows as T[];
            fetchErr = null;
          }
        }
      } catch (_) {
        // Express API offline
      }
    }

    // 3. Fallback to browser localStorage cache
    if (!rows || rows.length === 0) {
      const cached = localStorage.getItem(`vmc_offline_${table}`);
      if (cached) {
        try {
          rows = JSON.parse(cached);
          fetchErr = null;
        } catch (_) {}
      }
    }

    if (rows && rows.length > 0) {
      setData(rows);
      setError(null);
      try {
        localStorage.setItem(`vmc_offline_${table}`, JSON.stringify(rows));
      } catch (_) {}
    } else {
      setData([]);
      setError(fetchErr);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTableData();
  }, [table]);

  return { data, loading, error, refetch: fetchTableData, setData };
}
