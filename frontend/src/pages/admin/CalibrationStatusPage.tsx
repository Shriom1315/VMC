import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Search, ClipboardCheck, X, ChevronDown, ChevronUp, Mail } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import { useAuth, can } from "../../context/AuthContext";
import CalibDatasheet from "./calib/CalibDatasheet";
import CalibCertificate from "./calib/CalibCertificate";
import ExportToolbar, { ColumnDef } from "../../components/ExportToolbar";
import { supabase } from "../../lib/supabase";
import SendEmailModal from "../../components/SendEmailModal";
import { sendEmail, certificateEmailHtml, fetchPartyEmail } from "../../lib/emailService";
import { robotoFont } from "../../lib/RobotoFont";

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
  _dbId?: string;
}

function sanitizePdfText(str: string): string {
  if (!str) return "";
  return str;
}

export function buildCalibCertPdfDoc(job: CalibJob) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" }) as any;
  const pageW = 210;
  const marginL = 10;
  const marginR = 10;
  const contentW = pageW - marginL - marginR;

  let activeFont = "helvetica";
  try {
    if (robotoFont && robotoFont.length > 1000) {
      doc.addFileToVFS("DejaVuSans.ttf", robotoFont);
      doc.addFont("DejaVuSans.ttf", "DejaVuSans", "normal");
      doc.setFont("DejaVuSans");
      activeFont = "DejaVuSans";
    } else {
      doc.setFont("helvetica");
    }
  } catch (e) {
    console.warn("Could not load DejaVuSans font:", e);
    doc.setFont("helvetica");
  }

  // ── 1. Top Orange Header Bar & Letterhead ──
  doc.setFillColor(249, 115, 22);
  doc.rect(0, 0, pageW, 3, "F");

  // Company Name & Subtext
  doc.setFontSize(13);
  doc.setTextColor(234, 88, 12);
  doc.text("VIKRAMADITYA METROLOGY CENTRE LLP", marginL, 11);

  doc.setFontSize(7);
  doc.setTextColor(75, 85, 99);
  doc.text("Plot No. A-15/1, Near Ultratech M.I.D.C. Shiroli (P), Kolhapur 416 122", marginL, 15);
  doc.text("Contact No. 9503601616, 7262831818  |  Email: vmcindialab@gmail.com", marginL, 19);
  doc.text("Website : www.vikramadityacalibration.com", marginL, 23);

  // NABL badge (Right side)
  const nablX = marginL + contentW - 24;
  doc.setDrawColor(29, 78, 216);
  doc.setLineWidth(0.4);
  doc.rect(nablX, 5, 24, 18, "S");
  doc.setFontSize(7);
  doc.setTextColor(29, 78, 216);
  doc.text("NABL", nablX + 12, 10, { align: "center" });
  doc.setFontSize(5.5);
  doc.text("Accredited", nablX + 12, 14, { align: "center" });
  doc.setFontSize(6.5);
  doc.setTextColor(55, 65, 81);
  doc.text("CC-4564", nablX + 12, 20, { align: "center" });

  // Divider Line
  doc.setDrawColor(249, 115, 22);
  doc.setLineWidth(0.5);
  doc.line(marginL, 26, marginL + contentW, 26);

  doc.setFontSize(7);
  doc.setTextColor(107, 114, 128);
  doc.text("Certificate of Calibration issued by :", marginL, 30);

  // ── 2. Title ──
  doc.setFontSize(10.5);
  doc.setTextColor(0, 0, 0);
  doc.text(`Calibration Certificate of : ${job.name}`, pageW / 2, 36, { align: "center" });

  // ── 3. Top Info Table ──
  const topInfo = [
    [
      `Date of Calibration: ${job.calibDate || "-"}`,
      `Next Calibration Date: ${job.nextCalibDate || "-"}`,
      `Calibration Certificate No: ${job.certNo || job.labId}`,
    ],
    [
      `Certificate Issue Date: ${job.certIssueDate || job.calibDate || "-"}`,
      `ULR No. ${job.ulrNo || "-"}`,
      `Page No: 1 of 1`,
    ],
  ].map(r => r.map(cell => sanitizePdfText(cell)));

  autoTable(doc, {
    startY: 39,
    body: topInfo,
    theme: "grid",
    styles: { font: activeFont },
    margin: { left: marginL, right: marginR },
    bodyStyles: { fontSize: 7, textColor: [0, 0, 0], lineWidth: 0.2, lineColor: [156, 163, 175], cellPadding: 1.8 },
    columnStyles: {
      0: { cellWidth: contentW * 0.34 },
      1: { cellWidth: contentW * 0.33 },
      2: { cellWidth: contentW * 0.33 },
    },
  });

  // ── 4. Actual sizes from results ──
  const goA    = job.results.find(r => r.parameter === "Go"    && r.row === "A");
  const goB    = job.results.find(r => r.parameter === "Go"    && r.row === "B");
  const noGoA  = job.results.find(r => r.parameter === "No Go" && r.row === "A");
  const noGoB  = job.results.find(r => r.parameter === "No Go" && r.row === "B");
  const goActual    = goA && goB    ? `${goA.avg.toFixed(4)} / ${goB.avg.toFixed(4)}`    : "-";
  const noGoActual  = noGoA && noGoB ? `${noGoA.avg.toFixed(4)} / ${noGoB.avg.toFixed(4)}` : "-";

  // ── 5. Numbered Fields Table (01 - 13) ──
  const stdEquipStr = Array.isArray(job.standardEquipment) ? job.standardEquipment.join(", ") : String(job.standardEquipment || "-");

  const numFields = [
    ["01. Name & Address of Client", `: ${job.clientName}${job.clientAddress ? `, ${job.clientAddress}` : ""}`],
    ["02. Client DC No/DC Date", `: ${job.dcNo || "-"} / ${job.dcDate || "-"}                                                        VMC ID: ${job.labId}`],
    ["03. Condition of Gauge", `: ${job.conditionOfGauge || "-"}`],
    ["04. Date of Received", `: ${job.dateReceived || "-"}`],
    ["05. Description & Identification of Instrument", `: Name: ${job.name}    Make: ${job.make || "-"}\n  Sr.No.: ${job.srNo || "-"}    Identification No.: ${job.identificationNo || "-"}\n  Specification: ${job.specification || "-"}`],
    ["06. Equipment & Masters used for Calibration", `: ${stdEquipStr || "-"}`],
    ["07. Traceability", `: ${job.traceability || "-"}`],
    ["08. Reference Standard used", `: ${job.referenceStd || job.refIsStd || "-"}`],
    ["09. Calibration Method Used", `: ${job.calibMethodUse || job.toleranceMethod || "-"}`],
    ["10. Calibration Carried out at Temp.", `: ${job.calibTemp || "-"}`],
    ["11. Uncertainty of Measurement\n   ((At 95.45% Confidence Level (K=2)))", `: ${job.uncertainty || "-"}`],
    ["12. Calibration Location", `: ${job.calibLocation || "-"}`],
    ["13. Observation", `: ${job.observation || "-"}`],
  ].map(row => [row[0], sanitizePdfText(row[1])]);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 2,
    body: numFields,
    theme: "grid",
    styles: { font: activeFont },
    margin: { left: marginL, right: marginR },
    bodyStyles: { fontSize: 7, textColor: [0, 0, 0], lineWidth: 0.2, lineColor: [156, 163, 175], cellPadding: 1.6 },
    columnStyles: { 0: { cellWidth: 62 } },
  });

  // ── 6. Parameters Table ──
  const paramHead = [["Parameter", "Basic Size", "Specification Limit Max", "Specification Limit Min", "Wear Limit", "Actual Size"]];
  const paramBody = (job.parameters.length > 0 ? job.parameters : [
    { parameter: "Go", basicSize: 0, specLimitMax: 0, specLimitMin: 0, wearLimit: null },
    { parameter: "No Go", basicSize: 0, specLimitMax: 0, specLimitMin: 0, wearLimit: null }
  ]).map(p => [
    p.parameter,
    String(p.basicSize),
    p.specLimitMax.toFixed(4),
    p.specLimitMin.toFixed(4),
    p.wearLimit !== null ? p.wearLimit.toFixed(4) : "-",
    p.parameter === "Go" ? goActual : noGoActual,
  ]);

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 2,
    head: paramHead,
    body: paramBody,
    theme: "grid",
    styles: { font: activeFont },
    margin: { left: marginL, right: marginR },
    headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], lineWidth: 0.2, lineColor: [156, 163, 175], halign: "center", fontSize: 7 },
    bodyStyles: { fontSize: 7, textColor: [0, 0, 0], lineWidth: 0.2, lineColor: [156, 163, 175], halign: "center", cellPadding: 1.6 },
    columnStyles: { 0: { halign: "left" } },
  });

  // ── 7. Conformity & Remarks (Field 14) ──
  const confBody = [
    [sanitizePdfText(`14. Conformity Statement with Decision Rule    : ${job.conformityStatement || "Conforms to specifications"}`)],
    [sanitizePdfText(`Remark : ${job.remark || "-"}`)],
  ];

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 2,
    body: confBody,
    theme: "grid",
    styles: { font: activeFont },
    margin: { left: marginL, right: marginR },
    bodyStyles: { fontSize: 7, textColor: [0, 0, 0], lineWidth: 0.2, lineColor: [156, 163, 175], cellPadding: 1.6 },
  });

  // ── 8. Signatures, Footer Disclaimer & END line ──
  let curY = doc.lastAutoTable.finalY + 10;
  if (curY > 265) { doc.addPage(); curY = 20; }

  doc.setFont("helvetica", "bold"); doc.setFontSize(8); doc.setTextColor(0, 0, 0);
  doc.text(job.calibratedBy || "Calibrated By", marginL + 5, curY);
  doc.text(job.approvedBy || "Approved By", marginL + contentW - 5, curY, { align: "right" });

  doc.setFont("helvetica", "normal"); doc.setFontSize(7); doc.setTextColor(107, 114, 128);
  doc.text("Calibrated By", marginL + 5, curY + 4);
  doc.text("Approved By", marginL + contentW - 5, curY + 4, { align: "right" });

  const discY = curY + 10;
  doc.setDrawColor(209, 213, 219); doc.setLineWidth(0.3);
  doc.line(marginL, discY, marginL + contentW, discY);

  doc.setFontSize(6); doc.setTextColor(107, 114, 128);
  doc.text("This Certificate Pertains Only to the Items Calibrated At Vikramditya Metrology Centre LLP.", marginL, discY + 3.5);
  doc.text("This Calibration Certificate Shall Not Be Reproduced Except In Full, without Written Approval of The Laboratory.", marginL, discY + 7);
  doc.text("The Result Produced In This Certificate Are Valid Under Stated Condition At The Time of Calibration.", marginL, discY + 10.5);

  doc.setFontSize(7.5); doc.setTextColor(156, 163, 175);
  doc.text("------------------------------ END ------------------------------", pageW / 2, discY + 16, { align: "center" });

  return doc;
}

