import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Download } from "lucide-react";
import { supabase } from "../../../lib/supabase";

interface OutstandingRow {
  party: string; invoiceNo: string; date: string;
  total: number; paid: number; due: number; ageing: string;
}

function getAgeing(dateStr: string): string {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
  if (days <= 30)  return "0–30 days";
  if (days <= 60)  return "30–60 days";
  if (days <= 90)  return "60–90 days";
  return "90+ days";
}

function exportCSV(rows: OutstandingRow[]) {
  const header = "Party,Invoice No.,Date,Total (₹),Paid (₹),Balance Due (₹),Ageing";
  const csvRows = rows.map(r => [r.party, r.invoiceNo, r.date, r.total, r.paid, r.due, r.ageing].join(","));
  const blob = new Blob([[header, ...csvRows].join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = "Outstanding_Report.csv"; a.click();
  URL.revokeObjectURL(url);
}

export default function OutstandingPage() {
  const [rows,    setRows]    = useState<OutstandingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); setError(null);
      const [invRes, rcpRes] = await Promise.all([
        supabase.from("invoices").select("*").neq("status", "paid"),
        supabase.from("receipts").select("invoice_ref, amount"),
      ]);
      if (invRes.error) { setError(invRes.error.message); setLoading(false); return; }

      // Build a map of total paid per invoice
      const paidMap: Record<string, number> = {};
      (rcpRes.data ?? []).forEach((r: any) => {
        paidMap[r.invoice_ref] = (paidMap[r.invoice_ref] ?? 0) + Number(r.amount ?? 0);
      });

      const built: OutstandingRow[] = (invRes.data ?? []).map((r: any) => {
        const total = Number(r.total ?? 0);
        const paid  = paidMap[r.invoice_no] ?? 0;
        return {
          party:     r.party ?? "",
          invoiceNo: r.invoice_no ?? "",
          date:      r.invoice_date ?? "",
          total,
          paid,
          due:    total - paid,
          ageing: getAgeing(r.invoice_date ?? new Date().toISOString()),
        };
      }).filter(r => r.due > 0);

      setRows(built);
      setLoading(false);
    };
    fetchData();
  }, []);

  const totalDue = rows.reduce((s, r) => s + r.due, 0);
  const age0_30  = rows.filter(r => r.ageing === "0–30 days").reduce((s, r) => s + r.due, 0);
  const age30_60 = rows.filter(r => r.ageing === "30–60 days").reduce((s, r) => s + r.due, 0);
  const age60p   = rows.filter(r => r.ageing === "60–90 days" || r.ageing === "90+ days").reduce((s, r) => s + r.due, 0);

  const AGEING_COLOR: Record<string, string> = {
    "0–30 days":  "bg-amber-100 text-amber-700",
    "30–60 days": "bg-orange-100 text-orange-700",
    "60–90 days": "bg-red-100 text-red-700",
    "90+ days":   "bg-red-200 text-red-800",
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
      className="w-full flex flex-col gap-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Outstanding</h1>
          <p className="text-xs text-text-secondary mt-0.5">Unpaid invoices and ageing analysis</p>
        </div>
        <button
          onClick={() => exportCSV(rows)}
          className="inline-flex items-center gap-1.5 border border-border text-text-secondary text-xs font-medium px-3 py-2 rounded-lg hover:bg-surface-muted transition-colors"
        >
          <Download size={13} /> Export CSV
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2.5">{error}</div>}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-border p-4">
          <div className="text-xs text-text-secondary mb-1">Total Outstanding</div>
          <div className="text-xl font-semibold text-red-600">₹{totalDue.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg border border-border p-4">
          <div className="text-xs text-text-secondary mb-1">0–30 Days</div>
          <div className="text-xl font-semibold text-amber-600">₹{age0_30.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg border border-border p-4">
          <div className="text-xs text-text-secondary mb-1">30–60 Days</div>
          <div className="text-xl font-semibold text-orange-600">₹{age30_60.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg border border-border p-4">
          <div className="text-xs text-text-secondary mb-1">60+ Days</div>
          <div className="text-xl font-semibold text-red-700">₹{age60p.toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-x-auto">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-text-primary">Pending Payments ({rows.length})</h2>
        </div>
        <table className="w-full text-left text-xs min-w-[700px]">
          <thead className="bg-surface-muted border-b border-border">
            <tr>
              {["Party","Invoice No.","Invoice Date","Total","Paid","Balance Due","Ageing"].map((h, i) => (
                <th key={i} className="px-4 py-2.5 text-xs font-medium text-text-secondary border-r border-border last:border-r-0">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-text-muted">No outstanding invoices — all payments collected!</td></tr>
            ) : rows.map((r, i) => (
              <tr key={i} className="hover:bg-surface-subtle">
                <td className="px-4 py-3 font-medium text-text-primary border-r border-border">{r.party}</td>
                <td className="px-4 py-3 font-mono text-brand-orange border-r border-border">{r.invoiceNo}</td>
                <td className="px-4 py-3 text-text-secondary border-r border-border">{r.date}</td>
                <td className="px-4 py-3 font-mono text-text-primary border-r border-border">₹{r.total.toLocaleString()}</td>
                <td className="px-4 py-3 font-mono text-green-600 border-r border-border">₹{r.paid.toLocaleString()}</td>
                <td className="px-4 py-3 font-mono font-semibold text-red-600 border-r border-border">₹{r.due.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${AGEING_COLOR[r.ageing] ?? "bg-gray-100 text-gray-600"}`}>
                    {r.ageing}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
