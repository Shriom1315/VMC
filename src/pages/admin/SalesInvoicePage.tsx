import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Plus, Search, Printer } from "lucide-react";
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

function printInvoicePDF(inv: Invoice) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" }) as any;
  const pageW = 210, marginL = 15, marginR = 15, contentW = pageW - marginL - marginR;

  // Header
  doc.setFont("helvetica", "bold"); doc.setFontSize(16);
  doc.text("VIKRAMADITYA METROLOGY CENTRE LLP", pageW / 2, 18, { align: "center" });
  doc.setFont("helvetica", "normal"); doc.setFontSize(8);
  doc.text("Plot No. A-15/1, Near Ultratech MIDC Shiroli (P), Tal. Hatkanagale, Dist Kolhapur 416122", pageW / 2, 24, { align: "center" });
  doc.text("Contact: 9503601616 | Email: vikramadityametrologycenter@gmail.com", pageW / 2, 28, { align: "center" });

  // Title
  doc.setFont("helvetica", "bold"); doc.setFontSize(13);
  doc.text("TAX INVOICE", pageW / 2, 36, { align: "center" });
  doc.line(marginL, 38, pageW - marginR, 38);

  // Invoice details
  doc.setFont("helvetica", "normal"); doc.setFontSize(9);
  doc.text(`Invoice No: ${inv.invoiceNo}`, marginL, 44);
  doc.text(`Date: ${inv.invoiceDate}`, pageW - marginR, 44, { align: "right" });
  doc.text(`Party: ${inv.party}`, marginL, 50);
  doc.text(`DC Ref: ${inv.dcRef}`, marginL, 56);
  doc.text(`Status: ${inv.status.toUpperCase()}`, pageW - marginR, 50, { align: "right" });

  doc.line(marginL, 60, pageW - marginR, 60);

  // Amount table
  doc.autoTable({
    startY: 64,
    head: [["Description", "Taxable Amount (₹)", "GST @ 18% (₹)", "Total (₹)"]],
    body: [
      ["Calibration / Repair Services", inv.amount.toFixed(2), inv.gstAmount.toFixed(2), inv.total.toFixed(2)],
    ],
    theme: "grid",
    margin: { left: marginL, right: marginR },
    headStyles: { fillColor: [232, 93, 4], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    columnStyles: { 1: { halign: "right" }, 2: { halign: "right" }, 3: { halign: "right" } },
  });

  const finalY = doc.lastAutoTable.finalY + 6;
  doc.setFont("helvetica", "bold"); doc.setFontSize(10);
  doc.text(`Total Amount: ₹${inv.total.toLocaleString()}`, pageW - marginR, finalY, { align: "right" });

  // Footer
  doc.setFont("helvetica", "normal"); doc.setFontSize(8);
  doc.text("This is a computer-generated invoice.", pageW / 2, finalY + 20, { align: "center" });

  doc.save(`Invoice_${inv.invoiceNo}.pdf`);
}

export default function SalesInvoicePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search,   setSearch]   = useState("");
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true); setError(null);
      const { data, error: err } = await supabase.from("invoices").select("*").order("invoice_date", { ascending: false });
      if (err) { setError(err.message); }
      else { setInvoices((data ?? []).map((r: any) => ({ id: String(r.id), invoiceNo: r.invoice_no ?? "", party: r.party ?? "", dcRef: r.dc_ref ?? "—", invoiceDate: r.invoice_date ?? "", amount: Number(r.amount ?? 0), gstAmount: Number(r.gst_amount ?? 0), total: Number(r.total ?? 0), status: r.status ?? "draft" }))); }
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = invoices.filter(inv => [inv.invoiceNo, inv.party, inv.dcRef].some(v => v.toLowerCase().includes(search.toLowerCase())));
  const totalOutstanding = invoices.filter(i => i.status !== "paid").reduce((s, i) => s + i.total, 0);
  const totalPaid        = invoices.filter(i => i.status === "paid").reduce((s, i) => s + i.total, 0);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="w-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Sales Invoice</h1>
          <p className="text-xs text-text-secondary mt-0.5">Generate and manage GST invoices</p>
        </div>
        <button className="inline-flex items-center gap-1.5 bg-brand-orange text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"><Plus size={13} /> New Invoice</button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2.5">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[{ label: "Total Invoices", value: invoices.length, color: "text-text-primary" }, { label: "Outstanding", value: `₹${totalOutstanding.toLocaleString()}`, color: "text-red-600" }, { label: "Collected", value: `₹${totalPaid.toLocaleString()}`, color: "text-green-600" }].map(c => (
          <div key={c.label} className="bg-white rounded-lg border border-border p-4">
            <div className="text-xs text-text-secondary mb-1">{c.label}</div>
            <div className={`text-xl font-semibold ${c.color}`}>{c.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div><h2 className="text-sm font-semibold text-text-primary">All Invoices</h2><p className="text-xs text-text-secondary mt-0.5">{filtered.length} records</p></div>
          <div className="relative"><Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" /><input value={search} onChange={e => setSearch(e.target.value)} className="border border-border rounded-md text-xs pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-orange w-44" placeholder="Search..." /></div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[800px]">
            <thead className="bg-surface-muted border-b border-border">
              <tr>{["Invoice No.","Party","DC Ref","Date","Amount","GST (18%)","Total","Status",""].map((h, i) => <th key={i} className="px-4 py-2.5 text-xs font-medium text-text-secondary border-r border-border last:border-r-0">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(inv => (
                <tr key={inv.id} className="hover:bg-surface-subtle transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-brand-orange border-r border-border">{inv.invoiceNo}</td>
                  <td className="px-4 py-3 font-medium text-text-primary border-r border-border">{inv.party}</td>
                  <td className="px-4 py-3 font-mono text-text-secondary border-r border-border">{inv.dcRef}</td>
                  <td className="px-4 py-3 text-text-secondary border-r border-border">{inv.invoiceDate}</td>
                  <td className="px-4 py-3 font-mono text-text-primary border-r border-border">₹{inv.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono text-text-secondary border-r border-border">₹{inv.gstAmount.toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-text-primary border-r border-border">₹{inv.total.toLocaleString()}</td>
                  <td className="px-4 py-3 border-r border-border"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLOR[inv.status]}`}>{inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}</span></td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => printInvoicePDF(inv)}
                      className="text-xs text-brand-orange hover:underline flex items-center gap-1"
                    >
                      <Printer size={11} /> Print
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
