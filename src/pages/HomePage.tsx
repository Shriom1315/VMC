import { motion } from "motion/react";
import { Plus, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import StatCard from "../components/StatCard";

export default function HomePage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-6xl mx-auto w-full px-4 md:px-8 py-8 md:py-12 flex flex-col gap-8"
    >
      {/* Hero */}
      <section className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          {/* Text side */}
          <div className="flex-1 p-6 md:p-10 flex flex-col justify-center gap-5">
            <div className="inline-flex items-center gap-2 bg-brand-orange-light text-brand-orange text-xs font-medium px-3 py-1 rounded-full w-fit">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
              System Ready
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-text-primary leading-tight tracking-tight">
                Vikramaditya<br />Operational Hub
              </h1>
              <p className="mt-3 text-sm text-text-secondary leading-relaxed max-w-sm">
                Manage quotations, purchase orders, and material movements from a single, unified workspace.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/quotation"
                className="inline-flex items-center gap-2 bg-brand-orange text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Plus size={15} /> New Quotation
              </Link>
              <Link
                to="/po"
                className="inline-flex items-center gap-2 border border-border text-text-primary text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-surface-muted transition-colors"
              >
                PO Registry <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Image side */}
          <div className="lg:w-[420px] min-h-[220px] lg:min-h-0 bg-surface-muted flex items-center justify-center overflow-hidden relative">
            <div className="absolute inset-0 blueprint-grid opacity-60" />
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPsG0c89IfSrn0IkQgilVgI8eLTEzu4wP6p-V53mumyqnJ9eB3UAbPXdafzMKuqSYbE9S1SyTMqXqvoEsPtUDjdbLVl__phucwQRj009-vQK23JfoXB3P5NPgxWDAiIldeK_PAUlnF5ERahaOddB-1SWsuMItyBqDfeUTCZH623V53ZMN2B33Q2zOp6uprjGRTKnMqF6ZX1-76-cCr8Dtahl34_VwZCPzHkcJ3p_jRDPmxdb6M9DCmN5VOUfASWXPsJEjmsUxqxB0"
              alt="Precision mechanical part"
              className="relative z-10 w-3/4 h-3/4 object-contain opacity-70 mix-blend-multiply grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Quotes" value="128" delta="+12% this month" />
        <StatCard label="Pending POs" value="45" delta="-3% from last week" />
        <StatCard label="Inward Lots" value="892" delta="+24% this month" />
        <StatCard label="System Uptime" value="99.9%" delta="Stable" />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-text-primary mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { label: "New Quotation", desc: "Create and export a client quotation", to: "/quotation", color: "text-brand-orange" },
            { label: "Purchase Order", desc: "Log and manage purchase orders", to: "/po", color: "text-blue-600" },
            { label: "Material Inward", desc: "Record incoming consignments (GRN)", to: "/inward", color: "text-green-600" },
          ].map(item => (
            <Link
              key={item.to}
              to={item.to}
              className="bg-white rounded-lg border border-border p-4 hover:shadow-md hover:border-border-strong transition-all group"
            >
              <div className={`text-sm font-semibold ${item.color} mb-1 group-hover:underline`}>{item.label}</div>
              <div className="text-xs text-text-secondary">{item.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
