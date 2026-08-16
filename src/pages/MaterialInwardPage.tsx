import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Plus, Search, ChevronRight, Printer } from "lucide-react";
import { supabase } from "../lib/supabase";
import ExportToolbar, { ColumnDef } from "../components/ExportToolbar";
import InwardBillForm from "./inward/InwardBillForm";
import InwardItemForm from "./inward/InwardItemForm";
import InwardChallan from "./inward/InwardChallan";
import CreateJobModal from "./inward/CreateJobModal";
import { InwardBill, InwardItem, EMPTY_BILL, EMPTY_ITEM } from "./inward/types";

// ─── View modes ───────────────────────────────────────────────
type View = "list" | "items" | "edit_item" | "challan";

// ─── Column defs for export ───────────────────────────────────
const BILL_COLS: ColumnDef[] = [
  { key: "id",              label: "ID" },
  { key: "clientName",      label: "Client Name" },
  { key: "billingTo",       label: "Billing To" },
  { key: "deliveryTo",      label: "Delivery To" },
  { key: "clientDcNo",      label: "DC No" },
  { key: "clientDcDate",    label: "DC Date" },
  { key: "calibMethod",     label: "Calibration Method" },
  { key: "modeOfCollection",label: "Collection Mode" },
];

const ITEM_COLS: ColumnDef[] = [
  { key: "labId",           label: "Lab ID" },
  { key: "gaugeName",       label: "Name" },
  { key: "identificationNo",label: "Identification No" },
  { key: "specification",   label: "Specification" },
  { key: "manuSrNo",        label: "Manu.Sr." },
  { key: "process",         label: "Process" },
];

