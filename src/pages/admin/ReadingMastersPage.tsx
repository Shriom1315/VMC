import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { supabase } from "../../lib/supabase";
import ExportToolbar, { ColumnDef } from "../../components/ExportToolbar";
import ComboSelect from "../../components/ComboSelect";

interface ReadingMaster {
  id: number;
  gaugeType: string;
  parameterName: string;
  nominalValue: string;
  upperLimit: string;
  lowerLimit: string;
  unit: string;
  calibMethod: string;
  remark: string;
}

const GAUGE_TYPES = [
  "OD Limit Gauge", "ID Limit Gauge", "Plain Plug Gauge", "Plain Ring Gauge",
  "Thread Plug Gauge", "Thread Ring Gauge", "Dial Indicator", "Vernier Caliper",
  "Micrometer", "Bore Gauge", "Height Gauge", "Depth Micrometer",
];
const UNITS = ["mm", "μm", "inch", "degree", "N.m", "bar"];
const METHODS = ["Tolerance Method", "Grade Method", "Direct Go/No Method", "Comparison Method"];

const COLUMNS: ColumnDef[] = [
  { key: "gaugeType",     label: "Gauge Type"    },
  { key: "parameterName", label: "Parameter"     },
  { key: "nominalValue",  label: "Nominal Value" },
  { key: "upperLimit",    label: "Upper Limit"   },
  { key: "lowerLimit",    label: "Lower Limit"   },
  { key: "unit",          label: "Unit"          },
  { key: "calibMethod",   label: "Method"        },
];

