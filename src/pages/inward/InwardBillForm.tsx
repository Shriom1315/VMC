import { ChevronDown } from "lucide-react";
import { InwardBill, EMPTY_BILL } from "./types";

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

export default function InwardBillForm({ form, editingId, partyNames, onChange, onSave, onUpdate, onDelete, onCancel }: Props) {
  const f = "w-full bg-white border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-colors";
  const s = `${f} appearance-none cursor-pointer`;
  const l = "block text-xs font-medium text-text-secondary mb-1";

  const Sel = ({ label, field, options }: { label: string; field: keyof Omit<InwardBill,"id">; options: string[] }) => (
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

  const Inp = ({ label, field, type = "text" }: { label: string; field: keyof Omit<InwardBill,"id">; type?: string }) => (
    <div>
      <label className={l}>{label}</label>
      <input type={type} value={form[field] as string} onChange={e => onChange(field, e.target.value)} className={f} />
    </div>
  );

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
        <Sel label="Client Name"    field="clientName"    options={["", ...partyNames]} />
        <Sel label="Billing To"     field="billingTo"     options={["", ...partyNames]} />
        <Sel label="Delivery To"    field="deliveryTo"    options={["", ...partyNames]} />
        <Sel label="Other Access To" field="otherAccessTo" options={["", ...partyNames]} />
        <Inp label="Client DC No"   field="clientDcNo" />
        <Inp label="Client DC Date" field="clientDcDate" type="date" />
        <Inp label="Through"        field="through" />
        <Inp label="Inward Date"    field="inwardDate" type="date" />
        <Inp label="Receive Date"   field="receiveDate" type="date" />
        <Inp label="Commit Date"    field="commitDate" type="date" />
        <Sel label="Calibration Method To Be Used" field="calibMethod" options={["Lab Method","Customer Method"]} />
        <Sel label="Method Of Reporting"           field="methodOfReporting" options={["Lab Format","Customer Format"]} />
        <Sel label="Mode Of Collection"            field="modeOfCollection" options={["By Hand","Courier","Email"]} />
        <Sel label="Mode Of Dispatch"              field="modeOfDispatch" options={["By Hand","Courier","Email"]} />
        <Sel label="Compliance Statement"          field="compliance" options={["Required","Not Required"]} />
        <Sel label="If Yes Decision Rule is discussed, understand & acceptable or not" field="decisionRule" options={["Yes","No"]} />
        <div className="md:col-span-2">
          <label className={l}>Any Specific Requirement</label>
          <input value={form.anySpecificReq} onChange={e => onChange("anySpecificReq", e.target.value)} className={f} />
        </div>
        <Inp label="Lab Authorized Person"    field="labAuthorizedPerson" />
        <Inp label="Designation"              field="designation" />
        <Inp label="Customer Authorized Person" field="customerAuthPerson" />
        <Inp label="Contact"                  field="contact" />
        <Sel label="Billing Firm" field="billingFirm" options={["Vikramaditya Calibration","Vikramaditya Enterprises","Central Calibration Lab"]} />
      </div>

      <div className="px-5 pb-5 pt-3 border-t border-border flex items-center gap-2">
        <button onClick={onSave}   className="bg-brand-orange text-white text-xs font-medium px-5 py-2 rounded-lg hover:bg-orange-700 transition-colors">Save</button>
        <button onClick={onUpdate} disabled={editingId === null} className="border border-border text-text-primary text-xs font-medium px-5 py-2 rounded-lg hover:bg-surface-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Update</button>
        <button onClick={onDelete} disabled={editingId === null} className="border border-red-200 text-red-600 text-xs font-medium px-5 py-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Delete</button>
      </div>
    </div>
  );
}