export function generateCertPdfBase64(job: CalibJob): string {
  const doc = buildCalibCertPdfDoc(job);
  const dataUri = doc.output("datauristring");
  return dataUri.split(",")[1] ?? "";
}

// ─── DB row → CalibJob mapper ─────────────────────────────────────────────────

function parseParams(raw: any): CalibParameter[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((p: any) => ({
    parameter:    p.parameter    ?? "",
    basicSize:    Number(p.basicSize    ?? p.basic_size    ?? 0),
    specLimitMax: Number(p.specLimitMax ?? p.spec_limit_max ?? 0),
    specLimitMin: Number(p.specLimitMin ?? p.spec_limit_min ?? 0),
    wearLimit:    p.wearLimit !== undefined ? Number(p.wearLimit) : (p.wear_limit !== undefined ? Number(p.wear_limit) : null),
  }));
}

function parseResults(raw: any): CalibResult[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((r: any) => ({
    parameter: r.parameter ?? "",
    row:       r.row       ?? "A",
    x1:        Number(r.x1 ?? 0),
    x2:        Number(r.x2 ?? 0),
    x3:        Number(r.x3 ?? 0),
    avg:       Number(r.avg ?? 0),
  }));
}

function mapRow(r: any): CalibJob {
  return {
    _dbId:               String(r.id),
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
    traceability:        r.traceability ?? "",
    referenceStd:        r.ref_is_std ?? "",
    calibTemp:           r.calib_temp ?? "",
    uncertainty:         r.uncertainty ?? "",
    calibLocation:       r.calib_location ?? "",
    observation:         r.observation ?? "-",
    conformityStatement: r.conformity_statement ?? "-",
    remark:              r.remark ?? "",
    calibratedBy:        r.calibrated_by ?? "",
    approvedBy:          r.approved_by ?? "",
    parameters:          parseParams(r.parameters),
    results:             parseResults(r.results),
    typeAReadings:       { x1: 0, x2: 0, x3: 0, avg: 0, stdDev: 0 },
    stdDevNote:          "",
    status:              r.status ?? "pending",
  };
}

