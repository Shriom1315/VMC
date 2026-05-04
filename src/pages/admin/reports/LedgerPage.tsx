import { motion } from "motion/react";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const PARTIES = ["All Parties", "Cyberdyne Systems", "Starfleet Command", "Adeptus Mechanicus"];

const MOCK_LEDGER = [
  { date: "2026-05-03", type: "Invoice",  ref: "INV/2026/001", party: "Starfleet Command",  debit: 5310,  credit: 0,    balance: 5310  },
  { date: "2026-05-05", type: "Receipt",  ref: "RCP/2026/001", party: "Starfleet Command",  debit: 0,     credit: 5310, balance: 0     },
  { date: "2026-05-04", type: "Invoice",  ref: "INV/2026/002", party: "Cyberdyne Systems",  debit: 9676,  credit: 0,    balance: 9676  },
  { date: "2026-05-06", type: "Receipt",  ref: "RCP/2026/002", party: "Cyberdyne Systems",  debit: 0,     credit: 5000, balance: 4676  },
  { date: "2026-04-10", type: "Invoice",  ref: "INV/2026/003", party: "Adeptus Mechanicus", debit: 14160, credit: 0,    balance: 14160 },
];

export default function LedgerPage() {
  const [party, setParty] = useState("All Parties");

  const filtered = party === "All Parties" ? MOCK_LEDGER : MOCK_LEDGER.filter(r => r.party === party);

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
      className="w-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">Ledger</h1>
          <p className="text-xs text-text-secondary mt-0.5">Client-wise account statement — invoices and payments</p>
        </div>
        <div className="relative">
          <select value={party} onChange={e => setParty(e.target.value)}
            className="border border-border rounded-md px-3 py-2 text-xs text-text-primary bg-white focus:outline-none focus:ring-1 focus:ring-brand-orange appearance-none pr-8">
            {PARTIES.map(p => <option key={p}>{p}</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[700px]">
          <thead className="bg-surface-muted border-b border-border">
            <tr>
              {["Date","Type","Reference","Party","Debit (₹)","Credit (₹)","Balance (₹)"].map((h, i) => (
                <th key={i} className="px-4 py-2.5 text-xs font-medium text-text-secondary border-r border-border last:border-r-0">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((r, i) => (
              <tr key={i} className="hover:bg-surface-subtle">
                <td className="px-4 py-3 text-text-secondary border-r border-border">{r.date}</td>
                <td className="px-4 py-3 border-r border-border">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${r.type === "Invoice" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>{r.type}</span>
                </td>
                <td className="px-4 py-3 font-mono text-brand-orange border-r border-border">{r.ref}</td>
                <td className="px-4 py-3 font-medium text-text-primary border-r border-border">{r.party}</td>
                <td className="px-4 py-3 font-mono text-red-600 border-r border-border">{r.debit > 0 ? `₹${r.debit.toLocaleString()}` : "—"}</td>
                <td className="px-4 py-3 font-mono text-green-600 border-r border-border">{r.credit > 0 ? `₹${r.credit.toLocaleString()}` : "—"}</td>
                <td className="px-4 py-3 font-mono font-semibold text-text-primary">{`₹${r.balance.toLocaleString()}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
