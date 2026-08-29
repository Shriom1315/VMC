import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Plus, Search, X } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface Receipt {
  id: string; receiptNo: string; party: string; invoiceRef: string;
  receiptDate: string; amount: number;
  mode: "cash" | "cheque" | "upi" | "neft" | "rtgs"; reference: string;
}

interface InvoiceOption {
  invoiceNo: string; party: string; total: number; outstanding: number;
}

const MODE_COLOR: Record<Receipt["mode"], string> = {
  cash:   "bg-green-100 text-green-700",
  cheque: "bg-blue-100 text-blue-700",
  upi:    "bg-purple-100 text-purple-700",
  neft:   "bg-amber-100 text-amber-700",
  rtgs:   "bg-orange-100 text-orange-700",
};

export default function ReceiptPage() {
  const [receipts,       setReceipts]       = useState<Receipt[]>([]);
  const [invoiceOptions, setInvoiceOptions] = useState<InvoiceOption[]>([]);
  const [search,         setSearch]         = useState("");
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState<string | null>(null);
  const [showForm,       setShowForm]       = useState(false);
  const [editingId,      setEditingId]      = useState<string | null>(null);

  // Form state
  const [receiptNo,    setReceiptNo]    = useState("");
  const [party,        setParty]        = useState("");
  const [invoiceRef,   setInvoiceRef]   = useState("");
  const [receiptDate,  setReceiptDate]  = useState(new Date().toISOString().split("T")[0]);
  const [amount,       setAmount]       = useState("");
  const [mode,         setMode]         = useState<Receipt["mode"]>("cash");
  const [reference,    setReference]    = useState("");

  // Fetch all receipts
  const fetchReceipts = async () => {
    setLoading(true); setError(null);
    const { data, error: err } = await supabase.from("receipts").select("*").order("receipt_date", { ascending: false });
    if (err) { setError(err.message); }
    else {
      setReceipts((data ?? []).map((r: any) => ({
        id: String(r.id), receiptNo: r.receipt_no ?? "", party: r.party ?? "",
        invoiceRef: r.invoice_ref ?? "", receiptDate: r.receipt_date ?? "",
        amount: Number(r.amount ?? 0), mode: r.mode ?? "cash", reference: r.reference ?? "",
      })));
    }
    setLoading(false);
  };

  // Fetch outstanding invoices to populate the dropdown
  const fetchInvoiceOptions = async () => {
    const [invRes, rcpRes] = await Promise.all([
      supabase.from("invoices").select("invoice_no, party, total").neq("status", "paid"),
      supabase.from("receipts").select("invoice_ref, amount"),
    ]);
    const paidMap: Record<string, number> = {};
    (rcpRes.data ?? []).forEach((r: any) => {
      paidMap[r.invoice_ref] = (paidMap[r.invoice_ref] ?? 0) + Number(r.amount ?? 0);
    });
    setInvoiceOptions(
      (invRes.data ?? []).map((r: any) => ({
        invoiceNo:   r.invoice_no,
        party:       r.party,
        total:       Number(r.total ?? 0),
        outstanding: Number(r.total ?? 0) - (paidMap[r.invoice_no] ?? 0),
      })).filter(o => o.outstanding > 0)
    );
  };

  useEffect(() => { fetchReceipts(); fetchInvoiceOptions(); }, []);

  // When invoice is selected, auto-fill party and amount
  const handleInvoiceSelect = (inv: string) => {
    setInvoiceRef(inv);
    const opt = invoiceOptions.find(o => o.invoiceNo === inv);
    if (opt) { setParty(opt.party); setAmount(String(opt.outstanding)); }
  };

  const resetForm = () => {
    setReceiptNo(""); setParty(""); setInvoiceRef(""); setAmount("");
    setReceiptDate(new Date().toISOString().split("T")[0]);
    setMode("cash"); setReference(""); setEditingId(null);
  };

  const handleSave = async () => {
    if (!receiptNo.trim() || !invoiceRef.trim()) {
      setError("Receipt No. and Invoice Reference are required."); return;
    }
    setError(null);
    const amountNum = parseFloat(amount) || 0;

    const { error: err } = await supabase.from("receipts").insert({
      receipt_no:   receiptNo,
      party,
      invoice_ref:  invoiceRef,
      receipt_date: receiptDate || null,
      amount:       amountNum,
      mode,
      reference,
    });
    if (err) { setError(err.message); return; }

    // Auto-check if invoice is now fully paid
    await checkAndMarkPaid(invoiceRef);

    resetForm(); setShowForm(false); fetchReceipts(); fetchInvoiceOptions();
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    setError(null);
    const amountNum = parseFloat(amount) || 0;
    const { error: err } = await supabase.from("receipts").update({
      receipt_no: receiptNo, party, invoice_ref: invoiceRef,
      receipt_date: receiptDate || null, amount: amountNum, mode, reference,
    }).eq("id", editingId);
    if (err) { setError(err.message); return; }
    await checkAndMarkPaid(invoiceRef);
    resetForm(); setShowForm(false); fetchReceipts(); fetchInvoiceOptions();
  };

  const handleDelete = async () => {
    if (!editingId) return;
    const { error: err } = await supabase.from("receipts").delete().eq("id", editingId);
    if (err) { setError(err.message); return; }
    resetForm(); setShowForm(false); fetchReceipts(); fetchInvoiceOptions();
  };

  // Auto-update invoice status when fully paid
  const checkAndMarkPaid = async (invNo: string) => {
    const [invRes, rcpRes] = await Promise.all([
      supabase.from("invoices").select("total").eq("invoice_no", invNo).single(),
      supabase.from("receipts").select("amount").eq("invoice_ref", invNo),
    ]);
    if (!invRes.data) return;
    const invoiceTotal = Number(invRes.data.total ?? 0);
    const totalPaid    = (rcpRes.data ?? []).reduce((s: number, r: any) => s + Number(r.amount ?? 0), 0);
    if (totalPaid >= invoiceTotal) {
      await supabase.from("invoices").update({ status: "paid" }).eq("invoice_no", invNo);
    }
  };

  const handleEdit = (r: Receipt) => {
    setEditingId(r.id); setReceiptNo(r.receiptNo); setParty(r.party);
    setInvoiceRef(r.invoiceRef); setReceiptDate(r.receiptDate);
    setAmount(String(r.amount)); setMode(r.mode); setReference(r.reference);
    setShowForm(true); window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filtered = receipts.filter(r =>
    [r.receiptNo, r.party, r.invoiceRef, r.reference].some(v => v.toLowerCase().includes(search.toLowerCase()))
  );
  const totalCollected = receipts.reduce((s, r) => s + r.amount, 0);

  const fieldCls = "w-full border border-border rounded-md px-3 py-2 text-sm text-text-primary bg-white focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-colors";
  const labelCls = "block text-xs font-medium text-text-secondary mb-1";

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="w-full flex flex-col gap-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Receipt</h1>
          <p className="text-xs text-text-secondary mt-0.5">Record payments received against invoices</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(v => !v); }}
          className="inline-flex items-center gap-1.5 bg-brand-orange text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus size={13} /> New Receipt
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2.5">{error}</div>}

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-border p-4">
          <div className="text-xs text-text-secondary mb-1">Total Receipts</div>
          <div className="text-xl font-semibold text-text-primary">{receipts.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-border p-4">
          <div className="text-xs text-text-secondary mb-1">Total Collected</div>
          <div className="text-xl font-semibold text-green-600">₹{totalCollected.toLocaleString()}</div>
        </div>
      </div>

      {/* ── Receipt form ── */}
      {showForm && (
        <div className="bg-white rounded-xl border border-border shadow-sm">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <span className="text-sm font-semibold text-text-primary">
              {editingId ? "Edit Receipt" : "New Receipt"}
            </span>
            <button onClick={() => { setShowForm(false); resetForm(); }} className="text-text-muted hover:text-text-primary transition-colors">
              <X size={16} />
            </button>
          </div>

          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Receipt No. <span className="text-red-500">*</span></label>
              <input value={receiptNo} onChange={e => setReceiptNo(e.target.value)} className={fieldCls} placeholder="RCP-2026-001" />
            </div>
            <div>
              <label className={labelCls}>Receipt Date</label>
              <input type="date" value={receiptDate} onChange={e => setReceiptDate(e.target.value)} className={fieldCls} />
            </div>
            <div>
              <label className={labelCls}>Invoice Reference <span className="text-red-500">*</span></label>
              <select
                value={invoiceRef}
                onChange={e => handleInvoiceSelect(e.target.value)}
                className={`${fieldCls} appearance-none cursor-pointer`}
              >
                <option value="">-- Select Outstanding Invoice --</option>
                {invoiceOptions.map(o => (
                  <option key={o.invoiceNo} value={o.invoiceNo}>
                    {o.invoiceNo} — {o.party} (₹{o.outstanding.toLocaleString()} due)
                  </option>
                ))}
              </select>
              {invoiceOptions.length === 0 && (
                <p className="text-[11px] text-text-muted mt-1">No outstanding invoices found.</p>
              )}
            </div>
            <div>
              <label className={labelCls}>Party</label>
              <input value={party} onChange={e => setParty(e.target.value)} className={fieldCls} placeholder="Auto-filled from invoice" />
            </div>
            <div>
              <label className={labelCls}>Amount Received (₹)</label>
              <input type="number" min="0" value={amount} onChange={e => setAmount(e.target.value)} className={fieldCls} placeholder="0.00" />
            </div>
            <div>
              <label className={labelCls}>Payment Mode</label>
              <select value={mode} onChange={e => setMode(e.target.value as Receipt["mode"])} className={`${fieldCls} appearance-none cursor-pointer`}>
                <option value="cash">Cash</option>
                <option value="cheque">Cheque</option>
                <option value="upi">UPI</option>
                <option value="neft">NEFT</option>
                <option value="rtgs">RTGS</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>Reference (Cheque No. / Transaction ID)</label>
              <input value={reference} onChange={e => setReference(e.target.value)} className={fieldCls} placeholder="Optional" />
            </div>
          </div>

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

      {/* ── Receipts table ── */}
      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">All Receipts</h2>
            <p className="text-xs text-text-secondary mt-0.5">{filtered.length} records</p>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)} className="border border-border rounded-md text-xs pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-orange w-44" placeholder="Search..." />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[800px]">
            <thead className="bg-surface-muted border-b border-border">
              <tr>
                {["Receipt No.","Party","Invoice Ref","Date","Amount","Mode","Reference",""].map((h, i) => (
                  <th key={i} className="px-4 py-2.5 text-xs font-medium text-text-secondary border-r border-border last:border-r-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-text-muted">No receipts found. Click + New Receipt to record a payment.</td></tr>
              ) : filtered.map(r => (
                <tr key={r.id} className="hover:bg-surface-subtle transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-brand-orange border-r border-border">{r.receiptNo}</td>
                  <td className="px-4 py-3 font-medium text-text-primary border-r border-border">{r.party}</td>
                  <td className="px-4 py-3 font-mono text-text-secondary border-r border-border">{r.invoiceRef}</td>
                  <td className="px-4 py-3 text-text-secondary border-r border-border">{r.receiptDate}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-green-600 border-r border-border">₹{r.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 border-r border-border">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${MODE_COLOR[r.mode]}`}>{r.mode}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-text-secondary border-r border-border">{r.reference || "—"}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleEdit(r)} className="text-xs text-blue-600 hover:underline">Edit</button>
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
