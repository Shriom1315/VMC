import { useEffect, useState } from "react";
import ComboSelect from "../../components/ComboSelect";
import { InwardItem, InwardParameter } from "./types";
import { calcPlugGauge, calcSnapGauge, fmt4, CalcResult } from "./toleranceCalc";

interface Props {
  form: Omit<InwardItem, "id" | "inwardBillId">;
  editingItemId: number | null;
  gaugeNames: string[];
  onChange: (field: keyof Omit<InwardItem, "id" | "inwardBillId">, value: any) => void;
  onSave: () => void;
  onUpdate: () => void;
  onBack: () => void;
}

// Gauge types that measure a shaft (outside measurement — IS 3455 Table 3)
// Ring gauges check a shaft's OD → outside measurement
// Snap gauges check a shaft's OD → outside measurement
// Plug gauges check a hole's ID → inside measurement (Table 2)
const SNAP_GAUGE_TYPES = new Set([
  "Fixed Snap Gauge",
  "Go,No-go Ring gauge",
  "Plain Ring Gauge",
]);

function isSnapType(gaugeType: string): boolean {
  return SNAP_GAUGE_TYPES.has(gaugeType);
}

export default function InwardItemForm({ form, editingItemId, gaugeNames, onChange, onSave, onUpdate, onBack }: Props) {
  const [calcInfo, setCalcInfo] = useState<CalcResult | null>(null);
  // Grade Method: K and G entered directly
  const [kValue, setKValue] = useState("");
  const [gValue, setGValue] = useState("");

  const f   = "w-full bg-white border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-colors";
  const s   = `${f} appearance-none cursor-pointer`;
  const l   = "block text-xs font-medium text-text-secondary mb-1";
  const inp = "w-full border border-border rounded px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-orange bg-white";

  // ── Auto-calculate: Tolerance Method ──────────────────────────────────────
  useEffect(() => {
    if (form.method !== "Tolerance Method") return;
    const D  = parseFloat(form.size);
    const UT = parseFloat(form.upperTolerance);
    const LT = parseFloat(form.lowerTolerance);
    if (isNaN(D) || isNaN(UT) || isNaN(LT)) return;

    const snap   = isSnapType(form.gaugeType);
    const result = snap ? calcSnapGauge(D, UT, LT) : calcPlugGauge(D, UT, LT);
    setCalcInfo(result);
    applyResult(result);
  }, [form.method, form.gaugeType, form.size, form.upperTolerance, form.lowerTolerance]);

  // ── Auto-calculate: Grade Method (K and G entered directly) ───────────────
  useEffect(() => {
    if (form.method !== "Grade Method") return;
    const K = parseFloat(kValue);
    const G = parseFloat(gValue);
    if (isNaN(K) || isNaN(G)) return;
    // Derive D as midpoint, UT = G - D, LT = K - D
    const D  = (K + G) / 2;
    const UT = G - D;
    const LT = K - D;
    const snap   = isSnapType(form.gaugeType);
    const result = snap ? calcSnapGauge(D, UT, LT) : calcPlugGauge(D, UT, LT);
    setCalcInfo(result);
    applyResult(result);
  }, [form.method, form.gaugeType, kValue, gValue]);

  function applyResult(result: CalcResult) {
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
  }

  const updateParam = (idx: number, key: keyof InwardParameter, val: string) => {
    const updated = form.parameters.map((p, i) => i === idx ? { ...p, [key]: val } : p);
    onChange("parameters", updated);
  };

  const isAutoCalc = form.method === "Tolerance Method" || form.method === "Grade Method";

  const Sel = ({ label, field, options }: { label: string; field: keyof Omit<InwardItem,"id"|"inwardBillId">; options: string[] }) => (
    <div>
      <label className={l}>{label}</label>
      <ComboSelect value={form[field] as string} onChange={v => onChange(field, v)} options={options} />
    </div>
  );

  const renderCalcInfoBar = () => {
    if (!calcInfo) return null;
    const isSnap = calcInfo.kind === "snap";
    return (
      <div className="flex flex-wrap gap-4 text-xs text-text-secondary bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5">
        <span>K = <strong className="text-text-primary">{fmt4(calcInfo.K)}</strong></span>
        <span>G = <strong className="text-text-primary">{fmt4(calcInfo.G)}</strong></span>
        <span>T = <strong className="text-text-primary">{calcInfo.T_um} μm</strong></span>
        <span>Grade = <strong className="text-brand-orange">{calcInfo.grade}</strong></span>
        {isSnap ? (
          <>
            <span>Z1 = {calcInfo.Z1_um} μm</span>
            <span>H1/2 = {calcInfo.halfH1_um} μm</span>
            <span>HP/2 = {calcInfo.halfHp_um} μm</span>
            <span>Y1 = {calcInfo.Y1_um} μm</span>
          </>
        ) : (
          <>
            <span>Z = {calcInfo.Z_um} μm</span>
            <span>H/2 = {calcInfo.halfH_um} μm</span>
            <span>Hs/2 = {calcInfo.halfHs_um} μm</span>
            <span>Y = {calcInfo.Y_um} μm</span>
          </>
        )}
        {(calcInfo.at_um ?? 0) > 0 && (
          <span>@ = {calcInfo.at_um} μm</span>
        )}
        <span className="ml-auto text-[10px] text-text-muted font-medium uppercase tracking-wide">
          {isSnap ? "Outside / Shaft (Table 3)" : "Inside / Hole (Table 2)"}
        </span>
      </div>
    );
  };

  const renderMethodInputs = () => {
    if (form.method === "Tolerance Method") {
      return (
        <div className="md:col-span-2 flex flex-col gap-3">
          <div className="flex items-center gap-4 flex-wrap bg-surface-muted rounded-lg px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-text-secondary whitespace-nowrap">Size (D)</span>
              <input value={form.size} onChange={e => onChange("size", e.target.value)}
                className="w-24 border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-orange bg-white"
                placeholder="e.g. 50" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-text-secondary whitespace-nowrap">Upper Tolerance</span>
              <input value={form.upperTolerance} onChange={e => onChange("upperTolerance", e.target.value)}
                className="w-28 border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-orange bg-white"
                placeholder="e.g. +0.350" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-text-secondary whitespace-nowrap">Lower Tolerance</span>
              <input value={form.lowerTolerance} onChange={e => onChange("lowerTolerance", e.target.value)}
                className="w-28 border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-orange bg-white"
                placeholder="e.g. -0.350" />
            </div>
          </div>
          {renderCalcInfoBar()}
          <p className="text-[11px] text-text-muted">
            IT Grade auto-detected from T_μm per IS 3455:1971 —{" "}
            {isSnapType(form.gaugeType)
              ? "Table 3 (Outside/Shaft): Go = (G−Z1) ± H1/2  ·  No-Go = K ± H1/2  ·  Wear = G+Y1"
              : "Table 2 (Inside/Hole): Go = (K+Z) ± H/2  ·  No-Go = G ± H/2  ·  Wear = K−Y"}
          </p>
        </div>
      );
    }

    if (form.method === "Grade Method") {
      return (
        <div className="md:col-span-2 flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-surface-muted rounded-lg px-4 py-3">
            <div>
              <label className={l}>K — Lower limit of work piece</label>
              <input value={kValue} onChange={e => setKValue(e.target.value)} className={f} placeholder="e.g. 49.650" />
            </div>
            <div>
              <label className={l}>G — Higher limit of work piece</label>
              <input value={gValue} onChange={e => setGValue(e.target.value)} className={f} placeholder="e.g. 50.350" />
            </div>
          </div>
          {renderCalcInfoBar()}
          <p className="text-[11px] text-text-muted">
            Enter K and G directly. IT Grade auto-detected per IS 3455:1971.
          </p>
        </div>
      );
    }

    return null;
  };

  const renderParamsTable = () => (
    <div className="md:col-span-2">
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-xs">
          <thead className="bg-gray-800 text-white">
            <tr>
              {["Parameter (mm)", "Basic Size", "Spec. Limit Max", "Spec. Limit Min", "Wear Limit"].map(h => (
                <th key={h} className="px-3 py-2.5 text-left font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {form.parameters.map((p, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-surface-subtle/40"}>
                <td className="px-3 py-2.5 font-medium text-text-primary">{p.parameter}</td>
                {(["basicSize","specLimitMax","specLimitMin","wearLimit"] as (keyof InwardParameter)[]).map(key => (
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
          Auto-calculated per IS 3455:1971. Change inputs above to update.
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
        <div>
          <label className={l}>Gauge Name</label>
          <ComboSelect value={form.gaugeName} onChange={v => onChange("gaugeName", v)} options={gaugeNames} placeholder="Select or type gauge name..." />
        </div>
        <Sel label="Class" field="class" options={["No Type","Class A","Class B","Class C","Class X"]} />
        <Sel
          label="Gauge Type"
          field="gaugeType"
          options={[
            "OD Limit Gauge","ID Limit Gauge","Plain Plug Gauge","Plain Ring Gauge",
            "Thread Plug Gauge","Thread Ring Gauge","Taper Plug Gauge","Taper Ring Gauge",
            "Fixed Snap Gauge","Go,No-go Ring gauge",
            "Dial Indicator","Vernier Caliper","Micrometer","Height Gauge",
            "Depth Micrometer","Bore Gauge","Comparator Stand","Angle Plate","V Block",
            "Master Ring","Digital Dial Gauge","External Micrometer","Fixe Range Gauge",
          ]}
        />
        <div />
        <div><label className={l}>Identification No.</label><input value={form.identificationNo} onChange={e => onChange("identificationNo", e.target.value)} className={f} /></div>
        <div><label className={l}>Calibration Frequency</label><input value={form.calibFrequency} onChange={e => onChange("calibFrequency", e.target.value)} className={f} /></div>
        <div><label className={l}>Make</label><input value={form.make} onChange={e => onChange("make", e.target.value)} className={f} /></div>
        <div><label className={l}>Manufacturing Sr No.</label><input value={form.manuSrNo} onChange={e => onChange("manuSrNo", e.target.value)} className={f} /></div>
        <Sel label="Process" field="process" options={["Calibration","Repair","Repair & Calibration"]} />
        <Sel label="Unit" field="unit" options={["mm","inch","degree","bar","N.m","kg","N","μm"]} />
        <Sel label="Calibration Location" field="calibLocation" options={["Permanent Facility","On-Site","Customer Premises"]} />
        <Sel label="Calibration to be done under" field="calibUnder" options={["NABL","Non-NABL","ILC"]} />
        <div className="md:col-span-2">
          <label className={l}>Gauge Condition</label>
          <input value={form.gaugeCondition} onChange={e => onChange("gaugeCondition", e.target.value)} className={f} placeholder="e.g. Visually Ok" />
        </div>

        {/* Method selector */}
        <div className="md:col-span-2">
          <label className={l}>Method</label>
          <div className="w-72">
            <ComboSelect
              value={form.method}
              onChange={v => {
                onChange("method", v);
                onChange("size", ""); onChange("upperTolerance", ""); onChange("lowerTolerance", "");
                setKValue(""); setGValue(""); setCalcInfo(null);
                onChange("parameters", [
                  { parameter: "Go",    basicSize: "", specLimitMax: "", specLimitMin: "", wearLimit: "" },
                  { parameter: "No Go", basicSize: "", specLimitMax: "", specLimitMin: "", wearLimit: "" },
                ]);
              }}
              options={["Tolerance Method","Grade Method","Direct Go/No Method","Comparison Method"]}
            />
          </div>
        </div>

        {renderMethodInputs()}
        {renderParamsTable()}
      </div>

      <div className="px-5 pb-5 pt-3 border-t border-border flex items-center gap-2">
        <button onClick={onSave} disabled={editingItemId !== null}
          className="border border-border text-text-secondary text-xs font-medium px-5 py-2 rounded-lg hover:bg-surface-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          Save
        </button>
        <button onClick={onUpdate} disabled={editingItemId === null}
          className="bg-brand-orange text-white text-xs font-medium px-5 py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          Update
        </button>
        <button onClick={onBack}
          className="border border-border text-text-secondary text-xs font-medium px-5 py-2 rounded-lg hover:bg-surface-muted transition-colors">
          Back
        </button>
      </div>
    </div>
  );
}
