import { motion } from "motion/react";
import { useState } from "react";
import { Search } from "lucide-react";
import { useAuth, can } from "../../context/AuthContext";
import CalibDatasheet from "./calib/CalibDatasheet";
import CalibCertificate from "./calib/CalibCertificate";
import ExportToolbar, { ColumnDef } from "../../components/ExportToolbar";

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

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_JOBS: CalibJob[] = [
  {
    labId: "26041", name: "Plain Plug Gauge.", identificationNo: "Vmc/19",
    specification: "10 ( 0.1 / -0.1 ) mm", manuSr: "455366", process: "Calibration",
    dcNo: "Xxxx", dcDate: "2025-12-28", calibDate: "2025-12-30", nextCalibDate: "2025-12-30",
    certNo: "26/05/1", certIssueDate: "2025-12-30", ulrNo: "", srNo: "75", make: "", lc: "LC",
    refIsStd: "", calibMethodUse: "Tolerance Method", toleranceMethod: "Tolerance Method",
    standardEquipment: ["COMPARATOR STAND||600X90X95", "DIGITAL PLUNGER DIAL||0-12.7"],
    clientName: "VIKRAMADITYA METROLOGY CENTER LLP. PLOT NO.A-15/1,NEAR ULTRATECH CEMENT MIDC SHIROLI(P),TAL HATKANAGALE,DIST:KOLHAPUR",
    clientAddress: "PLOT NO.A-15/1, NEAR ULTRATECH CEMENT MIDC SHIROLI(P), TAL HATKANAGALE, DIST:KOLHAPUR",
    conditionOfGauge: "Visually Ok", dateReceived: "2025-12-30",
    traceability: "", referenceStd: "",
    calibTemp: "20°C ± 2°C & Humidity 40 to 60 % Rh.",
    uncertainty: "± 1 μm.", calibLocation: "Permanent Facility",
    observation: "-", conformityStatement: "-", remark: "* Due date given as per customer request..",
    calibratedBy: "Rohit Patil", approvedBy: "Kiran Patil",
    parameters: [
      { parameter: "Go",    basicSize: 25,      specLimitMax: 24.9830, specLimitMin: 24.9805, wearLimit: 24.9780 },
      { parameter: "No Go", basicSize: 25.0200, specLimitMax: 25.0230, specLimitMin: 25.0205, wearLimit: null },
    ],
    results: [
      { parameter: "Go",    row: "A", x1: 9.9300,  x2: 9.9300,  x3: 9.9301,  avg: 9.930  },
      { parameter: "Go",    row: "B", x1: 9.9310,  x2: 9.9310,  x3: 9.9311,  avg: 9.931  },
      { parameter: "No Go", row: "A", x1: 10.1020, x2: 10.1020, x3: 10.1021, avg: 10.102 },
      { parameter: "No Go", row: "B", x1: 10.1030, x2: 10.1030, x3: 10.1031, avg: 10.103 },
    ],
    typeAReadings: { x1: 10.103, x2: 10.103, x3: 10.104, avg: 10.104, stdDev: 10.103 },
    stdDevNote: "Std. dev. readings At (No Go –B)",
    status: "pending",
  },
  {
    labId: "26052", name: "Plain Plug Gauge.", identificationNo: "VMC/PG/19",
    specification: "Range -,-,-", manuSr: "87987895", process: "Calibration",
    dcNo: "Xxxx", dcDate: "2025-12-28", calibDate: "2025-12-30", nextCalibDate: "2025-12-30",
    certNo: "26/05/2", certIssueDate: "2025-12-30", ulrNo: "", srNo: "80", make: "SHRINIWAS", lc: "",
    refIsStd: "", calibMethodUse: "Tolerance Method", toleranceMethod: "Tolerance Method",
    standardEquipment: ["COMPARATOR STAND||600X90X95", "DIGITAL PLUNGER DIAL||0-12.7"],
    clientName: "VIKRAMADITYA METROLOGY CENTER LLP.",
    clientAddress: "PLOT NO.A-15/1, NEAR ULTRATECH CEMENT MIDC SHIROLI(P), TAL HATKANAGALE, DIST:KOLHAPUR",
    conditionOfGauge: "Visually Ok", dateReceived: "2025-12-30",
    traceability: "", referenceStd: "",
    calibTemp: "20°C ± 2°C & Humidity 40 to 60 % Rh.",
    uncertainty: "± 1 μm.", calibLocation: "Permanent Facility",
    observation: "-", conformityStatement: "-", remark: "* Due date given as per customer request..",
    calibratedBy: "Rohit Patil", approvedBy: "Kiran Patil",
    parameters: [
      { parameter: "Go",    basicSize: 25,      specLimitMax: 24.9830, specLimitMin: 24.9805, wearLimit: 24.9780 },
      { parameter: "No Go", basicSize: 25.0200, specLimitMax: 25.0230, specLimitMin: 25.0205, wearLimit: null },
    ],
    results: [
      { parameter: "Go",    row: "A", x1: 9.9300,  x2: 9.9300,  x3: 9.9301,  avg: 9.930  },
      { parameter: "Go",    row: "B", x1: 9.9310,  x2: 9.9310,  x3: 9.9311,  avg: 9.931  },
      { parameter: "No Go", row: "A", x1: 10.1020, x2: 10.1020, x3: 10.1021, avg: 10.102 },
      { parameter: "No Go", row: "B", x1: 10.1030, x2: 10.1030, x3: 10.1031, avg: 10.103 },
    ],
    typeAReadings: { x1: 10.103, x2: 10.103, x3: 10.104, avg: 10.104, stdDev: 10.103 },
    stdDevNote: "Std. dev. readings At (No Go –B)",
    status: "pending",
  },
  {
    labId: "26053", name: "(ILC) Lever Dial..", identificationNo: "",
    specification: "Range -,-,-", manuSr: "", process: "Calibration",
    dcNo: "Xxxx", dcDate: "2025-12-28", calibDate: "2025-12-30", nextCalibDate: "2025-12-30",
    certNo: "26/05/3", certIssueDate: "2025-12-30", ulrNo: "", srNo: "", make: "", lc: "",
    refIsStd: "", calibMethodUse: "Tolerance Method", toleranceMethod: "Tolerance Method",
    standardEquipment: ["COMPARATOR STAND||600X90X95"],
    clientName: "VIKRAMADITYA METROLOGY CENTER LLP.",
    clientAddress: "PLOT NO.A-15/1, NEAR ULTRATECH CEMENT MIDC SHIROLI(P), TAL HATKANAGALE, DIST:KOLHAPUR",
    conditionOfGauge: "Visually Ok", dateReceived: "2025-12-30",
    traceability: "", referenceStd: "",
    calibTemp: "20°C ± 2°C & Humidity 40 to 60 % Rh.",
    uncertainty: "± 1 μm.", calibLocation: "Permanent Facility",
    observation: "-", conformityStatement: "-", remark: "* Due date given as per customer request..",
    calibratedBy: "Rohit Patil", approvedBy: "Kiran Patil",
    parameters: [
      { parameter: "Go",    basicSize: 25,      specLimitMax: 24.9830, specLimitMin: 24.9805, wearLimit: 24.9780 },
      { parameter: "No Go", basicSize: 25.0200, specLimitMax: 25.0230, specLimitMin: 25.0205, wearLimit: null },
    ],
    results: [
      { parameter: "Go",    row: "A", x1: 9.9300,  x2: 9.9300,  x3: 9.9301,  avg: 9.930  },
      { parameter: "Go",    row: "B", x1: 9.9310,  x2: 9.9310,  x3: 9.9311,  avg: 9.931  },
      { parameter: "No Go", row: "A", x1: 10.1020, x2: 10.1020, x3: 10.1021, avg: 10.102 },
      { parameter: "No Go", row: "B", x1: 10.1030, x2: 10.1030, x3: 10.1031, avg: 10.103 },
    ],
    typeAReadings: { x1: 10.103, x2: 10.103, x3: 10.104, avg: 10.104, stdDev: 10.103 },
    stdDevNote: "Std. dev. readings At (No Go –B)",
    status: "generated",
  },
];

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

  const [printJob,  setPrintJob]  = useState<CalibJob | null>(null);
  const [printMode, setPrintMode] = useState<PrintMode>("print");

  const handleViewPending   = () => setPendingResults(MOCK_JOBS.filter(j => j.status === "pending"));
  const handleViewGenerated = () => setGenResults(MOCK_JOBS.filter(j => j.status === "generated"));

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
