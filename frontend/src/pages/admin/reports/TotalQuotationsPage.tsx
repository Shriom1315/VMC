import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Search, Download } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import ExportToolbar, { ColumnDef } from "../../../components/ExportToolbar";

interface Quotation {
  id: string; quotationNo: string; date: string; clientName: string;
  netTotal: number; roundedTotal: number; itemCount: number; createdAt: string;
}

const COLUMNS: ColumnDef[] = [
  { key: "quotationNo", label: "Quotation No." },
  { key: "clientName",  label: "Client" },
  { key: "date",        label: "Date" },
  { key: "netTotal",    label: "Net Total (₹)" },
  { key: "itemCount",   label: "Items" },
];

export default function TotalQuotationsPage() {
  const [quotations,  setQuotations]  = useState<Quotation[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [search,      setSearch]      = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleCols, setVisibleCols] = useState(COLUMNS.map(c => c.key));
  const rowsPerPage = 10;

  useEffect(() => {
    const fetch = async () => {
      setLoading(true); setError(null);
      const { data, error: err } = await supabase
        .from("quotations").select("*").order("created_at", { ascending: false });
      if (err) { setError(err.message); }
      else {
        setQuotations((data ?? []).map((r: any) => ({
          id: String(r.id), quotationNo: r.quotation_no ?? "",
          date: r.date ?? "", clientName: r.client_name ?? "",
          netTotal: Number(r.net_total ?? 0), roundedTotal: Number(r.rounded_total ?? 0),
          itemCount: Array.isArray(r.items) ? r.items.length : 0,
          createdAt: r.created_at,
        })));
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = quotations.filter(q =>
    [q.quotationNo, q.clientName].some(v => v.toLowerCase().includes(search.toLowerCase()))
  );
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated  = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const totalValue = filtered.reduce((s, q) => s + q.netTotal, 0);

  const exportData = filtered.map(q => ({
    quotationNo: q.quotationNo, clientName: q.clientName, date: q.date,
    netTotal: q.netTotal, itemCount: q.itemCount,
  }));

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="w-full flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Total Quotations</h1>
        <p className="text-xs text-text-secondary mt-0.5">All quotations raised to clients</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2.5">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-border p-4">
          <div className="text-xs text-text-secondary mb-1">Total Quotations</div>
          <div className="text-xl font-semibold text-text-primary">{quotations.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-border p-4">
          <div className="text-xs text-text-secondary mb-1">Filtered</div>
          <div className="text-xl font-semibold text-text-primary">{filtered.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-border p-4">
          <div className="text-xs text-text-secondary mb-1">Total Value (Filtered)</div>
          <div className="text-xl font-semibold text-brand-orange">₹{totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="px-5 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Quotations</h2>
            <p className="text-xs text-text-secondary mt-0.5">{filtered.length} records</p>
          </div>
          <div className="flex items-center gap-3">
            <ExportToolbar data={exportData} columns={COLUMNS} filename="quotations-report"
              visibleColumns={visibleCols} onVisibilityChange={cols => { setVisibleCols(cols); setCurrentPage(1); }} />
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input value={search} onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                className="border border-border rounded-md text-xs pl-7 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-orange w-44" placeholder="Search..." />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-surface-muted border-b border-border">
              <tr>
                {COLUMNS.filter(c => visibleCols.includes(c.key)).map(col => (
                  <th key={col.key} className="px-4 py-2.5 text-xs font-medium text-text-secondary border-r border-border">
                    <span className="flex items-center gap-1">{col.label} <span className="text-text-muted">↕</span></span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.length === 0 ? (
                <tr><td colSpan={COLUMNS.length} className="px-4 py-10 text-center text-text-muted">No quotations found.</td></tr>
              ) : paginated.map((q, i) => (
                <tr key={q.id} className={`hover:bg-surface-subtle transition-colors ${i % 2 === 0 ? "bg-white" : "bg-surface-subtle/40"}`}>
                  {visibleCols.includes("quotationNo") && <td className="px-4 py-3 font-mono font-semibold text-brand-orange border-r border-border">{q.quotationNo}</td>}
                  {visibleCols.includes("clientName")  && <td className="px-4 py-3 font-medium text-text-primary border-r border-border">{q.clientName || "—"}</td>}
                  {visibleCols.includes("date")        && <td className="px-4 py-3 text-text-secondary border-r border-border">{q.date}</td>}
                  {visibleCols.includes("netTotal")    && <td className="px-4 py-3 font-mono font-semibold text-text-primary border-r border-border">₹{q.netTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>}
                  {visibleCols.includes("itemCount")   && <td className="px-4 py-3 text-text-secondary border-r border-border">{q.itemCount}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-border flex items-center justify-between text-xs text-text-secondary">
          <span>Showing {filtered.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filtered.length)} of {filtered.length}</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="px-3 py-1 border border-border rounded hover:bg-surface-muted disabled:opacity-40 transition-colors">Previous</button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(pg => (
              <button key={pg} onClick={() => setCurrentPage(pg)}
                className={`px-3 py-1 border rounded transition-colors ${currentPage === pg ? "bg-brand-orange text-white border-brand-orange" : "border-border hover:bg-surface-muted"}`}>{pg}</button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}
              className="px-3 py-1 border border-border rounded hover:bg-surface-muted disabled:opacity-40 transition-colors">Next</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
