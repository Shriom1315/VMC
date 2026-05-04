import { motion } from "motion/react";
import { useState } from "react";
import { Search, Printer, Download } from "lucide-react";

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

const MOCK_CERTS: Certificate[] = [
  { id: "1", certNo: "VMC/2026/001", party: "Starfleet Command",  instrument: "Dial Indicator",   serialNo: "DI-1102", calibDate: "2026-05-01", dueDate: "2027-05-01", technician: "Priya Jadhav", result: "pass" },
  { id: "2", certNo: "VMC/2026/002", party: "Cyberdyne Systems",  instrument: "Vernier Caliper",  serialNo: "VC-2201", calibDate: "2026-05-02", dueDate: "2027-05-02", technician: "Priya Jadhav", result: "pass" },
  { id: "3", certNo: "VMC/2026/003", party: "Adeptus Mechanicus", instrument: "Thread Ring Gauge",serialNo: "TG-0078", calibDate: "2026-04-28", dueDate: "2027-04-28", technician: "Priya Jadhav", result: "conditional" },
];

const RESULT_COLOR = {
  pass:        "bg-green-100 text-green-700",
  fail:        "bg-red-100 text-red-700",
  conditional: "bg-amber-100 text-amber-700",
};

export default function CertificateHistoryPage() {
  const [search, setSearch] = useState("");

  const filtered = MOCK_CERTS.filter(c =>
    [c.certNo, c.party, c.instrument, c.serialNo].some(v => v.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
      className="w-full flex flex-col gap-6">

      <div>
        <h1 className="text-lg font-semibold text-text-primary">Certificate History</h1>
        <p className="text-xs text-text-secondary mt-0.5">All calibration certificates issued — searchable and printable</p>
      </div>

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
