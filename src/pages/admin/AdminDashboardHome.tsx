import { motion } from "motion/react";
import { Activity } from "lucide-react";
import StatCard from "../../components/StatCard";
import ModuleAccents from "../../components/ModuleAccents";

export default function AdminDashboardHome() {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-[1600px] mx-auto w-full flex flex-col gap-8">
      {/* Overview Banner */}
      <section className="relative bg-white hairline-border p-6 md:p-8 lg:p-10 shadow-sm flex flex-col md:flex-row justify-between md:items-end gap-6 group">
        <ModuleAccents label="SYS.ADMIN / OVERVIEW" />
        <div>
          <h1 className="font-display text-4xl md:text-5xl uppercase text-industrial-text leading-[0.9] tracking-tighter font-bold mb-2">
            System Overview
          </h1>
          <p className="font-mono text-xs text-gray-500 tracking-widest uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Live telemetry and metric aggregation node
          </p>
        </div>
        <div className="flex gap-2 relative z-10">
          <button className="bg-brand-orange text-white font-mono text-xs px-6 py-3 border-2 border-brand-orange hover:bg-black transition-all">
            GENERATE_REPORT
          </button>
        </div>
      </section>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Certificates Registered" value="1" delta="+1 This Week" />
        <StatCard label="Register Enquirys" value="0" delta="STABLE" />
        <StatCard label="Pending Enquirys" value="0" delta="STABLE" />
        <StatCard label="Total Customers" value="0" delta="STABLE" />
        <div className="lg:col-span-1">
          <StatCard label="No.of CSC Agency" value="0" delta="STABLE" />
        </div>
      </div>

      {/* Placeholder */}
      <div className="h-64 border-2 border-dashed border-[#c8c6c5] flex flex-col items-center justify-center bg-white/40">
        <Activity size={32} className="text-gray-300 mb-3" />
        <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest">AWAITING_FURTHER_DATA_INPUT // STANDBY</p>
      </div>
    </motion.div>
  );
}
