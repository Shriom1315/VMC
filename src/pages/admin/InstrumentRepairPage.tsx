import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { supabase } from "../../lib/supabase";
import ExportToolbar, { ColumnDef } from "../../components/ExportToolbar";
import ComboSelect from "../../components/ComboSelect";

interface RepairRecord {
  id: number;
  equipmentName: string;
  codeNo: string;
  faultDescription: string;
  repairAction: string;
  repairDate: string;
  repairedBy: string;
  cost: number;
  status: string;
  remark: string;
}

const STATUS_OPTIONS = ["Pending", "In Progress", "Completed", "Sent to External"];
const COLUMNS: ColumnDef[] = [
  { key: "equipmentName",   label: "Equipment"     },
  { key: "codeNo",          label: "Code No"       },
  { key: "faultDescription",label: "Fault"         },
  { key: "repairDate",      label: "Repair Date"   },
  { key: "repairedBy",      label: "Repaired By"   },
  { key: "cost",            label: "Cost (₹)"      },
  { key: "status",          label: "Status"        },
];

const STATUS_COLOR: Record<string, string> = {
  "Pending":           "bg-amber-100 text-amber-700",
  "In Progress":       "bg-blue-100 text-blue-700",
  "Completed":         "bg-green-100 text-green-700",
  "Sent to External":  "bg-purple-100 text-purple-700",
};

