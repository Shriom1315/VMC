import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Plus, Search, X } from "lucide-react";
import ComboSelect from "../../components/ComboSelect";
import ExportToolbar, { ColumnDef } from "../../components/ExportToolbar";
import { supabase } from "../../lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RangeRow {
  range: string;
  maxPermissibleError: string;
  uncertainty: string;
}

interface EquipmentHistory {
  id: number;
  masterEquipmentName: string;
  calBy: string;
  calibrationDate: string;
  remark: string;
  calibrationDueDt: string;
  formatNo: string;
  calCertiNo: string;
  traceability: string;
  ranges: RangeRow[];
}

const EMPTY_RANGE: RangeRow = { range: "", maxPermissibleError: "", uncertainty: "" };

const EMPTY_FORM: Omit<EquipmentHistory, "id"> = {
  masterEquipmentName: "",
  calBy: "",
  calibrationDate: "",
  remark: "",
  calibrationDueDt: "",
  formatNo: "",
  calCertiNo: "",
  traceability: "",
  ranges: [{ ...EMPTY_RANGE }, { ...EMPTY_RANGE }, { ...EMPTY_RANGE }],
};

// ─── Column definitions ────────────────────────────────────────────────────────

const COLUMNS: ColumnDef[] = [
  { key: "id",                   label: "ID" },
  { key: "masterEquipmentName",  label: "Equipment Name" },
  { key: "calBy",                label: "Cal. By" },
  { key: "calibrationDate",      label: "Cal. Date" },
  { key: "calibrationDueDt",     label: "Due Date" },
  { key: "formatNo",             label: "Format No." },
  { key: "calCertiNo",           label: "Cal. Certi. No" },
  { key: "traceability",         label: "Traceability" },
  { key: "remark",               label: "Remark" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function EquipmentHistoryPage() {
  const [records,     setRecords]     = useState<EquipmentHistory[]>([]);
  const [editingId,   setEditingId]   = useState<number | null>(null);
  const [form,        setForm]        = useState<Omit<EquipmentHistory, "id">>(EMPTY_FORM);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleCols, setVisibleCols] = useState(COLUMNS.map(c => c.key));
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [equipNames,  setEquipNames]  = useState<string[]>([]);
  const rowsPerPage = 10;

  // ── Fetch master equipment names (from gauges table) ──
  useEffect(() => {
    supabase.from("gauges").select("gauge_name").order("gauge_name").then(({ data }) => {
      setEquipNames((data ?? []).map((r: any) => r.gauge_name));
    });
  }, []);

  // ── Fetch records ──
  const fetchRecords = async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("equipment_history")
      .select("*")
      .order("id", { ascending: true });
    if (err) {
      setError(err.message);
    } else {
      setRecords(
        (data ?? []).map((r: any) => ({
          id:                   r.id,
          masterEquipmentName:  r.master_equipment_name,
          calBy:                r.cal_by ?? "",
          calibrationDate:      r.calibration_date ?? "",
          remark:               r.remark ?? "",
          calibrationDueDt:     r.calibration_due_dt ?? "",
          formatNo:             r.format_no ?? "",
          calCertiNo:           r.cal_certi_no ?? "",
          traceability:         r.traceability ?? "",
          ranges:               Array.isArray(r.ranges) ? r.ranges : [{ ...EMPTY_RANGE }],
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => { fetchRecords(); }, []);

  // ── Form helpers ──
  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
  };

  const setField = <K extends keyof Omit<EquipmentHistory, "id">>(
    key: K,
    value: Omit<EquipmentHistory, "id">[K]
  ) => setForm(prev => ({ ...prev, [key]: value }));

  const updateRange = (index: number, field: keyof RangeRow, value: string) => {
    setForm(prev => {
      const updated = [...prev.ranges];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, ranges: updated };
    });
  };

  const addRange = () => {
    setForm(prev => ({ ...prev, ranges: [...prev.ranges, { ...EMPTY_RANGE }] }));
  };

  const removeRange = (index: number) => {
    setForm(prev => ({
      ...prev,
      ranges: prev.ranges.filter((_, i) => i !== index),
    }));
  };

  // ── CRUD ──
  const buildPayload = () => ({
    master_equipment_name: form.masterEquipmentName,
    cal_by:                form.calBy,
    calibration_date:      form.calibrationDate || null,
    remark:                form.remark,
    calibration_due_dt:    form.calibrationDueDt || null,
    format_no:             form.formatNo,
    cal_certi_no:          form.calCertiNo,
    traceability:          form.traceability,
    ranges:                form.ranges,
  });

  const handleSave = async () => {
    if (!form.masterEquipmentName.trim()) return;
    const { error: err } = await supabase.from("equipment_history").insert(buildPayload());
    if (err) { setError(err.message); return; }
    resetForm();
    fetchRecords();
  };

  const handleUpdate = async () => {
    if (editingId === null) return;
    const { error: err } = await supabase.from("equipment_history").update(buildPayload()).eq("id", editingId);
    if (err) { setError(err.message); return; }
    resetForm();
    fetchRecords();
  };

  const handleDelete = async () => {
    if (editingId === null) return;
    const { error: err } = await supabase.from("equipment_history").delete().eq("id", editingId);
    if (err) { setError(err.message); return; }
    resetForm();
    fetchRecords();
  };

  const handleSelect = (rec: EquipmentHistory) => {
    setEditingId(rec.id);
    setForm({
      masterEquipmentName: rec.masterEquipmentName,
      calBy:               rec.calBy,
      calibrationDate:     rec.calibrationDate,
      remark:              rec.remark,
      calibrationDueDt:    rec.calibrationDueDt,
      formatNo:            rec.formatNo,
      calCertiNo:          rec.calCertiNo,
      traceability:        rec.traceability,
      ranges:              rec.ranges.length ? rec.ranges : [{ ...EMPTY_RANGE }],
    });
  };

  // ── Filter / paginate ──
  const filtered = records.filter(r =>
    [r.masterEquipmentName, r.calBy, r.calCertiNo, r.formatNo, r.traceability].some(v =>
      (v ?? "").toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  const totalPages  = Math.ceil(filtered.length / rowsPerPage);
  const paginated   = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const exportData  = filtered.map(r => ({
    id: r.id, masterEquipmentName: r.masterEquipmentName, calBy: r.calBy,
    calibrationDate: r.calibrationDate, calibrationDueDt: r.calibrationDueDt,
    formatNo: r.formatNo, calCertiNo: r.calCertiNo, traceability: r.traceability, remark: r.remark,
  }));

  // ── Style helpers ──
  const fieldCls = "w-full bg-white border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-colors";
  const labelCls = "block text-xs font-medium text-text-secondary mb-1";

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="w-full flex flex-col gap-6"
    >
      {/* Page title */}
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Equipment History</h1>
        <p className="text-xs text-text-secondary mt-0.5">Record and manage equipment calibration history</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2.5">
          {error}
        </div>
      )}

      {/* ── Form card ── */}
      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <span className="text-sm font-semibold text-text-primary">
            {editingId !== null ? `Editing Record #${editingId}` : "Equipment History Form"}
          </span>
          {editingId !== null && (
            <button onClick={resetForm} className="text-xs text-text-muted hover:text-text-primary transition-colors">
              ✕ Cancel
            </button>
          )}
        </div>

        <div className="p-5 flex flex-col gap-5">

          {/* Master Equipment Name — full width */}
          <div>
            <label className={labelCls}>Master Equipment Name</label>
            <ComboSelect
              value={form.masterEquipmentName}
              onChange={v => setField("masterEquipmentName", v)}
              options={equipNames}
              placeholder="Select an Option"
            />
          </div>

          {/* Row: Cal. by + Calibration Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <label className={labelCls}>Cal. by</label>
              <input value={form.calBy} onChange={e => setField("calBy", e.target.value)} className={fieldCls} />
            </div>
            <div>
              <label className={labelCls}>Calibration Date</label>
              <input type="date" value={form.calibrationDate} onChange={e => setField("calibrationDate", e.target.value)} className={fieldCls} />
            </div>
          </div>

          {/* Row: Remark + Calibration Due Dt */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <label className={labelCls}>Remark</label>
              <input value={form.remark} onChange={e => setField("remark", e.target.value)} className={fieldCls} />
            </div>
            <div>
              <label className={labelCls}>Calibration Due Dt.</label>
              <input type="date" value={form.calibrationDueDt} onChange={e => setField("calibrationDueDt", e.target.value)} className={fieldCls} />
            </div>
          </div>

          {/* Row: Format No. + Cal. Certi. no */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <label className={labelCls}>Format No.</label>
              <input value={form.formatNo} onChange={e => setField("formatNo", e.target.value)} className={fieldCls} />
            </div>
            <div>
              <label className={labelCls}>Cal. Certi. no</label>
              <input value={form.calCertiNo} onChange={e => setField("calCertiNo", e.target.value)} className={fieldCls} />
            </div>
          </div>

          {/* Traceability */}
          <div>
            <label className={labelCls}>Traceability</label>
            <input value={form.traceability} onChange={e => setField("traceability", e.target.value)} className={fieldCls} />
          </div>

          {/* ── Range rows ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <button
                type="button"
                onClick={addRange}
                className="inline-flex items-center gap-1.5 border border-border text-text-primary text-xs font-medium px-4 py-1.5 rounded-lg hover:bg-surface-muted transition-colors"
              >
                <Plus size={12} /> Add Range
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {form.ranges.map((row, i) => (
                <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 items-center bg-surface-subtle/50 rounded-lg px-3 py-2.5 border border-border">
                  <div>
                    <label className="block text-[10px] text-text-muted mb-1">Range</label>
                    <input
                      value={row.range}
                      onChange={e => updateRange(i, "range", e.target.value)}
                      className="w-full bg-white border border-border rounded px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-orange"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-text-muted mb-1">MAX Permissible Error</label>
                    <input
                      value={row.maxPermissibleError}
                      onChange={e => updateRange(i, "maxPermissibleError", e.target.value)}
                      className="w-full bg-white border border-border rounded px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-orange"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-text-muted mb-1">Unc.</label>
                    <input
                      value={row.uncertainty}
                      onChange={e => updateRange(i, "uncertainty", e.target.value)}
                      className="w-full bg-white border border-border rounded px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-orange"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeRange(i)}
                    className="mt-4 w-6 h-6 flex items-center justify-center rounded border border-border text-text-muted hover:border-red-300 hover:text-red-500 transition-colors shrink-0"
                    title="Remove row"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="px-5 pb-5 pt-3 border-t border-border flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={editingId !== null}
            className="bg-brand-orange text-white text-xs font-medium px-5 py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save
          </button>
          <button
            onClick={handleUpdate}
            disabled={editingId === null}
            className="border border-border text-text-primary text-xs font-medium px-5 py-2 rounded-lg hover:bg-surface-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Update
          </button>
          <button
            onClick={handleDelete}
            disabled={editingId === null}
            className="border border-red-200 text-red-600 text-xs font-medium px-5 py-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Delete
          </button>
          {editingId !== null && (
            <button onClick={resetForm} className="text-xs text-text-secondary hover:text-text-primary transition-colors px-2 py-2">
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
            <h2 className="text-sm font-semibold text-text-primary">Equipment History Records</h2>
            <p className="text-xs text-text-secondary mt-0.5">{filtered.length} records</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <ExportToolbar
              data={exportData}
              columns={COLUMNS}
              filename="equipment-history"
              visibleColumns={visibleCols}
              onVisibilityChange={cols => { setVisibleCols(cols); setCurrentPage(1); }}
            />
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-text-secondary">Search:</span>
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="border border-border rounded-md text-xs pl-7 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-orange w-44"
                  placeholder=""
                />
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
                <th className="px-3 py-2.5 text-xs font-medium text-text-secondary">
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
              ) : paginated.map((rec, i) => (
                <tr
                  key={rec.id}
                  className={`hover:bg-surface-subtle transition-colors ${
                    editingId === rec.id ? "bg-brand-orange-light" : i % 2 === 0 ? "bg-white" : "bg-surface-subtle/40"
                  }`}
                >
                  {visibleCols.includes("id")                  && <td className="px-3 py-2.5 font-mono text-text-secondary border-r border-border">{rec.id}</td>}
                  {visibleCols.includes("masterEquipmentName") && <td className="px-3 py-2.5 font-medium text-text-primary border-r border-border">{rec.masterEquipmentName}</td>}
                  {visibleCols.includes("calBy")               && <td className="px-3 py-2.5 text-text-secondary border-r border-border">{rec.calBy}</td>}
                  {visibleCols.includes("calibrationDate")     && <td className="px-3 py-2.5 text-text-secondary border-r border-border">{rec.calibrationDate}</td>}
                  {visibleCols.includes("calibrationDueDt")    && <td className="px-3 py-2.5 text-text-secondary border-r border-border">{rec.calibrationDueDt}</td>}
                  {visibleCols.includes("formatNo")            && <td className="px-3 py-2.5 font-mono text-text-secondary border-r border-border">{rec.formatNo}</td>}
                  {visibleCols.includes("calCertiNo")          && <td className="px-3 py-2.5 font-mono text-text-secondary border-r border-border">{rec.calCertiNo}</td>}
                  {visibleCols.includes("traceability")        && <td className="px-3 py-2.5 text-text-secondary border-r border-border max-w-[160px]">{rec.traceability}</td>}
                  {visibleCols.includes("remark")              && <td className="px-3 py-2.5 text-text-secondary border-r border-border max-w-[160px]">{rec.remark}</td>}
                  <td className="px-3 py-2.5 text-center">
                    <button
                      onClick={() => handleSelect(rec)}
                      className="bg-brand-orange text-white text-[11px] font-medium px-3 py-1 rounded hover:bg-orange-700 transition-colors"
                    >
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
            Showing {filtered.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} to{" "}
            {Math.min(currentPage * rowsPerPage, filtered.length)} of {filtered.length} entries
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="text-xs px-3 py-1 border border-border rounded text-text-secondary hover:bg-surface-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(pg => (
              <button
                key={pg}
                onClick={() => setCurrentPage(pg)}
                className={`text-xs px-3 py-1 border rounded transition-colors ${
                  currentPage === pg
                    ? "bg-brand-orange text-white border-brand-orange"
                    : "border-border text-text-secondary hover:bg-surface-muted"
                }`}
              >
                {pg}
              </button>
            ))}
            {totalPages > 7 && <span className="text-xs text-text-muted px-1">…</span>}
            {totalPages > 7 && (
              <button
                onClick={() => setCurrentPage(totalPages)}
                className={`text-xs px-3 py-1 border rounded transition-colors ${
                  currentPage === totalPages
                    ? "bg-brand-orange text-white border-brand-orange"
                    : "border-border text-text-secondary hover:bg-surface-muted"
                }`}
              >
                {totalPages}
              </button>
            )}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="text-xs px-3 py-1 border border-border rounded text-text-secondary hover:bg-surface-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
