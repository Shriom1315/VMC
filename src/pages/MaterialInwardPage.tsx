import { motion } from "motion/react";
import { Printer, Plus } from "lucide-react";
import StatCard from "../components/StatCard";

function StatusBadge({ status, alert = false, active = false }: { status: string; alert?: boolean; active?: boolean }) {
  const dot = alert
    ? "bg-red-500 animate-pulse"
    : active
    ? "bg-green-500"
    : status === "STORED"
    ? "bg-blue-500"
    : "bg-yellow-400 animate-pulse";
  const text = alert ? "text-red-600" : active ? "text-green-700" : "text-text-secondary";
  const label = status.replace(/_/g, " ");
  return (
    <div className="flex items-center gap-2">
      <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />
      <span className={`text-xs font-medium ${text}`}>{label}</span>
    </div>
  );
}

interface InwardRowProps {
  id: string; po: string; client: string; desc: string;
  qty: string; status: string; alert?: boolean; active?: boolean;
}

function InwardRow({ id, po, client, desc, qty, status, alert = false, active = false }: InwardRowProps) {
  return (
    <tr className={`hover:bg-surface-subtle transition-colors ${alert ? "bg-red-50" : active ? "bg-green-50" : ""}`}>
      <td className="px-4 py-3 text-xs font-mono font-semibold text-blue-600 border-r border-border">{id}</td>
      <td className="px-4 py-3 text-xs font-mono text-text-secondary border-r border-border">{po}</td>
      <td className="px-4 py-3 text-sm font-medium text-text-primary border-r border-border">{client}</td>
      <td className="px-4 py-3 text-xs text-text-secondary border-r border-border">{desc}</td>
      <td className="px-4 py-3 text-xs font-mono font-semibold text-right border-r border-border">{qty}</td>
      <td className="px-4 py-3"><StatusBadge status={status} alert={alert} active={active} /></td>
    </tr>
  );
}

export default function MaterialInwardPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="w-full px-4 md:px-8 py-6 flex flex-col gap-6"
    >
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pending Inspection" value="12" delta="+3 from yesterday" />
        <StatCard label="QC Passed Today"    value="48" delta="+12%" />
        <StatCard label="Rejected Units"     value="02" delta="-5% improvement" />
        <StatCard label="Avg Turnaround"     value="4.2h" delta="Target: <6h" />
      </div>

      {/* Main card */}
      <div className="bg-white rounded-xl border border-border shadow-sm flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-base font-semibold text-text-primary">Material Inward Log (GRN)</h1>
            <p className="text-xs text-text-secondary mt-0.5">Incoming consignment tracking</p>
          </div>
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-1.5 border border-border text-text-secondary text-xs font-medium px-3 py-2 rounded-lg hover:bg-surface-muted transition-colors">
              <Printer size={13} /> Reports
            </button>
            <button className="inline-flex items-center gap-1.5 bg-brand-orange text-white text-xs font-medium px-3 py-2 rounded-lg hover:bg-orange-700 transition-colors">
              <Plus size={13} /> Log Inward
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-medium text-text-primary">Incoming Consignments</h2>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-text-muted">Filter:</span>
            <button className="font-medium text-brand-orange">All</button>
            <span className="text-border-strong">|</span>
            <button className="text-text-secondary hover:text-text-primary transition-colors">Pending</button>
            <span className="text-border-strong">|</span>
            <button className="text-text-secondary hover:text-text-primary transition-colors">Completed</button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[800px]">
            <thead className="bg-surface-muted border-b border-border">
              <tr>
                <th className="px-4 py-2.5 text-xs font-medium text-text-secondary border-r border-border w-28">Inward ID</th>
                <th className="px-4 py-2.5 text-xs font-medium text-text-secondary border-r border-border w-28">PO Ref</th>
                <th className="px-4 py-2.5 text-xs font-medium text-text-secondary border-r border-border">Client / Source</th>
                <th className="px-4 py-2.5 text-xs font-medium text-text-secondary border-r border-border">Description</th>
                <th className="px-4 py-2.5 text-xs font-medium text-text-secondary border-r border-border w-24 text-right">Qty</th>
                <th className="px-4 py-2.5 text-xs font-medium text-text-secondary w-40">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <InwardRow id="IN-8892" po="PO-2991" client="Cyberdyne Systems"   desc="CPU Die Cast Housing V4"        qty="250 NOS"   status="INSPECTION_PENDING" />
              <InwardRow id="IN-8893" po="PO-2995" client="Starfleet Command"   desc="Warp Coil Casing Primary"       qty="12 NOS"    status="STORED" />
              <InwardRow id="IN-8894" po="PO-3001" client="Adeptus Mechanicus"  desc="Ceramite Plates Heavy"          qty="1,500 NOS" status="QC_PASS" active />
              <InwardRow id="IN-8895" po="PO-3002" client="Cyberdyne Systems"   desc="Hydraulic Actuators L"          qty="45 NOS"    status="QC_REJECT" alert />
              <InwardRow id="IN-8896" po="PO-3011" client="Weyland-Yutani"      desc="Atmospheric Processor Valve"    qty="8 NOS"     status="IN_TRANSIT" />
              <InwardRow id="IN-8897" po="PO-3015" client="Oscorp Corp"         desc="Bio Modular Unit Alpha"         qty="1 UNIT"    status="INSPECTION_PENDING" />
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border flex justify-between items-center text-xs text-text-muted">
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
          <span>Showing 6 of 1,244 records</span>
        </div>
      </div>
    </motion.div>
  );
}
