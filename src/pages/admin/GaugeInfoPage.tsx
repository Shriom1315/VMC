import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";
import ExportToolbar, { ColumnDef } from "../../components/ExportToolbar";
import { supabase } from "../../lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Gauge {
  id: number;
  gaugeName: string;
  isNo: string;
  nonNablNo: string;
  nablNo: string;
  datasheet: string;
  certificate: string;
  calibration: string;
  gaugeType: string;
  condition: string;
  calibrationMethod: string;
  envConditions: string;
  certCode: string;
  rawDatasheetFrmt: string;
}

const GAUGE_TYPES = [
  "OD Limit Gauge", "ID Limit Gauge", "Plain Plug Gauge", "Plain Ring Gauge",
  "Thread Plug Gauge", "Thread Ring Gauge", "Taper Plug Gauge", "Taper Ring Gauge",
  "Dial Indicator", "Vernier Caliper", "Micrometer", "Height Gauge",
  "Depth Micrometer", "Bore Gauge", "Comparator Stand", "Angle Plate",
  "V Block", "Master Ring", "Digital Dial Gauge", "External Micrometer",
];

const ENV_DEFAULT = "20°C ± 2°C & Humidity 40 to 60 % Rh.";

// ─── Component ────────────────────────────────────────────────────────────────

const COLUMNS: ColumnDef[] = [
  { key: "id",          label: "Gauge ID" },
  { key: "gaugeName",   label: "Gauge Name" },
  { key: "isNo",        label: "IS No" },
  { key: "nonNablNo",   label: "Non-NAB" },
  { key: "nablNo",      label: "NABL No" },
  { key: "datasheet",   label: "Datasheet" },
  { key: "certificate", label: "Certificate" },
  { key: "calibration", label: "Calibration" },
  { key: "gaugeType",   label: "Gauge Type" },
  { key: "condition",   label: "Condition" },
];

