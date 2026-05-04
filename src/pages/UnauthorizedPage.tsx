import { motion } from "motion/react";
import { ShieldOff, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function UnauthorizedPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-surface-subtle flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="text-center max-w-sm"
      >
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-5">
          <ShieldOff size={28} className="text-red-500" />
        </div>
        <h1 className="text-xl font-semibold text-text-primary mb-2">Access Denied</h1>
        <p className="text-sm text-text-secondary leading-relaxed mb-1">
          Your role <span className="font-medium text-text-primary">({user?.role ?? "unknown"})</span> does not have permission to view this page.
        </p>
        <p className="text-xs text-text-muted mb-8">
          Contact your administrator if you believe this is a mistake.
        </p>
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 bg-white border border-border text-text-primary text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-surface-muted transition-colors"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
      </motion.div>
    </div>
  );
}
