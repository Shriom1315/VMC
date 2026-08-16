import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { supabase } from "../../lib/supabase";
import ExportToolbar, { ColumnDef } from "../../components/ExportToolbar";
import ComboSelect from "../../components/ComboSelect";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CustomPORate {
  id: number;
  partyName: string;
  gaugeType: string;
  processType: string;
  calibType: string;
  repairRate: number;
  calibRate: number;
  discountPercent: number;
  effectiveFrom: string;
  remark: string;
}

const GAUGE_TYPES = [
  "OD Limit Gauge", "ID Limit Gauge", "Plain Plug Gauge", "Plain Ring Gauge",
  "Thread Plug Gauge", "Thread Ring Gauge", "Taper Plug Gauge", "Taper Ring Gauge",
  "Dial Indicator", "Vernier Caliper", "Micrometer", "Height Gauge",
  "Depth Micrometer", "Bore Gauge", "Comparator Stand", "Angle Plate",
  "V Block", "Master Ring", "Digital Dial Gauge", "External Micrometer",
];

const PROCESS_TYPES = ["Calibration", "Repair", "Repair & Calibration"];
const CALIB_TYPES   = ["NABL", "Non-NABL", "ILC"];

const COLUMNS: ColumnDef[] = [
  { key: "partyName",       label: "Party"          },
  { key: "gaugeType",       label: "Gauge Type"     },
  { key: "processType",     label: "Process"        },
  { key: "calibType",       label: "Calib. Type"    },
  { key: "repairRate",      label: "Repair (₹)"     },
  { key: "calibRate",       label: "Calib. (₹)"     },
  { key: "discountPercent", label: "Discount %"     },
  { key: "effectiveFrom",   label: "Effective From" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function CustomPORatePage() {
  const [records,     setRecords]     = useState<CustomPORate[]>([]);
  const [editingId,   setEditingId]   = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleCols, setVisibleCols] = useState(COLUMNS.map(c => c.key));
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [partyNames,  setPartyNames]  = useState<string[]>([]);
  const rowsPerPage = 10;

  // Form
  const [partyName,       setPartyName]       = useState("");
  const [gaugeType,       setGaugeType]       = useState(GAUGE_TYPES[0]);
  const [processType,     setProcessType]     = useState("Calibration");
  const [calibType,       setCalibType]       = useState("NABL");
  const [repairRate,      setRepairRate]      = useState("");
  const [calibRate,       setCalibRate]       = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [effectiveFrom,   setEffectiveFrom]   = useState(new Date().toISOString().split("T")[0]);
  const [remark,          setRemark]          = useState("");

  const fetch = async () => {
    setLoading(true); setError(null);
    const { data, error: err } = await supabase.from("custom_po_rates").select("*").order("id");
    if (err) { setError(err.message); setRecords([]); }
    else {
      setRecords((data ?? []).map((r: any) => ({
        id:              r.id,
        partyName:       r.party_name       ?? "",
        gaugeType:       r.gauge_type       ?? "",
        processType:     r.process_type     ?? "",
        calibType:       r.calib_type       ?? "",
        repairRate:      Number(r.repair_rate      ?? 0),
        calibRate:       Number(r.calib_rate       ?? 0),
        discountPercent: Number(r.discount_percent ?? 0),
        effectiveFrom:   r.effective_from   ?? "",
        remark:          r.remark           ?? "",
      })));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetch();
    supabase.from("parties").select("name").order("name").then(({ data }) =>
      setPartyNames((data ?? []).map((r: any) => r.name))
    );
  }, []);

  const resetForm = () => {
    setPartyName(""); setGaugeType(GAUGE_TYPES[0]); setProcessType("Calibration");
    setCalibType("NABL"); setRepairRate(""); setCalibRate("");
    setDiscountPercent(""); setEffectiveFrom(new Date().toISOString().split("T")[0]);
    setRemark(""); setEditingId(null);
  };

  const payload = () => ({
    party_name:       partyName,
    gauge_type:       gaugeType,
    process_type:     processType,
    calib_type:       calibType,
    repair_rate:      parseFloat(repairRate)      || 0,
    calib_rate:       parseFloat(calibRate)       || 0,
    discount_percent: parseFloat(discountPercent) || 0,
    effective_from:   effectiveFrom || null,
    remark,
  });

  const handleSave = async () => {
    if (!partyName || !gaugeType) { setError("Party and Gauge Type are required."); return; }
    setError(null);
    const { error: err } = await supabase.from("custom_po_rates").insert(payload());
    if (err) { setError(err.message); return; }
    resetForm(); fetch();
  };

  const handleUpdate = async () => {
    if (editingId === null) return;
    const { error: err } = await supabase.from("custom_po_rates").update(payload()).eq("id", editingId);
    if (err) { setError(err.message); return; }
    resetForm(); fetch();
  };

  const handleDelete = async () => {
    if (editingId === null) return;
    const { error: err } = await supabase.from("custom_po_rates").delete().eq("id", editingId);
    if (err) { setError(err.message); return; }
    resetForm(); fetch();
  };

  const handleSelect = (r: CustomPORate) => {
    setEditingId(r.id); setPartyName(r.partyName); setGaugeType(r.gaugeType);
    setProcessType(r.processType); setCalibType(r.calibType);
    setRepairRate(String(r.repairRate)); setCalibRate(String(r.calibRate));
    setDiscountPercent(String(r.discountPercent)); setEffectiveFrom(r.effectiveFrom);
    setRemark(r.remark);
  };

  const filtered   = records.filter(r =>
    [r.partyName, r.gaugeType, r.processType].some(v =>
      v.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated  = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const exportData = filtered.map(r => ({
    partyName: r.partyName, gaugeType: r.gaugeType, processType: r.processType,
    calibType: r.calibType, repairRate: r.repairRate, calibRate: r.calibRate,
    discountPercent: r.discountPercent, effectiveFrom: r.effectiveFrom,
  }));

  const f = "w-full bg-white border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-colors";
  const l = "block text-xs font-medium text-text-secondary mb-1";

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
      className="w-full flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Custom PO Rate Master</h1>
        <p className="text-xs text-text-secondary mt-0.5">Party-specific rate overrides for purchase orders</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2.5">{error}</div>}

      {/* Form */}
      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <span className="text-sm font-semibold text-text-primary">
            {editingId !== null ? `Editing Rate #${editingId}` : "Add Custom Rate"}
          </span>
          {editingId !== null && <button onClick={resetForm} className="text-xs text-text-muted hover:text-text-primary">✕ Cancel</button>}
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <label className={l}>Party Name</label>
            <ComboSelect value={partyName} onChange={setPartyName} options={partyNames} placeholder="Select party..." />
          </div>
          <div>
            <label className={l}>Gauge Type</label>
            <ComboSelect value={gaugeType} onChange={setGaugeType} options={GAUGE_TYPES} />
          </div>
          <div>
            <label className={l}>Process Type</label>
            <ComboSelect value={processType} onChange={setProcessType} options={PROCESS_TYPES} />
          </div>
          <div>
            <label className={l}>Calibration Type</label>
            <ComboSelect value={calibType} onChange={setCalibType} options={CALIB_TYPES} />
          </div>
          <div>
            <label className={l}>Repair Rate (₹)</label>
            <input type="number" min="0" value={repairRate} onChange={e => setRepairRate(e.target.value)} className={f} placeholder="0.00" />
          </div>
          <div>
            <label className={l}>Calibration Rate (₹)</label>
            <input type="number" min="0" value={calibRate} onChange={e => setCalibRate(e.target.value)} className={f} placeholder="0.00" />
          </div>
          <div>
            <label className={l}>Discount %</label>
            <input type="number" min="0" max="100" value={discountPercent} onChange={e => setDiscountPercent(e.target.value)} className={f} placeholder="0" />
          </div>
          <div>
            <label className={l}>Effective From</label>
            <input type="date" value={effectiveFrom} onChange={e => setEffectiveFrom(e.target.value)} className={f} />
          </div>
          <div className="md:col-span-2">
            <label className={l}>Remark</label>
            <input value={remark} onChange={e => setRemark(e.target.value)} className={f} />
          </div>
        </div>
        <div className="px-5 pb-5 pt-3 border-t border-border flex items-center gap-2">
          <button onClick={handleSave} disabled={editingId !== null}
            className="bg-brand-orange text-white text-xs font-medium px-5 py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Save</button>
          <button onClick={handleUpdate} disabled={editingId === null}
            className="border border-border text-text-primary text-xs font-medium px-5 py-2 rounded-lg hover:bg-surface-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Update</button>
          <button onClick={handleDelete} disabled={editingId === null}
            className="border border-red-200 text-red-600 text-xs font-medium px-5 py-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Delete</button>
          {editingId !== null && <button onClick={resetForm} className="text-xs text-text-secondary hover:text-text-primary px-2">Cancel</button>}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="px-5 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Custom Rate Records</h2>
            <p className="text-xs text-text-secondary mt-0.5">{filtered.length} records</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <ExportToolbar data={exportData} columns={COLUMNS} filename="custom-po-rates"
              visibleColumns={visibleCols} onVisibilityChange={cols => { setVisibleCols(cols); setCurrentPage(1); }} />
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-text-secondary">Search:</span>
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="border border-border rounded-md text-xs pl-7 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-orange w-44" />
              </div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[1000px]">
            <thead className="bg-surface-muted border-b border-border">
              <tr>
                {COLUMNS.filter(c => visibleCols.includes(c.key)).map(col => (
                  <th key={col.key} className="px-3 py-2.5 text-xs font-medium text-text-secondary border-r border-border">
                    <span className="flex items-center gap-1">{col.label} <span className="text-text-muted">↕</span></span>
                  </th>
                ))}
                <th className="px-3 py-2.5 text-xs font-medium text-text-secondary">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.length === 0 ? (
                <tr><td colSpan={visibleCols.length + 1} className="px-4 py-10 text-center text-text-muted">No records found</td></tr>
              ) : paginated.map((r, i) => (
                <tr key={r.id}
                  className={`hover:bg-surface-subtle transition-colors ${editingId === r.id ? "bg-brand-orange-light" : i % 2 === 0 ? "bg-white" : "bg-surface-subtle/40"}`}>
                  {visibleCols.includes("partyName")       && <td className="px-3 py-2.5 font-medium text-text-primary border-r border-border">{r.partyName}</td>}
                  {visibleCols.includes("gaugeType")       && <td className="px-3 py-2.5 text-text-secondary border-r border-border">{r.gaugeType}</td>}
                  {visibleCols.includes("processType")     && <td className="px-3 py-2.5 text-text-secondary border-r border-border">{r.processType}</td>}
                  {visibleCols.includes("calibType")       && <td className="px-3 py-2.5 text-text-secondary border-r border-border">{r.calibType}</td>}
                  {visibleCols.includes("repairRate")      && <td className="px-3 py-2.5 font-mono text-text-primary border-r border-border">₹{r.repairRate.toLocaleString()}</td>}
                  {visibleCols.includes("calibRate")       && <td className="px-3 py-2.5 font-mono text-text-primary border-r border-border">₹{r.calibRate.toLocaleString()}</td>}
                  {visibleCols.includes("discountPercent") && <td className="px-3 py-2.5 text-text-secondary border-r border-border">{r.discountPercent}%</td>}
                  {visibleCols.includes("effectiveFrom")   && <td className="px-3 py-2.5 text-text-secondary border-r border-border">{r.effectiveFrom}</td>}
                  <td className="px-3 py-2.5 text-center">
                    <button onClick={() => handleSelect(r)}
                      className="bg-brand-orange text-white text-[11px] font-medium px-3 py-1 rounded hover:bg-orange-700 transition-colors">Select</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span className="text-xs text-text-secondary">
            Showing {filtered.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} to{" "}
            {Math.min(currentPage * rowsPerPage, filtered.length)} of {filtered.length} entries
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="text-xs px-3 py-1 border border-border rounded text-text-secondary hover:bg-surface-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Previous</button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(pg => (
              <button key={pg} onClick={() => setCurrentPage(pg)}
                className={`text-xs px-3 py-1 border rounded transition-colors ${currentPage === pg ? "bg-brand-orange text-white border-brand-orange" : "border-border text-text-secondary hover:bg-surface-muted"}`}>{pg}</button>
            ))}
            {totalPages > 7 && <span className="text-xs text-text-muted px-1">…</span>}
            {totalPages > 7 && (
              <button onClick={() => setCurrentPage(totalPages)}
                className={`text-xs px-3 py-1 border rounded transition-colors ${currentPage === totalPages ? "bg-brand-orange text-white border-brand-orange" : "border-border text-text-secondary hover:bg-surface-muted"}`}>{totalPages}</button>
            )}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}
              className="text-xs px-3 py-1 border border-border rounded text-text-secondary hover:bg-surface-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Next</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