export default function MaterialInwardPage() {
  // ── View state ──
  const [view,           setView]           = useState<View>("list");
  const [showForm,       setShowForm]       = useState(false);
  const [activeBillId,   setActiveBillId]   = useState<number | null>(null);
  const [expandedRow,    setExpandedRow]    = useState<number | null>(null);

  // ── Bills state ──
  const [bills,          setBills]          = useState<InwardBill[]>([]);
  const [billForm,       setBillForm]       = useState<Omit<InwardBill,"id">>(EMPTY_BILL);
  const [editingBillId,  setEditingBillId]  = useState<number | null>(null);
  const [billSearch,     setBillSearch]     = useState("");
  const [billPage,       setBillPage]       = useState(1);
  const [billVisibleCols,setBillVisibleCols]= useState(BILL_COLS.map(c => c.key));
  const [billLoading,    setBillLoading]    = useState(true);
  const [billError,      setBillError]      = useState<string | null>(null);

  // ── Items state ──
  const [items,          setItems]          = useState<InwardItem[]>([]);
  const [itemForm,       setItemForm]       = useState<Omit<InwardItem,"id"|"inwardBillId">>(EMPTY_ITEM);
  const [editingItemId,  setEditingItemId]  = useState<number | null>(null);
  const [itemSearch,     setItemSearch]     = useState("");
  const [itemPage,       setItemPage]       = useState(1);
  const [itemVisibleCols,setItemVisibleCols]= useState(ITEM_COLS.map(c => c.key));
  const [itemLoading,    setItemLoading]    = useState(false);
  const [itemError,      setItemError]      = useState<string | null>(null);

  // ── Master data ──
  const [partyNames,     setPartyNames]     = useState<string[]>([]);
  const [gaugeNames,     setGaugeNames]     = useState<string[]>([]);
  const [partyAddressMap, setPartyAddressMap] = useState<Record<string, string>>({});

  // ── Job modal ──
  const [jobModalItem,   setJobModalItem]   = useState<InwardItem | null>(null);

  const ROWS = 10;

  // ── Fetch master data ──
  useEffect(() => {
    supabase.from("parties").select("name, address").order("name").then(({ data }) => {
      setPartyNames((data ?? []).map((r: any) => r.name));
      const addrMap: Record<string, string> = {};
      (data ?? []).forEach((r: any) => { addrMap[r.name] = r.address ?? ""; });
      setPartyAddressMap(addrMap);
    });
    supabase.from("gauges").select("gauge_name").order("gauge_name").then(({ data }) => {
      setGaugeNames((data ?? []).map((r: any) => r.gauge_name));
    });
  }, []);

  // ── Fetch bills ──
  const fetchBills = async () => {
    setBillLoading(true); setBillError(null);
    const { data, error } = await supabase.from("inward_bills").select("*").order("id");
    if (error) { setBillError(error.message); }
    else {
      setBills((data ?? []).map((r: any) => ({
        id: r.id, clientName: r.client_name, billingTo: r.billing_to,
        deliveryTo: r.delivery_to, otherAccessTo: r.other_access_to,
        clientDcNo: r.client_dc_no, clientDcDate: r.client_dc_date ?? "",
        through: r.through, inwardDate: r.inward_date ?? "",
        receiveDate: r.receive_date ?? "", commitDate: r.commit_date ?? "",
        calibMethod: r.calib_method, methodOfReporting: r.method_of_reporting,
        modeOfCollection: r.mode_of_collection, modeOfDispatch: r.mode_of_dispatch,
        compliance: r.compliance, decisionRule: r.decision_rule,
        anySpecificReq: r.any_specific_req, labAuthorizedPerson: r.lab_authorized_person,
        designation: r.designation, customerAuthPerson: r.customer_auth_person,
        contact: r.contact, billingFirm: r.billing_firm,
      })));
    }
    setBillLoading(false);
  };

  useEffect(() => { fetchBills(); }, []);

  // ── Fetch items for a bill ──
  const fetchItems = async (billId: number) => {
    setItemLoading(true); setItemError(null);
    const { data, error } = await supabase.from("inward_items").select("*").eq("inward_bill_id", billId).order("id");
    if (error) { setItemError(error.message); }
    else {
      setItems((data ?? []).map((r: any) => ({
        id: r.id, inwardBillId: r.inward_bill_id,
        gaugeName: r.gauge_name, class: r.class, gaugeType: r.gauge_type,
        identificationNo: r.identification_no, calibFrequency: r.calib_frequency,
        make: r.make, manuSrNo: r.manu_sr_no, process: r.process, unit: r.unit,
        calibLocation: r.calib_location, calibUnder: r.calib_under,
        gaugeCondition: r.gauge_condition, method: r.method,
        size: r.size, upperTolerance: r.upper_tolerance, lowerTolerance: r.lower_tolerance,
        specification: r.specification,
        parameters: Array.isArray(r.parameters) ? r.parameters : [],
        labId: r.lab_id ?? "",
      })));
    }
    setItemLoading(false);
  };

  // ── Bill CRUD ──
  const handleBillSave = async () => {
    if (!billForm.clientName) return;
    const payload = {
      client_name: billForm.clientName, billing_to: billForm.billingTo,
      delivery_to: billForm.deliveryTo, other_access_to: billForm.otherAccessTo,
      client_dc_no: billForm.clientDcNo, client_dc_date: billForm.clientDcDate || null,
      through: billForm.through, inward_date: billForm.inwardDate || null,
      receive_date: billForm.receiveDate || null, commit_date: billForm.commitDate || null,
      calib_method: billForm.calibMethod, method_of_reporting: billForm.methodOfReporting,
      mode_of_collection: billForm.modeOfCollection, mode_of_dispatch: billForm.modeOfDispatch,
      compliance: billForm.compliance, decision_rule: billForm.decisionRule,
      any_specific_req: billForm.anySpecificReq, lab_authorized_person: billForm.labAuthorizedPerson,
      designation: billForm.designation, customer_auth_person: billForm.customerAuthPerson,
      contact: billForm.contact, billing_firm: billForm.billingFirm,
    };
    const { data, error } = await supabase.from("inward_bills").insert(payload).select("id").single();
    if (error) { setBillError(error.message); return; }
    // ── Auto-navigate to items view for the new bill ──
    const newBillId = data?.id as number;
    setBillForm(EMPTY_BILL); setShowForm(false);
    await fetchBills();
    setActiveBillId(newBillId);
    setItemForm(EMPTY_ITEM);
    setEditingItemId(null);
    await fetchItems(newBillId);
    setView("items");
  };

  const handleBillUpdate = async () => {
    if (editingBillId === null) return;
    const payload = {
      client_name: billForm.clientName, billing_to: billForm.billingTo,
      delivery_to: billForm.deliveryTo, other_access_to: billForm.otherAccessTo,
      client_dc_no: billForm.clientDcNo, client_dc_date: billForm.clientDcDate || null,
      through: billForm.through, inward_date: billForm.inwardDate || null,
      receive_date: billForm.receiveDate || null, commit_date: billForm.commitDate || null,
      calib_method: billForm.calibMethod, method_of_reporting: billForm.methodOfReporting,
      mode_of_collection: billForm.modeOfCollection, mode_of_dispatch: billForm.modeOfDispatch,
      compliance: billForm.compliance, decision_rule: billForm.decisionRule,
      any_specific_req: billForm.anySpecificReq, lab_authorized_person: billForm.labAuthorizedPerson,
      designation: billForm.designation, customer_auth_person: billForm.customerAuthPerson,
      contact: billForm.contact, billing_firm: billForm.billingFirm,
    };
    const { error } = await supabase.from("inward_bills").update(payload).eq("id", editingBillId);
    if (error) { setBillError(error.message); return; }
    setBillForm(EMPTY_BILL); setEditingBillId(null); setShowForm(false); fetchBills();
  };

  const handleBillDelete = async () => {
    if (editingBillId === null) return;
    const { error } = await supabase.from("inward_bills").delete().eq("id", editingBillId);
    if (error) { setBillError(error.message); return; }
    setBillForm(EMPTY_BILL); setEditingBillId(null); setShowForm(false); fetchBills();
  };

  const handleBillEdit = (bill: InwardBill) => {
    setEditingBillId(bill.id);
    setBillForm({ clientName: bill.clientName, billingTo: bill.billingTo, deliveryTo: bill.deliveryTo, otherAccessTo: bill.otherAccessTo, clientDcNo: bill.clientDcNo, clientDcDate: bill.clientDcDate, through: bill.through, inwardDate: bill.inwardDate, receiveDate: bill.receiveDate, commitDate: bill.commitDate, calibMethod: bill.calibMethod, methodOfReporting: bill.methodOfReporting, modeOfCollection: bill.modeOfCollection, modeOfDispatch: bill.modeOfDispatch, compliance: bill.compliance, decisionRule: bill.decisionRule, anySpecificReq: bill.anySpecificReq, labAuthorizedPerson: bill.labAuthorizedPerson, designation: bill.designation, customerAuthPerson: bill.customerAuthPerson, contact: bill.contact, billingFirm: bill.billingFirm });
    setShowForm(true);
  };

  // ── Item CRUD ──
  const handleItemSave = async () => {
    if (!itemForm.gaugeName || activeBillId === null) return;
    const payload = {
      inward_bill_id: activeBillId, gauge_name: itemForm.gaugeName,
      class: itemForm.class, gauge_type: itemForm.gaugeType,
      identification_no: itemForm.identificationNo, calib_frequency: itemForm.calibFrequency,
      make: itemForm.make, manu_sr_no: itemForm.manuSrNo, process: itemForm.process,
      unit: itemForm.unit, calib_location: itemForm.calibLocation, calib_under: itemForm.calibUnder,
      gauge_condition: itemForm.gaugeCondition, method: itemForm.method,
      size: itemForm.size, upper_tolerance: itemForm.upperTolerance, lower_tolerance: itemForm.lowerTolerance,
      specification: itemForm.specification, parameters: itemForm.parameters,
      lab_id: itemForm.labId,
    };
    const { error } = await supabase.from("inward_items").insert(payload);
    if (error) { setItemError(error.message); return; }
    setItemForm(EMPTY_ITEM); setView("items"); fetchItems(activeBillId);
  };

  const handleItemUpdate = async () => {
    if (editingItemId === null || activeBillId === null) return;
    const payload = {
      gauge_name: itemForm.gaugeName, class: itemForm.class, gauge_type: itemForm.gaugeType,
      identification_no: itemForm.identificationNo, calib_frequency: itemForm.calibFrequency,
      make: itemForm.make, manu_sr_no: itemForm.manuSrNo, process: itemForm.process,
      unit: itemForm.unit, calib_location: itemForm.calibLocation, calib_under: itemForm.calibUnder,
      gauge_condition: itemForm.gaugeCondition, method: itemForm.method,
      size: itemForm.size, upper_tolerance: itemForm.upperTolerance, lower_tolerance: itemForm.lowerTolerance,
      specification: itemForm.specification, parameters: itemForm.parameters,
    };
    const { error } = await supabase.from("inward_items").update(payload).eq("id", editingItemId);
    if (error) { setItemError(error.message); return; }
    setItemForm(EMPTY_ITEM); setEditingItemId(null); setView("items"); fetchItems(activeBillId);
  };

  const handleItemDelete = async (itemId: number) => {
    if (activeBillId === null) return;
    const { error } = await supabase.from("inward_items").delete().eq("id", itemId);
    if (error) { setItemError(error.message); return; }
    fetchItems(activeBillId);
  };

  const handleItemEdit = (item: InwardItem) => {
    setEditingItemId(item.id);
    setItemForm({ gaugeName: item.gaugeName, class: item.class, gaugeType: item.gaugeType, identificationNo: item.identificationNo, calibFrequency: item.calibFrequency, make: item.make, manuSrNo: item.manuSrNo, process: item.process, unit: item.unit, calibLocation: item.calibLocation, calibUnder: item.calibUnder, gaugeCondition: item.gaugeCondition, method: item.method, size: item.size, upperTolerance: item.upperTolerance, lowerTolerance: item.lowerTolerance, specification: item.specification, parameters: item.parameters, labId: item.labId });
    setView("edit_item");
  };

  const handleViewData = (bill: InwardBill) => {
    setActiveBillId(bill.id);
    setItemForm(EMPTY_ITEM);
    setEditingItemId(null);
    setShowForm(false);
    setExpandedRow(null);
    fetchItems(bill.id);
    setView("items");
  };

  // ── Print Challan — fetch items then switch to challan view ──
  const handlePrintChallan = async (bill: InwardBill) => {
    setActiveBillId(bill.id);
    setShowForm(false);
    setExpandedRow(null);
    await fetchItems(bill.id);
    setView("challan");
    setTimeout(() => window.print(), 300);
  };

  // ── Filtered / paginated bills ──
  const filteredBills = bills.filter(b =>
    [b.clientName, b.billingTo, b.deliveryTo, b.clientDcNo].some(v =>
      (v ?? "").toLowerCase().includes(billSearch.toLowerCase())
    )
  );
  const totalBillPages = Math.ceil(filteredBills.length / ROWS);
  const paginatedBills = filteredBills.slice((billPage - 1) * ROWS, billPage * ROWS);
  const billExportData = filteredBills.map(b => ({ id: b.id, clientName: b.clientName, billingTo: b.billingTo, deliveryTo: b.deliveryTo, clientDcNo: b.clientDcNo, clientDcDate: b.clientDcDate, calibMethod: b.calibMethod, modeOfCollection: b.modeOfCollection }));

  // ── Filtered / paginated items ──
  const filteredItems = items.filter(it =>
    [it.gaugeName, it.identificationNo, it.process, it.labId].some(v =>
      (v ?? "").toLowerCase().includes(itemSearch.toLowerCase())
    )
  );
  const totalItemPages = Math.ceil(filteredItems.length / ROWS);
  const paginatedItems = filteredItems.slice((itemPage - 1) * ROWS, itemPage * ROWS);
  const itemExportData = filteredItems.map(it => ({ labId: it.labId, gaugeName: it.gaugeName, identificationNo: it.identificationNo, specification: it.specification, manuSrNo: it.manuSrNo, process: it.process }));

  const activeBill = bills.find(b => b.id === activeBillId);

  // ── Render: Challan print view ──
  if (view === "challan" && activeBill) {
    return (
      <div>
        {/* Screen toolbar — hidden when printing */}
        <div className="print:hidden p-4 flex items-center gap-3 border-b border-border bg-white">
          <button
            onClick={() => setView("list")}
            className="border border-border text-text-secondary text-xs font-medium px-4 py-2 rounded-lg hover:bg-surface-muted transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={() => window.print()}
            className="bg-brand-orange text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors inline-flex items-center gap-1.5"
          >
            <Printer size={13} /> Print / Save PDF
          </button>
          <span className="text-xs text-text-secondary">Inward Challan — {activeBill.clientName}</span>
        </div>
        <InwardChallan
          bill={activeBill}
          items={items}
          clientAddress={partyAddressMap[activeBill.clientName] ?? ""}
        />
      </div>
    );
  }

  // ── Render: Items view ──
  if (view === "items" || view === "edit_item") {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="w-full flex flex-col gap-6">

        {/* Job Card modal */}
        {jobModalItem && activeBill && (
          <CreateJobModal
            bill={activeBill}
            item={jobModalItem}
            onClose={() => setJobModalItem(null)}
            onSaved={() => { setJobModalItem(null); }}
          />
        )}
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <button onClick={() => { setView("list"); setActiveBillId(null); }} className="hover:text-brand-orange transition-colors">Material Inward</button>
          <ChevronRight size={12} />
          <span className="text-text-primary font-medium">{activeBill?.clientName ?? "Inward Bill"}</span>
          {view === "edit_item" && <><ChevronRight size={12} /><span className="text-text-primary font-medium">Edit Item</span></>}
        </div>

        {itemError && <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2.5">{itemError}</div>}

        {/* Item form */}
        <InwardItemForm
          form={itemForm}
          editingItemId={editingItemId}
          gaugeNames={gaugeNames}
          onChange={(field, value) => setItemForm(prev => ({ ...prev, [field]: value }))}
          onSave={handleItemSave}
          onUpdate={handleItemUpdate}
          onBack={() => { setView("list"); setActiveBillId(null); setEditingItemId(null); setItemForm(EMPTY_ITEM); }}
        />

        {/* Items table */}
        <div className="bg-white rounded-xl border border-border shadow-sm">
          <div className="px-5 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-text-primary">Total Items</h2>
              <p className="text-xs text-text-secondary mt-0.5">{filteredItems.length} records</p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <ExportToolbar data={itemExportData} columns={ITEM_COLS} filename="inward-items" visibleColumns={itemVisibleCols} onVisibilityChange={setItemVisibleCols} />
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
                <input value={itemSearch} onChange={e => { setItemSearch(e.target.value); setItemPage(1); }} className="border border-border rounded-md text-xs pl-7 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-orange w-40" placeholder="Search..." />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[900px]">
              <thead className="bg-surface-muted border-b border-border">
                <tr>
                  {ITEM_COLS.filter(c => itemVisibleCols.includes(c.key)).map(col => (
                    <th key={col.key} className="px-4 py-2.5 text-xs font-medium text-text-secondary border-r border-border">{col.label} ↕</th>
                  ))}
                  <th className="px-4 py-2.5 text-xs font-medium text-text-secondary">Manage ↕</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {itemLoading ? (
                  <tr><td colSpan={ITEM_COLS.length + 1} className="px-4 py-10 text-center"><div className="w-5 h-5 border-2 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
                ) : paginatedItems.length === 0 ? (
                  <tr><td colSpan={ITEM_COLS.length + 1} className="px-4 py-10 text-center text-text-muted">No items found. Add items using the form above.</td></tr>
                ) : paginatedItems.map(it => (
                  <tr key={it.id} className="hover:bg-surface-subtle transition-colors">
                    {itemVisibleCols.includes("labId")            && <td className="px-4 py-3 font-mono font-semibold text-brand-orange border-r border-border">{it.labId || it.id}</td>}
                    {itemVisibleCols.includes("gaugeName")        && <td className="px-4 py-3 font-medium text-text-primary border-r border-border">{it.gaugeName}</td>}
                    {itemVisibleCols.includes("identificationNo") && <td className="px-4 py-3 font-mono text-text-secondary border-r border-border">{it.identificationNo}</td>}
                    {itemVisibleCols.includes("specification")    && <td className="px-4 py-3 text-text-secondary border-r border-border">{it.specification || "Range -,-,-"}</td>}
                    {itemVisibleCols.includes("manuSrNo")         && <td className="px-4 py-3 font-mono text-text-secondary border-r border-border">{it.manuSrNo}</td>}
                    {itemVisibleCols.includes("process")          && <td className="px-4 py-3 text-text-secondary border-r border-border">{it.process}</td>}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1 w-24">
                        <button
                          onClick={() => setJobModalItem(it)}
                          className="bg-brand-orange text-white text-[11px] font-medium px-3 py-1 rounded hover:bg-orange-700 transition-colors text-center"
                        >
                          Job Card
                        </button>
                        <button className="bg-blue-500 text-white text-[11px] font-medium px-3 py-1 rounded hover:bg-blue-600 transition-colors text-center">Tag</button>
                        <button className="bg-blue-600 text-white text-[11px] font-medium px-3 py-1 rounded hover:bg-blue-700 transition-colors text-center">Datasheet</button>
                        <button onClick={() => handleItemEdit(it)} className="bg-gray-600 text-white text-[11px] font-medium px-3 py-1 rounded hover:bg-gray-700 transition-colors text-center">Edit</button>
                        <button onClick={() => handleItemDelete(it.id)} className="bg-red-500 text-white text-[11px] font-medium px-3 py-1 rounded hover:bg-red-600 transition-colors text-center">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-border flex items-center justify-between text-xs text-text-secondary">
            <span>Showing {filteredItems.length === 0 ? 0 : (itemPage - 1) * ROWS + 1} to {Math.min(itemPage * ROWS, filteredItems.length)} of {filteredItems.length} entries</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setItemPage(p => Math.max(1, p - 1))} disabled={itemPage === 1} className="px-3 py-1 border border-border rounded hover:bg-surface-muted disabled:opacity-40 transition-colors">Previous</button>
              {Array.from({ length: Math.min(totalItemPages, 5) }, (_, i) => i + 1).map(pg => (
                <button key={pg} onClick={() => setItemPage(pg)} className={`px-3 py-1 border rounded transition-colors ${itemPage === pg ? "bg-brand-orange text-white border-brand-orange" : "border-border hover:bg-surface-muted"}`}>{pg}</button>
              ))}
              <button onClick={() => setItemPage(p => Math.min(totalItemPages, p + 1))} disabled={itemPage === totalItemPages || totalItemPages === 0} className="px-3 py-1 border border-border rounded hover:bg-surface-muted disabled:opacity-40 transition-colors">Next</button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // ── Render: List view (default) ──
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="w-full flex flex-col gap-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Material Inward</h1>
          <p className="text-xs text-text-secondary mt-0.5">Inward Bill / Challan Master</p>
        </div>
        <button onClick={() => { setBillForm(EMPTY_BILL); setEditingBillId(null); setShowForm(v => !v); }}
          className="inline-flex items-center gap-1.5 bg-brand-orange text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
          <Plus size={13} /> New Inward
        </button>
      </div>

      {billError && <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2.5">{billError}</div>}

      {/* Inward Bill Form */}
      {showForm && (
        <InwardBillForm
          form={billForm}
          editingId={editingBillId}
          partyNames={partyNames}
          onChange={(field, value) => setBillForm(prev => ({ ...prev, [field]: value }))}
          onSave={handleBillSave}
          onUpdate={handleBillUpdate}
          onDelete={handleBillDelete}
          onCancel={() => { setShowForm(false); setBillForm(EMPTY_BILL); setEditingBillId(null); }}
        />
      )}

      {/* Bills table */}
      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="px-5 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Total Inward</h2>
            <p className="text-xs text-text-secondary mt-0.5">{filteredBills.length} records</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <ExportToolbar data={billExportData} columns={BILL_COLS} filename="inward-bills" visibleColumns={billVisibleCols} onVisibilityChange={setBillVisibleCols} />
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <input value={billSearch} onChange={e => { setBillSearch(e.target.value); setBillPage(1); }} className="border border-border rounded-md text-xs pl-7 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-orange w-40" placeholder="Search..." />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[900px]">
            <thead className="bg-surface-muted border-b border-border">
              <tr>
                <th className="px-4 py-2.5 text-xs font-medium text-text-secondary border-r border-border w-8" />
                {BILL_COLS.filter(c => billVisibleCols.includes(c.key)).map(col => (
                  <th key={col.key} className="px-4 py-2.5 text-xs font-medium text-text-secondary border-r border-border">
                    <span className="flex items-center gap-1">{col.label} <span className="text-text-muted">↕</span></span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {billLoading ? (
                <tr><td colSpan={BILL_COLS.length + 1} className="px-4 py-10 text-center"><div className="w-5 h-5 border-2 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : paginatedBills.length === 0 ? (
                <tr><td colSpan={BILL_COLS.length + 1} className="px-4 py-10 text-center text-text-muted">No inward records found. Click + New Inward to create one.</td></tr>
              ) : paginatedBills.map(bill => (
                <>
                  <tr key={bill.id} className={`border-b border-border hover:bg-surface-subtle transition-colors ${expandedRow === bill.id ? "bg-surface-subtle" : ""}`}>
                    {/* Expand toggle */}
                    <td className="px-4 py-3 border-r border-border text-center">
                      <button onClick={() => setExpandedRow(expandedRow === bill.id ? null : bill.id)}
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold transition-colors ${expandedRow === bill.id ? "bg-red-500" : "bg-blue-500 hover:bg-blue-600"}`}>
                        {expandedRow === bill.id ? "−" : "+"}
                      </button>
                    </td>
                    {billVisibleCols.includes("id")               && <td className="px-4 py-3 font-mono font-semibold text-brand-orange border-r border-border">{bill.id}</td>}
                    {billVisibleCols.includes("clientName")       && <td className="px-4 py-3 font-medium text-text-primary border-r border-border max-w-[160px]">{bill.clientName}</td>}
                    {billVisibleCols.includes("billingTo")        && <td className="px-4 py-3 text-text-secondary border-r border-border max-w-[160px]">{bill.billingTo}</td>}
                    {billVisibleCols.includes("deliveryTo")       && <td className="px-4 py-3 text-text-secondary border-r border-border max-w-[160px]">{bill.deliveryTo}</td>}
                    {billVisibleCols.includes("clientDcNo")       && <td className="px-4 py-3 font-mono text-text-secondary border-r border-border">{bill.clientDcNo}</td>}
                    {billVisibleCols.includes("clientDcDate")     && <td className="px-4 py-3 text-text-secondary border-r border-border">{bill.clientDcDate}</td>}
                    {billVisibleCols.includes("calibMethod")      && <td className="px-4 py-3 text-text-secondary border-r border-border">{bill.calibMethod}</td>}
                    {billVisibleCols.includes("modeOfCollection") && <td className="px-4 py-3 text-text-secondary border-r border-border">{bill.modeOfCollection}</td>}
                  </tr>

                  {/* Expanded row */}
                  {expandedRow === bill.id && (
                    <tr key={`exp-${bill.id}`} className="border-b border-border bg-surface-subtle/60">
                      <td colSpan={BILL_COLS.filter(c => billVisibleCols.includes(c.key)).length + 1} className="px-6 py-4">
                        <div className="flex flex-wrap gap-6 text-xs text-text-secondary mb-3">
                          <span><span className="font-medium text-text-primary">Dispatch Mode</span> {bill.modeOfDispatch}</span>
                          <span><span className="font-medium text-text-primary">Lab Person</span> {bill.labAuthorizedPerson || "—"}</span>
                          <span><span className="font-medium text-text-primary">Inward Date</span> {bill.inwardDate}</span>
                          <span><span className="font-medium text-text-primary">Billing Firm</span> {bill.billingFirm}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-text-secondary">Action</span>
                          <button onClick={() => handleBillEdit(bill)}
                            className="bg-blue-500 text-white text-xs font-medium px-4 py-1.5 rounded hover:bg-blue-600 transition-colors">
                            Edit
                          </button>
                          <button onClick={() => handleViewData(bill)}
                            className="bg-red-500 text-white text-xs font-medium px-4 py-1.5 rounded hover:bg-red-600 transition-colors">
                            View Data
                          </button>
                          <button
                            onClick={() => handlePrintChallan(bill)}
                            className="inline-flex items-center gap-1.5 bg-brand-orange text-white text-xs font-medium px-4 py-1.5 rounded hover:bg-orange-700 transition-colors"
                          >
                            <Printer size={12} /> Print Challan
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-border flex items-center justify-between text-xs text-text-secondary">
          <span>Showing {filteredBills.length === 0 ? 0 : (billPage - 1) * ROWS + 1} to {Math.min(billPage * ROWS, filteredBills.length)} of {filteredBills.length} entries</span>
          <div className="flex items-center gap-1">
            <button onClick={() => setBillPage(p => Math.max(1, p - 1))} disabled={billPage === 1} className="px-3 py-1 border border-border rounded hover:bg-surface-muted disabled:opacity-40 transition-colors">Previous</button>
            {Array.from({ length: Math.min(totalBillPages, 5) }, (_, i) => i + 1).map(pg => (
              <button key={pg} onClick={() => setBillPage(pg)} className={`px-3 py-1 border rounded transition-colors ${billPage === pg ? "bg-brand-orange text-white border-brand-orange" : "border-border hover:bg-surface-muted"}`}>{pg}</button>
            ))}
            <button onClick={() => setBillPage(p => Math.min(totalBillPages, p + 1))} disabled={billPage === totalBillPages || totalBillPages === 0} className="px-3 py-1 border border-border rounded hover:bg-surface-muted disabled:opacity-40 transition-colors">Next</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
