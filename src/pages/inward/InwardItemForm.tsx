import { useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { InwardItem, InwardParameter } from "./types";
import { calcPlugGauge, fmt4 } from "./toleranceCalc";

interface Props {
  form: Omit<InwardItem, "id" | "inwardBillId">;
  editingItemId: number | null;
  gaugeNames: string[];
  onChange: (field: keyof Omit<InwardItem, "id" | "inwardBillId">, value: any) => void;
  onSave: () => void;
  onUpdate: () => void;
  onBack: () => void;
}

export default function InwardItemForm({
  form, editingItemId, gaugeNames, onChange, onSave, onUpdate, onBack,
}: Props) {
  const f = "w-full bg-white border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-colors";
  const s = `${f} appearance-none cursor-pointer`;
  const l = "block text-xs font-medium text-text-secondary mb-1";
  const inp = "w-full border border-border rounded px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-orange bg-white";

  // ── Auto-calculate when Tolerance Method inputs change ──────────────────────
  useEffect(() => {
    if (form.method !== "Tolerance Method") return;
    const D  = parseFloat(form.size);
    const UT = parseFloat(form.upperTolerance);
    const LT = parseFloat(form.lowerTolerance);
    if (isNaN(D) || isNaN(UT) || isNaN(LT)) return;

    const result = calcPlugGauge(D, UT, LT);

    const updated: InwardParameter[] = [
      {
        parameter:    "Go",
        basicSize:    fmt4(result.go.basicSize),
        specLimitMax: fmt4(result.go.specLimitMax),
        specLimitMin: fmt4(result.go.specLimitMin),
        wearLimit:    fmt4(result.go.wearLimit),
      },
      {
        parameter:    "No Go",
        basicSize:    fmt4(result.noGo.basicSize),
        specLimitMax: fmt4(result.noGo.specLimitMax),
        specLimitMin: fmt4(result.noGo.specLimitMin),
        wearLimit:    "",
      },
    ];
    onChange("parameters", updated);
  }, [form.method, form.size, form.upperTolerance, form.lowerTolerance]);

  const updateParam = (idx: number, key: keyof InwardParameter, val: string) => {
    const updated = form.parameters.map((p, i) => i === idx ? { ...p, [key]: val } : p);
    onChange("parameters", updated);
  };

  const isAutoCalc = form.method === "Tolerance Method";

  // Live preview of IT grade and table values
  const getPreview = () => {
    if (!isAutoCalc) return null;
    const D  = parseFloat(form.size);
    const UT = parseFloat(form.upperTolerance);
    const LT = parseFloat(form.lowerTolerance);
    if (isNaN(D) || isNaN(UT) || isNaN(LT)) return null;
    try {
      const r = calcPlugGauge(D, UT, LT);
      return `K=${fmt4(r.K)}  G=${fmt4(r.G)}  T=${r.T_um}μm  →  ${r.itGrade}  (Z=${r.Z}μm, H/2=${r.H2}μm, Y=${r.Y}μm)`;
    } catch { return null; }
  };

  const Sel = ({ label, field, options }: {
    label: string;
    field: keyof Omit<InwardItem, "id" | "inwardBillId">;
    options: string[];
  }) => (
    <div>
      <label className={l}>{label}</label>
      <div className="relative">
        <select value={form[field] as string} onChange={e => onChange(field, e.target.value)} className={s}>
          {options.map(o => <option key={o}>{o}</option>)}
        </select>
        <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
      </div>
    </div>
  );

  const renderMethodInputs = () => {
    if (form.method === "Tolerance Method") {
      const preview = getPreview();
      return (
        <div className="md:col-span-2 flex flex-col gap-3">
          {/* Size + tolerances */}
          <div className="flex items-center gap-4 flex-wrap bg-surface-muted rounded-lg px-4 py-3 border border-border">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-text-secondary whitespace-nowrap">Size (D)</span>
              <input
                value={form.size}
                onChange={e => onChange("size", e.target.value)}
                className="w-24 border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-orange bg-white"
                placeholder="e.g. 20"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-text-secondary whitespace-nowrap">Upper Tolerance (UT)</span>
              <input
                value={form.upperTolerance}
                onChange={e => onChange("upperTolerance", e.target.value)}
                className="w-24 border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-orange bg-white"
                placeholder="e.g. +0.100"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-text-secondary whitespace-nowrap">Lower Tolerance (LT)</span>
              <input
                value={form.lowerTolerance}
                onChange={e => onChange("lowerTolerance", e.target.value)}
                className="w-24 border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-orange bg-white"
                placeholder="e.g. -0.100"
              />
            </div>
          </div>
          {/* Live IT grade preview */}
          {preview && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-[11px] font-mono text-blue-800">
              IS 3455 Lookup: {preview}
            </div>
          )}
          <p className="text-[11px] text-text-muted">
            IT Grade is auto-determined from workpiece tolerance (T = UT − LT).
            Parameters calculated per IS 3455:1971 Table 2.
          </p>
        </div>
      );
    }

    if (form.method === "Grade Method") {
      return (
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={l}>K — Lower limit of work piece (mm)</label>
            <input
              value={form.size}
              onChange={e => onChange("size", e.target.value)}
              className={f}
              placeholder="e.g. 29.800"
            />
          </div>
          <div>
            <label className={l}>G — Higher limit of work piece (mm)</label>
            <input
              value={form.upperTolerance}
              onChange={e => onChange("upperTolerance", e.target.value)}
              className={f}
              placeholder="e.g. 30.200"
            />
          </div>
        </div>
      );
    }

    // Direct Go/No Method — no extra inputs
    return null;
  };

  const renderParamsTable = () => (
    <div className="md:col-span-2">
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-xs">
          <thead className="bg-gray-800 text-white">
            <tr>
              {["Parameter(mm)", "Basic-Size", "Specification Limit Max", "Specification Limit Min", "Wear Limit"].map(h => (
                <th key={h} className="px-3 py-2.5 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {form.parameters.map((p, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-surface-subtle/40"}>
                <td className="px-3 py-2.5 font-medium text-text-primary">{p.parameter}</td>
                {(["basicSize", "specLimitMax", "specLimitMin", "wearLimit"] as (keyof InwardParameter)[]).map(key => (
                  <td key={key} className="p-1.5">
                    <input
                      value={p[key]}
                      onChange={e => updateParam(idx, key, e.target.value)}
                      readOnly={isAutoCalc}
                      className={`${inp} ${isAutoCalc ? "bg-surface-muted text-text-secondary cursor-default" : ""}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isAutoCalc && (
        <p className="text-[11px] text-text-muted mt-1.5">
          Read-only — auto-calculated from IS 3455:1971 Table 2. Change Size or Tolerances to update.
        </p>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-border shadow-sm">
      <div className="px-5 py-4 border-b border-border">
        <span className="text-sm font-semibold text-text-primary">
          {editingItemId !== null ? "Edit Item" : "Add Items to Inward Bill"}
        </span>
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Gauge Name */}
        <div>
          <label className={l}>Gauge Name</label>
          <div className="relative">
            <select value={form.gaugeName} onChange={e => onChange("gaugeName", e.target.value)} className={s}>
              <option value="">-- Select Gauge --</option>
              {gaugeNames.map(g => <option key={g}>{g}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          </div>
        </div>
        <Sel label="Class" field="class" options={["No Type","Class A","Class B","Class C","Class X"]} />
        <Sel label="Gauge Type" field="gaugeType" options={[
          "OD Limit Gauge","ID Limit Gauge","Plain Plug Gauge","Plain Ring Gauge",
          "Thread Plug Gauge","Thread Ring Gauge","Taper Plug Gauge","Taper Ring Gauge",
          "Dial Indicator","Vernier Caliper","Micrometer","Height Gauge",
          "Depth Micrometer","Bore Gauge","Comparator Stand","Angle Plate",
          "V Block","Master Ring","Digital Dial Gauge","External Micrometer","Fixe Range Gauge",
        ]} />
        <div />
        <div><label className={l}>Identification No.</label><input value={form.identificationNo} onChange={e => onChange("identificationNo", e.target.value)} className={f} /></div>
        <div><label className={l}>Calibration Frequency</label><input value={form.calibFrequency} onChange={e => onChange("calibFrequency", e.target.value)} className={f} /></div>
        <div><label className={l}>Make</label><input value={form.make} onChange={e => onChange("make", e.target.value)} className={f} /></div>
        <div><label className={l}>Manufacturing Sr No.</label><input value={form.manuSrNo} onChange={e => onChange("manuSrNo", e.target.value)} className={f} /></div>
        <Sel label="Process" field="process" options={["Calibration","Repair","Repair & Calibration"]} />
        <Sel label="Unit"    field="unit"    options={["mm","inch","degree","bar","N.m","kg","N","μm"]} />
        <Sel label="Calibration Location"         field="calibLocation" options={["Permanent Facility","On-Site","Customer Premises"]} />
        <Sel label="Calibration to be done under" field="calibUnder"    options={["NABL","Non-NABL","ILC"]} />
        <div className="md:col-span-2">
          <label className={l}>Gauge Condition</label>
          <input value={form.gaugeCondition} onChange={e => onChange("gaugeCondition", e.target.value)} className={f} placeholder="e.g. Visually Ok" />
        </div>

        {/* Method selector */}
        <div className="md:col-span-2">
          <label className={l}>Method</label>
          <div className="relative w-72">
            <select
              value={form.method}
              onChange={e => {
                onChange("method", e.target.value);
                onChange("size", "");
                onChange("upperTolerance", "");
                onChange("lowerTolerance", "");
                onChange("parameters", [
                  { parameter: "Go",    basicSize: "", specLimitMax: "", specLimitMin: "", wearLimit: "" },
                  { parameter: "No Go", basicSize: "", specLimitMax: "", specLimitMin: "", wearLimit: "" },
                ]);
              }}
              className={s}
            >
              <option>Tolerance Method</option>
              <option>Grade Method</option>
              <option>Direct Go/No Method</option>
              <option>Comparison Method</option>
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          </div>
        </div>

        {renderMethodInputs()}
        {renderParamsTable()}
      </div>

      <div className="px-5 pb-5 pt-3 border-t border-border flex items-center gap-2">
        <button
          onClick={onSave}
          disabled={editingItemId !== null}
          className="border border-border text-text-secondary text-xs font-medium px-5 py-2 rounded-lg hover:bg-surface-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Save
        </button>
        <button
          onClick={onUpdate}
          disabled={editingItemId === null}
          className="bg-brand-orange text-white text-xs font-medium px-5 py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Update
        </button>
        <button
          onClick={onBack}
          className="border border-border text-text-secondary text-xs font-medium px-5 py-2 rounded-lg hover:bg-surface-muted transition-colors"
        >
          Back
        </button>
      </div>
    </div>
  );
}
