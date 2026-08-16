import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import ExportToolbar, { ColumnDef } from "../../../components/ExportToolbar";

interface PO {
  id: string; poNumber: string; poDate: string; customerName: string;
  totalQty: number; totalAmount: number; itemCount: number; createdAt: string;
}

const COLUMNS: ColumnDef[] = [
  { key: "poNumber",     label: "PO Number"       },
  { key: "customerName", label: "Customer"        },
  { key: "poDate",       label: "Date"            },
  { key: "totalAmount",  label: "Total Amount (₹)"},
  { key: "totalQty",     label: "Total Qty"       },
];

export default function TotalPOsPage() {
  const [pos,         setPos]         = useState<PO[]>([]);
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
        .from("purchase_orders").select("*").order("created_at", { ascending: false });
      if (err) { setError(err.message); }
      else {
        setPos((data ?? []).map((r: any) => ({
          id: String(r.id), poNumber: r.po_number ?? "",
          poDate: r.po_date ?? "", customerName: r.customer_name ?? "",
          totalQty: Number(r.total_qty ?? 0), totalAmount: Number(r.total_amount ?? 0),
          itemCount: Array.isArray(r.items) ? r.items.length : 0,
          createdAt: r.created_at,
        })));
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered   = pos.filter(p =>
    [p.poNumber, p.customerName].some(v => v.toLowerCase().includes(search.toLowerCase()))
  );
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated  = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const totalValue = filtered.reduce((s, p) => s + p.totalAmount, 0);
  const exportData = filtered.map(p => ({
    poNumber: p.poNumber, customerName: p.customerName, poDate: p.poDate,
    totalAmount: p.totalAmount, totalQty: p.totalQty,
  }));

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="w-full flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Total Purchase Orders</h1>
        <p className="text-xs text-text-secondary mt-0.5">All purchase orders received from clients</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2.5">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-border p-4">
          <div className="text-xs text-text-secondary mb-1">Total POs</div>
          <div className="text-xl font-semibold text-text-primary">{pos.length}</div>
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
            <h2 className="text-sm font-semibold text-text-primary">Purchase Orders</h2>
            <p className="text-xs text-text-secondary mt-0.5">{filtered.length} records</p>
          </div>
          <div className="flex items-center gap-3">
            <ExportToolbar data={exportData} columns={COLUMNS} filename="purchase-orders-report"
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
                <tr><td colSpan={COLUMNS.length} className="px-4 py-10 text-center text-text-muted">No purchase orders found.</td></tr>
              ) : paginated.map((p, i) => (
                <tr key={p.id} className={`hover:bg-surface-subtle transition-colors ${i % 2 === 0 ? "bg-white" : "bg-surface-subtle/40"}`}>
                  {visibleCols.includes("poNumber")     && <td className="px-4 py-3 font-mono font-semibold text-brand-orange border-r border-border">{p.poNumber}</td>}
                  {visibleCols.includes("customerName") && <td className="px-4 py-3 font-medium text-text-primary border-r border-border">{p.customerName || "—"}</td>}
                  {visibleCols.includes("poDate")       && <td className="px-4 py-3 text-text-secondary border-r border-border">{p.poDate}</td>}
                  {visibleCols.includes("totalAmount")  && <td className="px-4 py-3 font-mono font-semibold text-text-primary border-r border-border">₹{p.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>}
                  {visibleCols.includes("totalQty")     && <td className="px-4 py-3 text-text-secondary border-r border-border">{p.totalQty}</td>}
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
