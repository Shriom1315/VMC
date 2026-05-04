import { useState, useEffect } from "react";
import { supabase } from "./supabase";

/** Generic hook: fetch all rows from a table, with optional search filter */
export function useTable<T>(
  table: string,
  options?: {
    orderBy?: string;
    ascending?: boolean;
    searchCol?: string;
    searchVal?: string;
  }
) {
  const [data,    setData]    = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const fetch = async () => {
    setLoading(true);
    let q = supabase.from(table).select("*");
    if (options?.orderBy) q = q.order(options.orderBy, { ascending: options?.ascending ?? true });
    const { data: rows, error: err } = await q;
    if (err) setError(err.message);
    else setData((rows ?? []) as T[]);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, [table]);

  return { data, loading, error, refetch: fetch, setData };
}
