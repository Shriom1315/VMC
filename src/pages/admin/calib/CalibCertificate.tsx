import { CalibJob } from "../CalibrationStatusPage";

interface Props {
  job: CalibJob;
  withLetterhead: boolean;
}

export default function CalibCertificate({ job, withLetterhead }: Props) {
  const cell  = "border border-gray-400 px-2 py-1 text-[9.5pt]";
  const hcell = "border border-gray-400 px-2 py-1 text-[9.5pt] font-bold";
  const row   = "flex gap-2 mb-1";
  const lbl   = "text-[9.5pt] text-gray-700 w-64 shrink-0";
  const val   = "text-[9.5pt] text-black";

  // Actual sizes from results
  const goA    = job.results.find(r => r.parameter === "Go"    && r.row === "A");
  const goB    = job.results.find(r => r.parameter === "Go"    && r.row === "B");
  const noGoA  = job.results.find(r => r.parameter === "No Go" && r.row === "A");
  const noGoB  = job.results.find(r => r.parameter === "No Go" && r.row === "B");
  const goActual    = goA && goB    ? `${goA.avg.toFixed(3)} / ${goB.avg.toFixed(3)}`    : "";
  const noGoActual  = noGoA && noGoB ? `${noGoA.avg.toFixed(3)} / ${noGoB.avg.toFixed(3)}` : "";

  return (
    <div className="font-sans text-[9.5pt] text-black bg-white relative"
      style={{ maxWidth: "210mm", margin: "0 auto", padding: withLetterhead ? "0" : "24px" }}>

      {/* ── LETTERHEAD (only when withLetterhead=true) ── */}
      {withLetterhead && (
        <div className="relative">
          {/* Top orange bar */}
          <div className="h-2 bg-orange-500 w-full" />

          {/* Header content */}
          <div className="px-6 pt-4 pb-2 flex items-start justify-between border-b-2 border-orange-500">
            {/* Left: Logo + name */}
            <div className="flex items-center gap-3">
              {/* VMC Logo placeholder */}
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white font-black text-xl shrink-0">
                VM
              </div>
              <div>
                <div className="font-black text-[15pt] text-orange-600 leading-tight">VIKRAMADITYA METROLOGY CENTRE LLP</div>
                <div className="text-[8.5pt] text-gray-600 mt-0.5">Plot No. A-15/1, Near Ultratech M.I.D.C. Shiroli (P), Kolhapur 416 122</div>
                <div className="text-[8.5pt] text-gray-600">Contact No. 9503601616, 7262831818</div>
                <div className="text-[8.5pt] text-gray-600">✉ vmcindialab@gmail.com &nbsp; Website : www.vikramadityacalibration.com</div>
              </div>
            </div>
            {/* Right: NABL logo placeholder + cert no */}
            <div className="flex flex-col items-end gap-1">
              <div className="w-14 h-14 border-2 border-blue-700 rounded-full flex items-center justify-center text-blue-700 font-bold text-[8pt] text-center leading-tight">
                NABL<br/>Accredited
              </div>
              <div className="text-[8pt] font-bold text-gray-600">CC-4564</div>
            </div>
          </div>

          {/* Certificate issued by line */}
          <div className="px-6 py-1 text-[8pt] text-gray-500 italic border-b border-gray-200">
            Certificate of Calibration issued by :
          </div>

          {/* Watermark */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
            style={{ top: "120px" }}>
            <div className="text-orange-200 font-black text-[40pt] text-center leading-tight opacity-30 rotate-[-15deg]">
              VIKRAMADITYA<br />METROLOGY CENTRE LLP
            </div>
          </div>
        </div>
      )}

      {/* ── CERTIFICATE BODY ── */}
      <div className={withLetterhead ? "px-6 py-4" : ""}>

        {/* Title */}
        <div className="text-center font-bold text-[13pt] mb-3">
          Calibration Certificate of : {job.name}
        </div>

        {/* Top info grid */}
        <table className="w-full border-collapse mb-3">
          <tbody>
            <tr>
              <td className={cell}>Date of Calibration: {job.calibDate}</td>
              <td className={cell}>Next Calibration Date: {job.nextCalibDate}</td>
              <td className={cell}>Calibration Certificate No: {job.certNo}</td>
            </tr>
            <tr>
              <td className={cell}>Certificate Issue Date: {job.certIssueDate}</td>
              <td className={cell}>ULR No. {job.ulrNo}</td>
              <td className={cell}>Page No: 1 of 1</td>
            </tr>
          </tbody>
        </table>

        {/* Numbered fields */}
        <table className="w-full border-collapse mb-3">
          <tbody>
            <tr>
              <td className={`${cell} w-56 align-top`}>01. Name &amp; Address of Client</td>
              <td className={`${cell} align-top`}>
                : {job.clientName}
              </td>
            </tr>
            <tr>
              <td className={`${cell} align-top`}>02. Client DC No/DC Date</td>
              <td className={cell}>
                : {job.dcNo} / {job.dcDate}
                <span className="float-right font-bold">VMC ID: {job.labId}</span>
              </td>
            </tr>
            <tr>
              <td className={cell}>03. Condition of Gauge</td>
              <td className={cell}>: {job.conditionOfGauge}</td>
            </tr>
            <tr>
              <td className={cell}>04. Date of Received</td>
              <td className={cell}>: {job.dateReceived}</td>
            </tr>
            <tr>
              <td className={`${cell} align-top`}>05. Description &amp; Identification of Instrument</td>
              <td className={`${cell} align-top`}>
                : <span className="font-bold">{job.name}</span> &nbsp;&nbsp; Make: {job.make}<br />
                Sr.No.: <span className="font-bold">{job.srNo}</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                Identification No.: <span className="font-bold">{job.identificationNo}</span><br />
                Specification: <span className="font-bold">{job.specification}</span>
              </td>
            </tr>
            <tr>
              <td className={`${cell} align-top`}>06. Equipment &amp; Masters used for Calibration</td>
              <td className={cell}>{job.standardEquipment.join(",")}</td>
            </tr>
            <tr>
              <td className={cell}>07. Traceability</td>
              <td className={cell}>: {job.traceability}</td>
            </tr>
            <tr>
              <td className={cell}>08. Reference Standard used</td>
              <td className={cell}>: {job.referenceStd}</td>
            </tr>
            <tr>
              <td className={cell}>09. Calibration Method Used</td>
              <td className={cell}>: {job.calibMethodUse}</td>
            </tr>
            <tr>
              <td className={cell}>10. Calibration Carried out at Temp.</td>
              <td className={cell}>: {job.calibTemp}</td>
            </tr>
            <tr>
              <td className={`${cell} align-top`}>
                11. Uncertainty of Measurement<br />
                ((At 95.45% Confidence Level<br />
                (K=2)))
              </td>
              <td className={cell}>: {job.uncertainty}</td>
            </tr>
            <tr>
              <td className={cell}>12. Calibration Location</td>
              <td className={cell}>: {job.calibLocation}</td>
            </tr>
            <tr>
              <td className={cell}>13. Observation</td>
              <td className={cell}>{job.observation}</td>
            </tr>
          </tbody>
        </table>

        {/* Results table */}
        <table className="w-full border-collapse mb-3">
          <thead>
            <tr>
              <td className={hcell}>Parameter</td>
              <td className={hcell}>Basic Size</td>
              <td className={hcell}>Specification Limit Max</td>
              <td className={hcell}>Specification Limit Min</td>
              <td className={hcell}>Wear Limit</td>
              <td className={hcell}>Actual Size</td>
            </tr>
          </thead>
          <tbody>
            {job.parameters.map((p, i) => (
              <tr key={i}>
                <td className={`${cell} font-bold`}>{p.parameter}</td>
                <td className={`${cell} text-center`}>{p.basicSize}</td>
                <td className={`${cell} text-center`}>{p.specLimitMax.toFixed(4)}</td>
                <td className={`${cell} text-center`}>{p.specLimitMin.toFixed(4)}</td>
                <td className={`${cell} text-center`}>{p.wearLimit !== null ? p.wearLimit.toFixed(4) : "-"}</td>
                <td className={`${cell} text-center`}>
                  {p.parameter === "Go" ? goActual : noGoActual}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Conformity + Remark */}
        <table className="w-full border-collapse mb-4">
          <tbody>
            <tr>
              <td className={cell} colSpan={2}>
                14. Conformity Statement with Decision Rule &nbsp;&nbsp; : {job.conformityStatement}
              </td>
            </tr>
            <tr>
              <td className={cell} colSpan={2}>Remark : {job.remark}</td>
            </tr>
          </tbody>
        </table>

        {/* Signatures */}
        <div className="flex justify-between mt-8 mb-4">
          <div>
            <div className="font-bold text-[10pt]">{job.calibratedBy}</div>
            <div className="text-[9pt] text-gray-600">Calibrated By</div>
          </div>
          <div className="text-right">
            <div className="font-bold text-[10pt]">{job.approvedBy}</div>
            <div className="text-[9pt] text-gray-600">Approved By</div>
          </div>
        </div>

        {/* Footer disclaimer */}
        <div className="border-t border-gray-300 pt-2 text-[8pt] text-gray-600 leading-relaxed">
          <p>This Certificate Pertains Only to the Items Calibrated At Vikramditya Metrology Centre LLP.</p>
          <p>This Calibration Certificate Shall Not Be Reproduced Except In Full, without Written Approval of The Laboratory</p>
          <p>The Result Produced In This Certificate Are Valid Under Stated Condition At The Time of Calibration.</p>
        </div>

        {/* END */}
        <div className="text-center mt-6 text-[9pt] text-gray-500">
          ------------------------------ END ------------------------------
        </div>
        <div className="text-right text-[8pt] text-gray-400 mt-1">--------------</div>
      </div>
    </div>
  );
}