export default function ReadingMastersPage() {
  const [records, setRecords] = useState<ReadingMaster[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleCols, setVisibleCols] = useState(COLUMNS.map(c => c.key));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const rowsPerPage = 10;

  const [gaugeType, setGaugeType] = useState(GAUGE_TYPES[0]);
  const [parameterName, setParameterName] = useState("");
  const [nominalValue, setNominalValue] = useState("");
  const [upperLimit, setUpperLimit] = useState("");
  const [lowerLimit, setLowerLimit] = useState("");
  const [unit, setUnit] = useState("mm");
  const [calibMethod, setCalibMethod] = useState("Tolerance Method");
  const [remark, setRemark] = useState("");

  const fetchRecords = async () => {
    setLoading(true); setError(null);
    const { data, error: err } = await supabase.from("reading_masters").select("*").order("id");
    if (err) { setError(err.message); setRecords([]); }
    else setRecords((data ?? []).map((r: any) => ({ id: r.id, gaugeType: r.gauge_type ?? "", parameterName: r.parameter_name ?? "", nominalValue: r.nominal_value ?? "", upperLimit: r.upper_limit ?? "", lowerLimit: r.lower_limit ?? "", unit: r.unit ?? "", calibMethod: r.calib_method ?? "", remark: r.remark ?? "" })));
    setLoading(false);
  };
  useEffect(() => { fetchRecords(); }, []);

  const resetForm = () => { setGaugeType(GAUGE_TYPES[0]); setParameterName(""); setNominalValue(""); setUpperLimit(""); setLowerLimit(""); setUnit("mm"); setCalibMethod("Tolerance Method"); setRemark(""); setEditingId(null); };
  const p = () => ({ gauge_type: gaugeType, parameter_name: parameterName, nominal_value: nominalValue, upper_limit: upperLimit, lower_limit: lowerLimit, unit, calib_method: calibMethod, remark });
  const handleSave = async () => { if (!parameterName.trim()) { setError("Parameter Name is required."); return; } setError(null); const { error: err } = await supabase.from("reading_masters").insert(p()); if (err) { setError(err.message); return; } resetForm(); fetchRecords(); };
  const handleUpdate = async () => { if (editingId === null) return; const { error: err } = await supabase.from("reading_masters").update(p()).eq("id", editingId); if (err) { setError(err.message); return; } resetForm(); fetchRecords(); };
  const handleDelete = async () => { if (editingId === null) return; const { error: err } = await supabase.from("reading_masters").delete().eq("id", editingId); if (err) { setError(err.message); return; } resetForm(); fetchRecords(); };
  const handleSelect = (r: ReadingMaster) => { setEditingId(r.id); setGaugeType(r.gaugeType); setParameterName(r.parameterName); setNominalValue(r.nominalValue); setUpperLimit(r.upperLimit); setLowerLimit(r.lowerLimit); setUnit(r.unit); setCalibMethod(r.calibMethod); setRemark(r.remark); };

  const filtered = records.filter(r => [r.gaugeType, r.parameterName].some(v => v.toLowerCase().includes(searchQuery.toLowerCase())));
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const exportData = filtered.map(r => ({ gaugeType: r.gaugeType, parameterName: r.parameterName, nominalValue: r.nominalValue, upperLimit: r.upperLimit, lowerLimit: r.lowerLimit, unit: r.unit, calibMethod: r.calibMethod }));

  const fc = "w-full bg-white border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-colors";
  const lc = "block text-xs font-medium text-text-secondary mb-1";

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="w-full flex flex-col gap-6">
      <div><h1 className="text-lg font-semibold text-text-primary">Reading Masters</h1><p className="text-xs text-text-secondary mt-0.5">Standard calibration reading templates per gauge type</p></div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2.5">{error}</div>}
      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <span className="text-sm font-semibold text-text-primary">{editingId !== null ? `Editing #${editingId}` : "Add Reading Template"}</span>
          {editingId !== null && <button onClick={resetForm} className="text-xs text-text-muted hover:text-text-primary">✕ Cancel</button>}
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div><label className={lc}>Gauge Type</label><ComboSelect value={gaugeType} onChange={setGaugeType} options={GAUGE_TYPES} /></div>
          <div><label className={lc}>Parameter Name</label><input value={parameterName} onChange={e => setParameterName(e.target.value)} className={fc} placeholder="Go / No-Go / Diameter..." /></div>
          <div><label className={lc}>Nominal Value</label><input value={nominalValue} onChange={e => setNominalValue(e.target.value)} className={fc} placeholder="50.000" /></div>
          <div><label className={lc}>Upper Limit</label><input value={upperLimit} onChange={e => setUpperLimit(e.target.value)} className={fc} /></div>
          <div><label className={lc}>Lower Limit</label><input value={lowerLimit} onChange={e => setLowerLimit(e.target.value)} className={fc} /></div>
          <div><label className={lc}>Unit</label><ComboSelect value={unit} onChange={setUnit} options={UNITS} /></div>
          <div><label className={lc}>Calibration Method</label><ComboSelect value={calibMethod} onChange={setCalibMethod} options={METHODS} /></div>
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
          <div><h2 className="text-sm font-semibold text-text-primary">Reading Templates</h2><p className="text-xs text-text-secondary mt-0.5">{filtered.length} records</p></div>
          <div className="flex items-center gap-3"><ExportToolbar data={exportData} columns={COLUMNS} filename="reading-masters" visibleColumns={visibleCols} onVisibilityChange={cols => { setVisibleCols(cols); setCurrentPage(1); }} /><div className="flex items-center gap-1.5"><span className="text-xs text-text-secondary">Search:</span><div className="relative"><Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" /><input value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="border border-border rounded-md text-xs pl-7 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-orange w-44" /></div></div></div>
        </div>
        <div className="overflow-x-auto"><table className="w-full text-left text-xs min-w-[900px]"><thead className="bg-surface-muted border-b border-border"><tr>{COLUMNS.filter(c => visibleCols.includes(c.key)).map(col => <th key={col.key} className="px-3 py-2.5 text-xs font-medium text-text-secondary border-r border-border"><span className="flex items-center gap-1">{col.label} <span className="text-text-muted">↕</span></span></th>)}<th className="px-3 py-2.5 text-xs font-medium text-text-secondary">Action</th></tr></thead>
          <tbody className="divide-y divide-border">{paginated.length === 0 ? <tr><td colSpan={visibleCols.length + 1} className="px-4 py-10 text-center text-text-muted">No templates found</td></tr> : paginated.map((r, i) => <tr key={r.id} className={`hover:bg-surface-subtle transition-colors ${editingId === r.id ? "bg-brand-orange-light" : i % 2 === 0 ? "bg-white" : "bg-surface-subtle/40"}`}>{visibleCols.includes("gaugeType") && <td className="px-3 py-2.5 font-medium text-text-primary border-r border-border">{r.gaugeType}</td>}{visibleCols.includes("parameterName") && <td className="px-3 py-2.5 text-text-secondary border-r border-border">{r.parameterName}</td>}{visibleCols.includes("nominalValue") && <td className="px-3 py-2.5 font-mono text-text-primary border-r border-border">{r.nominalValue}</td>}{visibleCols.includes("upperLimit") && <td className="px-3 py-2.5 font-mono text-text-secondary border-r border-border">{r.upperLimit}</td>}{visibleCols.includes("lowerLimit") && <td className="px-3 py-2.5 font-mono text-text-secondary border-r border-border">{r.lowerLimit}</td>}{visibleCols.includes("unit") && <td className="px-3 py-2.5 text-text-secondary border-r border-border">{r.unit}</td>}{visibleCols.includes("calibMethod") && <td className="px-3 py-2.5 text-text-secondary border-r border-border">{r.calibMethod}</td>}<td className="px-3 py-2.5 text-center"><button onClick={() => handleSelect(r)} className="bg-brand-orange text-white text-[11px] font-medium px-3 py-1 rounded hover:bg-orange-700 transition-colors">Select</button></td></tr>)}</tbody>
        </table></div>
        <div className="px-5 py-3 border-t border-border flex items-center justify-between text-xs text-text-secondary"><span>Showing {filtered.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filtered.length)} of {filtered.length} entries</span><div className="flex items-center gap-1"><button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 border border-border rounded hover:bg-surface-muted disabled:opacity-40 transition-colors">Previous</button>{Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(pg => <button key={pg} onClick={() => setCurrentPage(pg)} className={`px-3 py-1 border rounded transition-colors ${currentPage === pg ? "bg-brand-orange text-white border-brand-orange" : "border-border hover:bg-surface-muted"}`}>{pg}</button>)}<button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1 border border-border rounded hover:bg-surface-muted disabled:opacity-40 transition-colors">Next</button></div></div>
      </div>
    </motion.div>
  );
}
