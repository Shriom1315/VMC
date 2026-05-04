import { motion } from "motion/react";

const MOCK = [
  { party: "Cyberdyne Systems",  invoiceNo: "INV/2026/002", date: "2026-05-04", total: 9676,  paid: 5000,  due: 4676,  ageing: "0–30 days" },
  { party: "Adeptus Mechanicus", invoiceNo: "INV/2026/003", date: "2026-04-10", total: 14160, paid: 0,     due: 14160, ageing: "30–60 days" },
];

export default function OutstandingPage() {
  const totalDue = MOCK.reduce((s, r) => s + r.due, 0);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
      className="w-full flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">Outstanding</h1>
        <p className="text-xs text-text-secondary mt-0.5">Unpaid invoices and ageing analysis</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-border p-4">
          <div className="text-xs text-text-secondary mb-1">Total Outstanding</div>
          <div className="text-xl font-semibold text-red-600">₹{totalDue.toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg border border-border p-4">
          <div className="text-xs text-text-secondary mb-1">0–30 Days</div>
          <div className="text-xl font-semibold text-amber-600">₹{MOCK.filter(r => r.ageing === "0–30 days").reduce((s, r) => s + r.due, 0).toLocaleString()}</div>
        </div>
        <div className="bg-white rounded-lg border border-border p-4">
          <div className="text-xs text-text-secondary mb-1">30–60 Days</div>
          <div className="text-xl font-semibold text-red-600">₹{MOCK.filter(r => r.ageing === "30–60 days").reduce((s, r) => s + r.due, 0).toLocaleString()}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-x-auto">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-text-primary">Pending Payments</h2>
        </div>
        <table className="w-full text-left text-xs min-w-[700px]">
          <thead className="bg-surface-muted border-b border-border">
            <tr>
              {["Party","Invoice No.","Invoice Date","Total","Paid","Balance Due","Ageing"].map((h, i) => (
                <th key={i} className="px-4 py-2.5 text-xs font-medium text-text-secondary border-r border-border last:border-r-0">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {MOCK.map((r, i) => (
              <tr key={i} className="hover:bg-surface-subtle">
                <td className="px-4 py-3 font-medium text-text-primary border-r border-border">{r.party}</td>
                <td className="px-4 py-3 font-mono text-brand-orange border-r border-border">{r.invoiceNo}</td>
                <td className="px-4 py-3 text-text-secondary border-r border-border">{r.date}</td>
                <td className="px-4 py-3 font-mono text-text-primary border-r border-border">₹{r.total.toLocaleString()}</td>
                <td className="px-4 py-3 font-mono text-green-600 border-r border-border">₹{r.paid.toLocaleString()}</td>
                <td className="px-4 py-3 font-mono font-semibold text-red-600 border-r border-border">₹{r.due.toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${r.ageing === "0–30 days" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                    {r.ageing}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
