import { motion } from "motion/react";
import { HardDrive } from "lucide-react";
import { Link } from "react-router-dom";

export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-[1600px] mx-auto w-full">
      <div className="bg-white border border-gray-200 rounded-lg p-12 flex flex-col items-center justify-center min-h-[400px] shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 blueprint-grid opacity-[0.03] pointer-events-none" />
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-6 relative z-10 border border-gray-100">
          <HardDrive size={32} className="text-gray-400" />
        </div>
        <h1 className="text-xl md:text-2xl font-semibold font-sans text-gray-900 mb-3 relative z-10 text-center">{title}</h1>
        <p className="font-sans text-sm text-gray-500 relative z-10 text-center max-w-sm">
          This module is currently under development. Please check back later for updates.
        </p>
        <Link to="/admin" className="mt-8 bg-white text-gray-700 font-sans font-medium text-sm px-6 py-2 border border-gray-300 hover:bg-gray-50 transition-all relative z-10 rounded-md shadow-sm">
          Return to Dashboard
        </Link>
      </div>
    </motion.div>
  );
}
