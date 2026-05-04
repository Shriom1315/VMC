import { motion } from "motion/react";
import { useState } from "react";
import { Plus, Search } from "lucide-react";

interface Receipt {
  id: string;
  receiptNo: string;
  party: string;
  invoiceRef: string;
  receiptDate: string;
  amount: number;
  mode: "cash" | "cheque" | "upi" | "neft" | "rtgs";
  reference: string;
}

const MOCK_RECEIPTS: Receipt[] = [
  { id: "1", receiptNo: "RCP/2026/001", party: "Starfleet Command", invoiceRef: "INV/2026/001", receiptDate: "2026-05-05", amount: 5310,  mode: "upi",    reference: "UPI/2026/TXN001" },
  { id: "2", receiptNo: "RCP/2026/002", party: "Cyberdyne Systems", invoiceRef: "INV/2026/002", receiptDate: "2026-05-06", amount: 5000,  mode: "cheque", reference: "CHQ-004521" },
];

const MODE_COLOR: Record<Receipt["mode"], string> = {
  cash:   "bg-green-100 text-green-700",
  cheque: "bg-blue-100 text-blue-700",
  upi:    "bg-purple-100 text-purple-700",
  neft:   "bg-amber-100 text-amber-700",
  rtgs:   "bg-orange-100 text-orange-700",
};

export default function ReceiptPage() {
  const [receipts] = useState<Receipt[]>(MOCK_RECEIPTS);
  const [search, setSearch] = useState("");

  const filtered = receipts.filter(r =>
    [r.receiptNo, r.party, r.invoiceRef, r.reference].some(v => v.toLowerCase().includes(search.toLowerCase()))
  );

  const totalCollected = receipts.reduce((s, r) => s + r.amount, 0);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
      className="w-full flex flex-col gap-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Receipt</h1>
          <p className="text-xs text-text-secondary mt-0.5">Record payments received against invoices</p>
        </div>
        <button className="inline-flex items-center gap-1.5 bg-brand-orange text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
          <Plus size={13} /> New Receipt
        </button>
      </div>

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

      {/* Table */}
      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">All Receipts</h2>
            <p className="text-xs text-text-secondary mt-0.5">{filtered.length} records</p>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="border border-border rounded-md text-xs pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-orange w-44"
              placeholder="Search..." />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-surface-muted border-b border-border">
              <tr>
                {["Receipt No.","Party","Invoice Ref","Date","Amount","Mode","Reference"].map((h, i) => (
                  <th key={i} className="px-4 py-2.5 text-xs font-medium text-text-secondary border-r border-border last:border-r-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-surface-subtle transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-brand-orange border-r border-border">{r.receiptNo}</td>
                  <td className="px-4 py-3 font-medium text-text-primary border-r border-border">{r.party}</td>
                  <td className="px-4 py-3 font-mono text-text-secondary border-r border-border">{r.invoiceRef}</td>
                  <td className="px-4 py-3 text-text-secondary border-r border-border">{r.receiptDate}</td>
                  <td className="px-4 py-3 font-mono font-semibold text-green-600 border-r border-border">₹{r.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 border-r border-border">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase ${MODE_COLOR[r.mode]}`}>{r.mode}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-text-secondary">{r.reference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
