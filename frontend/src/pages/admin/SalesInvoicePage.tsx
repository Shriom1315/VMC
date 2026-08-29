import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Plus, Search, Printer, X } from "lucide-react";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { supabase } from "../../lib/supabase";

interface Invoice {
  id: string; invoiceNo: string; party: string; dcRef: string; invoiceDate: string;
  amount: number; gstAmount: number; total: number;
  status: "draft" | "issued" | "paid" | "overdue";
}

const STATUS_COLOR = {
  draft:   "bg-gray-100 text-gray-600",
  issued:  "bg-blue-100 text-blue-700",
  paid:    "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-700",
};

const GST_RATE = 0.18;

function printInvoicePDF(inv: Invoice) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" }) as any;
  const pageW = 210, marginL = 15, marginR = 15;

  doc.setFont("helvetica", "bold"); doc.setFontSize(16);
  doc.text("VIKRAMADITYA METROLOGY CENTRE LLP", pageW / 2, 18, { align: "center" });
  doc.setFont("helvetica", "normal"); doc.setFontSize(8);
  doc.text("Plot No. A-15/1, Near Ultratech MIDC Shiroli (P), Tal. Hatkanagale, Dist Kolhapur 416122", pageW / 2, 24, { align: "center" });
  doc.text("Contact: 9503601616 | Email: vmcindialab@gmail.com", pageW / 2, 28, { align: "center" });

  doc.setFont("helvetica", "bold"); doc.setFontSize(13);
  doc.text("TAX INVOICE", pageW / 2, 36, { align: "center" });
  doc.line(marginL, 38, pageW - marginR, 38);

  doc.setFont("helvetica", "normal"); doc.setFontSize(9);
  doc.text(`Invoice No: ${inv.invoiceNo}`, marginL, 44);
  doc.text(`Date: ${inv.invoiceDate}`, pageW - marginR, 44, { align: "right" });
  doc.text(`Party: ${inv.party}`, marginL, 50);
  doc.text(`DC Ref: ${inv.dcRef}`, marginL, 56);
  doc.text(`Status: ${inv.status.toUpperCase()}`, pageW - marginR, 50, { align: "right" });
  doc.line(marginL, 60, pageW - marginR, 60);

  doc.autoTable({
    startY: 64,
    head: [["Description", "Taxable Amount (₹)", "GST @ 18% (₹)", "Total (₹)"]],
    body: [["Calibration / Repair Services", inv.amount.toFixed(2), inv.gstAmount.toFixed(2), inv.total.toFixed(2)]],
    theme: "grid",
    margin: { left: marginL, right: marginR },
    headStyles: { fillColor: [232, 93, 4], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    columnStyles: { 1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right" } },
  });

  const finalY = doc.lastAutoTable.finalY + 6;
  doc.setFont("helvetica", "bold"); doc.setFontSize(10);
  doc.text(`Total Amount: ₹${inv.total.toLocaleString()}`, pageW - marginR, finalY, { align: "right" });
  doc.setFont("helvetica", "normal"); doc.setFontSize(8);
  doc.text("This is a computer-generated invoice.", pageW / 2, finalY + 20, { align: "center" });
  doc.save(`Invoice_${inv.invoiceNo}.pdf`);
}

export default function SalesInvoicePage() {
  const [invoices,   setInvoices]   = useState<Invoice[]>([]);
  const [search,     setSearch]     = useState("");
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [showForm,   setShowForm]   = useState(false);
  const [editingId,  setEditingId]  = useState<string | null>(null);

  // Dropdown data
  const [partyNames,   setPartyNames]   = useState<string[]>([]);
  const [dispatchNos,  setDispatchNos]  = useState<string[]>([]);

  // Form state
  const [invoiceNo,    setInvoiceNo]    = useState("");
  const [party,        setParty]        = useState("");
  const [dcRef,        setDcRef]        = useState("");
  const [invoiceDate,  setInvoiceDate]  = useState(new Date().toISOString().split("T")[0]);
  const [amount,       setAmount]       = useState("");
  const [status,       setStatus]       = useState<Invoice["status"]>("draft");

  const gstAmount  = Math.round((parseFloat(amount) || 0) * GST_RATE * 100) / 100;
  const total      = (parseFloat(amount) || 0) + gstAmount;

  const fetchInvoices = async () => {
    setLoading(true); setError(null);
    const { data, error: err } = await supabase.from("invoices").select("*").order("invoice_date", { ascending: false });
    if (err) { setError(err.message); }
    else {
      setInvoices((data ?? []).map((r: any) => ({
        id: String(r.id), invoiceNo: r.invoice_no ?? "", party: r.party ?? "",
        dcRef: r.dc_ref ?? "—", invoiceDate: r.invoice_date ?? "",
        amount: Number(r.amount ?? 0), gstAmount: Number(r.gst_amount ?? 0),
        total: Number(r.total ?? 0), status: r.status ?? "draft",
      })));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchInvoices();
    supabase.from("parties").select("name").order("name").then(({ data }) =>
      setPartyNames((data ?? []).map((r: any) => r.name))
    );
    supabase.from("dispatches").select("dc_no").order("dispatch_date", { ascending: false }).then(({ data }) =>
      setDispatchNos((data ?? []).map((r: any) => r.dc_no).filter(Boolean))
    );
  }, []);

  const resetForm = () => {
    setInvoiceNo(""); setParty(""); setDcRef(""); setAmount("");
    setInvoiceDate(new Date().toISOString().split("T")[0]);
    setStatus("draft"); setEditingId(null);
  };

  const buildPayload = () => ({
    invoice_no:   invoiceNo,
    party,
    dc_ref:       dcRef,
    invoice_date: invoiceDate || null,
    amount:       parseFloat(amount) || 0,
    gst_amount:   gstAmount,
    total,
    status,
  });

  const handleSave = async () => {
    if (!invoiceNo.trim() || !party.trim()) { setError("Invoice No. and Party are required."); return; }
    setError(null);
    const { error: err } = await supabase.from("invoices").insert(buildPayload());
    if (err) { setError(err.message); return; }
    resetForm(); setShowForm(false); fetchInvoices();
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    setError(null);
    const { error: err } = await supabase.from("invoices").update(buildPayload()).eq("id", editingId);
    if (err) { setError(err.message); return; }
    resetForm(); setShowForm(false); fetchInvoices();
  };

  const handleDelete = async () => {
    if (!editingId) return;
    const { error: err } = await supabase.from("invoices").delete().eq("id", editingId);
    if (err) { setError(err.message); return; }
    resetForm(); setShowForm(false); fetchInvoices();
  };

  const handleEdit = (inv: Invoice) => {
    setEditingId(inv.id); setInvoiceNo(inv.invoiceNo); setParty(inv.party);
    setDcRef(inv.dcRef === "—" ? "" : inv.dcRef); setInvoiceDate(inv.invoiceDate);
    setAmount(String(inv.amount)); setStatus(inv.status);
    setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filtered = invoices.filter(inv =>
    [inv.invoiceNo, inv.party, inv.dcRef].some(v => v.toLowerCase().includes(search.toLowerCase()))
  );
  const totalOutstanding = invoices.filter(i => i.status !== "paid").reduce((s, i) => s + i.total, 0);
  const totalPaid        = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.total, 0);

  const fieldCls = "w-full border border-border rounded-md px-3 py-2 text-sm text-text-primary bg-white focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-colors";
  const labelCls = "block text-xs font-medium text-text-secondary mb-1";

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="w-full flex flex-col gap-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Sales Invoice</h1>
          <p className="text-xs text-text-secondary mt-0.5">Generate and manage GST invoices</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(v => !v); }}
          className="inline-flex items-center gap-1.5 bg-brand-orange text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus size={13} /> New Invoice
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2.5">{error}</div>}

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Invoices",  value: invoices.length,                          color: "text-text-primary" },
          { label: "Outstanding",     value: `₹${totalOutstanding.toLocaleString()}`,  color: "text-red-600"      },
          { label: "Collected",       value: `₹${totalPaid.toLocaleString()}`,          color: "text-green-600"    },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-lg border border-border p-4">
            <div className="text-xs text-text-secondary mb-1">{c.label}</div>
            <div className={`text-xl font-semibold ${c.color}`}>{c.value}</div>
          </div>
        ))}
      </div>

      {/* ── Invoice form ── */}
      {showForm && (
        <div className="bg-white rounded-xl border border-border shadow-sm">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <span className="text-sm font-semibold text-text-primary">
              {editingId ? `Editing Invoice` : "New Invoice"}
            </span>
            <button onClick={() => { setShowForm(false); resetForm(); }} className="text-text-muted hover:text-text-primary transition-colors"><X size={16} /></button>
          </div>

          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Invoice No. <span className="text-red-500">*</span></label>
              <input value={invoiceNo} onChange={e => setInvoiceNo(e.target.value)} className={fieldCls} placeholder="VMC/2026/001" />
            </div>
            <div>
              <label className={labelCls}>Invoice Date</label>
              <input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} className={fieldCls} />
            </div>
            <div>
              <label className={labelCls}>Party <span className="text-red-500">*</span></label>
              <select value={party} onChange={e => setParty(e.target.value)} className={`${fieldCls} appearance-none cursor-pointer`}>
                <option value="">-- Select Party --</option>
                {partyNames.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>DC Ref (Dispatch No.)</label>
              <select value={dcRef} onChange={e => setDcRef(e.target.value)} className={`${fieldCls} appearance-none cursor-pointer`}>
                <option value="">-- Select or type --</option>
                {dispatchNos.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Taxable Amount (₹)</label>
              <input type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)} className={fieldCls} placeholder="0.00" />
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select value={status} onChange={e => setStatus(e.target.value as Invoice["status"])} className={`${fieldCls} appearance-none cursor-pointer`}>
                <option value="draft">Draft</option>
                <option value="issued">Issued</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>

          {/* GST calculation summary */}
          {parseFloat(amount) > 0 && (
            <div className="mx-5 mb-4 bg-surface-muted rounded-lg px-4 py-3 flex gap-6 text-xs">
              <span className="text-text-secondary">Taxable: <strong className="text-text-primary">₹{(parseFloat(amount) || 0).toFixed(2)}</strong></span>
              <span className="text-text-secondary">GST 18%: <strong className="text-text-primary">₹{gstAmount.toFixed(2)}</strong></span>
              <span className="text-text-secondary font-medium">Total: <strong className="text-brand-orange text-sm">₹{total.toFixed(2)}</strong></span>
            </div>
          )}

          <div className="px-5 pb-5 pt-3 border-t border-border flex items-center gap-2">
            <button onClick={handleSave} disabled={!!editingId}
              className="bg-brand-orange text-white text-xs font-medium px-5 py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              Save
            </button>
            <button onClick={handleUpdate} disabled={!editingId}
              className="border border-border text-text-primary text-xs font-medium px-5 py-2 rounded-lg hover:bg-surface-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              Update
            </button>
            <button onClick={handleDelete} disabled={!editingId}
              className="border border-red-200 text-red-600 text-xs font-medium px-5 py-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              Delete
            </button>
            {editingId && (
              <button onClick={() => { setShowForm(false); resetForm(); }} className="text-xs text-text-secondary hover:text-text-primary transition-colors px-2">
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Invoices table ── */}
      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">All Invoices</h2>
            <p className="text-xs text-text-secondary mt-0.5">{filtered.length} records</p>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)} className="border border-border rounded-md text-xs pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-orange w-44" placeholder="Search..." />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[900px]">
            <thead className="bg-surface-muted border-b border-border">
              <tr>
                {["Invoice No.","Party","DC Ref","Date","Amount","GST (18%)","Total","Status","Actions"].map((h, i) => (
                  <th key={i} className="px-4 py-2.5 text-xs font-medium text-text-secondary border-r border-border last:border-r-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-text-muted">No invoices found. Click + New Invoice to create one.</td></tr>
              ) : filtered.map(inv => (
                <tr key={inv.id} className="hover:bg-surface-subtle transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-brand-orange border-r border-border">{inv.invoiceNo}</td>
                  <td className="px-4 py-3 font-medium text-text-primary border-r border-border">{inv.party}</td>
                  <td className="px-4 py-3 font-mono text-text-secondary border-r border-border">{inv.dcRef}</td>
                  <td className="px-4 py-3 text-text-secondary border-r border-border">{inv.invoiceDate}</td>
                  <td className="px-4 py-3 font-mono text-text-primary border-r border-border">₹{inv.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono text-text-secondary border-r border-border">₹{inv.gstAmount.toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-text-primary border-r border-border">₹{inv.total.toLocaleString()}</td>
                  <td className="px-4 py-3 border-r border-border">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[inv.status]}`}>
                      {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex items-center gap-2">
                    <button onClick={() => handleEdit(inv)} className="text-xs text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => printInvoicePDF(inv)} className="text-xs text-brand-orange hover:underline flex items-center gap-1">
                      <Printer size={11} /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
