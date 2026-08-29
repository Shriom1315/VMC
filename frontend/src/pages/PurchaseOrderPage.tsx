import { motion } from "motion/react";
import { useState, useMemo, useEffect } from "react";
import { Printer, FileDown, Plus, Trash2, Save, Eye } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { supabase } from "../lib/supabase";
import { useAuth, can } from "../context/AuthContext";

interface POItem {
  id: string; poCode: string; particular: string; category: string; size: string;
  qty: number; repair: number; calibration: number; discount: number;
}

interface SavedPO {
  id: string; poNumber: string; poDate: string; customerName: string;
  address: string; totalAmount: number; items: any[]; createdAt: string;
}

export default function PurchaseOrderPage() {
  const { user } = useAuth();
  const canSave = user ? can(user.role, "po:write") : false;

  const [poNumber] = useState(`PO-${Math.floor(100000 + Math.random() * 900000)}`);
  const [poDate]   = useState(new Date().toISOString().split("T")[0]);
  const [customerName, setCustomerName] = useState("");
  const [address, setAddress]           = useState("");
  const [clientIdSearch, setClientIdSearch] = useState("");
  const [saveMsg, setSaveMsg] = useState("");
  const [savedList, setSavedList] = useState<SavedPO[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [items, setItems] = useState<POItem[]>([
    { id: "1", poCode: "", particular: "", category: "", size: "", qty: 1, repair: 0, calibration: 0, discount: 0 },
  ]);

  const [quotationsList, setQuotationsList] = useState<any[]>([]);
  const [selectedQuoId, setSelectedQuoId]   = useState<string>("");

  // Fetch available quotations for quick import
  const fetchQuotationsList = async () => {
    const { data } = await supabase
      .from("quotations")
      .select("id, quotation_no, client_name, client_address, items, discount_percent, created_at")
      .order("created_at", { ascending: false })
      .limit(50);
    if (data) setQuotationsList(data);
  };

  useEffect(() => {
    fetchQuotationsList();
  }, []);

  const loadQuotationData = (quo: any) => {
    setCustomerName(quo.client_name ?? "");
    setAddress(quo.client_address ?? "");
    const qItems = Array.isArray(quo.items) ? quo.items : [];
    if (qItems.length > 0) {
      setItems(qItems.map((it: any, idx: number) => ({
        id: String(Date.now() + idx),
        poCode: it.hsn || it.poCode || it.code || "",
        particular: it.desc || it.particular || "",
        category: it.identification || it.category || "",
        size: it.size || "",
        qty: Math.max(1, Number(it.qty) || 1),
        repair: Math.max(0, Number(it.repair) || 0),
        calibration: Math.max(0, Number(it.calib || it.calibration) || 0),
        discount: Math.max(0, Number(quo.discount_percent) || Number(it.discount) || 0),
      })));
    }
    setSaveMsg(`Loaded client & ${qItems.length} items from Quotation ${quo.quotation_no}`);
    setTimeout(() => setSaveMsg(""), 4000);
  };

  const fetchClientDetails = async () => {
    const query = clientIdSearch.trim();
    if (!query) { alert("Please enter a Quotation No / ID or Party ID."); return; }

    // 1. First search in quotations by quotation_no or id
    const { data: quoData } = await supabase
      .from("quotations")
      .select("*")
      .or(`quotation_no.ilike.%${query}%,id.eq.${!isNaN(Number(query)) ? query : 0}`)
      .limit(1);

    if (quoData && quoData.length > 0) {
      loadQuotationData(quoData[0]);
      return;
    }

    // 2. Fallback to parties table if numeric ID
    const numId = parseInt(query);
    if (!isNaN(numId)) {
      const { data: partyData, error } = await supabase
        .from("parties")
        .select("name, address")
        .eq("id", numId)
        .single();

      if (!error && partyData) {
        setCustomerName(partyData.name ?? "");
        setAddress(partyData.address ?? "");
        setSaveMsg(`Loaded client details for Party #${numId}`);
        setTimeout(() => setSaveMsg(""), 3000);
        return;
      }
    }

    alert(`No Quotation or Client found matching "${query}".`);
  };

  const addItem = () =>
    setItems([...items, { id: Date.now().toString(), poCode: "", particular: "", category: "", size: "", qty: 1, repair: 0, calibration: 0, discount: 0 }]);
  const removeItem = (id: string) => { if (items.length > 1) setItems(items.filter(i => i.id !== id)); };
  const updateItem = (id: string, field: keyof POItem, value: string) => {
    setItems(items.map(item => {
      if (item.id !== id) return item;
      if (["qty","repair","calibration","discount"].includes(field))
        return { ...item, [field]: Math.max(0, parseFloat(value) || 0) };
      return { ...item, [field]: value };
    }));
  };

  const calcRate  = (item: POItem) => (item.repair + item.calibration) * (1 - item.discount / 100);
  const calcTotal = (item: POItem) => calcRate(item) * item.qty;

  const summary = useMemo(() =>
    items.reduce((acc, item) => ({ qty: acc.qty + item.qty, total: acc.total + calcTotal(item) }), { qty: 0, total: 0 }),
    [items]
  );

  // ── Fetch saved POs ──
  const fetchSaved = async () => {
    if (!canSave) return;
    setListLoading(true);
    const { data } = await supabase.from("purchase_orders").select("*").order("created_at", { ascending: false });
    setSavedList((data ?? []).map((r: any) => ({
      id: r.id, poNumber: r.po_number, poDate: r.po_date ?? "",
      customerName: r.customer_name ?? "", address: r.address ?? "",
      totalAmount: Number(r.total_amount ?? 0),
      items: Array.isArray(r.items) ? r.items : [],
      createdAt: r.created_at,
    })));
    setListLoading(false);
  };

  useEffect(() => { fetchSaved(); }, [canSave]);

  // ── View saved PO — load into form ──
  const handleViewPO = (po: SavedPO) => {
    setCustomerName(po.customerName);
    setAddress(po.address);
    if (Array.isArray(po.items) && po.items.length > 0) {
      setItems(po.items.map((it: any) => ({
        id: it.id ?? Date.now().toString(),
        poCode: it.poCode ?? "", particular: it.particular ?? "",
        category: it.category ?? "", size: it.size ?? "",
        qty: Number(it.qty ?? 1), repair: Number(it.repair ?? 0),
        calibration: Number(it.calibration ?? 0), discount: Number(it.discount ?? 0),
      })));
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Download saved PO as PDF ──
  const handleDownloadPO = (po: SavedPO) => {
    const prevCustomer = customerName;
    const prevAddress  = address;
    const prevItems    = items;

    setCustomerName(po.customerName);
    setAddress(po.address);
    if (Array.isArray(po.items) && po.items.length > 0) {
      setItems(po.items.map((it: any) => ({
        id: it.id ?? Date.now().toString(),
        poCode: it.poCode ?? "", particular: it.particular ?? "",
        category: it.category ?? "", size: it.size ?? "",
        qty: Number(it.qty ?? 1), repair: Number(it.repair ?? 0),
        calibration: Number(it.calibration ?? 0), discount: Number(it.discount ?? 0),
      })));
    }

    setTimeout(() => {
      exportPDF();
      setCustomerName(prevCustomer);
      setAddress(prevAddress);
      setItems(prevItems);
    }, 100);
  };

  // ── Save PO to DB ──
  const handleSavePO = async () => {
    if (!canSave) return;
    setSaveMsg("");
    const { error } = await supabase.from("purchase_orders").upsert({
      po_number:     poNumber,
      po_date:       poDate || null,
      customer_name: customerName,
      address,
      total_qty:     summary.qty,
      total_amount:  summary.total,
      items,
      created_by:    user?.email ?? "",
    }, { onConflict: "po_number" });
    if (error) { setSaveMsg("Error: " + error.message); }
    else { setSaveMsg("Purchase Order saved successfully."); fetchSaved(); }
    setTimeout(() => setSaveMsg(""), 3000);
  };

  const exportPDF = () => {
    const doc = new jsPDF() as any;
    doc.setFont("helvetica","bold"); doc.setFontSize(20);
    doc.text("Purchase Order", 105, 20, { align:"center" });
    doc.setFont("helvetica","normal"); doc.setFontSize(10);
    doc.text(`PO Number: ${poNumber}`, 20, 35); doc.text(`Date: ${poDate}`, 150, 35);
    doc.text(`Customer: ${customerName}`, 20, 45); doc.text(`Address: ${address}`, 20, 50);
    doc.autoTable({ startY:70, head:[["Code","Particular","Category","Size","Qty","Repair","Calib.","Disc%","Rate","Total"]], body: items.map(item => [item.poCode, item.particular, item.category, item.size, item.qty, item.repair.toFixed(2), item.calibration.toFixed(2), `${item.discount}%`, calcRate(item).toFixed(2), calcTotal(item).toFixed(2)]), theme:"grid", headStyles:{ fillColor:[232,93,4] }, styles:{ fontSize:8 } });
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`Total Qty: ${summary.qty}`, 150, finalY);
    doc.text(`Total: ${summary.total.toFixed(2)}`, 150, finalY + 5);
    doc.save(`${poNumber}.pdf`);
  };

  const labelCls = "block text-xs font-medium text-text-secondary mb-1";
  const inputCls = "w-full bg-white border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-colors";
  const readonlyCls = "w-full bg-surface-muted border border-border rounded-md px-3 py-2 text-sm text-text-secondary cursor-not-allowed font-mono";
  const thCls = "px-3 py-2.5 text-xs font-medium text-text-secondary border-r border-border last:border-r-0";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="w-full px-4 md:px-8 py-6 print:p-0 flex flex-col gap-6"
    >
      {/* Print Header */}
      <div className="hidden print:flex flex-col items-center py-4 border-b-2 border-black mb-4">
        <h1 className="text-2xl font-bold text-black">Vikramaditya Enterprises</h1>
        <p className="text-sm text-black mt-1">A/P Male, Tal. Panhala, Dist. Kolhapur 416122</p>
        <p className="text-xs text-black mt-0.5">Phone: +91 9503601616 | Email: kiranpatil24586@gmail.com</p>
      </div>

      {/* Page header */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Purchase Order</h1>
          <p className="text-xs text-text-secondary mt-0.5">Log and manage purchase orders</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 border border-border text-text-secondary text-xs font-medium px-3 py-2 rounded-lg hover:bg-surface-muted transition-colors">
            <Printer size={13} /> Print
          </button>
          <button onClick={exportPDF} className="inline-flex items-center gap-1.5 bg-brand-orange text-white text-xs font-medium px-3 py-2 rounded-lg hover:bg-orange-700 transition-colors">
            <FileDown size={13} /> Export PDF
          </button>
          {canSave && (
            <button onClick={handleSavePO} className="inline-flex items-center gap-1.5 bg-green-600 text-white text-xs font-medium px-3 py-2 rounded-lg hover:bg-green-700 transition-colors">
              <Save size={13} /> Save PO
            </button>
          )}
        </div>
      </div>
      {saveMsg && (
        <div className={`text-xs rounded-lg px-3 py-2 ${saveMsg.startsWith("Error") ? "bg-red-50 border border-red-200 text-red-700" : "bg-green-50 border border-green-200 text-green-700"}`}>
          {saveMsg}
        </div>
      )}

      <div className="bg-white rounded-xl border border-border shadow-sm print:rounded-none print:border-none print:shadow-none flex flex-col gap-0">
        {/* Header fields */}
        <div className="p-5 md:p-6 border-b border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className={labelCls}>PO Number</label>
              <input value={poNumber} readOnly className={readonlyCls} />
            </div>
            <div>
              <label className={labelCls}>PO Date</label>
              <input type="date" value={poDate} readOnly className={readonlyCls} />
            </div>
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
              <div>
                <label className={labelCls}>Import from Quotation</label>
                <select
                  value={selectedQuoId}
                  onChange={e => {
                    const val = e.target.value;
                    setSelectedQuoId(val);
                    const found = quotationsList.find(q => String(q.id) === val);
                    if (found) loadQuotationData(found);
                  }}
                  className="w-full border border-border rounded-md px-3 py-2 text-xs text-text-primary bg-white focus:outline-none focus:ring-1 focus:ring-brand-orange h-[38px]"
                >
                  <option value="">-- Select Quotation --</option>
                  {quotationsList.map(q => (
                    <option key={q.id} value={q.id}>
                      {q.quotation_no} - {q.client_name} ({Array.isArray(q.items) ? q.items.length : 0} items)
                    </option>
                  ))}
                </select>
              </div>
              <div className="print:hidden">
                <label className={labelCls}>Fetch by Quo No / ID</label>
                <div className="flex h-[38px]">
                  <input
                    value={clientIdSearch}
                    onChange={e => setClientIdSearch(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && fetchClientDetails()}
                    className="flex-1 min-w-0 border border-border border-r-0 rounded-l-md px-3 py-2 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-brand-orange"
                    placeholder="Quo No / ID / Client ID..."
                  />
                  <button
                    onClick={fetchClientDetails}
                    className="bg-gray-800 text-white px-3 text-xs font-medium rounded-r-md hover:bg-gray-700 transition-colors whitespace-nowrap"
                  >
                    Fetch
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className={labelCls}>Customer Name</label>
              <input value={customerName} onChange={e => setCustomerName(e.target.value)} className={inputCls} placeholder="Enter customer name..." />
            </div>
            <div>
              <label className={labelCls}>Customer Address</label>
              <textarea value={address} onChange={e => setAddress(e.target.value)} rows={2} className={`${inputCls} resize-none`} placeholder="Client address..." />
            </div>
          </div>
        </div>

        {/* Items table */}
        <div className="p-5 md:p-6">
          <div className="flex justify-between items-center mb-3 print:hidden">
            <h2 className="text-sm font-semibold text-text-primary">Line Items</h2>
            <button onClick={addItem} className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-orange hover:underline">
              <Plus size={13} /> Add Row
            </button>
          </div>
          <div className="rounded-lg border border-border overflow-x-auto print:rounded-none print:border-black">
            <table className="w-full text-left text-xs min-w-[900px] print:min-w-full">
              <thead className="bg-surface-muted border-b border-border print:bg-white print:border-black">
                <tr>
                  <th className={thCls}>Code</th>
                  <th className={thCls}>Particular</th>
                  <th className={thCls}>Category</th>
                  <th className={thCls}>Size</th>
                  <th className={`${thCls} text-right`}>Qty</th>
                  <th className={`${thCls} text-right`}>Repair</th>
                  <th className={`${thCls} text-right`}>Calib.</th>
                  <th className={`${thCls} text-right`}>Disc %</th>
                  <th className={`${thCls} text-right`}>Rate (₹)</th>
                  <th className={`${thCls} text-right`}>Total (₹)</th>
                  <th className="px-3 py-2.5 w-8 print:hidden" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border print:divide-black">
                {items.map(item => (
                  <tr key={item.id} className="group hover:bg-surface-subtle text-text-primary">
                    <td className="p-0 border-r border-border print:border-black"><input value={item.poCode}      onChange={e => updateItem(item.id,"poCode",e.target.value)}      className="w-full px-3 py-2.5 bg-transparent focus:bg-blue-50 focus:outline-none font-mono text-xs" /></td>
                    <td className="p-0 border-r border-border print:border-black"><input value={item.particular}  onChange={e => updateItem(item.id,"particular",e.target.value)}  className="w-full px-3 py-2.5 bg-transparent focus:bg-blue-50 focus:outline-none text-xs" /></td>
                    <td className="p-0 border-r border-border print:border-black"><input value={item.category}    onChange={e => updateItem(item.id,"category",e.target.value)}    className="w-full px-3 py-2.5 bg-transparent focus:bg-blue-50 focus:outline-none text-xs" /></td>
                    <td className="p-0 border-r border-border print:border-black"><input value={item.size}        onChange={e => updateItem(item.id,"size",e.target.value)}        className="w-full px-3 py-2.5 bg-transparent focus:bg-blue-50 focus:outline-none text-xs" /></td>
                    <td className="p-0 border-r border-border print:border-black"><input type="number" min="1"  value={item.qty}         onChange={e => updateItem(item.id,"qty",e.target.value)}         className="w-full px-3 py-2.5 bg-transparent focus:bg-blue-50 focus:outline-none text-right font-mono text-xs" /></td>
                    <td className="p-0 border-r border-border print:border-black"><input type="number" min="0"  value={item.repair}      onChange={e => updateItem(item.id,"repair",e.target.value)}      className="w-full px-3 py-2.5 bg-transparent focus:bg-blue-50 focus:outline-none text-right font-mono text-xs" /></td>
                    <td className="p-0 border-r border-border print:border-black"><input type="number" min="0"  value={item.calibration} onChange={e => updateItem(item.id,"calibration",e.target.value)} className="w-full px-3 py-2.5 bg-transparent focus:bg-blue-50 focus:outline-none text-right font-mono text-xs" /></td>
                    <td className="p-0 border-r border-border print:border-black"><input type="number" min="0"  value={item.discount}    onChange={e => updateItem(item.id,"discount",e.target.value)}    className="w-full px-3 py-2.5 bg-transparent focus:bg-blue-50 focus:outline-none text-right font-mono text-xs" /></td>
                    <td className="px-3 py-2.5 text-right font-mono text-text-secondary border-r border-border print:border-black">{calcRate(item).toFixed(2)}</td>
                    <td className="px-3 py-2.5 text-right font-mono font-semibold text-text-primary border-r border-border print:border-black">{calcTotal(item).toFixed(2)}</td>
                    <td className="px-2 py-2.5 text-center print:hidden">
                      <button onClick={() => removeItem(item.id)} className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-500 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-surface-muted border-t border-border print:bg-white print:border-black">
                <tr>
                  <td colSpan={4} className="px-3 py-2.5 text-right text-xs font-semibold text-text-secondary border-r border-border print:border-black">Totals</td>
                  <td className="px-3 py-2.5 text-right font-mono font-bold text-text-primary border-r border-border print:border-black">{summary.qty}</td>
                  <td colSpan={4} className="border-r border-border print:border-black" />
                  <td className="px-3 py-2.5 text-right font-mono font-bold text-text-primary border-r border-border print:border-black">
                    {summary.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="print:hidden" />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Print signature */}
        <div className="hidden print:flex flex-row justify-between items-end px-6 pb-8 pt-16">
          <div className="text-center">
            <div className="w-40 border-b border-black mb-1 mx-auto" />
            <p className="text-xs text-black">Prepared By</p>
          </div>
          <div className="text-center">
            <div className="w-40 border-b border-black mb-1 mx-auto" />
            <p className="text-xs text-black">Authorized Signatory</p>
          </div>
        </div>
      </div>

      {/* Saved POs List — admin/manager only */}
      {canSave && (
        <div className="bg-white rounded-xl border border-border shadow-sm print:hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-text-primary">Saved Purchase Orders</h2>
            <p className="text-xs text-text-secondary mt-0.5">{savedList.length} records</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[600px]">
              <thead className="bg-surface-muted border-b border-border">
                <tr>
                  {["PO Number","Customer","Date","Total Amount (₹)","Saved On","Actions"].map((h, i) => (
                    <th key={i} className="px-4 py-2.5 text-xs font-medium text-text-secondary border-r border-border last:border-r-0">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {listLoading ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center"><div className="w-5 h-5 border-2 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
                ) : savedList.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-text-muted">No saved purchase orders yet. Fill the form above and click Save PO.</td></tr>
                ) : savedList.map(po => (
                  <tr key={po.id} className="hover:bg-surface-subtle transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-brand-orange border-r border-border">{po.poNumber}</td>
                    <td className="px-4 py-3 font-medium text-text-primary border-r border-border">{po.customerName || "—"}</td>
                    <td className="px-4 py-3 text-text-secondary border-r border-border">{po.poDate}</td>
                    <td className="px-4 py-3 font-mono font-semibold text-text-primary border-r border-border">₹{po.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-text-secondary border-r border-border">{new Date(po.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 flex items-center gap-2">
                      <button
                        onClick={() => handleViewPO(po)}
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                      >
                        <Eye size={12} /> View
                      </button>
                      <button
                        onClick={() => handleDownloadPO(po)}
                        className="inline-flex items-center gap-1 text-xs text-brand-orange hover:underline"
                      >
                        <FileDown size={12} /> PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}