export default function GaugeInfoPage() {
  const [gauges,      setGauges]      = useState<Gauge[]>([]);
  const [editingId,   setEditingId]   = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleCols, setVisibleCols] = useState(COLUMNS.map(c => c.key));
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const rowsPerPage = 10;

  // Form state
  const [gaugeName,          setGaugeName]          = useState("");
  const [isNo,               setIsNo]               = useState("");
  const [nonNablNo,          setNonNablNo]          = useState("");
  const [nablNo,             setNablNo]             = useState("");
  const [rawDatasheetFrmt,   setRawDatasheetFrmt]   = useState("");
  const [certCode,           setCertCode]           = useState("");
  const [calibrationMethod,  setCalibrationMethod]  = useState("");
  const [gaugeType,          setGaugeType]          = useState("OD Limit Gauge");
  const [envConditions,      setEnvConditions]      = useState(ENV_DEFAULT);

  const fetchGauges = async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("gauges")
      .select("*")
      .order("id", { ascending: true });
    if (err) {
      setError(err.message);
    } else {
      setGauges(
        (data ?? []).map((r: any) => ({
          id:               r.id,
          gaugeName:        r.gauge_name,
          isNo:             r.is_no,
          nonNablNo:        r.non_nabl_no,
          nablNo:           r.nabl_no,
          rawDatasheetFrmt: r.raw_datasheet_frmt,
          certCode:         r.cert_code,
          calibrationMethod:r.calibration_method,
          gaugeType:        r.gauge_type,
          envConditions:    r.env_conditions,
          datasheet:        r.datasheet,
          certificate:      r.certificate,
          calibration:      r.calibration,
          condition:        r.env_conditions,
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => { fetchGauges(); }, []);

  const resetForm = () => {
    setGaugeName(""); setIsNo(""); setNonNablNo(""); setNablNo("");
    setRawDatasheetFrmt(""); setCertCode(""); setCalibrationMethod("");
    setGaugeType("OD Limit Gauge"); setEnvConditions(ENV_DEFAULT);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!gaugeName.trim()) return;
    const payload = {
      gauge_name:         gaugeName,
      is_no:              isNo,
      non_nabl_no:        nonNablNo,
      nabl_no:            nablNo,
      raw_datasheet_frmt: rawDatasheetFrmt,
      cert_code:          certCode,
      calibration_method: calibrationMethod,
      gauge_type:         gaugeType,
      env_conditions:     envConditions,
      datasheet:          rawDatasheetFrmt,
      certificate:        certCode,
      calibration:        calibrationMethod,
    };
    if (editingId !== null) {
      const { error: err } = await supabase.from("gauges").update(payload).eq("id", editingId);
      if (err) { setError(err.message); return; }
    } else {
      const { error: err } = await supabase.from("gauges").insert(payload);
      if (err) { setError(err.message); return; }
    }
    resetForm();
    fetchGauges();
  };

  const handleSelect = (g: Gauge) => {
    setEditingId(g.id);
    setGaugeName(g.gaugeName); setIsNo(g.isNo);
    setNonNablNo(g.nonNablNo); setNablNo(g.nablNo);
    setRawDatasheetFrmt(g.rawDatasheetFrmt); setCertCode(g.certCode);
    setCalibrationMethod(g.calibrationMethod); setGaugeType(g.gaugeType);
    setEnvConditions(g.envConditions);
  };

  const handleDelete = async () => {
    if (editingId !== null) {
      const { error: err } = await supabase.from("gauges").delete().eq("id", editingId);
      if (err) { setError(err.message); return; }
    }
    resetForm();
    fetchGauges();
  };

  const filtered   = gauges.filter(g =>
    [g.gaugeName, g.isNo, g.gaugeType, g.certificate, g.calibration].some(v =>
      (v ?? "").toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated  = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const exportData = filtered.map(g => ({
    id: g.id, gaugeName: g.gaugeName, isNo: g.isNo,
    nonNablNo: g.nonNablNo, nablNo: g.nablNo, datasheet: g.datasheet,
    certificate: g.certificate, calibration: g.calibration,
    gaugeType: g.gaugeType, condition: g.condition,
  }));

  const fieldCls  = "w-full bg-white border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-colors";
  const labelCls  = "block text-xs font-medium text-text-secondary mb-1";
  const selectCls = `${fieldCls} appearance-none cursor-pointer`;

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
      className="w-full flex flex-col gap-6">

      {/* Page title */}
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Gauge Info Registration</h1>
        <p className="text-xs text-text-secondary mt-0.5">Register and manage gauge master records</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2.5 mb-4">{error}</div>}

      {/* ── Form card ── */}
      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <span className="text-sm font-semibold text-text-primary">
            {editingId !== null ? `Editing Gauge #${editingId}` : "Add Gauge Form"}
          </span>
          {editingId !== null && (
            <button onClick={resetForm} className="text-xs text-text-muted hover:text-text-primary transition-colors">
              ✕ Cancel
            </button>
          )}
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {/* Row 1 */}
          <div>
            <label className={labelCls}>Gauge Name</label>
            <input value={gaugeName} onChange={e => setGaugeName(e.target.value)} className={fieldCls} placeholder="" />
          </div>
          <div>
            <label className={labelCls}>IS Standard No</label>
            <input value={isNo} onChange={e => setIsNo(e.target.value)} className={fieldCls} placeholder="" />
          </div>

          {/* Row 2 */}
          <div>
            <label className={labelCls}>Non NABI certi. Frmt. No</label>
            <input value={nonNablNo} onChange={e => setNonNablNo(e.target.value)} className={fieldCls} placeholder="" />
          </div>
          <div>
            <label className={labelCls}>NABI certi. Frmt. No</label>
            <input value={nablNo} onChange={e => setNablNo(e.target.value)} className={fieldCls} placeholder="" />
          </div>

          {/* Row 3 */}
          <div>
            <label className={labelCls}>Raw Datasheet frmt. No</label>
            <input value={rawDatasheetFrmt} onChange={e => setRawDatasheetFrmt(e.target.value)} className={fieldCls} placeholder="" />
          </div>
          <div>
            <label className={labelCls}>Certificate code</label>
            <input value={certCode} onChange={e => setCertCode(e.target.value)} className={fieldCls} placeholder="" />
          </div>

          {/* Row 4 */}
          <div>
            <label className={labelCls}>Calibration Method</label>
            <input value={calibrationMethod} onChange={e => setCalibrationMethod(e.target.value)} className={fieldCls} placeholder="" />
          </div>
          <div>
            <label className={labelCls}>Gauge Type</label>
            <div className="relative">
              <select value={gaugeType} onChange={e => setGaugeType(e.target.value)} className={selectCls}>
                {GAUGE_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            </div>
          </div>

          {/* Row 5 — full width */}
          <div className="md:col-span-2">
            <label className={labelCls}>Environmental Conditions</label>
            <input value={envConditions} onChange={e => setEnvConditions(e.target.value)} className={fieldCls} />
          </div>
        </div>

        {/* Action buttons */}
        <div className="px-5 pb-5 pt-3 border-t border-border flex items-center gap-2">
          <button onClick={handleSave}
            className="bg-brand-orange text-white text-xs font-medium px-5 py-2 rounded-lg hover:bg-orange-700 transition-colors">
            Save
          </button>
          <button onClick={handleSave} disabled={editingId === null}
            className="border border-border text-text-primary text-xs font-medium px-5 py-2 rounded-lg hover:bg-surface-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            Update
          </button>
          <button onClick={handleDelete} disabled={editingId === null}
            className="border border-red-200 text-red-600 text-xs font-medium px-5 py-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            Delete
          </button>
          {editingId !== null && (
            <button onClick={resetForm}
              className="text-xs text-text-secondary hover:text-text-primary transition-colors px-2 py-2">
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* ── Table card ── */}
      <div className="bg-white rounded-xl border border-border shadow-sm">
        {/* Toolbar */}
        <div className="px-5 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Total Party</h2>
            <p className="text-xs text-text-secondary mt-0.5">{filtered.length} records</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <ExportToolbar
              data={exportData}
              columns={COLUMNS}
              filename="gauge-info"
              visibleColumns={visibleCols}
              onVisibilityChange={cols => { setVisibleCols(cols); setCurrentPage(1); }}
            />
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-text-secondary">Search:</span>
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="border border-border rounded-md text-xs pl-7 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-orange w-44"
                  placeholder="" />
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[1100px]">
            <thead className="bg-surface-muted border-b border-border">
              <tr>
                {COLUMNS.filter(c => visibleCols.includes(c.key)).map(col => (
                  <th key={col.key} className="px-3 py-2.5 text-xs font-medium text-text-secondary border-r border-border">
                    <span className="flex items-center gap-1">{col.label} <span className="text-text-muted">↕</span></span>
                  </th>
                ))}
                <th className="px-3 py-2.5 text-xs font-medium text-text-secondary text-center">
                  <span className="flex items-center gap-1">Action <span className="text-text-muted">↕</span></span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={visibleCols.length + 1} className="px-4 py-10 text-center text-text-muted">
                    No records found
                  </td>
                </tr>
              ) : paginated.map((g, i) => (
                <tr key={g.id}
                  className={`hover:bg-surface-subtle transition-colors ${editingId === g.id ? "bg-brand-orange-light" : i % 2 === 0 ? "bg-white" : "bg-surface-subtle/40"}`}>
                  {visibleCols.includes("id")          && <td className="px-3 py-2.5 font-mono text-text-secondary border-r border-border">{g.id}</td>}
                  {visibleCols.includes("gaugeName")   && <td className="px-3 py-2.5 font-medium text-text-primary border-r border-border">{g.gaugeName}</td>}
                  {visibleCols.includes("isNo")        && <td className="px-3 py-2.5 text-text-secondary border-r border-border">{g.isNo}</td>}
                  {visibleCols.includes("nonNablNo")   && <td className="px-3 py-2.5 text-text-secondary border-r border-border text-[10px] leading-tight max-w-[120px]">{g.nonNablNo}</td>}
                  {visibleCols.includes("nablNo")      && <td className="px-3 py-2.5 text-text-secondary border-r border-border text-[10px] leading-tight max-w-[120px]">{g.nablNo}</td>}
                  {visibleCols.includes("datasheet")   && <td className="px-3 py-2.5 font-mono text-text-secondary border-r border-border">{g.datasheet}</td>}
                  {visibleCols.includes("certificate") && <td className="px-3 py-2.5 font-mono text-text-secondary border-r border-border">{g.certificate}</td>}
                  {visibleCols.includes("calibration") && <td className="px-3 py-2.5 font-mono text-text-secondary border-r border-border">{g.calibration}</td>}
                  {visibleCols.includes("gaugeType")   && <td className="px-3 py-2.5 text-text-secondary border-r border-border">{g.gaugeType}</td>}
                  {visibleCols.includes("condition")   && <td className="px-3 py-2.5 text-text-secondary border-r border-border text-[10px] leading-tight max-w-[140px]">{g.condition}</td>}
                  <td className="px-3 py-2.5 text-center">
                    <button onClick={() => handleSelect(g)}
                      className="bg-brand-orange text-white text-[11px] font-medium px-3 py-1 rounded hover:bg-orange-700 transition-colors">
                      Select
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <span className="text-xs text-text-secondary">
            Showing {filtered.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filtered.length)} of {filtered.length} entries
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="text-xs px-3 py-1 border border-border rounded text-text-secondary hover:bg-surface-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Previous
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(pg => (
              <button key={pg} onClick={() => setCurrentPage(pg)}
                className={`text-xs px-3 py-1 border rounded transition-colors ${currentPage === pg ? "bg-brand-orange text-white border-brand-orange" : "border-border text-text-secondary hover:bg-surface-muted"}`}>
                {pg}
              </button>
            ))}
            {totalPages > 7 && <span className="text-xs text-text-muted px-1">…</span>}
            {totalPages > 7 && (
              <button onClick={() => setCurrentPage(totalPages)}
                className={`text-xs px-3 py-1 border rounded transition-colors ${currentPage === totalPages ? "bg-brand-orange text-white border-brand-orange" : "border-border text-text-secondary hover:bg-surface-muted"}`}>
                {totalPages}
              </button>
            )}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}
              className="text-xs px-3 py-1 border border-border rounded text-text-secondary hover:bg-surface-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
