import { motion } from "motion/react";
import { useState } from "react";
import { Download } from "lucide-react";

const MONTHS = ["April 2026", "March 2026", "February 2026"];

const MOCK_GST = [
  { invoiceNo: "INV/2026/001", party: "Starfleet Command",  date: "2026-05-03", taxable: 4500,  cgst: 405,  sgst: 405,  igst: 0,    total: 5310  },
  { invoiceNo: "INV/2026/002", party: "Cyberdyne Systems",  date: "2026-05-04", taxable: 8200,  cgst: 738,  sgst: 738,  igst: 0,    total: 9676  },
  { invoiceNo: "INV/2026/003", party: "Adeptus Mechanicus", date: "2026-04-10", taxable: 12000, cgst: 0,    sgst: 0,    igst: 2160, total: 14160 },
];

export default function GSTReportPage() {
  const [month, setMonth] = useState(MONTHS[0]);

  const totals = MOCK_GST.reduce((acc, r) => ({
    taxable: acc.taxable + r.taxable,
    cgst: acc.cgst + r.cgst,
    sgst: acc.sgst + r.sgst,
    igst: acc.igst + r.igst,
    total: acc.total + r.total,
  }), { taxable: 0, cgst: 0, sgst: 0, igst: 0, total: 0 });

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
      className="w-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Sales GST Report</h1>
          <p className="text-xs text-text-secondary mt-0.5">Monthly GST summary for filing — CGST / SGST / IGST breakup</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={month} onChange={e => setMonth(e.target.value)}
            className="border border-border rounded-md px-3 py-2 text-xs text-text-primary bg-white focus:outline-none focus:ring-1 focus:ring-brand-orange">
            {MONTHS.map(m => <option key={m}>{m}</option>)}
          </select>
          <button className="inline-flex items-center gap-1.5 border border-border text-text-secondary text-xs font-medium px-3 py-2 rounded-lg hover:bg-surface-muted transition-colors">
            <Download size={13} /> Export
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Taxable Value", value: totals.taxable, color: "text-text-primary" },
          { label: "CGST (9%)",     value: totals.cgst,    color: "text-blue-600" },
          { label: "SGST (9%)",     value: totals.sgst,    color: "text-blue-600" },
          { label: "IGST (18%)",    value: totals.igst,    color: "text-purple-600" },
          { label: "Total Tax",     value: totals.cgst + totals.sgst + totals.igst, color: "text-brand-orange" },
        ].map(c => (
          <div key={c.label} className="bg-white rounded-lg border border-border p-4">
            <div className="text-xs text-text-secondary mb-1">{c.label}</div>
            <div className={`text-lg font-semibold ${c.color}`}>₹{c.value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-border shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[800px]">
          <thead className="bg-surface-muted border-b border-border">
            <tr>
              {["Invoice No.","Party","Date","Taxable (₹)","CGST (₹)","SGST (₹)","IGST (₹)","Total (₹)"].map((h, i) => (
                <th key={i} className="px-4 py-2.5 text-xs font-medium text-text-secondary border-r border-border last:border-r-0">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {MOCK_GST.map((r, i) => (
              <tr key={i} className="hover:bg-surface-subtle">
                <td className="px-4 py-3 font-mono text-brand-orange border-r border-border">{r.invoiceNo}</td>
                <td className="px-4 py-3 font-medium text-text-primary border-r border-border">{r.party}</td>
                <td className="px-4 py-3 text-text-secondary border-r border-border">{r.date}</td>
                <td className="px-4 py-3 font-mono text-text-primary border-r border-border">₹{r.taxable.toLocaleString()}</td>
                <td className="px-4 py-3 font-mono text-blue-600 border-r border-border">{r.cgst > 0 ? `₹${r.cgst}` : "—"}</td>
                <td className="px-4 py-3 font-mono text-blue-600 border-r border-border">{r.sgst > 0 ? `₹${r.sgst}` : "—"}</td>
                <td className="px-4 py-3 font-mono text-purple-600 border-r border-border">{r.igst > 0 ? `₹${r.igst}` : "—"}</td>
                <td className="px-4 py-3 font-mono font-semibold text-text-primary">₹{r.total.toLocaleString()}</td>
              </tr>
            ))}
            {/* Totals row */}
            <tr className="bg-surface-muted font-semibold">
              <td colSpan={3} className="px-4 py-3 text-text-primary border-r border-border">Totals</td>
              <td className="px-4 py-3 font-mono text-text-primary border-r border-border">₹{totals.taxable.toLocaleString()}</td>
              <td className="px-4 py-3 font-mono text-blue-600 border-r border-border">₹{totals.cgst.toLocaleString()}</td>
              <td className="px-4 py-3 font-mono text-blue-600 border-r border-border">₹{totals.sgst.toLocaleString()}</td>
              <td className="px-4 py-3 font-mono text-purple-600 border-r border-border">₹{totals.igst.toLocaleString()}</td>
              <td className="px-4 py-3 font-mono text-text-primary">₹{totals.total.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
