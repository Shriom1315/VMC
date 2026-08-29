import { CalibJob } from "../CalibrationStatusPage";

interface Props { job: CalibJob; }

export default function CalibDatasheet({ job }: Props) {
  const goResults    = job.results.filter(r => r.parameter === "Go");
  const noGoResults  = job.results.filter(r => r.parameter === "No Go");
  const goParam      = job.parameters.find(p => p.parameter === "Go");
  const noGoParam    = job.parameters.find(p => p.parameter === "No Go");

  const cell  = "border border-gray-400 px-2 py-1 text-[10pt]";
  const hcell = "border border-gray-400 px-2 py-1 text-[10pt] font-bold bg-gray-100 text-center";

  return (
    <div className="font-sans text-[10pt] text-black bg-white p-6 max-w-[210mm] mx-auto print:p-4 print:max-w-none">

      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="text-[11pt] leading-snug">
          <div className="font-bold text-[13pt]">VIKRAMADITYA METROLOGY</div>
          <div className="font-bold text-[13pt]">CENTRE LLP.</div>
          <div className="text-[9pt] mt-1">Plot No. A-15/1 Near Ultratech, MIDC Shiroli (P),</div>
          <div className="text-[9pt]">Tal. Hatkanagale, Dist Kolhapur. 416122. Maharashtra</div>
          <div className="text-[9pt]">Contact: 9503601616/7262831818, Email:</div>
          <div className="text-[9pt]">vikramadityametrologycenter@gmail.com</div>
        </div>
        <div className="text-right">
          <div className="font-bold text-[16pt]">Calibration Data Sheet</div>
        </div>
      </div>

      {/* Instrument name */}
      <table className="w-full border-collapse mb-2">
        <tbody>
          <tr>
            <td className={`${hcell} text-center text-[11pt]`} colSpan={6}>
              {job.name}
            </td>
          </tr>
        </tbody>
      </table>

      {/* DC / Date row */}
      <table className="w-full border-collapse mb-2">
        <tbody>
          <tr>
            <td className={`${cell} w-1/2`} colSpan={3}>
              D.C. No. &amp; Date. : {job.dcNo} / {job.dcDate}
            </td>
            <td className={`${cell} w-1/2`} colSpan={3}>
              &nbsp;
            </td>
          </tr>
          <tr>
            <td className={cell} colSpan={3}>Date of Calibration.: {job.calibDate}</td>
            <td className={cell} colSpan={3}>Certificate No.: {job.certNo}</td>
          </tr>
        </tbody>
      </table>

      {/* Lab ID / Identification / Specification */}
      <table className="w-full border-collapse mb-2">
        <tbody>
          <tr>
            <td className={hcell}>LAB ID NO.</td>
            <td className={hcell}>IDENTIFICATION No.</td>
            <td className={hcell}>Specification</td>
          </tr>
          <tr>
            <td className={`${cell} text-center`}>{job.labId}</td>
            <td className={`${cell} text-center`}>{job.identificationNo}</td>
            <td className={`${cell} text-center`}>{job.specification}</td>
          </tr>
          <tr>
            <td className={hcell}>SR. NO</td>
            <td className={hcell}>MAKE</td>
            <td className={hcell}>LC</td>
          </tr>
          <tr>
            <td className={`${cell} text-center`}>{job.srNo}</td>
            <td className={`${cell} text-center`}>{job.make}</td>
            <td className={`${cell} text-center`}>{job.lc}</td>
          </tr>
        </tbody>
      </table>

      {/* Ref IS Std / Standard Equipment */}
      <table className="w-full border-collapse mb-4">
        <tbody>
          <tr>
            <td className={`${cell} w-1/3 align-top`}>
              <div>Ref. IS Std : {job.refIsStd}</div>
              <div className="mt-2">Calibration Method Use</div>
              <div>Tolerance Method</div>
            </td>
            <td className={`${cell} w-2/3 align-top`}>
              <div className="font-bold">Standard / Equipment use for calibration</div>
              {job.standardEquipment.map((eq, i) => (
                <div key={i}>{eq}</div>
              ))}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Parameters table */}
      <table className="w-full border-collapse mb-4">
        <thead>
          <tr>
            <td className={hcell}>Parameter</td>
            <td className={hcell}>Basic Size</td>
            <td className={hcell}>Speci. Limit Max</td>
            <td className={hcell}>Speci. Limit Min</td>
            <td className={hcell}>Wear Limit</td>
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
            </tr>
          ))}
        </tbody>
      </table>

      {/* Calibration Result */}
      <div className="font-bold text-[11pt] mb-1 underline">CALIBRATION RESULT :</div>
      <table className="w-full border-collapse mb-2">
        <thead>
          <tr>
            <td className={hcell} colSpan={2} rowSpan={2}>&nbsp;</td>
            <td className={hcell} colSpan={3}>Observed Size</td>
            <td className={hcell} rowSpan={2}>Average Size</td>
            <td className={hcell} rowSpan={2}>Standard Deviation for<br />this item (μm)</td>
          </tr>
          <tr>
            <td className={hcell}>X1</td>
            <td className={hcell}>X2</td>
            <td className={hcell}>X3</td>
          </tr>
        </thead>
        <tbody>
          {/* Go rows */}
          {goResults.map((r, i) => (
            <tr key={`go-${i}`}>
              {i === 0 && (
                <td className={`${cell} font-bold text-center`} rowSpan={goResults.length}>Go</td>
              )}
              <td className={`${cell} text-center`}>{r.row}</td>
              <td className={`${cell} text-center`}>{r.x1.toFixed(4)}</td>
              <td className={`${cell} text-center`}>{r.x2.toFixed(4)}</td>
              <td className={`${cell} text-center`}>{r.x3.toFixed(4)}</td>
              <td className={`${cell} text-center font-bold`}>{r.avg.toFixed(3)}</td>
              {i === 0 && (
                <td className={`${cell} text-center`} rowSpan={goResults.length + noGoResults.length + 2}>
                  {/* std dev placeholder */}
                  <div className="mt-8">0.0000</div>
                </td>
              )}
            </tr>
          ))}
          {/* Separator */}
          <tr><td className={cell} colSpan={6}>&nbsp;</td></tr>
          {/* No Go rows */}
          {noGoResults.map((r, i) => (
            <tr key={`nogo-${i}`}>
              {i === 0 && (
                <td className={`${cell} font-bold text-center`} rowSpan={noGoResults.length}>No Go</td>
              )}
              <td className={`${cell} text-center`}>{r.row}</td>
              <td className={`${cell} text-center`}>{r.x1.toFixed(4)}</td>
              <td className={`${cell} text-center`}>{r.x2.toFixed(4)}</td>
              <td className={`${cell} text-center`}>{r.x3.toFixed(4)}</td>
              <td className={`${cell} text-center font-bold`}>{r.avg.toFixed(3)}</td>
            </tr>
          ))}
          {/* Type A readings */}
          <tr>
            <td className={`${cell} text-center`} colSpan={2}>Type "A"<br />Readings</td>
            <td className={`${cell} text-center`}>{job.typeAReadings.x1.toFixed(3)}</td>
            <td className={`${cell} text-center`}>{job.typeAReadings.x2.toFixed(3)}</td>
            <td className={`${cell} text-center`}>{job.typeAReadings.x3.toFixed(3)}</td>
            <td className={`${cell} text-center`}>{job.typeAReadings.avg.toFixed(3)}</td>
          </tr>
        </tbody>
      </table>

      {/* Std dev note */}
      <table className="w-full border-collapse mb-1">
        <tbody>
          <tr>
            <td className={cell} colSpan={7}>{job.stdDevNote}</td>
          </tr>
          <tr>
            <td className={`${cell} w-1/2`}>Remark : {job.remark}</td>
            <td className={`${cell} w-1/2`}>CALIBRATED BY : {job.calibratedBy}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
