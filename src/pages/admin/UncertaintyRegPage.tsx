import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { supabase } from "../../lib/supabase";
import ExportToolbar, { ColumnDef } from "../../components/ExportToolbar";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UncertaintyRecord {
  id: string;
  master_equipment_name:   string;
  accuracy_value:          string;
  accuracy_factor:         string;
  uncertainty_cert_value:  string;
  uncertainty_cert_factor: string;
  k_factor_value:          string;
  k_factor_factor:         string;
  list_count_iuc_value:    string;
  list_count_iuc_factor:   string;
  resolution_value:        string;
  resolution_factor:       string;
  repeatability_value:     string;
  repeatability_factor:    string;
  created_at?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FACTOR_OPTIONS = ["1", "1/√2", "1/√3", "1/2", "1/3", "2", "√3", "√2"];

const COLUMNS: ColumnDef[] = [
  { key: "master_equipment_name",   label: "Master Equipment" },
  { key: "accuracy_value",          label: "Accuracy / Max. Error (μm)" },
  { key: "accuracy_factor",         label: "Acc. Factor" },
  { key: "uncertainty_cert_value",  label: "Uncertainty from cert (μm)" },
  { key: "uncertainty_cert_factor", label: "Unc. Factor" },
  { key: "k_factor_value",          label: "k Factor" },
  { key: "k_factor_factor",         label: "k Factor Req." },
  { key: "list_count_iuc_value",    label: "List Count of IUC" },
  { key: "list_count_iuc_factor",   label: "IUC Factor" },
  { key: "resolution_value",        label: "Resolution" },
  { key: "resolution_factor",       label: "Res. Factor" },
  { key: "repeatability_value",     label: "Repeatability" },
  { key: "repeatability_factor",    label: "Rep. Factor" },
];

// ─── Row definition for the factor input grid ─────────────────────────────────
interface FactorRow {
  label:     string;
  value:     string;
  setValue:  (v: string) => void;
  factor:    string;
  setFactor: (v: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function UncertaintyRegPage() {
  const [records,     setRecords]     = useState<UncertaintyRecord[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [editingId,   setEditingId]   = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleCols, setVisibleCols] = useState(COLUMNS.map(c => c.key));
  const rowsPerPage = 10;

  // ── Equipment names for dropdown ──
  const [equipmentList, setEquipmentList] = useState<string[]>([]);

  // ── Form fields ──
  const [masterEquipmentName,   setMasterEquipmentName]   = useState("");
  const [accuracyValue,         setAccuracyValue]         = useState("");
  const [accuracyFactor,        setAccuracyFactor]        = useState("");
  const [uncertaintyCertValue,  setUncertaintyCertValue]  = useState("");
  const [uncertaintyCertFactor, setUncertaintyCertFactor] = useState("");
  const [kFactorValue,          setKFactorValue]          = useState("");
  const [kFactorFactor,         setKFactorFactor]         = useState("");
  const [listCountIucValue,     setListCountIucValue]     = useState("");
  const [listCountIucFactor,    setListCountIucFactor]    = useState("");
  const [resolutionValue,       setResolutionValue]       = useState("");
  const [resolutionFactor,      setResolutionFactor]      = useState("");
  const [repeatabilityValue,    setRepeatabilityValue]    = useState("");
  const [repeatabilityFactor,   setRepeatabilityFactor]   = useState("");

  // ── Data fetching ──────────────────────────────────────────────────────────
  const fetchRecords = async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("uncertainty_records")
      .select("*")
      .order("created_at", { ascending: false });
    if (err) { setError(err.message); }
    else      { setRecords(data ?? []); }
    setLoading(false);
  };

  const fetchEquipment = async () => {
    // Pull from the equipments table (created by NewEquipmentPage)
    const { data } = await supabase
      .from("equipments")
      .select("equipment_name")
      .order("equipment_name", { ascending: true });
    if (data) setEquipmentList(data.map((r: any) => r.equipment_name));
  };

  useEffect(() => { fetchRecords(); fetchEquipment(); }, []);

  // ── Form helpers ───────────────────────────────────────────────────────────
  const resetForm = () => {
    setMasterEquipmentName("");
    setAccuracyValue("");        setAccuracyFactor("");
    setUncertaintyCertValue(""); setUncertaintyCertFactor("");
    setKFactorValue("");         setKFactorFactor("");
    setListCountIucValue("");    setListCountIucFactor("");
    setResolutionValue("");      setResolutionFactor("");
    setRepeatabilityValue("");   setRepeatabilityFactor("");
    setEditingId(null);
  };

  const buildPayload = () => ({
    master_equipment_name:   masterEquipmentName,
    accuracy_value:          accuracyValue,
    accuracy_factor:         accuracyFactor,
    uncertainty_cert_value:  uncertaintyCertValue,
    uncertainty_cert_factor: uncertaintyCertFactor,
    k_factor_value:          kFactorValue,
    k_factor_factor:         kFactorFactor,
    list_count_iuc_value:    listCountIucValue,
    list_count_iuc_factor:   listCountIucFactor,
    resolution_value:        resolutionValue,
    resolution_factor:       resolutionFactor,
    repeatability_value:     repeatabilityValue,
    repeatability_factor:    repeatabilityFactor,
  });

  // ── CRUD ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!masterEquipmentName.trim()) { setError("Master Equipment Name is required."); return; }
    setError(null);
    const { error: err } = await supabase.from("uncertainty_records").insert(buildPayload());
    if (err) { setError(err.message); return; }
    resetForm(); fetchRecords();
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    if (!masterEquipmentName.trim()) { setError("Master Equipment Name is required."); return; }
    setError(null);
    const { error: err } = await supabase
      .from("uncertainty_records")
      .update(buildPayload())
      .eq("id", editingId);
    if (err) { setError(err.message); return; }
    resetForm(); fetchRecords();
  };

  const handleDelete = async () => {
    if (!editingId) return;
    const { error: err } = await supabase.from("uncertainty_records").delete().eq("id", editingId);
    if (err) { setError(err.message); return; }
    resetForm(); fetchRecords();
  };

  const handleSelect = (r: UncertaintyRecord) => {
    setEditingId(r.id);
    setMasterEquipmentName(r.master_equipment_name);
    setAccuracyValue(r.accuracy_value);               setAccuracyFactor(r.accuracy_factor);
    setUncertaintyCertValue(r.uncertainty_cert_value); setUncertaintyCertFactor(r.uncertainty_cert_factor);
    setKFactorValue(r.k_factor_value);                setKFactorFactor(r.k_factor_factor);
    setListCountIucValue(r.list_count_iuc_value);     setListCountIucFactor(r.list_count_iuc_factor);
    setResolutionValue(r.resolution_value);           setResolutionFactor(r.resolution_factor);
    setRepeatabilityValue(r.repeatability_value);     setRepeatabilityFactor(r.repeatability_factor);
  };

  // ── Filter / paginate ──────────────────────────────────────────────────────
  const filtered   = records.filter(r =>
    r.master_equipment_name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated  = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // ── Style helpers ──────────────────────────────────────────────────────────
  const inputCls  = "border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-colors bg-white";
  const selectCls = `${inputCls} appearance-none cursor-pointer`;

  // ── Factor rows config ────────────────────────────────────────────────────
  const factorRows: FactorRow[] = [
    { label: "Accuracy / Max. Error (μm)", value: accuracyValue,        setValue: setAccuracyValue,        factor: accuracyFactor,        setFactor: setAccuracyFactor        },
    { label: "Uncertainty from cert (μm)", value: uncertaintyCertValue, setValue: setUncertaintyCertValue, factor: uncertaintyCertFactor, setFactor: setUncertaintyCertFactor },
    { label: "k Factor",                   value: kFactorValue,          setValue: setKFactorValue,          factor: kFactorFactor,          setFactor: setKFactorFactor          },
    { label: "List Count OF IUC",          value: listCountIucValue,     setValue: setListCountIucValue,     factor: listCountIucFactor,     setFactor: setListCountIucFactor     },
    { label: "Resolution",                 value: resolutionValue,       setValue: setResolutionValue,       factor: resolutionFactor,       setFactor: setResolutionFactor       },
    { label: "Repeatability",              value: repeatabilityValue,    setValue: setRepeatabilityValue,    factor: repeatabilityFactor,    setFactor: setRepeatabilityFactor    },
  ];

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
        <h1 className="text-lg font-semibold text-text-primary">Uncertainty Registration</h1>
        <p className="text-xs text-text-secondary mt-0.5">Register and manage uncertainty budget records for master equipment</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2.5">{error}</div>
      )}

      {/* ── Form card ── */}
      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <span className="text-sm font-semibold text-text-primary">
            {editingId ? `Editing Record` : "New Form"}
          </span>
          {editingId && (
            <button onClick={resetForm} className="text-xs text-text-muted hover:text-text-primary transition-colors">
              ✕ Cancel
            </button>
          )}
        </div>

        <div className="p-5 flex flex-col gap-5">

          {/* Master Equipment Name */}
          <div className="flex items-center gap-4 flex-wrap">
            <label className="text-sm font-medium text-text-secondary w-52 shrink-0">
              Master Equipment Name
            </label>
            <select
              value={masterEquipmentName}
              onChange={e => setMasterEquipmentName(e.target.value)}
              className={`${selectCls} w-96`}
            >
              <option value="">-- Select Equipment --</option>
              {equipmentList.map(eq => (
                <option key={eq} value={eq}>{eq}</option>
              ))}
            </select>
          </div>

          {/* ── Factor rows ── */}
          <div className="flex flex-col gap-3">
            {factorRows.map(row => (
              <div key={row.label} className="flex items-center gap-4 flex-wrap">
                <label className="text-sm font-medium text-text-secondary w-52 shrink-0 leading-tight">
                  {row.label}
                </label>
                <input
                  value={row.value}
                  onChange={e => row.setValue(e.target.value)}
                  className={`${inputCls} w-56`}
                />
                <label className="text-xs font-medium text-text-secondary shrink-0 ml-4">
                  Factor Requirement:
                </label>
                <select
                  value={row.factor}
                  onChange={e => row.setFactor(e.target.value)}
                  className={`${selectCls} w-32`}
                >
                  <option value="">--</option>
                  {FACTOR_OPTIONS.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="px-5 pb-5 pt-3 border-t border-border flex items-center gap-2">
          <button onClick={handleSave} disabled={!!editingId}
            className="bg-brand-orange text-white text-xs font-medium px-5 py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            Save
          </button>
          <button onClick={handleUpdate} disabled={!editingId}
            className="border border-border text-text-primary text-xs font-medium px-5 py-2 rounded-lg hover:bg-surface-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            Update
          </button>
          <button onClick={handleDelete} disabled={!editingId}
            className="border border-red-200 text-red-600 text-xs font-medium px-5 py-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            Delete
          </button>
          {editingId && (
            <button onClick={resetForm} className="text-xs text-text-secondary hover:text-text-primary transition-colors px-2 py-2">
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* ── Data Table ── */}
      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="px-5 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Uncertainty Records</h2>
            <p className="text-xs text-text-secondary mt-0.5">{filtered.length} records</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <ExportToolbar
              data={filtered}
              columns={COLUMNS}
              filename="uncertainty-records"
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

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-muted border-b border-border">
              <tr>
                {COLUMNS.filter(c => visibleCols.includes(c.key)).map(col => (
                  <th key={col.key} className="px-3 py-2.5 text-xs font-medium text-text-secondary border-r border-border whitespace-nowrap">
                    {col.label}
                  </th>
                ))}
                <th className="px-3 py-2.5 text-xs font-medium text-text-secondary text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={visibleCols.length + 1} className="px-4 py-10 text-center text-text-muted">
                    No records found
                  </td>
                </tr>
              ) : paginated.map((r, i) => (
                <tr key={r.id}
                  className={`hover:bg-surface-subtle transition-colors ${
                    editingId === r.id ? "bg-brand-orange-light" : i % 2 === 0 ? "bg-white" : "bg-surface-subtle/40"
                  }`}
                >
                  {visibleCols.includes("master_equipment_name")   && <td className="px-3 py-2.5 font-medium text-text-primary border-r border-border whitespace-nowrap">{r.master_equipment_name}</td>}
                  {visibleCols.includes("accuracy_value")          && <td className="px-3 py-2.5 text-text-secondary border-r border-border">{r.accuracy_value}</td>}
                  {visibleCols.includes("accuracy_factor")         && <td className="px-3 py-2.5 text-text-secondary border-r border-border">{r.accuracy_factor}</td>}
                  {visibleCols.includes("uncertainty_cert_value")  && <td className="px-3 py-2.5 text-text-secondary border-r border-border">{r.uncertainty_cert_value}</td>}
                  {visibleCols.includes("uncertainty_cert_factor") && <td className="px-3 py-2.5 text-text-secondary border-r border-border">{r.uncertainty_cert_factor}</td>}
                  {visibleCols.includes("k_factor_value")          && <td className="px-3 py-2.5 text-text-secondary border-r border-border">{r.k_factor_value}</td>}
                  {visibleCols.includes("k_factor_factor")         && <td className="px-3 py-2.5 text-text-secondary border-r border-border">{r.k_factor_factor}</td>}
                  {visibleCols.includes("list_count_iuc_value")    && <td className="px-3 py-2.5 text-text-secondary border-r border-border">{r.list_count_iuc_value}</td>}
                  {visibleCols.includes("list_count_iuc_factor")   && <td className="px-3 py-2.5 text-text-secondary border-r border-border">{r.list_count_iuc_factor}</td>}
                  {visibleCols.includes("resolution_value")        && <td className="px-3 py-2.5 text-text-secondary border-r border-border">{r.resolution_value}</td>}
                  {visibleCols.includes("resolution_factor")       && <td className="px-3 py-2.5 text-text-secondary border-r border-border">{r.resolution_factor}</td>}
                  {visibleCols.includes("repeatability_value")     && <td className="px-3 py-2.5 text-text-secondary border-r border-border">{r.repeatability_value}</td>}
                  {visibleCols.includes("repeatability_factor")    && <td className="px-3 py-2.5 text-text-secondary border-r border-border">{r.repeatability_factor}</td>}
                  <td className="px-3 py-2.5 text-center">
                    <button onClick={() => handleSelect(r)}
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
            Showing {filtered.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} to{" "}
            {Math.min(currentPage * rowsPerPage, filtered.length)} of {filtered.length} entries
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
              className="text-xs px-3 py-1 border border-border rounded text-text-secondary hover:bg-surface-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Previous
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(pg => (
              <button key={pg} onClick={() => setCurrentPage(pg)}
                className={`text-xs px-3 py-1 border rounded transition-colors ${
                  currentPage === pg ? "bg-brand-orange text-white border-brand-orange" : "border-border text-text-secondary hover:bg-surface-muted"
                }`}>
                {pg}
              </button>
            ))}
            {totalPages > 7 && <span className="text-xs text-text-muted px-1">…</span>}
            {totalPages > 7 && (
              <button onClick={() => setCurrentPage(totalPages)}
                className={`text-xs px-3 py-1 border rounded transition-colors ${
                  currentPage === totalPages ? "bg-brand-orange text-white border-brand-orange" : "border-border text-text-secondary hover:bg-surface-muted"
                }`}>
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
