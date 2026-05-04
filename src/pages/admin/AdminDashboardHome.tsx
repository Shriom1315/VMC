import { motion } from "motion/react";
import { Activity, TrendingUp } from "lucide-react";
import StatCard from "../../components/StatCard";

export default function AdminDashboardHome() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="max-w-5xl mx-auto w-full flex flex-col gap-6"
    >
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-text-primary">System Overview</h1>
          <p className="text-xs text-text-secondary mt-0.5">Live metrics and module access</p>
        </div>
        <button className="inline-flex items-center gap-2 bg-brand-orange text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
          <TrendingUp size={13} /> Generate Report
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Certificates Registered" value="1" delta="+1 this week" />
        <StatCard label="Registered Enquiries" value="0" delta="Stable" />
        <StatCard label="Pending Enquiries" value="0" delta="Stable" />
        <StatCard label="Total Customers" value="0" delta="Stable" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="CSC Agencies" value="0" delta="Stable" />
      </div>

      {/* Placeholder */}
      <div className="bg-white rounded-lg border border-border h-56 flex flex-col items-center justify-center gap-3">
        <Activity size={28} className="text-border-strong" />
        <p className="text-xs text-text-muted">Awaiting data input — charts will appear here</p>
      </div>
    </motion.div>
  );
}
