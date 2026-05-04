import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useAuth, can } from "../../context/AuthContext";
import CalibDatasheet from "./calib/CalibDatasheet";
import CalibCertificate from "./calib/CalibCertificate";
import ExportToolbar, { ColumnDef } from "../../components/ExportToolbar";
import { supabase } from "../../lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CalibParameter {
  parameter: string;
  basicSize: number;
  specLimitMax: number;
  specLimitMin: number;
  wearLimit: number | null;
}

export interface CalibResult {
  parameter: string;
  row: "A" | "B";
  x1: number; x2: number; x3: number; avg: number;
}

export interface CalibJob {
  labId: string;
  name: string;
  identificationNo: string;
  specification: string;
  manuSr: string;
  process: string;
  dcNo: string;
  dcDate: string;
  calibDate: string;
  nextCalibDate: string;
  certNo: string;
  certIssueDate: string;
  ulrNo: string;
  srNo: string;
  make: string;
  lc: string;
  refIsStd: string;
  calibMethodUse: string;
  toleranceMethod: string;
  standardEquipment: string[];
  clientName: string;
  clientAddress: string;
  conditionOfGauge: string;
  dateReceived: string;
  traceability: string;
  referenceStd: string;
  calibTemp: string;
  uncertainty: string;
  calibLocation: string;
  observation: string;
  conformityStatement: string;
  remark: string;
  calibratedBy: string;
  approvedBy: string;
  parameters: CalibParameter[];
  results: CalibResult[];
  typeAReadings: { x1: number; x2: number; x3: number; avg: number; stdDev: number };
  stdDevNote: string;
  status: "pending" | "generated";
}

// ─── DB row → CalibJob mapper ─────────────────────────────────────────────────

