import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Search, Plus, X } from "lucide-react";
import ExportToolbar, { ColumnDef } from "../../components/ExportToolbar";
import { supabase } from "../../lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Equipment {
  id: number;
  equipmentName: string;
  codeNo: string;
  serialNo: string;
  mgfDate: string;
  dateOfInstallation: string;
  referenceStd: string;
  leastCount: string;
  calAgency: string;
  make: string;
  sizeRange: string;
  periodicityNo: string;
  equipmentLocation: string;
  ranges: EquipmentRange[];
}

interface EquipmentRange {
  range: string;
  maxError: string;
}

// ─── Column definitions ───────────────────────────────────────────────────────

const COLUMNS: ColumnDef[] = [
  { key: "id",          label: "ID" },
  { key: "name",        label: "Name" },
  { key: "codeNo",      label: "Code No" },
  { key: "serialNo",    label: "Serial No" },
  { key: "calagency",   label: "Cal Agency" },
  { key: "periodicity", label: "Periodicity" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function NewEquipmentPage() {
  const [equipments,   setEquipments]   = useState<Equipment[]>([]);
  const [editingId,    setEditingId]    = useState<number | null>(null);
  const [searchQuery,  setSearchQuery]  = useState("");
  const [currentPage,  setCurrentPage]  = useState(1);
  const [visibleCols,  setVisibleCols]  = useState(COLUMNS.map(c => c.key));
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const rowsPerPage = 10;

  // Form state
  const [equipmentName,      setEquipmentName]      = useState("");
  const [codeNo,             setCodeNo]             = useState("");
  const [serialNo,           setSerialNo]           = useState("");
  const [mgfDate,            setMgfDate]            = useState("");
  const [dateOfInstallation, setDateOfInstallation] = useState("");
  const [referenceStd,       setReferenceStd]       = useState("");
  const [leastCount,         setLeastCount]         = useState("");
  const [calAgency,          setCalAgency]          = useState("");
  const [make,               setMake]               = useState("");
  const [sizeRange,          setSizeRange]          = useState("");
  const [periodicityNo,      setPeriodicityNo]      = useState("");
  const [equipmentLocation,  setEquipmentLocation]  = useState("");
  const [ranges,             setRanges]             = useState<EquipmentRange[]>([]);

  // ── Data fetching ──────────────────────────────────────────────────────────
  const fetchEquipments = async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("equipments")
      .select("*")
      .order("id", { ascending: true });
    if (err) {
      setError(err.message);
      setEquipments([]);
    } else {
      setEquipments(
        (data ?? []).map((r: any) => ({
          id:                 r.id,
          equipmentName:      r.equipment_name,
          codeNo:             r.code_no,
          serialNo:           r.serial_no,
          mgfDate:            r.mgf_date ?? "",
          dateOfInstallation: r.date_of_installation ?? "",
          referenceStd:       r.reference_std ?? "",
          leastCount:         r.least_count ?? "",
          calAgency:          r.cal_agency ?? "",
          make:               r.make ?? "",
          sizeRange:          r.size_range ?? "",
          periodicityNo:      r.periodicity_no ?? "",
          equipmentLocation:  r.equipment_location ?? "",
          ranges:             Array.isArray(r.ranges) ? r.ranges : [],
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => { fetchEquipments(); }, []);

  // ── Form helpers ───────────────────────────────────────────────────────────
  const resetForm = () => {
    setEquipmentName(""); setCodeNo(""); setSerialNo(""); setMgfDate("");
    setDateOfInstallation(""); setReferenceStd(""); setLeastCount("");
    setCalAgency(""); setMake(""); setSizeRange(""); setPeriodicityNo("");
    setEquipmentLocation(""); setRanges([]); setEditingId(null);
  };

  const buildPayload = () => ({
    equipment_name:       equipmentName,
    code_no:              codeNo,
    serial_no:            serialNo,
    mgf_date:             mgfDate,
    date_of_installation: dateOfInstallation,
    reference_std:        referenceStd,
    least_count:          leastCount,
    cal_agency:           calAgency,
    make,
    size_range:           sizeRange,
    periodicity_no:       periodicityNo,
    equipment_location:   equipmentLocation,
    ranges,
  });

  // ── CRUD ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!equipmentName.trim()) return;
    const { error: err } = await supabase.from("equipments").insert(buildPayload());
    if (err) { setError(err.message); return; }
    resetForm(); fetchEquipments();
  };

  const handleUpdate = async () => {
    if (editingId === null) return;
    const { error: err } = await supabase.from("equipments").update(buildPayload()).eq("id", editingId);
    if (err) { setError(err.message); return; }
    resetForm(); fetchEquipments();
  };

  const handleDelete = async () => {
    if (editingId === null) return;
    const { error: err } = await supabase.from("equipments").delete().eq("id", editingId);
    if (err) { setError(err.message); return; }
    resetForm(); fetchEquipments();
  };

  const handleSelect = (e: Equipment) => {
    setEditingId(e.id);
    setEquipmentName(e.equipmentName); setCodeNo(e.codeNo); setSerialNo(e.serialNo);
    setMgfDate(e.mgfDate); setDateOfInstallation(e.dateOfInstallation);
    setReferenceStd(e.referenceStd); setLeastCount(e.leastCount);
    setCalAgency(e.calAgency); setMake(e.make); setSizeRange(e.sizeRange);
    setPeriodicityNo(e.periodicityNo); setEquipmentLocation(e.equipmentLocation);
    setRanges(e.ranges || []);
  };

  // ── Range helpers ──────────────────────────────────────────────────────────
  const addRange = () => setRanges(prev => [...prev, { range: "", maxError: "" }]);
  const removeRange = (idx: number) => setRanges(prev => prev.filter((_, i) => i !== idx));
  const updateRange = (idx: number, field: keyof EquipmentRange, value: string) => {
    setRanges(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  // ── Filter / paginate ──────────────────────────────────────────────────────
  const filtered = equipments.filter(e =>
    [e.equipmentName, e.codeNo, e.serialNo, e.calAgency].some(v =>
      (v ?? "").toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated  = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const exportData = filtered.map(e => ({
    id: e.id, name: e.equipmentName, codeNo: e.codeNo,
    serialNo: e.serialNo, calagency: e.calAgency, periodicity: e.periodicityNo,
  }));

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
        <h1 className="text-lg font-semibold text-text-primary">New Equipment</h1>
        <p className="text-xs text-text-secondary mt-0.5">Register and manage equipment master records</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2.5">{error}</div>
      )}

      {/* ── Form card ── */}
      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <span className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <Plus size={15} className="text-brand-orange" />
            {editingId !== null ? `Editing Equipment #${editingId}` : "Add New Equipment"}
          </span>
          {editingId !== null && (
            <button onClick={resetForm} className="text-xs text-text-muted hover:text-text-primary transition-colors">
              ✕ Cancel
            </button>
          )}
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div><label className={labelCls}>Equipment Name</label><input value={equipmentName} onChange={e => setEquipmentName(e.target.value)} className={fieldCls} /></div>
          <div><label className={labelCls}>Code No</label><input value={codeNo} onChange={e => setCodeNo(e.target.value)} className={fieldCls} /></div>
          <div><label className={labelCls}>Serial No</label><input value={serialNo} onChange={e => setSerialNo(e.target.value)} className={fieldCls} /></div>
          <div><label className={labelCls}>MGF Date</label><input type="date" value={mgfDate} onChange={e => setMgfDate(e.target.value)} className={fieldCls} /></div>
          <div><label className={labelCls}>Date of Installation in Lab</label><input type="date" value={dateOfInstallation} onChange={e => setDateOfInstallation(e.target.value)} className={fieldCls} /></div>
          <div><label className={labelCls}>Reference Std</label><input value={referenceStd} onChange={e => setReferenceStd(e.target.value)} className={fieldCls} /></div>
          <div><label className={labelCls}>Least Count</label><input value={leastCount} onChange={e => setLeastCount(e.target.value)} className={fieldCls} /></div>
          <div><label className={labelCls}>Cal Agency</label><input value={calAgency} onChange={e => setCalAgency(e.target.value)} className={fieldCls} /></div>
          <div><label className={labelCls}>Make</label><input value={make} onChange={e => setMake(e.target.value)} className={fieldCls} /></div>
          <div><label className={labelCls}>Size / Range</label><input value={sizeRange} onChange={e => setSizeRange(e.target.value)} className={fieldCls} /></div>
          <div><label className={labelCls}>Periodicity No</label><input value={periodicityNo} onChange={e => setPeriodicityNo(e.target.value)} className={fieldCls} /></div>
          <div><label className={labelCls}>Equipment Location</label><input value={equipmentLocation} onChange={e => setEquipmentLocation(e.target.value)} className={fieldCls} /></div>
        </div>

        {/* Add Range */}
        <div className="px-5 pb-3">
          <button onClick={addRange}
            className="inline-flex items-center gap-1.5 bg-brand-orange text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
            <Plus size={13} /> Add Range
          </button>
        </div>

        {ranges.length > 0 && (
          <div className="px-5 pb-4 flex flex-col gap-2">
            {ranges.map((r, idx) => (
              <div key={idx} className="grid grid-cols-[1fr_1fr_auto] gap-3 items-center bg-surface-subtle/50 rounded-lg px-3 py-2.5 border border-border">
                <div>
                  <label className="block text-[10px] text-text-muted mb-1">Range</label>
                  <input value={r.range} onChange={e => updateRange(idx, "range", e.target.value)}
                    className="w-full bg-white border border-border rounded px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-orange" />
                </div>
                <div>
                  <label className="block text-[10px] text-text-muted mb-1">MAX Error</label>
                  <input value={r.maxError} onChange={e => updateRange(idx, "maxError", e.target.value)}
                    className="w-full bg-white border border-border rounded px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-orange" />
                </div>
                <button onClick={() => removeRange(idx)}
                  className="mt-4 w-6 h-6 flex items-center justify-center rounded border border-border text-text-muted hover:border-red-300 hover:text-red-500 transition-colors">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="px-5 pb-5 pt-3 border-t border-border flex items-center gap-2">
          <button onClick={handleSave} disabled={editingId !== null}
            className="bg-brand-orange text-white text-xs font-medium px-5 py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            Save
          </button>
          <button onClick={handleUpdate} disabled={editingId === null}
            className="border border-border text-text-primary text-xs font-medium px-5 py-2 rounded-lg hover:bg-surface-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            Update
          </button>
          <button onClick={handleDelete} disabled={editingId === null}
            className="border border-red-200 text-red-600 text-xs font-medium px-5 py-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
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
        <div className="px-5 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Equipment Records</h2>
            <p className="text-xs text-text-secondary mt-0.5">{filtered.length} records</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <ExportToolbar data={exportData} columns={COLUMNS} filename="new-equipment"
              visibleColumns={visibleCols} onVisibilityChange={cols => { setVisibleCols(cols); setCurrentPage(1); }} />
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-text-secondary">Search:</span>
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="border border-border rounded-md text-xs pl-7 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-orange w-44" placeholder="" />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[900px]">
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
              ) : paginated.map((e, i) => (
                <tr key={e.id}
                  className={`hover:bg-surface-subtle transition-colors ${editingId === e.id ? "bg-brand-orange-light" : i % 2 === 0 ? "bg-white" : "bg-surface-subtle/40"}`}>
                  {visibleCols.includes("id")          && <td className="px-3 py-2.5 font-mono text-text-secondary border-r border-border">{e.id}</td>}
                  {visibleCols.includes("name")        && <td className="px-3 py-2.5 font-medium text-text-primary border-r border-border">{e.equipmentName}</td>}
                  {visibleCols.includes("codeNo")      && <td className="px-3 py-2.5 font-mono text-text-secondary border-r border-border">{e.codeNo}</td>}
                  {visibleCols.includes("serialNo")    && <td className="px-3 py-2.5 font-mono text-text-secondary border-r border-border">{e.serialNo}</td>}
                  {visibleCols.includes("calagency")   && <td className="px-3 py-2.5 text-text-secondary border-r border-border">{e.calAgency}</td>}
                  {visibleCols.includes("periodicity") && <td className="px-3 py-2.5 text-text-secondary border-r border-border">{e.periodicityNo}</td>}
                  <td className="px-3 py-2.5 text-center">
                    <button onClick={() => handleSelect(e)}
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
