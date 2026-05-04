import { motion } from "motion/react";
import { LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import StatCard from "../components/StatCard";

export default function HomePage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full px-4 md:px-8 py-8 md:py-12 flex flex-col gap-8"
    >
      {/* Hero */}
      <section className="rounded-xl overflow-hidden shadow-sm relative min-h-[280px] md:min-h-[320px] flex items-center">
        <img
          src="https://res.cloudinary.com/dvzlqsgwq/image/upload/v1777904206/copy_of_a0900813525f4965e7de00627873efb1_mpqpdx_51bac6.jpg"
          alt="Precision mechanical part"
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-gray-900/70 to-gray-900/30" />

        <div className="relative z-10 px-8 md:px-12 py-10 md:py-14 flex flex-col gap-5 max-w-xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full w-fit border border-white/20">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
            ISO 17025 Accredited
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight">
              Vikramaditya<br />Metrology Center
            </h1>
            <p className="mt-3 text-sm text-gray-300 leading-relaxed max-w-sm">
              Precision calibration, repair, and testing services for measuring instruments across manufacturing and engineering industries.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-brand-orange text-white text-sm font-medium px-6 py-2.5 rounded-lg hover:bg-orange-600 transition-colors shadow-lg"
            >
              <LogIn size={15} /> Login to Dashboard
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/30 text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-white/20 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active Quotes"  value="128"   delta="+12% this month" />
        <StatCard label="Pending POs"    value="45"    delta="-3% from last week" />
        <StatCard label="Inward Lots"    value="892"   delta="+24% this month" />
        <StatCard label="System Uptime"  value="99.9%" delta="Stable" />
      </div>

      {/* Services overview */}
      <div>
        <h2 className="text-sm font-semibold text-text-primary mb-4">Our Services</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { label: "Dimensional Calibration", desc: "Vernier calipers, micrometers, gauges and CMM verification", color: "text-brand-orange" },
            { label: "Instrument Repair",        desc: "Servicing and repair of precision measuring instruments",   color: "text-blue-600" },
            { label: "Thread Gauging",           desc: "Ring gauges, plug gauges and taper thread verification",    color: "text-green-600" },
          ].map(item => (
            <Link
              key={item.label}
              to="/about"
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