function mapRow(r: any): CalibJob {
  return {
    labId:               String(r.lab_id ?? r.id),
    name:                r.name ?? "",
    identificationNo:    r.identification_no ?? "",
    specification:       r.specification ?? "",
    manuSr:              r.manu_sr ?? "",
    process:             r.process ?? "",
    dcNo:                r.dc_no ?? "",
    dcDate:              r.dc_date ?? "",
    calibDate:           r.calib_date ?? "",
    nextCalibDate:       r.next_calib_date ?? "",
    certNo:              r.cert_no ?? "",
    certIssueDate:       r.cert_issue_date ?? "",
    ulrNo:               r.ulr_no ?? "",
    srNo:                r.sr_no ?? "",
    make:                r.make ?? "",
    lc:                  r.lc ?? "",
    refIsStd:            r.ref_is_std ?? "",
    calibMethodUse:      r.calib_method_use ?? "",
    toleranceMethod:     r.calib_method_use ?? "",
    standardEquipment:   Array.isArray(r.standard_equipment) ? r.standard_equipment : [],
    clientName:          r.client_name ?? "",
    clientAddress:       r.client_address ?? "",
    conditionOfGauge:    r.condition_of_gauge ?? "",
    dateReceived:        r.date_received ?? "",
    traceability:        "",
    referenceStd:        "",
    calibTemp:           r.calib_temp ?? "",
    uncertainty:         r.uncertainty ?? "",
    calibLocation:       r.calib_location ?? "",
    observation:         "-",
    conformityStatement: "-",
    remark:              r.remark ?? "",
    calibratedBy:        r.calibrated_by ?? "",
    approvedBy:          r.approved_by ?? "",
    parameters:          [],
    results:             [],
    typeAReadings:       { x1: 0, x2: 0, x3: 0, avg: 0, stdDev: 0 },
    stdDevNote:          "",
    status:              r.status ?? "pending",
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

type PrintMode = "datasheet" | "print" | "print_lh";

export default function CalibrationStatusPage() {
  const { user } = useAuth();
  const role = user?.role ?? "staff";

  const today = new Date().toISOString().split("T")[0];
  const [pendingFrom, setPendingFrom] = useState(today);
  const [pendingTo,   setPendingTo]   = useState(today);
  const [genFrom,     setGenFrom]     = useState(today);
  const [genTo,       setGenTo]       = useState(today);

  const [pendingResults, setPendingResults] = useState<CalibJob[] | null>(null);
  const [genResults,     setGenResults]     = useState<CalibJob[] | null>(null);
  const [search,         setSearch]         = useState("");
  const [error,          setError]          = useState<string | null>(null);

  const [printJob,  setPrintJob]  = useState<CalibJob | null>(null);
  const [printMode, setPrintMode] = useState<PrintMode>("print");

  const handleViewPending = async () => {
    setError(null);
    const { data, error: err } = await supabase
      .from("calib_jobs")
      .select("*")
      .eq("status", "pending")
      .gte("calib_date", pendingFrom)
      .lte("calib_date", pendingTo)
      .order("lab_id", { ascending: true });
    if (err) { setError(err.message); return; }
    setPendingResults((data ?? []).map(mapRow));
  };

  const handleViewGenerated = async () => {
    setError(null);
    const { data, error: err } = await supabase
      .from("calib_jobs")
      .select("*")
      .eq("status", "generated")
      .gte("calib_date", genFrom)
      .lte("calib_date", genTo)
      .order("lab_id", { ascending: true });
    if (err) { setError(err.message); return; }
    setGenResults((data ?? []).map(mapRow));
  };

  const allResults = [
    ...(pendingResults ?? []),
    ...(genResults ?? []),
  ].filter(j =>
    !search ||
    [j.labId, j.name, j.identificationNo, j.specification, j.manuSr].some(v =>
      v.toLowerCase().includes(search.toLowerCase())
    )
  );

  const totalItems = allResults.length;

  // ── Export config ──
  const CALIB_COLUMNS: ColumnDef[] = [
    { key: "labId",           label: "Lab ID" },
    { key: "name",            label: "Name" },
    { key: "identificationNo",label: "Identification No" },
    { key: "specification",   label: "Specification" },
    { key: "manuSr",          label: "Manu.Sr." },
    { key: "process",         label: "Process" },
  ];
  const [visibleCols, setVisibleCols] = useState(CALIB_COLUMNS.map(c => c.key));
  const exportData = allResults.map(j => ({
    labId: j.labId, name: j.name, identificationNo: j.identificationNo,
    specification: j.specification, manuSr: j.manuSr, process: j.process,
  }));

  const openPrint = (job: CalibJob, mode: PrintMode) => {
    setPrintJob(job);
    setPrintMode(mode);
    setTimeout(() => window.print(), 300);
  };

  // ── Print view ──
  if (printJob) {
    return (
      <div>
        <div className="print:hidden p-4 flex items-center gap-3 border-b border-border bg-white">
          <button onClick={() => setPrintJob(null)}
            className="border border-border text-text-secondary text-xs font-medium px-4 py-2 rounded-lg hover:bg-surface-muted transition-colors">
            ← Back
          </button>
          <button onClick={() => window.print()}
            className="bg-brand-orange text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
            Print / Save PDF
          </button>
          <span className="text-xs text-text-secondary">
            {printMode === "datasheet" ? "Calibration Data Sheet" :
             printMode === "print"     ? "Certificate (without letterhead)" :
                                         "Certificate (with letterhead)"}
          </span>
        </div>
        {printMode === "datasheet"
          ? <CalibDatasheet job={printJob} />
          : <CalibCertificate job={printJob} withLetterhead={printMode === "print_lh"} />
        }
      </div>
    );
  }

  // ── Screen view ──
  const inputCls = "w-full border border-border rounded-md px-3 py-2 text-sm text-text-primary bg-white focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-colors";
  const labelCls = "block text-xs font-medium text-text-secondary mb-1";

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
      className="w-full flex flex-col gap-5">

      <div>
        <h1 className="text-lg font-semibold text-text-primary">View Certificate Details</h1>
        <p className="text-xs text-text-secondary mt-0.5">Search pending and generated calibration certificates by date range</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2.5 mb-4">{error}</div>}

      {/* Filter panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pending */}
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
            <span className="text-sm font-semibold text-text-primary">Pending Certificate List</span>
          </div>
          <div className="p-4 flex flex-col gap-3">
            <div>
              <label className={labelCls}>From Date</label>
              <input type="date" value={pendingFrom} onChange={e => setPendingFrom(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>To Date</label>
              <input type="date" value={pendingTo} onChange={e => setPendingTo(e.target.value)} className={inputCls} />
            </div>
            <button onClick={handleViewPending}
              className="w-fit bg-brand-orange text-white text-xs font-medium px-5 py-2 rounded-lg hover:bg-orange-700 transition-colors">
              View
            </button>
          </div>
        </div>

        {/* Generated */}
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" />
            <span className="text-sm font-semibold text-text-primary">Generated Certificate List</span>
          </div>
          <div className="p-4 flex flex-col gap-3">
            <div>
              <label className={labelCls}>From Date</label>
              <input type="date" value={genFrom} onChange={e => setGenFrom(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>To Date</label>
              <input type="date" value={genTo} onChange={e => setGenTo(e.target.value)} className={inputCls} />
            </div>
            <button onClick={handleViewGenerated}
              className="w-fit bg-brand-orange text-white text-xs font-medium px-5 py-2 rounded-lg hover:bg-orange-700 transition-colors">
              View
            </button>
          </div>
        </div>
      </div>

      {/* Results table */}
      {(pendingResults !== null || genResults !== null) && (
        <div className="bg-white rounded-xl border border-border shadow-sm">
          <div className="px-5 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-text-primary">Total Items</h2>
              <p className="text-xs text-text-secondary mt-0.5">{totalItems} records</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <ExportToolbar
                data={exportData}
                columns={CALIB_COLUMNS}
                filename="calibration-status"
                visibleColumns={visibleCols}
                onVisibilityChange={setVisibleCols}
              />
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-text-secondary">Search:</span>
                <div className="relative">
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    className="border border-border rounded-md text-xs pl-7 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-orange w-40" />
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[900px]">
              <thead className="bg-surface-muted border-b border-border">
                <tr>
                  {CALIB_COLUMNS.filter(c => visibleCols.includes(c.key)).map(col => (
                    <th key={col.key} className="px-4 py-2.5 text-xs font-medium text-text-secondary border-r border-border">
                      {col.label} ↕
                    </th>
                  ))}
                  <th className="px-4 py-2.5 text-xs font-medium text-text-secondary">Manage ↕</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {allResults.length === 0 ? (
                  <tr>
                    <td colSpan={visibleCols.length + 1} className="px-4 py-10 text-center text-text-muted">No records found</td>
                  </tr>
                ) : allResults.map(job => (
                  <tr key={job.labId} className="hover:bg-surface-subtle transition-colors align-top">
                    {visibleCols.includes("labId")            && <td className="px-4 py-3 font-mono font-semibold text-brand-orange border-r border-border">{job.labId}</td>}
                    {visibleCols.includes("name")             && <td className="px-4 py-3 font-medium text-text-primary border-r border-border">{job.name}</td>}
                    {visibleCols.includes("identificationNo") && <td className="px-4 py-3 font-mono text-text-secondary border-r border-border">{job.identificationNo}</td>}
                    {visibleCols.includes("specification")    && <td className="px-4 py-3 text-text-secondary border-r border-border">{job.specification}</td>}
                    {visibleCols.includes("manuSr")           && <td className="px-4 py-3 font-mono text-text-secondary border-r border-border">{job.manuSr}</td>}
                    {visibleCols.includes("process")          && <td className="px-4 py-3 text-text-secondary border-r border-border">{job.process}</td>}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1 w-24">
                        {can(role, "calib:write") && (
                          <button className="bg-blue-500 text-white text-[11px] font-medium px-3 py-1 rounded hover:bg-blue-600 transition-colors text-center">
                            Edit
                          </button>
                        )}
                        <button onClick={() => openPrint(job, "datasheet")}
                          className="bg-blue-600 text-white text-[11px] font-medium px-3 py-1 rounded hover:bg-blue-700 transition-colors text-center">
                          Datasheet
                        </button>
                        <button onClick={() => openPrint(job, "print")}
                          className="bg-gray-700 text-white text-[11px] font-medium px-3 py-1 rounded hover:bg-gray-800 transition-colors text-center">
                          Print
                        </button>
                        <button onClick={() => openPrint(job, "print_lh")}
                          className="bg-gray-700 text-white text-[11px] font-medium px-3 py-1 rounded hover:bg-gray-800 transition-colors text-center">
                          Print LH
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 border-t border-border flex items-center justify-between text-xs text-text-secondary">
            <span>Showing 1 to {totalItems} of {totalItems} entries</span>
            <div className="flex items-center gap-1">
              <button className="px-3 py-1 border border-border rounded hover:bg-surface-muted disabled:opacity-40 transition-colors" disabled>Previous</button>
              <button className="px-3 py-1 border border-brand-orange bg-brand-orange text-white rounded">1</button>
              <button className="px-3 py-1 border border-border rounded hover:bg-surface-muted disabled:opacity-40 transition-colors" disabled>Next</button>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {pendingResults === null && genResults === null && (
        <div className="bg-white rounded-xl border border-border shadow-sm p-5">
          <p className="text-sm font-medium text-text-secondary">Total Items</p>
          <div className="h-px bg-border mt-3" />
          <p className="text-xs text-text-muted mt-3">Select a date range above and click View to load certificates.</p>
        </div>
      )}
    </motion.div>
  );
}
