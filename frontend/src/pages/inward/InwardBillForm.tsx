/**
 * InwardBillForm — owns its own form state internally.
 * This eliminates the focus-loss bug caused by re-creating onChange
 * on every parent render. onSave/onUpdate receive the completed data.
 */

import { useState, useEffect } from "react";
import ComboSelect from "../../components/ComboSelect";
import { InwardBill, EMPTY_BILL } from "./types";

type BillData = Omit<InwardBill, "id">;

interface Props {
  initial:    BillData;          // initial values (EMPTY_BILL for new, bill data for edit)
  editingId:  number | null;
  partyNames: string[];
  onSave:     (data: BillData) => void;
  onUpdate:   (data: BillData) => void;
  onDelete:   () => void;
  onCancel:   () => void;
}

const f = "w-full bg-white border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-colors";
const l = "block text-xs font-medium text-text-secondary mb-1";

export default function InwardBillForm({
  initial, editingId, partyNames, onSave, onUpdate, onDelete, onCancel,
}: Props) {
  // ── Internal form state — no more parent-driven re-renders ──
  const [clientName,         setClientName]         = useState(initial.clientName);
  const [billingTo,          setBillingTo]          = useState(initial.billingTo);
  const [deliveryTo,         setDeliveryTo]         = useState(initial.deliveryTo);
  const [otherAccessTo,      setOtherAccessTo]      = useState(initial.otherAccessTo);
  const [clientDcNo,         setClientDcNo]         = useState(initial.clientDcNo);
  const [clientDcDate,       setClientDcDate]       = useState(initial.clientDcDate);
  const [through,            setThrough]            = useState(initial.through);
  const [inwardDate,         setInwardDate]         = useState(initial.inwardDate);
  const [receiveDate,        setReceiveDate]        = useState(initial.receiveDate);
  const [commitDate,         setCommitDate]         = useState(initial.commitDate);
  const [calibMethod,        setCalibMethod]        = useState(initial.calibMethod);
  const [methodOfReporting,  setMethodOfReporting]  = useState(initial.methodOfReporting);
  const [modeOfCollection,   setModeOfCollection]   = useState(initial.modeOfCollection);
  const [modeOfDispatch,     setModeOfDispatch]     = useState(initial.modeOfDispatch);
  const [compliance,         setCompliance]         = useState(initial.compliance);
  const [decisionRule,       setDecisionRule]       = useState(initial.decisionRule);
  const [anySpecificReq,     setAnySpecificReq]     = useState(initial.anySpecificReq);
  const [labAuthorizedPerson,setLabAuthorizedPerson]= useState(initial.labAuthorizedPerson);
  const [designation,        setDesignation]        = useState(initial.designation);
  const [customerAuthPerson, setCustomerAuthPerson] = useState(initial.customerAuthPerson);
  const [contact,            setContact]            = useState(initial.contact);
  const [billingFirm,        setBillingFirm]        = useState(initial.billingFirm);

  // Re-init when `initial` prop changes (e.g. when editing a different bill)
  useEffect(() => {
    setClientName(initial.clientName);
    setBillingTo(initial.billingTo);
    setDeliveryTo(initial.deliveryTo);
    setOtherAccessTo(initial.otherAccessTo);
    setClientDcNo(initial.clientDcNo);
    setClientDcDate(initial.clientDcDate);
    setThrough(initial.through);
    setInwardDate(initial.inwardDate);
    setReceiveDate(initial.receiveDate);
    setCommitDate(initial.commitDate);
    setCalibMethod(initial.calibMethod);
    setMethodOfReporting(initial.methodOfReporting);
    setModeOfCollection(initial.modeOfCollection);
    setModeOfDispatch(initial.modeOfDispatch);
    setCompliance(initial.compliance);
    setDecisionRule(initial.decisionRule);
    setAnySpecificReq(initial.anySpecificReq);
    setLabAuthorizedPerson(initial.labAuthorizedPerson);
    setDesignation(initial.designation);
    setCustomerAuthPerson(initial.customerAuthPerson);
    setContact(initial.contact);
    setBillingFirm(initial.billingFirm);
  }, [initial]);

  const collect = (): BillData => ({
    clientName, billingTo, deliveryTo, otherAccessTo,
    clientDcNo, clientDcDate, through, inwardDate,
    receiveDate, commitDate, calibMethod, methodOfReporting,
    modeOfCollection, modeOfDispatch, compliance, decisionRule,
    anySpecificReq, labAuthorizedPerson, designation,
    customerAuthPerson, contact, billingFirm,
  });

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

        <div>
          <label className={l}>Client Name</label>
          <ComboSelect value={clientName} onChange={setClientName} options={["", ...partyNames]} />
        </div>
        <div>
          <label className={l}>Billing To</label>
          <ComboSelect value={billingTo} onChange={setBillingTo} options={["", ...partyNames]} />
        </div>
        <div>
          <label className={l}>Delivery To</label>
          <ComboSelect value={deliveryTo} onChange={setDeliveryTo} options={["", ...partyNames]} />
        </div>
        <div>
          <label className={l}>Other Access To</label>
          <ComboSelect value={otherAccessTo} onChange={setOtherAccessTo} options={["", ...partyNames]} />
        </div>
        <div>
          <label className={l}>Client DC No</label>
          <input value={clientDcNo} onChange={e => setClientDcNo(e.target.value)} className={f} />
        </div>
        <div>
          <label className={l}>Client DC Date</label>
          <input type="date" value={clientDcDate} onChange={e => setClientDcDate(e.target.value)} className={f} />
        </div>
        <div>
          <label className={l}>Through</label>
          <input value={through} onChange={e => setThrough(e.target.value)} className={f} />
        </div>
        <div>
          <label className={l}>Inward Date</label>
          <input type="date" value={inwardDate} onChange={e => setInwardDate(e.target.value)} className={f} />
        </div>
        <div>
          <label className={l}>Receive Date</label>
          <input type="date" value={receiveDate} onChange={e => setReceiveDate(e.target.value)} className={f} />
        </div>
        <div>
          <label className={l}>Commit Date</label>
          <input type="date" value={commitDate} onChange={e => setCommitDate(e.target.value)} className={f} />
        </div>
        <div>
          <label className={l}>Calibration Method To Be Used</label>
          <ComboSelect value={calibMethod} onChange={setCalibMethod} options={["Lab Method","Customer Method"]} />
        </div>
        <div>
          <label className={l}>Method Of Reporting</label>
          <ComboSelect value={methodOfReporting} onChange={setMethodOfReporting} options={["Lab Format","Customer Format"]} />
        </div>
        <div>
          <label className={l}>Mode Of Collection</label>
          <ComboSelect value={modeOfCollection} onChange={setModeOfCollection} options={["By Hand","Courier","Email"]} />
        </div>
        <div>
          <label className={l}>Mode Of Dispatch</label>
          <ComboSelect value={modeOfDispatch} onChange={setModeOfDispatch} options={["By Hand","Courier","Email"]} />
        </div>
        <div>
          <label className={l}>Compliance Statement</label>
          <ComboSelect value={compliance} onChange={setCompliance} options={["Required","Not Required"]} />
        </div>
        <div>
          <label className={l}>Decision Rule Discussed &amp; Acceptable</label>
          <ComboSelect value={decisionRule} onChange={setDecisionRule} options={["Yes","No"]} />
        </div>
        <div className="md:col-span-2">
          <label className={l}>Any Specific Requirement</label>
          <input value={anySpecificReq} onChange={e => setAnySpecificReq(e.target.value)} className={f} />
        </div>
        <div>
          <label className={l}>Lab Authorized Person</label>
          <input value={labAuthorizedPerson} onChange={e => setLabAuthorizedPerson(e.target.value)} className={f} />
        </div>
        <div>
          <label className={l}>Designation</label>
          <input value={designation} onChange={e => setDesignation(e.target.value)} className={f} />
        </div>
        <div>
          <label className={l}>Customer Authorized Person</label>
          <input value={customerAuthPerson} onChange={e => setCustomerAuthPerson(e.target.value)} className={f} />
        </div>
        <div>
          <label className={l}>Contact</label>
          <input value={contact} onChange={e => setContact(e.target.value)} className={f} />
        </div>
        <div>
          <label className={l}>Billing Firm</label>
          <ComboSelect value={billingFirm} onChange={setBillingFirm}
            options={["Vikramaditya Calibration","Vikramaditya Enterprises","Central Calibration Lab"]} />
        </div>

      </div>

      <div className="px-5 pb-5 pt-3 border-t border-border flex items-center gap-2">
        <button onClick={() => onSave(collect())} disabled={editingId !== null}
          className="bg-brand-orange text-white text-xs font-medium px-5 py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          Save
        </button>
        <button onClick={() => onUpdate(collect())} disabled={editingId === null}
          className="border border-border text-text-primary text-xs font-medium px-5 py-2 rounded-lg hover:bg-surface-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          Update
        </button>
        <button onClick={onDelete} disabled={editingId === null}
          className="border border-red-200 text-red-600 text-xs font-medium px-5 py-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
          Delete
        </button>
      </div>
    </div>
  );
}
