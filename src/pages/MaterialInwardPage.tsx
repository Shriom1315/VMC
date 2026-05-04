import { motion } from "motion/react";
import { Printer, Plus } from "lucide-react";
import StatCard from "../components/StatCard";
import InwardRow from "../components/InwardRow";

export default function MaterialInwardPage() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 md:p-8 lg:p-10 max-w-[1400px] mx-auto w-full flex flex-col gap-6 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Pending Inspect" value="12" delta="+3 from yesterday" />
        <StatCard label="QC Passed Today" value="48" delta="+12%" />
        <StatCard label="Rejected Units" value="02" delta="-5% improvement" />
        <StatCard label="Avg Turnaround" value="4.2h" delta="Target: <6h" />
      </div>

      <div className="bg-white border border-gray-300 shadow-sm flex flex-col">
        <div className="bg-gray-50 border-b border-gray-300 p-5 px-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold uppercase tracking-wide text-gray-800">Material Inward Log (GRN)</h2>
            <p className="text-xs text-gray-500 font-mono mt-1">INTERNAL_LOG // NODE_ACCESS_STABLE</p>
          </div>
          <div className="flex gap-3">
            <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2">
              <Printer size={14} /> Reports
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2">
              <Plus size={14} /> Log Inward
            </button>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="flex justify-between items-end border-b border-gray-200 pb-2 mb-4">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-widest">Incoming Consignments</h3>
            <div className="flex gap-2 text-[11px] font-mono">
              <span className="text-gray-400">FILTER_BY:</span>
              <button className="text-blue-600 font-bold hover:underline">ALL</button>
              <span className="text-gray-300">|</span>
              <button className="text-gray-500 hover:text-blue-600">PENDING</button>
              <span className="text-gray-300">|</span>
              <button className="text-gray-500 hover:text-blue-600">COMPLETED</button>
            </div>
          </div>

          <div className="border border-gray-300 overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[1000px]">
              <thead className="bg-gray-100 border-b border-gray-300 text-gray-700">
                <tr>
                  <th className="p-3 font-bold border-r border-gray-300 w-32">Inward ID</th>
                  <th className="p-3 font-bold border-r border-gray-300 w-32">PO Ref</th>
                  <th className="p-3 font-bold border-r border-gray-300">Client / Source</th>
                  <th className="p-3 font-bold border-r border-gray-300">Description</th>
                  <th className="p-3 font-bold border-r border-gray-300 w-24 text-right">Qty</th>
                  <th className="p-3 font-bold border-gray-300 w-44">Inward Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <InwardRow id="IN-8892" po="PO-2991" client="CYBERDYNE SYSTEMS" desc="CPU_DIE_CAST_HOUSING_V4" qty="250 NOS" status="INSPECTION_PENDING" />
                <InwardRow id="IN-8893" po="PO-2995" client="STARFLEET COMMAND" desc="WARP_COIL_CASING_PRIMARY" qty="12 NOS" status="STORED" />
                <InwardRow id="IN-8894" po="PO-3001" client="ADEPTUS MECHANICUS" desc="CERAMITE_PLATES_HEAVY" qty="1,500 NOS" status="QC_PASS" active />
                <InwardRow id="IN-8895" po="PO-3002" client="CYBERDYNE SYSTEMS" desc="HYDRAULIC_ACTUATORS_L" qty="45 NOS" status="QC_REJECT" alert />
                <InwardRow id="IN-8896" po="PO-3011" client="WEYLAND-YUTANI" desc="ATMOSPHERIC_PROCESSOR_VALVE" qty="8 NOS" status="IN_TRANSIT" />
                <InwardRow id="IN-8897" po="PO-3015" client="OSCORP CORP" desc="BIO_MODULAR_UNIT_ALPHA" qty="1 UNIT" status="INSPECTION_PENDING" />
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-between items-center text-xs text-gray-400 font-mono">
            <div>SYSTEM_TIME: {new Date().toLocaleTimeString()} // NODE_LOCAL</div>
            <div>SHOWING 6 OF 1,244 RECORDS</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
