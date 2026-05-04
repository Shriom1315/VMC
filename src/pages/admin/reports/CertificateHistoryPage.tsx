import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Search, Printer, Download } from "lucide-react";
import { supabase } from "../../../lib/supabase";

interface Certificate {
  id: string;
  certNo: string;
  party: string;
  instrument: string;
  serialNo: string;
  calibDate: string;
  dueDate: string;
  technician: string;
  result: "pass" | "fail" | "conditional";
}

const RESULT_COLOR = {
  pass:        "bg-green-100 text-green-700",
  fail:        "bg-red-100 text-red-700",
  conditional: "bg-amber-100 text-amber-700",
};

export default function CertificateHistoryPage() {
  const [certs,   setCerts]   = useState<Certificate[]>([]);
  const [search,  setSearch]  = useState("");
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    const fetchCerts = async () => {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from("calib_jobs")
        .select("*")
        .eq("status", "generated");
      if (err) {
        setError(err.message);
      } else {
        setCerts(
          (data ?? []).map((r: any) => ({
            id:         String(r.id),
            certNo:     r.cert_no ?? "",
            party:      r.client_name ?? "",
            instrument: r.name ?? "",
            serialNo:   r.identification_no ?? "",
            calibDate:  r.calib_date ?? "",
            dueDate:    r.next_calib_date ?? "",
            technician: r.calibrated_by ?? "",
            result:     "pass" as const,
          }))
        );
      }
      setLoading(false);
    };
    fetchCerts();
  }, []);

  const filtered = certs.filter(c =>
    [c.certNo, c.party, c.instrument, c.serialNo].some(v => v.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
      className="w-full flex flex-col gap-6">

      <div>
        <h1 className="text-lg font-semibold text-text-primary">Certificate History</h1>
        <p className="text-xs text-text-secondary mt-0.5">All calibration certificates issued — searchable and printable</p>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg px-3 py-2.5 mb-4">{error}</div>}

      <div className="bg-white rounded-xl border border-border shadow-sm">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-text-primary">Certificates</h2>
            <p className="text-xs text-text-secondary mt-0.5">{filtered.length} records</p>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="border border-border rounded-md text-xs pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-orange w-44"
              placeholder="Search certificates..." />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[900px]">
            <thead className="bg-surface-muted border-b border-border">
              <tr>
                {["Cert. No.","Party","Instrument","Serial No.","Calib. Date","Next Due","Technician","Result",""].map((h, i) => (
                  <th key={i} className="px-4 py-2.5 text-xs font-medium text-text-secondary border-r border-border last:border-r-0">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-surface-subtle transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-brand-orange border-r border-border">{c.certNo}</td>
                  <td className="px-4 py-3 font-medium text-text-primary border-r border-border">{c.party}</td>
                  <td className="px-4 py-3 text-text-primary border-r border-border">{c.instrument}</td>
                  <td className="px-4 py-3 font-mono text-text-secondary border-r border-border">{c.serialNo}</td>
                  <td className="px-4 py-3 text-text-secondary border-r border-border">{c.calibDate}</td>
                  <td className="px-4 py-3 text-text-secondary border-r border-border">{c.dueDate}</td>
                  <td className="px-4 py-3 text-text-secondary border-r border-border">{c.technician}</td>
                  <td className="px-4 py-3 border-r border-border">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${RESULT_COLOR[c.result]}`}>{c.result}</span>
                  </td>
                  <td className="px-4 py-3 flex items-center gap-2">
                    <button className="text-xs text-text-secondary hover:text-brand-orange transition-colors" title="Print"><Printer size={13} /></button>
                    <button className="text-xs text-text-secondary hover:text-brand-orange transition-colors" title="Download"><Download size={13} /></button>
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
