import { motion } from "motion/react";
import { Construction } from "lucide-react";
import { Link } from "react-router-dom";

export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="max-w-5xl mx-auto w-full"
    >
      <div className="bg-white rounded-lg border border-border p-12 flex flex-col items-center justify-center min-h-[360px] shadow-sm">
        <div className="w-12 h-12 bg-surface-muted rounded-full flex items-center justify-center mb-4">
          <Construction size={22} className="text-text-muted" />
        </div>
        <h1 className="text-base font-semibold text-text-primary mb-2">{title}</h1>
        <p className="text-sm text-text-secondary text-center max-w-xs">
          This module is under development and will be available soon.
        </p>
        <Link
          to="/admin"
          className="mt-6 text-xs font-medium text-brand-orange hover:underline"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </motion.div>
  );
}
