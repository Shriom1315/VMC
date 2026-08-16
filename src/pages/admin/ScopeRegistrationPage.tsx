import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import ExportToolbar, { ColumnDef } from "../../components/ExportToolbar";
import ComboSelect from "../../components/ComboSelect";
import { supabase } from "../../lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Scope {
  id: number;
  gaugeType: string;
  leastCount: string;
  rangeFrom: string;
  rangeTo: string;
  validDate: string;
  uncertaintyMeasurement: string;
  confidanceLevel: string;
  calibLocation: string;
  remark: string;
  equipmentUseForCali: string[];
  masterEquipmentList: string;
  effectiveFrom: string;
  isActive: boolean;
}

interface EquipmentItem {
  id: number;
  name: string;
  code: string;
  range: string;
  uncertaintyValue: string;
}

// ─── Static equipment list ────────────────────────────────────────────────────

const SAMPLE_EQUIPMENT: EquipmentItem[] = [
  { id: 1, name: "AIR PLUG GAUGE",    code: "VMC-APG-01",  range: "20.000",       uncertaintyValue: "± 0.030" },
  { id: 2, name: "AIR PLUG GAUGE",    code: "VMC-APG-02",  range: "20.000",       uncertaintyValue: "± 0.030" },
  { id: 3, name: "AIR PLUG GAUGE",    code: "VMC-APG-03",  range: "20.000",       uncertaintyValue: "± 0.080" },
  { id: 4, name: "THICKNESS FOILS",   code: "VMC-CTFS-01", range: "0-1.817",      uncertaintyValue: "± 1.817" },
  { id: 5, name: "COMPARATOR STAND",  code: "VMC-CS-01",   range: "1000X100X150", uncertaintyValue: "" },
  { id: 6, name: "COMPARATOR STAND",  code: "VMC-CS-02",   range: "600X90X95",    uncertaintyValue: "" },
  { id: 7, name: "DIAL INDICATOR",    code: "VMC-DI-01",   range: "0-10",         uncertaintyValue: "± 2" },
  { id: 8, name: "DIGITAL VERNIER",   code: "VMC-DVC-01",  range: "0-150",        uncertaintyValue: "± 20" },
];

// ─── Options ──────────────────────────────────────────────────────────────────

const GAUGE_TYPE_OPTIONS = [
  "(ILC) Lever Dial..", "(PT) Plunger Dial", "2 D Height Gauge", "Air Gauge Unit",
  "Angle Plate", "Bench Centre", "Bore Gauge", "Bush Mandrel", "Calipers",
  "Circularity Machine", "CMM", "Comparator Stand", "Cylindricity Machine",
  "Depth Micrometer", "Dial Indicator", "Digital Dial Gauge", "Digital Height Gauge",
  "Digital Micrometer", "Digital Vernier Caliper",
];

const CALIBRATION_LOCATIONS = ["Site Facility", "Permanent Facility", "Mobile Facility"];

// ─── Column definitions ───────────────────────────────────────────────────────

