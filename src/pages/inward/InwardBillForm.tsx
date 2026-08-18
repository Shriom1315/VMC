import ComboSelect from "../../components/ComboSelect";
import { InwardBill } from "./types";

interface Props {
  form: Omit<InwardBill, "id">;
  editingId: number | null;
  partyNames: string[];
  onChange: (field: keyof Omit<InwardBill, "id">, value: string) => void;
  onSave: () => void;
  onUpdate: () => void;
  onDelete: () => void;
  onCancel: () => void;
}

// Style constants — defined outside the component so they never change reference
const f = "w-full bg-white border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-colors";
const l = "block text-xs font-medium text-text-secondary mb-1";

export default function InwardBillForm({ form, editingId, partyNames, onChange, onSave, onUpdate, onDelete, onCancel }: Props) {
  return (
    <div className="bg-white rounded-xl border border-border shadow-sm">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <span className="text-sm font-semibold text-text-primary">
          {editingId !== null ? `Editing Inward #${editingId}` : "Inward Master Details"}
        </span>
        {editingId !== null && (
          <button onClick={onCancel} className="text-xs text-text-muted hover:text-text-primary">✕ Cancel</button>
        )}
      </div>

      <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Client Name */}
        <div>
          <label className={l}>Client Name</label>
          <ComboSelect value={form.clientName} onChange={v => onChange("clientName", v)} options={["", ...partyNames]} />
        </div>

        {/* Billing To */}
        <div>
          <label className={l}>Billing To</label>
          <ComboSelect value={form.billingTo} onChange={v => onChange("billingTo", v)} options={["", ...partyNames]} />
        </div>

        {/* Delivery To */}
        <div>
          <label className={l}>Delivery To</label>
          <ComboSelect value={form.deliveryTo} onChange={v => onChange("deliveryTo", v)} options={["", ...partyNames]} />
        </div>

        {/* Other Access To */}
        <div>
          <label className={l}>Other Access To</label>
          <ComboSelect value={form.otherAccessTo} onChange={v => onChange("otherAccessTo", v)} options={["", ...partyNames]} />
        </div>

        {/* Client DC No */}
        <div>
          <label className={l}>Client DC No</label>
          <input value={form.clientDcNo} onChange={e => onChange("clientDcNo", e.target.value)} className={f} />
        </div>

        {/* Client DC Date */}
        <div>
          <label className={l}>Client DC Date</label>
          <input type="date" value={form.clientDcDate} onChange={e => onChange("clientDcDate", e.target.value)} className={f} />
        </div>

        {/* Through */}
        <div>
          <label className={l}>Through</label>
          <input value={form.through} onChange={e => onChange("through", e.target.value)} className={f} />
        </div>

        {/* Inward Date */}
        <div>
          <label className={l}>Inward Date</label>
          <input type="date" value={form.inwardDate} onChange={e => onChange("inwardDate", e.target.value)} className={f} />
        </div>

        {/* Receive Date */}
        <div>
          <label className={l}>Receive Date</label>
          <input type="date" value={form.receiveDate} onChange={e => onChange("receiveDate", e.target.value)} className={f} />
        </div>

        {/* Commit Date */}
        <div>
          <label className={l}>Commit Date</label>
          <input type="date" value={form.commitDate} onChange={e => onChange("commitDate", e.target.value)} className={f} />
        </div>

        {/* Calibration Method */}
        <div>
          <label className={l}>Calibration Method To Be Used</label>
          <ComboSelect value={form.calibMethod} onChange={v => onChange("calibMethod", v)} options={["Lab Method", "Customer Method"]} />
        </div>

        {/* Method Of Reporting */}
        <div>
          <label className={l}>Method Of Reporting</label>
          <ComboSelect value={form.methodOfReporting} onChange={v => onChange("methodOfReporting", v)} options={["Lab Format", "Customer Format"]} />
        </div>

        {/* Mode Of Collection */}
        <div>
          <label className={l}>Mode Of Collection</label>
          <ComboSelect value={form.modeOfCollection} onChange={v => onChange("modeOfCollection", v)} options={["By Hand", "Courier", "Email"]} />
        </div>

        {/* Mode Of Dispatch */}
        <div>
          <label className={l}>Mode Of Dispatch</label>
          <ComboSelect value={form.modeOfDispatch} onChange={v => onChange("modeOfDispatch", v)} options={["By Hand", "Courier", "Email"]} />
        </div>

        {/* Compliance */}
        <div>
          <label className={l}>Compliance Statement</label>
          <ComboSelect value={form.compliance} onChange={v => onChange("compliance", v)} options={["Required", "Not Required"]} />
        </div>

        {/* Decision Rule */}
        <div>
          <label className={l}>If Yes Decision Rule is discussed, understand &amp; acceptable or not</label>
          <ComboSelect value={form.decisionRule} onChange={v => onChange("decisionRule", v)} options={["Yes", "No"]} />
        </div>

        {/* Any Specific Requirement — full width */}
        <div className="md:col-span-2">
          <label className={l}>Any Specific Requirement</label>
          <input value={form.anySpecificReq} onChange={e => onChange("anySpecificReq", e.target.value)} className={f} />
        </div>

        {/* Lab Authorized Person */}
        <div>
          <label className={l}>Lab Authorized Person</label>
          <input value={form.labAuthorizedPerson} onChange={e => onChange("labAuthorizedPerson", e.target.value)} className={f} />
        </div>

        {/* Designation */}
        <div>
          <label className={l}>Designation</label>
          <input value={form.designation} onChange={e => onChange("designation", e.target.value)} className={f} />
        </div>

        {/* Customer Authorized Person */}
        <div>
          <label className={l}>Customer Authorized Person</label>
          <input value={form.customerAuthPerson} onChange={e => onChange("customerAuthPerson", e.target.value)} className={f} />
        </div>

        {/* Contact */}
        <div>
          <label className={l}>Contact</label>
          <input value={form.contact} onChange={e => onChange("contact", e.target.value)} className={f} />
        </div>

        {/* Billing Firm */}
        <div>
          <label className={l}>Billing Firm</label>
          <ComboSelect value={form.billingFirm} onChange={v => onChange("billingFirm", v)} options={["Vikramaditya Calibration", "Vikramaditya Enterprises", "Central Calibration Lab"]} />
        </div>

      </div>

      <div className="px-5 pb-5 pt-3 border-t border-border flex items-center gap-2">
        <button onClick={onSave}   disabled={editingId !== null} className="bg-brand-orange text-white text-xs font-medium px-5 py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Save</button>
        <button onClick={onUpdate} disabled={editingId === null} className="border border-border text-text-primary text-xs font-medium px-5 py-2 rounded-lg hover:bg-surface-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Update</button>
        <button onClick={onDelete} disabled={editingId === null} className="border border-red-200 text-red-600 text-xs font-medium px-5 py-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Delete</button>
      </div>
    </div>
  );
}
