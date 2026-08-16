/**
 * CreateJobModal — pre-fills a calib_job from an inward item.
 * Opens as a slide-in panel from the inward items view.
 */

import { useState } from "react";
import { X, ClipboardCheck } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { InwardBill, InwardItem } from "./types";

interface Props {
  bill:    InwardBill;
  item:    InwardItem;
  onClose: () => void;
  onSaved: () => void;
}

const today = new Date().toISOString().split("T")[0];

export default function CreateJobModal({ bill, item, onClose, onSaved }: Props) {
  const [labId,           setLabId]           = useState(item.labId || "");
  const [calibDate,       setCalibDate]        = useState(today);
  const [nextCalibDate,   setNextCalibDate]    = useState("");
  const [certNo,          setCertNo]           = useState("");
  const [ulrNo,           setUlrNo]            = useState("");
  const [srNo,            setSrNo]             = useState(item.manuSrNo || "");
  const [make,            setMake]             = useState(item.make || "");
  const [lc,              setLc]               = useState("");
  const [calibratedBy,    setCalibratedBy]     = useState(bill.labAuthorizedPerson || "");
  const [approvedBy,      setApprovedBy]       = useState("");
  const [uncertainty,     setUncertainty]      = useState("± 1 μm.");
  const [calibTemp,       setCalibTemp]        = useState("20°C ± 2°C & Humidity 40 to 60 % Rh.");
  const [conditionOfGauge,setConditionOfGauge] = useState(item.gaugeCondition || "Visually Ok");
  const [remark,          setRemark]           = useState("");
  const [saving,          setSaving]           = useState(false);
  const [error,           setError]            = useState<string | null>(null);

  const handleSave = async () => {
    if (!labId.trim()) { setError("Lab ID is required."); return; }
    setSaving(true); setError(null);

    // ── Snapshot the current active scope for this gauge type ──
    let scopeSnapshot = {};
    const { data: scopeData } = await supabase
      .from("scopes")
      .select("*")
      .eq("gauge_type", item.gaugeType)
      .eq("is_active", true)
      .order("effective_from", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (scopeData) {
      scopeSnapshot = {
        gauge_type:              scopeData.gauge_type,
        range_from:              scopeData.range_from,
        range_to:                scopeData.range_to,
        least_count:             scopeData.least_count,
        uncertainty_measurement: scopeData.uncertainty_measurement,
        confidance_level:        scopeData.confidance_level,
        calib_location:          scopeData.calib_location,
        effective_from:          scopeData.effective_from,
        snapshotted_at:          new Date().toISOString(),
      };
    }

    const payload = {
      lab_id:             labId,
      name:               item.gaugeName,
      identification_no:  item.identificationNo,
      specification:      item.specification,
      manu_sr:            item.manuSrNo,
      process:            item.process,
      dc_no:              bill.clientDcNo,
      dc_date:            bill.clientDcDate || null,
      calib_date:         calibDate || null,
      next_calib_date:    nextCalibDate || null,
      cert_no:            certNo,
      cert_issue_date:    calibDate || null,
      ulr_no:             ulrNo,
      sr_no:              srNo,
      make,
      lc,
      ref_is_std:         "",
      calib_method_use:   item.method,
      standard_equipment: [],
      client_name:        bill.clientName,
      client_address:     "",
      condition_of_gauge: conditionOfGauge,
      date_received:      bill.receiveDate || null,
      calib_temp:         calibTemp,
      uncertainty,
      calib_location:     item.calibLocation,
      remark,
      calibrated_by:      calibratedBy,
      approved_by:        approvedBy,
      status:             "pending",
      scope_snapshot:     scopeSnapshot,
      parameters:         item.parameters,
    };

    const { error: err } = await supabase.from("calib_jobs").insert(payload);
    if (err) { setError(err.message); setSaving(false); return; }
    setSaving(false);
    onSaved();
    onClose();
  };

  const f = "w-full border border-border rounded-md px-3 py-2 text-sm text-text-primary bg-white focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-colors";
  const l = "block text-xs font-medium text-text-secondary mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/40" onClick={onClose}>
      <div
        className="h-full w-full max-w-lg bg-white shadow-2xl overflow-y-auto flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <ClipboardCheck size={16} className="text-brand-orange" />
            <span className="text-sm font-semibold text-text-primary">Create Job Card</span>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Pre-filled info banner */}
        <div className="px-5 py-3 bg-blue-50 border-b border-blue-100">
          <p className="text-xs font-medium text-blue-800">Pre-filled from inward item</p>
          <p className="text-xs text-blue-600 mt-0.5">
            <strong>{item.gaugeName}</strong> · {item.identificationNo} · {bill.clientName}
          </p>
        </div>

        <div className="p-5 flex flex-col gap-4 flex-1">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2">{error}</div>
          )}

          {/* Read-only pre-filled fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={l}>Gauge Name</label>
              <input value={item.gaugeName} readOnly className="w-full border border-border rounded-md px-3 py-2 text-sm bg-surface-muted text-text-secondary cursor-not-allowed" />
            </div>
            <div>
              <label className={l}>Identification No.</label>
              <input value={item.identificationNo} readOnly className="w-full border border-border rounded-md px-3 py-2 text-sm bg-surface-muted text-text-secondary cursor-not-allowed" />
            </div>
            <div>
              <label className={l}>Client Name</label>
              <input value={bill.clientName} readOnly className="w-full border border-border rounded-md px-3 py-2 text-sm bg-surface-muted text-text-secondary cursor-not-allowed" />
            </div>
            <div>
              <label className={l}>DC No.</label>
              <input value={bill.clientDcNo} readOnly className="w-full border border-border rounded-md px-3 py-2 text-sm bg-surface-muted text-text-secondary cursor-not-allowed" />
            </div>
            <div>
              <label className={l}>Process</label>
              <input value={item.process} readOnly className="w-full border border-border rounded-md px-3 py-2 text-sm bg-surface-muted text-text-secondary cursor-not-allowed" />
            </div>
            <div>
              <label className={l}>Specification</label>
              <input value={item.specification} readOnly className="w-full border border-border rounded-md px-3 py-2 text-sm bg-surface-muted text-text-secondary cursor-not-allowed" />
            </div>
          </div>

          <hr className="border-border" />

          {/* Editable job fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={l}>Lab ID <span className="text-red-500">*</span></label>
              <input value={labId} onChange={e => setLabId(e.target.value)} className={f} placeholder="VMC-2026-0001" />
            </div>
            <div>
              <label className={l}>Calibration Date</label>
              <input type="date" value={calibDate} onChange={e => setCalibDate(e.target.value)} className={f} />
            </div>
            <div>
              <label className={l}>Next Calib. Date</label>
              <input type="date" value={nextCalibDate} onChange={e => setNextCalibDate(e.target.value)} className={f} />
            </div>
            <div>
              <label className={l}>Certificate No.</label>
              <input value={certNo} onChange={e => setCertNo(e.target.value)} className={f} placeholder="VMC/2026/001" />
            </div>
            <div>
              <label className={l}>ULR No.</label>
              <input value={ulrNo} onChange={e => setUlrNo(e.target.value)} className={f} placeholder="C-0057..." />
            </div>
            <div>
              <label className={l}>Sr. No.</label>
              <input value={srNo} onChange={e => setSrNo(e.target.value)} className={f} />
            </div>
            <div>
              <label className={l}>Make</label>
              <input value={make} onChange={e => setMake(e.target.value)} className={f} />
            </div>
            <div>
              <label className={l}>Least Count (LC)</label>
              <input value={lc} onChange={e => setLc(e.target.value)} className={f} placeholder="0.001 mm" />
            </div>
            <div>
              <label className={l}>Calibrated By</label>
              <input value={calibratedBy} onChange={e => setCalibratedBy(e.target.value)} className={f} />
            </div>
            <div>
              <label className={l}>Approved By</label>
              <input value={approvedBy} onChange={e => setApprovedBy(e.target.value)} className={f} />
            </div>
          </div>

          <div>
            <label className={l}>Uncertainty (at 95.45%, k=2)</label>
            <input value={uncertainty} onChange={e => setUncertainty(e.target.value)} className={f} />
          </div>
          <div>
            <label className={l}>Calibration Temperature</label>
            <input value={calibTemp} onChange={e => setCalibTemp(e.target.value)} className={f} />
          </div>
          <div>
            <label className={l}>Condition of Gauge</label>
            <input value={conditionOfGauge} onChange={e => setConditionOfGauge(e.target.value)} className={f} />
          </div>
          <div>
            <label className={l}>Remark</label>
            <input value={remark} onChange={e => setRemark(e.target.value)} className={f} />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-6 pt-4 border-t border-border flex items-center gap-2 bg-white sticky bottom-0">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-brand-orange text-white text-xs font-medium px-5 py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-1"
          >
            {saving ? "Creating..." : "Create Job Card"}
          </button>
          <button
            onClick={onClose}
            className="border border-border text-text-secondary text-xs font-medium px-4 py-2 rounded-lg hover:bg-surface-muted transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