interface MeasRow {
  parameter: string;
  row: "A" | "B";
  x1: string; x2: string; x3: string;
}

function calcAvg(x1: string, x2: string, x3: string): number {
  const n = [x1, x2, x3].map(Number).filter(n => !isNaN(n));
  return n.length ? n.reduce((a, b) => a + b, 0) / n.length : 0;
}

type PrintMode = "datasheet" | "print" | "print_lh";

const CALIB_COLUMNS: ColumnDef[] = [
  { key: "labId",           label: "VMC ID"          },
  { key: "name",            label: "Gauge Name"       },
  { key: "identificationNo",label: "Identification No"},
  { key: "clientName",      label: "Client"          },
  { key: "calibDate",       label: "Calib. Date"     },
  { key: "status",          label: "Status"          },
];

export default function CalibrationStatusPage() {
  const { user } = useAuth();
  const role = user?.role ?? "staff";

  const today = new Date().toISOString().split("T")[0];
  const [pendingFrom, setPendingFrom] = useState(today);
  const [pendingTo,   setPendingTo]   = useState(today);
  const [genFrom,     setGenFrom]     = useState(today);
  const [genTo,       setGenTo]       = useState(today);
  const [vmcIdSearch, setVmcIdSearch] = useState("");

  const [pendingResults, setPendingResults] = useState<CalibJob[] | null>(null);
  const [genResults,     setGenResults]     = useState<CalibJob[] | null>(null);
  const [search,         setSearch]         = useState("");
  const [error,          setError]          = useState<string | null>(null);
  const [visibleCols,    setVisibleCols]    = useState(CALIB_COLUMNS.map(c => c.key));

  const [printJob,  setPrintJob]  = useState<CalibJob | null>(null);
  const [printMode, setPrintMode] = useState<PrintMode>("print");

  const [genJob,       setGenJob]       = useState<CalibJob | null>(null);
  const [measRows,     setMeasRows]     = useState<MeasRow[]>([]);
  const [genCertNo,    setGenCertNo]    = useState("");
  const [genUlrNo,     setGenUlrNo]     = useState("");
  const [genCalibDate, setGenCalibDate] = useState(today);
  const [genNextDate,  setGenNextDate]  = useState("");
  const [genCalibBy,   setGenCalibBy]   = useState("");
  const [genApprovedBy,setGenApprovedBy]= useState("");
  const [genObs,       setGenObs]       = useState("");
  const [genConformity,setGenConformity]= useState("Conforms to specifications");
  const [genRemark,    setGenRemark]    = useState("");
  const [genSaving,    setGenSaving]    = useState(false);
  const [genError,     setGenError]     = useState<string | null>(null);
  const [employeeNames, setEmployeeNames] = useState<string[]>([]);

  // ── Email modal state ──
  const [certEmailModal,   setCertEmailModal]   = useState(false);
  const [certEmailJob,     setCertEmailJob]     = useState<CalibJob | null>(null);
  const [certClientEmail,  setCertClientEmail]  = useState("");
  const [pendingCertPdf,   setPendingCertPdf]   = useState("");

  useEffect(() => {
    supabase.from("employees").select("name, designation").eq("is_active", true).order("name").then(({ data }) => {
      setEmployeeNames((data ?? []).map((e: any) => `${e.name}${e.designation ? ` (${e.designation})` : ""}`));
    });
  }, []);

  const handleViewPending = async () => {
    setError(null);
    const { data, error: err } = await supabase
      .from("calib_jobs").select("*").eq("status", "pending")
      .gte("calib_date", pendingFrom).lte("calib_date", pendingTo)
      .order("lab_id", { ascending: true });
    if (err) { setError(err.message); return; }
    setPendingResults((data ?? []).map(mapRow));
  };

  const handleViewGenerated = async () => {
    setError(null);
    const { data, error: err } = await supabase
      .from("calib_jobs").select("*").eq("status", "generated")
      .gte("calib_date", genFrom).lte("calib_date", genTo)
      .order("lab_id", { ascending: true });
    if (err) { setError(err.message); return; }
    setGenResults((data ?? []).map(mapRow));
  };

  const handleVmcSearch = async () => {
    if (!vmcIdSearch.trim()) return;
    setError(null);
    const { data, error: err } = await supabase
      .from("calib_jobs").select("*").ilike("lab_id", `%${vmcIdSearch.trim()}%`)
      .order("calib_date", { ascending: false });
    if (err) { setError(err.message); return; }
    const results = (data ?? []).map(mapRow);
    setPendingResults(results.filter(j => j.status === "pending"));
    setGenResults(results.filter(j => j.status === "generated"));
  };

  const allResults = [
    ...(pendingResults ?? []),
    ...(genResults ?? []),
  ].filter(j =>
    !search ||
    [j.labId, j.name, j.identificationNo, j.clientName, j.specification].some(v =>
      v.toLowerCase().includes(search.toLowerCase())
    )
  );

  const exportData = allResults.map(j => ({
    labId: j.labId, name: j.name, identificationNo: j.identificationNo,
    clientName: j.clientName, calibDate: j.calibDate, status: j.status,
  }));

  const openGenerate = (job: CalibJob) => {
    setGenJob(job);
    setGenError(null);
    setGenCertNo(job.certNo || `VMC/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 9000) + 1000)}`);
    setGenUlrNo(job.ulrNo || "");
    setGenCalibDate(job.calibDate || today);
    setGenNextDate(job.nextCalibDate || "");
    setGenCalibBy(job.calibratedBy || "");
    setGenApprovedBy(job.approvedBy || "");
    setGenObs(job.observation !== "-" ? job.observation : "");
    setGenConformity(job.conformityStatement !== "-" ? job.conformityStatement : "Conforms to specifications");
    setGenRemark(job.remark || "");

    const rows: MeasRow[] = [];
    const params = job.parameters.length > 0
      ? job.parameters
      : [{ parameter: "Go", basicSize: 0, specLimitMax: 0, specLimitMin: 0, wearLimit: null },
         { parameter: "No Go", basicSize: 0, specLimitMax: 0, specLimitMin: 0, wearLimit: null }];

    const existingMap: Record<string, Record<string, CalibResult>> = {};
    job.results.forEach(r => {
      if (!existingMap[r.parameter]) existingMap[r.parameter] = {};
      existingMap[r.parameter][r.row] = r;
    });

    params.forEach(p => {
      ["A", "B"].forEach(row => {
        const ex = existingMap[p.parameter]?.[row as "A"|"B"];
        rows.push({
          parameter: p.parameter,
          row: row as "A"|"B",
          x1: ex ? String(ex.x1) : "",
          x2: ex ? String(ex.x2) : "",
          x3: ex ? String(ex.x3) : "",
        });
      });
    });
    setMeasRows(rows);
  };

  const updateMeasRow = (idx: number, field: keyof MeasRow, value: string) => {
    setMeasRows(prev => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const handleGenerateCertificate = async () => {
    if (!genJob) return;
    setGenSaving(true); setGenError(null);

    const results: CalibResult[] = measRows.map(r => ({
      parameter: r.parameter,
      row:       r.row,
      x1:  Number(r.x1) || 0,
      x2:  Number(r.x2) || 0,
      x3:  Number(r.x3) || 0,
      avg: calcAvg(r.x1, r.x2, r.x3),
    }));

    const { error: err } = await supabase.from("calib_jobs").update({
      cert_no:              genCertNo,
      ulr_no:               genUlrNo,
      cert_issue_date:      genCalibDate || null,
      calib_date:           genCalibDate || null,
      next_calib_date:      genNextDate  || null,
      calibrated_by:        genCalibBy,
      approved_by:          genApprovedBy,
      observation:          genObs,
      conformity_statement: genConformity,
      remark:               genRemark,
      results,
      status:               "generated",
    }).eq("id", genJob._dbId ?? genJob.labId);

    if (err) { setGenError(err.message); setGenSaving(false); return; }

    const completedJob: CalibJob = {
      ...genJob,
      certNo:              genCertNo,
      ulrNo:               genUlrNo,
      calibDate:           genCalibDate,
      nextCalibDate:       genNextDate,
      calibratedBy:        genCalibBy,
      approvedBy:          genApprovedBy,
      observation:         genObs,
      conformityStatement: genConformity,
      remark:              genRemark,
      status:              "generated",
    };

    const pEmail = await fetchPartyEmail(genJob.clientName);
    const pdfBase64 = generateCertPdfBase64(completedJob);

    setGenSaving(false);
    setGenJob(null);

    // ── Open email modal ──
    setCertEmailJob(completedJob);
    setCertClientEmail(pEmail);
    setPendingCertPdf(pdfBase64);
    setCertEmailModal(true);

    if (pendingResults !== null) handleViewPending();
    if (genResults !== null) handleViewGenerated();
  };

  const handleEmailCert = async (job: CalibJob) => {
    const pEmail = await fetchPartyEmail(job.clientName);
    const pdfBase64 = generateCertPdfBase64(job);
    setCertEmailJob(job);
    setCertClientEmail(pEmail);
    setPendingCertPdf(pdfBase64);
    setCertEmailModal(true);
  };

  const openPrint = (job: CalibJob, mode: PrintMode) => {
    setPrintJob(job);
    setPrintMode(mode);
    setTimeout(() => window.print(), 300);
  };

  if (printJob) {
    return (
      <div>
        <div className="print:hidden p-4 flex items-center gap-3 border-b border-border bg-white">
          <button onClick={() => setPrintJob(null)} className="border border-border text-text-secondary text-xs font-medium px-4 py-2 rounded-lg hover:bg-surface-muted transition-colors">← Back</button>
          <button onClick={() => window.print()} className="bg-brand-orange text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">Print / Save PDF</button>
          <span className="text-xs text-text-secondary">
            {printMode === "datasheet" ? "Calibration Data Sheet" : printMode === "print" ? "Certificate (without letterhead)" : "Certificate (with letterhead)"}
          </span>
        </div>
        {printMode === "datasheet"
          ? <CalibDatasheet job={printJob} />
          : <CalibCertificate job={printJob} withLetterhead={printMode === "print_lh"} />
        }
      </div>
    );
  }

  const inputCls = "w-full border border-border rounded-md px-3 py-2 text-sm text-text-primary bg-white focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-colors";
  const labelCls = "block text-xs font-medium text-text-secondary mb-1";

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
      className="w-full flex flex-col gap-5">

      <div>
        <h1 className="text-lg font-semibold text-text-primary">Calibration Status</h1>
        <p className="text-xs text-text-secondary mt-0.5">Search, generate and print calibration certificates</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2.5">{error}</div>}

      {/* ── VMC ID Direct Search ── */}
      <div className="bg-white rounded-xl border border-border shadow-sm p-4">
        <p className="text-xs font-semibold text-text-primary mb-3 flex items-center gap-2">
          <Search size={13} className="text-brand-orange" /> Quick Search by VMC ID
        </p>
        <div className="flex gap-2">
          <input
            value={vmcIdSearch}
            onChange={e => setVmcIdSearch(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleVmcSearch()}
            placeholder="e.g. VMC-2026-0001"
            className={`${inputCls} max-w-xs`}
          />
          <button onClick={handleVmcSearch} className="bg-brand-orange text-white text-xs font-medium px-5 py-2 rounded-lg hover:bg-orange-700 transition-colors whitespace-nowrap">
            Search
          </button>
          {(pendingResults !== null || genResults !== null) && (
            <button onClick={() => { setPendingResults(null); setGenResults(null); setVmcIdSearch(""); }}
              className="border border-border text-text-secondary text-xs font-medium px-4 py-2 rounded-lg hover:bg-surface-muted transition-colors">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Date-range panels ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
            <span className="text-sm font-semibold text-text-primary">Pending Certificates</span>
            {pendingResults !== null && <span className="ml-auto text-xs font-semibold text-amber-600">{pendingResults.length} pending</span>}
          </div>
          <div className="p-4 flex flex-col gap-3">
            <div><label className={labelCls}>From Date</label><input type="date" value={pendingFrom} onChange={e => setPendingFrom(e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>To Date</label><input type="date" value={pendingTo} onChange={e => setPendingTo(e.target.value)} className={inputCls} /></div>
            <button onClick={handleViewPending} className="w-fit bg-brand-orange text-white text-xs font-medium px-5 py-2 rounded-lg hover:bg-orange-700 transition-colors">View Pending</button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 shrink-0" />
            <span className="text-sm font-semibold text-text-primary">Generated Certificates</span>
            {genResults !== null && <span className="ml-auto text-xs font-semibold text-green-600">{genResults.length} generated</span>}
          </div>
          <div className="p-4 flex flex-col gap-3">
            <div><label className={labelCls}>From Date</label><input type="date" value={genFrom} onChange={e => setGenFrom(e.target.value)} className={inputCls} /></div>
            <div><label className={labelCls}>To Date</label><input type="date" value={genTo} onChange={e => setGenTo(e.target.value)} className={inputCls} /></div>
            <button onClick={handleViewGenerated} className="w-fit bg-brand-orange text-white text-xs font-medium px-5 py-2 rounded-lg hover:bg-orange-700 transition-colors">View Generated</button>
          </div>
        </div>
      </div>

      {/* ── Results table ── */}
      {(pendingResults !== null || genResults !== null) && (
        <div className="bg-white rounded-xl border border-border shadow-sm">
          <div className="px-5 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-text-primary">Results</h2>
              <p className="text-xs text-text-secondary mt-0.5">{allResults.length} records</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <ExportToolbar data={exportData} columns={CALIB_COLUMNS} filename="calibration-status" visibleColumns={visibleCols} onVisibilityChange={setVisibleCols} />
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-text-secondary">Filter:</span>
                <div className="relative">
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    className="border border-border rounded-md text-xs pl-7 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-orange w-44"
                    placeholder="Name, ID, client..." />
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[900px]">
              <thead className="bg-surface-muted border-b border-border">
                <tr>
                  {CALIB_COLUMNS.filter(c => visibleCols.includes(c.key)).map(col => (
                    <th key={col.key} className="px-4 py-2.5 text-xs font-medium text-text-secondary border-r border-border">{col.label} ↕</th>
                  ))}
                  <th className="px-4 py-2.5 text-xs font-medium text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {allResults.length === 0 ? (
                  <tr><td colSpan={visibleCols.length + 1} className="px-4 py-10 text-center text-text-muted">No records found</td></tr>
                ) : allResults.map(job => (
                  <tr key={job.labId + job._dbId} className="hover:bg-surface-subtle transition-colors align-top">
                    {visibleCols.includes("labId")            && <td className="px-4 py-3 font-mono font-semibold text-brand-orange border-r border-border">{job.labId}</td>}
                    {visibleCols.includes("name")             && <td className="px-4 py-3 font-medium text-text-primary border-r border-border">{job.name}</td>}
                    {visibleCols.includes("identificationNo") && <td className="px-4 py-3 font-mono text-text-secondary border-r border-border">{job.identificationNo}</td>}
                    {visibleCols.includes("clientName")       && <td className="px-4 py-3 text-text-secondary border-r border-border">{job.clientName}</td>}
                    {visibleCols.includes("calibDate")        && <td className="px-4 py-3 text-text-secondary border-r border-border">{job.calibDate}</td>}
                    {visibleCols.includes("status")           && (
                      <td className="px-4 py-3 border-r border-border">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${job.status === "generated" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                          {job.status === "generated" ? "Generated" : "Pending"}
                        </span>
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1 w-28">
                        {/* Generate Certificate — only for pending */}
                        {job.status === "pending" && can(role, "calib:write") && (
                          <button
                            onClick={() => openGenerate(job)}
                            className="bg-brand-orange text-white text-[11px] font-medium px-3 py-1 rounded hover:bg-orange-700 transition-colors text-center flex items-center justify-center gap-1"
                          >
                            <ClipboardCheck size={11} /> Generate
                          </button>
                        )}
                        {/* Email Certificate button — available for generated certificates */}
                        {job.status === "generated" && (
                          <button
                            onClick={() => handleEmailCert(job)}
                            className="bg-emerald-600 text-white text-[11px] font-medium px-3 py-1 rounded hover:bg-emerald-700 transition-colors text-center flex items-center justify-center gap-1"
                          >
                            <Mail size={11} /> Email
                          </button>
                        )}
                        <button onClick={() => openPrint(job, "datasheet")} className="bg-blue-500 text-white text-[11px] font-medium px-3 py-1 rounded hover:bg-blue-600 transition-colors text-center">Datasheet</button>
                        <button onClick={() => openPrint(job, "print")} className="bg-gray-700 text-white text-[11px] font-medium px-3 py-1 rounded hover:bg-gray-800 transition-colors text-center">Print</button>
                        <button onClick={() => openPrint(job, "print_lh")} className="bg-gray-700 text-white text-[11px] font-medium px-3 py-1 rounded hover:bg-gray-800 transition-colors text-center">Print LH</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {pendingResults === null && genResults === null && (
        <div className="bg-white rounded-xl border border-border shadow-sm p-8 text-center">
          <ClipboardCheck size={32} className="text-text-muted mx-auto mb-3" />
          <p className="text-sm font-medium text-text-secondary">Search by VMC ID or select a date range and click View to load certificates.</p>
        </div>
      )}

      {/* ── Generate Certificate Modal ── */}
      {genJob && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-end" onClick={() => setGenJob(null)}>
          <div
            className="h-full w-full max-w-2xl bg-white shadow-2xl overflow-y-auto flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-white sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <ClipboardCheck size={16} className="text-brand-orange" />
                <span className="text-sm font-semibold text-text-primary">Generate Certificate</span>
                <span className="text-xs text-brand-orange font-mono font-semibold ml-1">{genJob.labId}</span>
              </div>
              <button onClick={() => setGenJob(null)} className="text-text-muted hover:text-text-primary"><X size={18} /></button>
            </div>

            {/* Info banner */}
            <div className="px-5 py-3 bg-blue-50 border-b border-blue-100 text-xs text-blue-800">
              <strong>{genJob.name}</strong> · {genJob.identificationNo} · {genJob.clientName}
            </div>

            <div className="p-5 flex flex-col gap-5 flex-1">
              {genError && <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2">{genError}</div>}

              {/* Certificate fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Certificate No. <span className="text-red-500">*</span></label>
                  <input value={genCertNo} onChange={e => setGenCertNo(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>ULR No.</label>
                  <input value={genUlrNo} onChange={e => setGenUlrNo(e.target.value)} className={inputCls} placeholder="C-0057..." />
                </div>
                <div>
                  <label className={labelCls}>Calibration Date</label>
                  <input type="date" value={genCalibDate} onChange={e => setGenCalibDate(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Next Calibration Date</label>
                  <input type="date" value={genNextDate} onChange={e => setGenNextDate(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Calibrated By</label>
                  <input value={genCalibBy} onChange={e => setGenCalibBy(e.target.value)} list="emp-list" className={inputCls} />
                  <datalist id="emp-list">{employeeNames.map(n => <option key={n} value={n} />)}</datalist>
                </div>
                <div>
                  <label className={labelCls}>Approved By</label>
                  <input value={genApprovedBy} onChange={e => setGenApprovedBy(e.target.value)} list="emp-list" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Conformity Statement</label>
                  <input value={genConformity} onChange={e => setGenConformity(e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Observation</label>
                  <input value={genObs} onChange={e => setGenObs(e.target.value)} className={inputCls} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelCls}>Remark</label>
                  <input value={genRemark} onChange={e => setGenRemark(e.target.value)} className={inputCls} />
                </div>
              </div>

              {/* Measurement readings table */}
              <div>
                <p className="text-xs font-semibold text-text-primary mb-2">
                  Measurement Readings (x1, x2, x3 per row)
                </p>
                <div className="rounded-lg border border-border overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-800 text-white">
                      <tr>
                        <th className="px-3 py-2.5 text-left font-medium w-24">Parameter</th>
                        <th className="px-3 py-2.5 text-center font-medium w-10">Row</th>
                        <th className="px-3 py-2.5 text-center font-medium">X1</th>
                        <th className="px-3 py-2.5 text-center font-medium">X2</th>
                        <th className="px-3 py-2.5 text-center font-medium">X3</th>
                        <th className="px-3 py-2.5 text-center font-medium">Average</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {measRows.map((row, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-surface-subtle/40"}>
                          <td className="px-3 py-2 font-medium text-text-primary">{row.parameter}</td>
                          <td className="px-3 py-2 text-center font-semibold text-text-secondary">{row.row}</td>
                          {(["x1", "x2", "x3"] as const).map(f => (
                            <td key={f} className="p-1">
                              <input
                                type="number"
                                value={row[f]}
                                onChange={e => updateMeasRow(idx, f, e.target.value)}
                                className="w-full border border-border rounded px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-orange text-center font-mono"
                                placeholder="0.0000"
                              />
                            </td>
                          ))}
                          <td className="px-3 py-2 text-center font-mono font-semibold text-text-primary">
                            {calcAvg(row.x1, row.x2, row.x3).toFixed(4)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-[11px] text-text-muted mt-1.5">Average is calculated automatically. Leave blank if not measured.</p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 pb-6 pt-4 border-t border-border flex items-center gap-2 bg-white sticky bottom-0">
              <button
                onClick={handleGenerateCertificate}
                disabled={genSaving || !genCertNo.trim()}
                className="bg-brand-orange text-white text-xs font-medium px-6 py-2.5 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-1"
              >
                {genSaving ? "Saving..." : "Generate Certificate & Mark as Done"}
              </button>
              <button onClick={() => setGenJob(null)} className="border border-border text-text-secondary text-xs font-medium px-4 py-2.5 rounded-lg hover:bg-surface-muted transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Email Certificate Modal ── */}
      {certEmailModal && certEmailJob && (
        <SendEmailModal
          defaultEmail={certClientEmail}
          subject={`Calibration Certificate ${certEmailJob.certNo || certEmailJob.labId} for ${certEmailJob.name}`}
          previewName={`Calibration Certificate (${certEmailJob.certNo || certEmailJob.name})`}
          onClose={() => { setCertEmailModal(false); setCertEmailJob(null); }}
          onSend={async (targetEmail) => {
            await sendEmail({
              to: targetEmail,
              subject: `Calibration Certificate ${certEmailJob.certNo || certEmailJob.labId} for ${certEmailJob.name}`,
              html: certificateEmailHtml({
                clientName: certEmailJob.clientName || "Valued Client",
                gaugeName: certEmailJob.name,
                labId: certEmailJob.labId,
                certNo: certEmailJob.certNo || certEmailJob.labId,
                calibDate: certEmailJob.calibDate,
                nextCalibDate: certEmailJob.nextCalibDate,
                labName: "VIKRAMADITYA METROLOGY CENTRE LLP",
              }),
              pdfBase64: pendingCertPdf,
              pdfName: `Certificate_${(certEmailJob.certNo || certEmailJob.labId).replace(/\//g, "-")}.pdf`,
            });
          }}
        />
      )}
    </motion.div>
  );
}
