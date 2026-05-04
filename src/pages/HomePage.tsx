import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import StatCard from "../components/StatCard";
import ModuleAccents from "../components/ModuleAccents";

export default function HomePage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 md:p-8 lg:p-12 max-w-[1600px] mx-auto w-full flex flex-col gap-12"
    >
      <section className="relative bg-white hairline-border p-6 md:p-10 lg:p-12 flex flex-col lg:flex-row gap-12 shadow-sm">
        <ModuleAccents label="SEC_01.H / DASHBOARD" />
        <div className="w-full lg:w-1/2 flex flex-col justify-center gap-6 md:gap-8 pt-4">
          <h1 className="font-display text-5xl md:text-7xl xl:text-8xl uppercase text-industrial-text leading-[0.9] tracking-tighter font-bold">
            Vikramaditya<br />Operational Hub
          </h1>
          <p className="font-sans text-base md:text-lg text-industrial-text-variant max-w-md">
            Welcome to the central command node. Manage quotations, purchase orders, and material movements with absolute precision and zero latency.
          </p>
          <div className="flex flex-wrap gap-4 mt-2">
            <Link to="/quotation" className="bg-brand-orange text-white font-mono text-xs md:text-sm px-6 py-3 border-2 border-brand-orange hover:bg-black transition-all flex items-center gap-2">
              NEW_QUOTATION <Plus size={14} />
            </Link>
            <Link to="/po" className="bg-transparent text-industrial-text font-mono text-xs md:text-sm px-6 py-3 border-2 border-industrial-text hover:bg-industrial-low transition-all">
              PO_REGISTRY
            </Link>
          </div>
        </div>
        <div className="w-full lg:w-1/2 relative min-h-[300px] md:min-h-[400px] bg-industrial-low hairline-border flex items-center justify-center blueprint-grid overflow-hidden group">
          <div className="absolute top-2 left-2 font-mono text-xs text-gray-400">STATUS: SYSTEM_READY</div>
          <div className="relative w-4/5 h-4/5">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDPsG0c89IfSrn0IkQgilVgI8eLTEzu4wP6p-V53mumyqnJ9eB3UAbPXdafzMKuqSYbE9S1SyTMqXqvoEsPtUDjdbLVl__phucwQRj009-vQK23JfoXB3P5NPgxWDAiIldeK_PAUlnF5ERahaOddB-1SWsuMItyBqDfeUTCZH623V53ZMN2B33Q2zOp6uprjGRTKnMqF6ZX1-76-cCr8Dtahl34_VwZCPzHkcJ3p_jRDPmxdb6M9DCmN5VOUfASWXPsJEjmsUxqxB0"
              alt="Mechanical part"
              className="w-full h-full object-contain opacity-40 mix-blend-multiply grayscale transition-all duration-700 group-hover:opacity-100 group-hover:grayscale-0"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="ACTIVE_QUOTES" value="128" delta="+12%" />
        <StatCard label="PENDING_POs" value="45" delta="-3%" />
        <StatCard label="INWARD_LOTS" value="892" delta="+24%" />
        <StatCard label="SYS_UPTIME" value="99.9%" delta="STABLE" />
      </div>
    </motion.div>
  );
}