export default function InstrumentRepairPage() {
  const [records,     setRecords]     = useState<RepairRecord[]>([]);
  const [editingId,   setEditingId]   = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleCols, setVisibleCols] = useState(COLUMNS.map(c => c.key));
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [equipNames,  setEquipNames]  = useState<string[]>([]);
  const rowsPerPage = 10;

  const [equipmentName,    setEquipmentName]    = useState("");
  const [codeNo,           setCodeNo]           = useState("");
  const [faultDescription, setFaultDescription] = useState("");
  const [repairAction,     setRepairAction]     = useState("");
  const [repairDate,       setRepairDate]       = useState(new Date().toISOString().split("T")[0]);
  const [repairedBy,       setRepairedBy]       = useState("");
  const [cost,             setCost]             = useState("");
  const [status,           setStatus]           = useState("Pending");
  const [remark,           setRemark]           = useState("");

  const fetchRecords = async () => {
    setLoading(true); setError(null);
    const { data, error: err } = await supabase.from("instrument_repairs").select("*").order("id", { ascending: false });
    if (err) { setError(err.message); setRecords([]); }
    else {
      setRecords((data ?? []).map((r: any) => ({
        id: r.id, equipmentName: r.equipment_name ?? "", codeNo: r.code_no ?? "",
        faultDescription: r.fault_description ?? "", repairAction: r.repair_action ?? "",
        repairDate: r.repair_date ?? "", repairedBy: r.repaired_by ?? "",
        cost: Number(r.cost ?? 0), status: r.status ?? "Pending", remark: r.remark ?? "",
      })));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRecords();
    supabase.from("equipments").select("equipment_name, code_no").order("equipment_name").then(({ data }) => {
      setEquipNames((data ?? []).map((r: any) => r.equipment_name));
    });
  }, []);

  const resetForm = () => {
    setEquipmentName(""); setCodeNo(""); setFaultDescription(""); setRepairAction("");
    setRepairDate(new Date().toISOString().split("T")[0]); setRepairedBy("");
    setCost(""); setStatus("Pending"); setRemark(""); setEditingId(null);
  };

  const payload = () => ({
    equipment_name:    equipmentName, code_no: codeNo,
    fault_description: faultDescription, repair_action: repairAction,
    repair_date:       repairDate || null, repaired_by: repairedBy,
    cost:              parseFloat(cost) || 0, status, remark,
  });

  const handleSave = async () => {
    if (!equipmentName.trim()) { setError("Equipment Name is required."); return; }
    setError(null);
    const { error: err } = await supabase.from("instrument_repairs").insert(payload());
    if (err) { setError(err.message); return; }
    resetForm(); fetchRecords();
  };
  const handleUpdate = async () => {
    if (editingId === null) return;
    const { error: err } = await supabase.from("instrument_repairs").update(payload()).eq("id", editingId);
    if (err) { setError(err.message); return; }
    resetForm(); fetchRecords();
  };
  const handleDelete = async () => {
    if (editingId === null) return;
    const { error: err } = await supabase.from("instrument_repairs").delete().eq("id", editingId);
    if (err) { setError(err.message); return; }
    resetForm(); fetchRecords();
  };
  const handleSelect = (r: RepairRecord) => {
    setEditingId(r.id); setEquipmentName(r.equipmentName); setCodeNo(r.codeNo);
    setFaultDescription(r.faultDescription); setRepairAction(r.repairAction);
    setRepairDate(r.repairDate); setRepairedBy(r.repairedBy);
    setCost(String(r.cost)); setStatus(r.status); setRemark(r.remark);
  };

  const filtered   = records.filter(r =>
    [r.equipmentName, r.codeNo, r.faultDescription, r.status].some(v =>
      v.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated  = filtered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const exportData = filtered.map(r => ({
    equipmentName: r.equipmentName, codeNo: r.codeNo, faultDescription: r.faultDescription,
    repairDate: r.repairDate, repairedBy: r.repairedBy, cost: r.cost, status: r.status,
  }));

  const fc = "w-full bg-white border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-colors";
  const lc = "block text-xs font-medium text-text-secondary mb-1";

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="w-full flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Instrument Repair Master</h1>
        <p className="text-xs text-text-secondary mt-0.5">Log repairs performed on the lab's own equipment</p>
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2.5">{error}</div>}

      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <span className="text-sm font-semibold text-text-primary">{editingId !== null ? `Editing Record #${editingId}` : "Log Repair"}</span>
          {editingId !== null && <button onClick={resetForm} className="text-xs text-text-muted hover:text-text-primary">✕ Cancel</button>}
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <label className={lc}>Equipment Name</label>
            <ComboSelect value={equipmentName} onChange={setEquipmentName} options={equipNames} placeholder="Select or type..." />
          </div>
          <div><label className={lc}>Code No</label><input value={codeNo} onChange={e => setCodeNo(e.target.value)} className={fc} /></div>
          <div className="md:col-span-2"><label className={lc}>Fault Description</label><input value={faultDescription} onChange={e => setFaultDescription(e.target.value)} className={fc} /></div>
          <div className="md:col-span-2"><label className={lc}>Repair Action Taken</label><input value={repairAction} onChange={e => setRepairAction(e.target.value)} className={fc} /></div>
          <div><label className={lc}>Repair Date</label><input type="date" value={repairDate} onChange={e => setRepairDate(e.target.value)} className={fc} /></div>
          <div><label className={lc}>Repaired By</label><input value={repairedBy} onChange={e => setRepairedBy(e.target.value)} className={fc} /></div>
          <div><label className={lc}>Cost (₹)</label><input type="number" min="0" value={cost} onChange={e => setCost(e.target.value)} className={fc} placeholder="0.00" /></div>
          <div><label className={lc}>Status</label><ComboSelect value={status} onChange={setStatus} options={STATUS_OPTIONS} /></div>
          <div className="md:col-span-2"><label className={lc}>Remark</label><input value={remark} onChange={e => setRemark(e.target.value)} className={fc} /></div>
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
          <div><h2 className="text-sm font-semibold text-text-primary">Repair Records</h2><p className="text-xs text-text-secondary mt-0.5">{filtered.length} records</p></div>
          <div className="flex items-center gap-3 flex-wrap">
            <ExportToolbar data={exportData} columns={COLUMNS} filename="instrument-repairs" visibleColumns={visibleCols} onVisibilityChange={cols => { setVisibleCols(cols); setCurrentPage(1); }} />
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-text-secondary">Search:</span>
              <div className="relative"><Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="border border-border rounded-md text-xs pl-7 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-orange w-44" /></div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[900px]">
            <thead className="bg-surface-muted border-b border-border">
              <tr>{COLUMNS.filter(c => visibleCols.includes(c.key)).map(col => <th key={col.key} className="px-3 py-2.5 text-xs font-medium text-text-secondary border-r border-border"><span className="flex items-center gap-1">{col.label} <span className="text-text-muted">↕</span></span></th>)}<th className="px-3 py-2.5 text-xs font-medium text-text-secondary">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginated.length === 0 ? <tr><td colSpan={visibleCols.length + 1} className="px-4 py-10 text-center text-text-muted">No records found</td></tr>
              : paginated.map((r, i) => (
                <tr key={r.id} className={`hover:bg-surface-subtle transition-colors ${editingId === r.id ? "bg-brand-orange-light" : i % 2 === 0 ? "bg-white" : "bg-surface-subtle/40"}`}>
                  {visibleCols.includes("equipmentName")    && <td className="px-3 py-2.5 font-medium text-text-primary border-r border-border">{r.equipmentName}</td>}
                  {visibleCols.includes("codeNo")           && <td className="px-3 py-2.5 font-mono text-text-secondary border-r border-border">{r.codeNo}</td>}
                  {visibleCols.includes("faultDescription") && <td className="px-3 py-2.5 text-text-secondary border-r border-border max-w-[180px] truncate">{r.faultDescription}</td>}
                  {visibleCols.includes("repairDate")       && <td className="px-3 py-2.5 text-text-secondary border-r border-border">{r.repairDate}</td>}
                  {visibleCols.includes("repairedBy")       && <td className="px-3 py-2.5 text-text-secondary border-r border-border">{r.repairedBy}</td>}
                  {visibleCols.includes("cost")             && <td className="px-3 py-2.5 font-mono text-text-primary border-r border-border">₹{r.cost.toLocaleString()}</td>}
                  {visibleCols.includes("status")           && <td className="px-3 py-2.5 border-r border-border"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[r.status] ?? "bg-gray-100 text-gray-600"}`}>{r.status}</span></td>}
                  <td className="px-3 py-2.5 text-center"><button onClick={() => handleSelect(r)} className="bg-brand-orange text-white text-[11px] font-medium px-3 py-1 rounded hover:bg-orange-700 transition-colors">Select</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-border flex items-center justify-between text-xs text-text-secondary">
          <span>Showing {filtered.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filtered.length)} of {filtered.length} entries</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 border border-border rounded hover:bg-surface-muted disabled:opacity-40 transition-colors">Previous</button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(pg => <button key={pg} onClick={() => setCurrentPage(pg)} className={`px-3 py-1 border rounded transition-colors ${currentPage === pg ? "bg-brand-orange text-white border-brand-orange" : "border-border hover:bg-surface-muted"}`}>{pg}</button>)}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1 border border-border rounded hover:bg-surface-muted disabled:opacity-40 transition-colors">Next</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
