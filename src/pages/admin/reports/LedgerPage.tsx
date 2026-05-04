import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { supabase } from "../../../lib/supabase";

interface LedgerEntry {
  date: string; type: "Invoice" | "Receipt"; ref: string;
  party: string; debit: number; credit: number; balance: number;
}

export default function LedgerPage() {
  const [ledger,  setLedger]  = useState<LedgerEntry[]>([]);
  const [parties, setParties] = useState<string[]>(["All Parties"]);
  const [party,   setParty]   = useState("All Parties");
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); setError(null);
      const [invRes, rcpRes] = await Promise.all([
        supabase.from("invoices").select("*"),
        supabase.from("receipts").select("*"),
      ]);
      if (invRes.error) { setError(invRes.error.message); setLoading(false); return; }
      if (rcpRes.error) { setError(rcpRes.error.message); setLoading(false); return; }

      const invoiceEntries: LedgerEntry[] = (invRes.data ?? []).map((r: any) => ({ date: r.invoice_date ?? "", type: "Invoice" as const, ref: r.invoice_no ?? "", party: r.party ?? "", debit: Number(r.total ?? 0), credit: 0, balance: Number(r.total ?? 0) }));
      const receiptEntries: LedgerEntry[] = (rcpRes.data ?? []).map((r: any) => ({ date: r.receipt_date ?? "", type: "Receipt" as const, ref: r.receipt_no ?? "", party: r.party ?? "", debit: 0, credit: Number(r.amount ?? 0), balance: 0 }));
      const combined = [...invoiceEntries, ...receiptEntries].sort((a, b) => a.date.localeCompare(b.date));

      const balanceMap: Record<string, number> = {};
      const withBalance = combined.map(entry => {
        const prev = balanceMap[entry.party] ?? 0;
        const next = prev + entry.debit - entry.credit;
        balanceMap[entry.party] = next;
        return { ...entry, balance: next };
      });

      setLedger(withBalance);
      setParties(["All Parties", ...Array.from(new Set(combined.map(e => e.party))).filter(Boolean)]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = party === "All Parties" ? ledger : ledger.filter(r => r.party === party);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-6 h-6 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="w-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-lg font-semibold text-text-primary">Ledger</h1><p className="text-xs text-text-secondary mt-0.5">Client-wise account statement — invoices and payments</p></div>
        <div className="relative">
          <select value={party} onChange={e => setParty(e.target.value)} className="border border-border rounded-md px-3 py-2 text-xs text-text-primary bg-white focus:outline-none focus:ring-1 focus:ring-brand-orange appearance-none pr-8">
            {parties.map(p => <option key={p}>{p}</option>)}
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2.5">{error}</div>}

      <div className="bg-white rounded-xl border border-border shadow-sm overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[700px]">
          <thead className="bg-surface-muted border-b border-border">
            <tr>{["Date","Type","Reference","Party","Debit (₹)","Credit (₹)","Balance (₹)"].map((h, i) => <th key={i} className="px-4 py-2.5 text-xs font-medium text-text-secondary border-r border-border last:border-r-0">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-text-muted">No ledger entries found</td></tr>
            ) : filtered.map((r, i) => (
              <tr key={i} className="hover:bg-surface-subtle">
                <td className="px-4 py-3 text-text-secondary border-r border-border">{r.date}</td>
                <td className="px-4 py-3 border-r border-border"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${r.type === "Invoice" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"}`}>{r.type}</span></td>
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
