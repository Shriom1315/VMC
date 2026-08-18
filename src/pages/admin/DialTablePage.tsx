import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { supabase } from "../../lib/supabase";
import ExportToolbar, { ColumnDef } from "../../components/ExportToolbar";
import ComboSelect from "../../components/ComboSelect";

interface DialEntry {
  id: number;
  gaugeType: string;
  rangeFrom: string;
  rangeTo: string;
  leastCount: string;
  dialDivisions: string;
  multiplier: string;
  calibValue: string;
  unit: string;
  remark: string;
}

const GAUGE_TYPES = [
  "Dial Indicator", "Digital Dial Gauge", "Bore Gauge", "Depth Indicator",
  "Height Gauge", "Test Indicator", "Lever Dial Indicator",
];
const UNITS = ["mm", "μm", "inch"];

const COLUMNS: ColumnDef[] = [
  { key: "gaugeType",     label: "Gauge Type"     },
  { key: "rangeFrom",     label: "Range From"     },
  { key: "rangeTo",       label: "Range To"       },
  { key: "leastCount",    label: "Least Count"    },
  { key: "dialDivisions", label: "Dial Divisions" },
  { key: "calibValue",    label: "Calib Value"    },
  { key: "unit",          label: "Unit"           },
];

export default function DialTablePage() {
  const [records, setRecords] = useState<DialEntry[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleCols, setVisibleCols] = useState(COLUMNS.map(c => c.key));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const rowsPerPage = 10;

  const [gaugeType, setGaugeType] = useState(GAUGE_TYPES[0]);
  const [rangeFrom, setRangeFrom] = useState("");
  const [rangeTo, setRangeTo] = useState("");
  const [leastCount, setLeastCount] = useState("");
  const [dialDivisions, setDialDivisions] = useState("");
  const [multiplier, setMultiplier] = useState("");
  const [calibValue, setCalibValue] = useState("");
  const [unit, setUnit] = useState("mm");
  const [remark, setRemark] = useState("");

  const fetchRecords = async () => {
    setLoading(true); setError(null);
    const { data, error: err } = await supabase.from("dial_table").select("*").order("id");
    if (err) { setError(err.message); setRecords([]); }
    else setRecords((data ?? []).map((r: any) => ({ id: r.id, gaugeType: r.gauge_type ?? "", rangeFrom: r.range_from ?? "", rangeTo: r.range_to ?? "", leastCount: r.least_count ?? "", dialDivisions: r.dial_divisions ?? "", multiplier: r.multiplier ?? "", calibValue: r.calib_value ?? "", unit: r.unit ?? "", remark: r.remark ?? "" })));
    setLoading(false);
  };
  useEffect(() => { fetchRecords(); }, []);

  const resetForm = () => { setGaugeType(GAUGE_TYPES[0]); setRangeFrom(""); setRangeTo(""); setLeastCount(""); setDialDivisions(""); setMultiplier(""); setCalibValue(""); setUnit("mm"); setRemark(""); setEditingId(null); };
  const p = () => ({ gauge_type: gaugeType, range_from: rangeFrom, range_to: rangeTo, least_count: leastCount, dial_divisions: dialDivisions, multiplier, calib_value: calibValue, unit, remark });
  const handleSave = async () => { if (!gaugeType) { setError("Gauge Type is required."); return; } setError(null); const { error: err } = await supabase.from("dial_table").insert(p()); if (err) { setError(err.message); return; } resetForm(); fetchRecords(); };
  const handleUpdate = async () => { if (editingId === null) return; const { error: err } = await supabase.from("dial_table").update(p()).eq("id", editingId); if (err) { setError(err.message); return; } resetForm(); fetchRecords(); };
  const handleDelete = async () => { if (editingId === null) return; const { error: err } = await supabase.from("dial_table").delete().eq("id", editingId); if (err) { setError(err.message); return; } resetForm(); fetchRecords(); };
  const handleSelect = (r: DialEntry) => { setEditingId(r.id); setGaugeType(r.gaugeType); setRangeFrom(r.rangeFrom); setRangeTo(r.rangeTo); setLeastCount(r.leastCount); setDialDivisions(r.dialDivisions); setMultiplier(r.multiplier); setCalibValue(r.calibValue); setUnit(r.unit); setRemark(r.remark); };

  const filtered = records.filter(r => [r.gaugeType, r.leastCount, r.unit].some(v => v.toLowerCase().includes(searchQuery.toLowerCase())));
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const exportData = filtered.map(r => ({ gaugeType: r.gaugeType, rangeFrom: r.rangeFrom, rangeTo: r.rangeTo, leastCount: r.leastCount, dialDivisions: r.dialDivisions, calibValue: r.calibValue, unit: r.unit }));

  const fc = "w-full bg-white border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-colors";
  const lc = "block text-xs font-medium text-text-secondary mb-1";

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="w-full flex flex-col gap-6">
      <div><h1 className="text-lg font-semibold text-text-primary">Dial Table Master</h1><p className="text-xs text-text-secondary mt-0.5">Lookup table for dial gauge ranges and calibration values</p></div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2.5">{error}</div>}
      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <span className="text-sm font-semibold text-text-primary">{editingId !== null ? `Editing #${editingId}` : "Add Dial Entry"}</span>
          {editingId !== null && <button onClick={resetForm} className="text-xs text-text-muted hover:text-text-primary">✕ Cancel</button>}
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
          <div><label className={lc}>Gauge Type</label><ComboSelect value={gaugeType} onChange={setGaugeType} options={GAUGE_TYPES} /></div>
          <div><label className={lc}>Range From</label><input value={rangeFrom} onChange={e => setRangeFrom(e.target.value)} className={fc} placeholder="0" /></div>
          <div><label className={lc}>Range To</label><input value={rangeTo} onChange={e => setRangeTo(e.target.value)} className={fc} placeholder="10" /></div>
          <div><label className={lc}>Least Count</label><input value={leastCount} onChange={e => setLeastCount(e.target.value)} className={fc} placeholder="0.001" /></div>
          <div><label className={lc}>Dial Divisions</label><input value={dialDivisions} onChange={e => setDialDivisions(e.target.value)} className={fc} placeholder="100" /></div>
          <div><label className={lc}>Multiplier</label><input value={multiplier} onChange={e => setMultiplier(e.target.value)} className={fc} placeholder="1" /></div>
          <div><label className={lc}>Calibration Value</label><input value={calibValue} onChange={e => setCalibValue(e.target.value)} className={fc} /></div>
          <div><label className={lc}>Unit</label><ComboSelect value={unit} onChange={setUnit} options={UNITS} /></div>
          <div><label className={lc}>Remark</label><input value={remark} onChange={e => setRemark(e.target.value)} className={fc} /></div>
        </div>
        <div className="px-5 pb-5 pt-3 border-t border-border flex items-center gap-2">
          <button onClick={handleSave} disabled={editingId !== null} className="bg-brand-orange text-white text-xs font-medium px-5 py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Save</button>
          <button onClick={handleUpdate} disabled={editingId === null} className="border border-border text-text-primary text-xs font-medium px-5 py-2 rounded-lg hover:bg-surface-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Update</button>
          <button onClick={handleDelete} disabled={editingId === null} className="border border-red-200 text-red-600 text-xs font-medium px-5 py-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Delete</button>
          {editingId !== null && <button onClick={resetForm} className="text-xs text-text-secondary hover:text-text-primary px-2">Cancel</button>}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="px-5 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div><h2 className="text-sm font-semibold text-text-primary">Dial Table Entries</h2><p className="text-xs text-text-secondary mt-0.5">{filtered.length} records</p></div>
          <div className="flex items-center gap-3"><ExportToolbar data={exportData} columns={COLUMNS} filename="dial-table" visibleColumns={visibleCols} onVisibilityChange={cols => { setVisibleCols(cols); setCurrentPage(1); }} /><div className="flex items-center gap-1.5"><span className="text-xs text-text-secondary">Search:</span><div className="relative"><Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" /><input value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="border border-border rounded-md text-xs pl-7 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-orange w-44" /></div></div></div>
        </div>
        <div className="overflow-x-auto"><table className="w-full text-left text-xs min-w-[900px]"><thead className="bg-surface-muted border-b border-border"><tr>{COLUMNS.filter(c => visibleCols.includes(c.key)).map(col => <th key={col.key} className="px-3 py-2.5 text-xs font-medium text-text-secondary border-r border-border"><span className="flex items-center gap-1">{col.label} <span className="text-text-muted">↕</span></span></th>)}<th className="px-3 py-2.5 text-xs font-medium text-text-secondary">Action</th></tr></thead>
          <tbody className="divide-y divide-border">{paginated.length === 0 ? <tr><td colSpan={visibleCols.length + 1} className="px-4 py-10 text-center text-text-muted">No records found</td></tr> : paginated.map((r, i) => <tr key={r.id} className={`hover:bg-surface-subtle transition-colors ${editingId === r.id ? "bg-brand-orange-light" : i % 2 === 0 ? "bg-white" : "bg-surface-subtle/40"}`}>{visibleCols.includes("gaugeType") && <td className="px-3 py-2.5 font-medium text-text-primary border-r border-border">{r.gaugeType}</td>}{visibleCols.includes("rangeFrom") && <td className="px-3 py-2.5 font-mono text-text-secondary border-r border-border">{r.rangeFrom}</td>}{visibleCols.includes("rangeTo") && <td className="px-3 py-2.5 font-mono text-text-secondary border-r border-border">{r.rangeTo}</td>}{visibleCols.includes("leastCount") && <td className="px-3 py-2.5 font-mono text-text-primary border-r border-border">{r.leastCount}</td>}{visibleCols.includes("dialDivisions") && <td className="px-3 py-2.5 font-mono text-text-secondary border-r border-border">{r.dialDivisions}</td>}{visibleCols.includes("calibValue") && <td className="px-3 py-2.5 font-mono text-text-secondary border-r border-border">{r.calibValue}</td>}{visibleCols.includes("unit") && <td className="px-3 py-2.5 text-text-secondary border-r border-border">{r.unit}</td>}<td className="px-3 py-2.5 text-center"><button onClick={() => handleSelect(r)} className="bg-brand-orange text-white text-[11px] font-medium px-3 py-1 rounded hover:bg-orange-700 transition-colors">Select</button></td></tr>)}</tbody>
        </table></div>
        <div className="px-5 py-3 border-t border-border flex items-center justify-between text-xs text-text-secondary"><span>Showing {filtered.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filtered.length)} of {filtered.length} entries</span><div className="flex items-center gap-1"><button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 border border-border rounded hover:bg-surface-muted disabled:opacity-40 transition-colors">Previous</button>{Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(pg => <button key={pg} onClick={() => setCurrentPage(pg)} className={`px-3 py-1 border rounded transition-colors ${currentPage === pg ? "bg-brand-orange text-white border-brand-orange" : "border-border hover:bg-surface-muted"}`}>{pg}</button>)}<button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1 border border-border rounded hover:bg-surface-muted disabled:opacity-40 transition-colors">Next</button></div></div>
      </div>
    </motion.div>
  );
}