const COLUMNS: ColumnDef[] = [
  { key: "id",            label: "ID" },
  { key: "equipmentType", label: "Equipment Type" },
  { key: "range",         label: "Range" },
  { key: "leastCount",    label: "Least Count" },
  { key: "uncertainty",   label: "Uncertainty" },
  { key: "calLocation",   label: "Cal Location" },
  { key: "validity",      label: "Validity" },
  { key: "remark",        label: "Remark" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ScopeRegistrationPage() {
  const [scopes,       setScopes]       = useState<Scope[]>([]);
  const [editingId,    setEditingId]    = useState<number | null>(null);
  const [searchQuery,  setSearchQuery]  = useState("");
  const [currentPage,  setCurrentPage]  = useState(1);
  const [visibleCols,  setVisibleCols]  = useState(COLUMNS.map(c => c.key));
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  const rowsPerPage = 10;

  // Form state
  const [gaugeType,               setGaugeType]               = useState("(ILC) Lever Dial..");
  const [leastCount,              setLeastCount]              = useState("");
  const [rangeFrom,               setRangeFrom]               = useState("");
  const [rangeTo,                 setRangeTo]                 = useState("");
  const [validDate,               setValidDate]               = useState("");
  const [uncertaintyMeasurement,  setUncertaintyMeasurement]  = useState("");
  const [confidanceLevel,         setConfidanceLevel]         = useState("");
  const [calibLocation,           setCalibLocation]           = useState("Site Facility");
  const [remark,                  setRemark]                  = useState("");
  const [selectedEquipment,       setSelectedEquipment]       = useState<number[]>([]);
  const [masterEquipmentList,     setMasterEquipmentList]     = useState("");
  const [equipmentSearchQuery,    setEquipmentSearchQuery]    = useState("");
  const [effectiveFrom,           setEffectiveFrom]           = useState(new Date().toISOString().split("T")[0]);
  const [isActive,                setIsActive]                = useState(true);
  const fetchScopes = async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("scopes")
      .select("*")
      .order("id", { ascending: true });
    if (err) {
      setError(err.message);
      setScopes([]);
    } else {
      setScopes(
        (data ?? []).map((r: any) => ({
          id:                     r.id,
          gaugeType:              r.gauge_type,
          leastCount:             r.least_count ?? "",
          rangeFrom:              r.range_from ?? "",
          rangeTo:                r.range_to ?? "",
          validDate:              r.valid_date ?? "",
          uncertaintyMeasurement: r.uncertainty_measurement ?? "",
          confidanceLevel:        r.confidance_level ?? "",
          calibLocation:          r.calib_location ?? "",
          remark:                 r.remark ?? "",
          equipmentUseForCali:    Array.isArray(r.equipment_use_for_cali) ? r.equipment_use_for_cali : [],
          masterEquipmentList:    r.master_equipment_list ?? "",
          effectiveFrom:          r.effective_from ?? "",
          isActive:               r.is_active ?? true,
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => { fetchScopes(); }, []);

  // ── Form helpers ───────────────────────────────────────────────────────────
  const resetForm = () => {
    setGaugeType("(ILC) Lever Dial.."); setLeastCount(""); setRangeFrom(""); setRangeTo("");
    setValidDate(""); setUncertaintyMeasurement(""); setConfidanceLevel("");
    setCalibLocation("Site Facility"); setRemark(""); setSelectedEquipment([]);
    setMasterEquipmentList(""); setEffectiveFrom(new Date().toISOString().split("T")[0]);
    setIsActive(true); setEditingId(null);
  };

  const buildPayload = () => ({
    gauge_type:               gaugeType,
    least_count:              leastCount,
    range_from:               rangeFrom,
    range_to:                 rangeTo,
    valid_date:               validDate,
    uncertainty_measurement:  uncertaintyMeasurement,
    confidance_level:         confidanceLevel,
    calib_location:           calibLocation,
    remark,
    equipment_use_for_cali:   selectedEquipment.map(id => {
      const eq = SAMPLE_EQUIPMENT.find(e => e.id === id);
      return `${eq?.name}||${eq?.code}||${eq?.range}||${eq?.uncertaintyValue}`;
    }),
    master_equipment_list:    masterEquipmentList,
    effective_from:           effectiveFrom || null,
    is_active:                isActive,
  });

  // ── CRUD ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!gaugeType.trim()) return;
    const { error: err } = await supabase.from("scopes").insert(buildPayload());
    if (err) { setError(err.message); return; }
    resetForm(); fetchScopes();
  };

  const handleUpdate = async () => {
    if (editingId === null) return;
    const { error: err } = await supabase.from("scopes").update(buildPayload()).eq("id", editingId);
    if (err) { setError(err.message); return; }
    resetForm(); fetchScopes();
  };

  const handleDelete = async () => {
    if (editingId === null) return;
    const { error: err } = await supabase.from("scopes").delete().eq("id", editingId);
    if (err) { setError(err.message); return; }
    resetForm(); fetchScopes();
  };

  const handleSelect = (s: Scope) => {
    setEditingId(s.id);
    setGaugeType(s.gaugeType); setLeastCount(s.leastCount); setRangeFrom(s.rangeFrom);
    setRangeTo(s.rangeTo); setValidDate(s.validDate);
    setUncertaintyMeasurement(s.uncertaintyMeasurement); setConfidanceLevel(s.confidanceLevel);
    setCalibLocation(s.calibLocation); setRemark(s.remark);
    setMasterEquipmentList(s.masterEquipmentList);
    setEffectiveFrom(s.effectiveFrom || new Date().toISOString().split("T")[0]);
    setIsActive(s.isActive);
    const eqIds = s.equipmentUseForCali.map(eq => {
      const code = eq.split("||")[1];
      return SAMPLE_EQUIPMENT.find(e => e.code === code)?.id ?? 0;
    }).filter(id => id > 0);
    setSelectedEquipment(eqIds);
  };

  // ── Equipment picker helpers ───────────────────────────────────────────────
  const toggleEquipment = (eqId: number) => {
    setSelectedEquipment(prev =>
      prev.includes(eqId) ? prev.filter(id => id !== eqId) : [...prev, eqId]
    );
  };
  const removeEquipment = (eqId: number) =>
    setSelectedEquipment(prev => prev.filter(id => id !== eqId));

  const filteredEquipment = SAMPLE_EQUIPMENT.filter(eq =>
    [eq.name, eq.code, eq.range].some(v =>
      v.toLowerCase().includes(equipmentSearchQuery.toLowerCase())
    )
  );

  // ── Filter / paginate ──────────────────────────────────────────────────────
  const filtered = scopes.filter(s =>
    [s.gaugeType, s.rangeFrom, s.rangeTo, s.calibLocation].some(v =>
      (v ?? "").toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated  = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const exportData = filtered.map(s => ({
    id: s.id, equipmentType: s.gaugeType, range: `${s.rangeFrom} - ${s.rangeTo}`,
    leastCount: s.leastCount, uncertainty: s.uncertaintyMeasurement,
    calLocation: s.calibLocation, validity: s.validDate, remark: s.remark,
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
        <h1 className="text-lg font-semibold text-text-primary">Scope Registration</h1>
        <p className="text-xs text-text-secondary mt-0.5">Register and manage calibration scope records</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2.5">{error}</div>
      )}

      {/* ── Form card ── */}
      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <span className="text-sm font-semibold text-text-primary">
            {editingId !== null ? `Editing Scope #${editingId}` : "Add Scope Form"}
          </span>
          {editingId !== null && (
            <button onClick={resetForm} className="text-xs text-text-muted hover:text-text-primary transition-colors">
              ✕ Cancel
            </button>
          )}
        </div>

        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          {/* Gauge Type */}
          <div>
            <label className={labelCls}>Gauge Type</label>
            <ComboSelect value={gaugeType} onChange={setGaugeType} options={GAUGE_TYPE_OPTIONS} />
          </div>
          <div>
            <label className={labelCls}>Least Count (mm)</label>
            <input value={leastCount} onChange={e => setLeastCount(e.target.value)} className={fieldCls} />
          </div>

          {/* Range */}
          <div>
            <label className={labelCls}>Range From (mm)</label>
            <input value={rangeFrom} onChange={e => setRangeFrom(e.target.value)} className={fieldCls} />
          </div>
          <div>
            <label className={labelCls}>Range To (mm)</label>
            <input value={rangeTo} onChange={e => setRangeTo(e.target.value)} className={fieldCls} />
          </div>

          {/* Dates / Uncertainty */}
          <div>
            <label className={labelCls}>Valid Date</label>
            <input type="date" value={validDate} onChange={e => setValidDate(e.target.value)} className={fieldCls} />
          </div>
          <div>
            <label className={labelCls}>Uncertainty Measurement</label>
            <input value={uncertaintyMeasurement} onChange={e => setUncertaintyMeasurement(e.target.value)} className={fieldCls} />
          </div>

          {/* Confidence / Location */}
          <div>
            <label className={labelCls}>Confidence Level &amp; Coverage Factor</label>
            <input value={confidanceLevel} onChange={e => setConfidanceLevel(e.target.value)} className={fieldCls} />
          </div>
          <div>
            <label className={labelCls}>Calibration Location</label>
            <ComboSelect value={calibLocation} onChange={setCalibLocation} options={CALIBRATION_LOCATIONS} />
          </div>

          {/* Remark */}
          <div>
            <label className={labelCls}>Remark</label>
            <input value={remark} onChange={e => setRemark(e.target.value)} className={fieldCls} />
          </div>

          {/* Equipment picker */}
          <div className="relative">
            <label className={labelCls}>Equipment Use For Calibration</label>
            <div className={`w-full bg-white border border-border rounded-md px-3 py-2 min-h-[38px] flex flex-wrap items-center gap-1.5 focus-within:ring-1 focus-within:ring-brand-orange focus-within:border-brand-orange transition-colors`}>
              {selectedEquipment.map(eqId => {
                const eq = SAMPLE_EQUIPMENT.find(e => e.id === eqId);
                if (!eq) return null;
                return (
                  <span key={eq.id} className="inline-flex items-center gap-1 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded shrink-0">
                    {eq.id}.{eq.name}||{eq.code}||{eq.range}
                    <button type="button" onClick={() => removeEquipment(eq.id)}
                      className="hover:bg-blue-700 rounded-full p-0.5 ml-0.5">
                      <X size={9} />
                    </button>
                  </span>
                );
              })}
              <input
                value={equipmentSearchQuery}
                onChange={e => setEquipmentSearchQuery(e.target.value)}
                className="flex-1 min-w-[100px] outline-none bg-transparent text-sm text-text-primary placeholder:text-text-muted"
                placeholder={selectedEquipment.length === 0 ? "Search equipment..." : ""}
              />
            </div>
            {equipmentSearchQuery && filteredEquipment.length > 0 && (
              <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-56 overflow-y-auto">
                {filteredEquipment.map(eq => {
                  const isSelected = selectedEquipment.includes(eq.id);
                  return (
                    <div key={eq.id}
                      onClick={() => { toggleEquipment(eq.id); setEquipmentSearchQuery(""); }}
                      className={`px-3 py-2 text-xs cursor-pointer transition-colors hover:bg-surface-muted flex items-center justify-between ${isSelected ? "bg-blue-50" : ""}`}>
                      <span className="font-medium text-text-primary">
                        {eq.id}.{eq.name}||{eq.code}||{eq.range}
                        {eq.uncertaintyValue && ` (${eq.uncertaintyValue})`}
                      </span>
                      {isSelected && <span className="text-blue-600 font-bold">✓</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Master Equipment List — full width */}
          <div className="md:col-span-2">
            <label className={labelCls}>Master Equipment List</label>
            <input value={masterEquipmentList} onChange={e => setMasterEquipmentList(e.target.value)} className={fieldCls} />
          </div>

          {/* Versioning fields */}
          <div>
            <label className={labelCls}>Effective From <span className="text-xs text-text-muted font-normal">(scope version date)</span></label>
            <input type="date" value={effectiveFrom} onChange={e => setEffectiveFrom(e.target.value)} className={fieldCls} />
          </div>
          <div className="flex items-center gap-3 mt-5">
            <input type="checkbox" id="scope-active" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-4 h-4 accent-brand-orange cursor-pointer" />
            <label htmlFor="scope-active" className="text-sm text-text-primary cursor-pointer">
              Active <span className="text-xs text-text-muted font-normal">(only active scopes are used for new certificates)</span>
            </label>
          </div>
        </div>

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
            <h2 className="text-sm font-semibold text-text-primary">Scope Records</h2>
            <p className="text-xs text-text-secondary mt-0.5">{filtered.length} records</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <ExportToolbar data={exportData} columns={COLUMNS} filename="scope-registration"
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
              ) : paginated.map((s, i) => (
                <tr key={s.id}
                  className={`hover:bg-surface-subtle transition-colors ${editingId === s.id ? "bg-brand-orange-light" : i % 2 === 0 ? "bg-white" : "bg-surface-subtle/40"}`}>
                  {visibleCols.includes("id")            && <td className="px-3 py-2.5 font-mono text-text-secondary border-r border-border">{s.id}</td>}
                  {visibleCols.includes("equipmentType") && <td className="px-3 py-2.5 font-medium text-text-primary border-r border-border">{s.gaugeType}</td>}
                  {visibleCols.includes("range")         && <td className="px-3 py-2.5 text-text-secondary border-r border-border">{s.rangeFrom} – {s.rangeTo}</td>}
                  {visibleCols.includes("leastCount")    && <td className="px-3 py-2.5 text-text-secondary border-r border-border">{s.leastCount}</td>}
                  {visibleCols.includes("uncertainty")   && <td className="px-3 py-2.5 text-text-secondary border-r border-border">{s.uncertaintyMeasurement}</td>}
                  {visibleCols.includes("calLocation")   && <td className="px-3 py-2.5 text-text-secondary border-r border-border">{s.calibLocation}</td>}
                  {visibleCols.includes("validity")      && <td className="px-3 py-2.5 text-text-secondary border-r border-border">{s.validDate}</td>}
                  {visibleCols.includes("remark")        && <td className="px-3 py-2.5 text-text-secondary border-r border-border max-w-[160px]">{s.remark}</td>}
                  <td className="px-3 py-2.5 text-center">
                    <button onClick={() => handleSelect(s)}
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
