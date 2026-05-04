import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Menu } from "lucide-react";
import { Link, Routes, Route, useLocation } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminDashboardHome from "../pages/admin/AdminDashboardHome";
import PartyRegistrationPage from "../pages/admin/PartyRegistrationPage";
import PlaceholderPage from "../pages/admin/PlaceholderPage";

function Breadcrumb() {
  const location = useLocation();
  const parts = location.pathname.replace("/admin", "").split("/").filter(Boolean);
  const labels = parts.map(p => p.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()));

  return (
    <div className="flex items-center gap-1.5 text-xs text-text-secondary">
      <Link to="/admin" className="hover:text-text-primary transition-colors">Dashboard</Link>
      {labels.map((label, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <span className="text-border-strong">/</span>
          <span className={i === labels.length - 1 ? "text-text-primary font-medium" : ""}>{label}</span>
        </span>
      ))}
    </div>
  );
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="h-screen flex font-sans overflow-hidden bg-surface-subtle text-text-primary">
      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 256, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full bg-white border-r border-border flex flex-col shrink-0 overflow-y-auto z-20"
          >
            <div className="px-4 py-4 border-b border-border flex items-center justify-between">
              <Link to="/" className="text-sm font-semibold text-text-primary hover:text-brand-orange transition-colors">
                Vikramaditya
              </Link>
              <span className="text-[10px] font-medium text-text-muted bg-surface-muted px-2 py-0.5 rounded">
                Admin
              </span>
            </div>
            <AdminSidebar />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-surface-subtle">
        {/* Admin Header */}
        <header className="bg-white border-b border-border h-14 flex items-center px-4 md:px-6 justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-text-secondary hover:text-text-primary transition-colors p-1 rounded hover:bg-surface-muted"
            >
              <Menu size={18} />
            </button>
            <div className="h-4 w-px bg-border" />
            <Breadcrumb />
          </div>
          <Link to="/" className="text-xs text-text-secondary hover:text-text-primary transition-colors">
            ← Back to site
          </Link>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Routes>
            <Route path="/" element={<AdminDashboardHome />} />
            <Route path="/basic-registration/party" element={<PartyRegistrationPage />} />
            <Route path="/basic-registration/gauge-info" element={<PlaceholderPage title="Gauge Info Registration" />} />
            <Route path="/basic-registration/new-equipment" element={<PlaceholderPage title="New Equipment" />} />
            <Route path="/basic-registration/equipment-hist" element={<PlaceholderPage title="Equipment History" />} />
            <Route path="/basic-registration/uncertainty" element={<PlaceholderPage title="Uncertainty Reg" />} />
            <Route path="/basic-registration/scope" element={<PlaceholderPage title="Scope Registration" />} />
            <Route path="/basic-registration/thread-specs" element={<PlaceholderPage title="Thread / Ring / Plug Spec" />} />
            <Route path="/basic-registration/taper-thread" element={<PlaceholderPage title="Taper Thread Reading" />} />
            <Route path="/basic-registration/reading-masters" element={<PlaceholderPage title="Reading Masters" />} />
            <Route path="/basic-registration/inst-repair" element={<PlaceholderPage title="Instrument Repair Master" />} />
            <Route path="/basic-registration/dial-table" element={<PlaceholderPage title="Dial Table Master" />} />
            <Route path="/basic-registration/rate" element={<PlaceholderPage title="Rate Register" />} />
            <Route path="/basic-registration/custom-po" element={<PlaceholderPage title="Custom PO Rate Master" />} />
            <Route path="/basic-registration/firm-creation" element={<PlaceholderPage title="Firm Creation" />} />
            <Route path="/transactions/quotation" element={<PlaceholderPage title="Quotation" />} />
            <Route path="/transactions/purchase-order" element={<PlaceholderPage title="Purchase Order" />} />
            <Route path="/transactions/inward" element={<PlaceholderPage title="Material Inward" />} />
            <Route path="/transactions/calib-status" element={<PlaceholderPage title="Calibration Status" />} />
            <Route path="/transactions/dispatch" element={<PlaceholderPage title="Dispatch" />} />
            <Route path="/transactions/sales-invoice" element={<PlaceholderPage title="Sales Invoice" />} />
            <Route path="/transactions/receipt" element={<PlaceholderPage title="Receipt" />} />
            <Route path="/reports/total-quotations" element={<PlaceholderPage title="Total Quotations" />} />
            <Route path="/reports/total-pos" element={<PlaceholderPage title="Total POs" />} />
            <Route path="/reports/cert-history" element={<PlaceholderPage title="Certificate History" />} />
            <Route path="/reports/outstanding" element={<PlaceholderPage title="Outstanding" />} />
            <Route path="/reports/ledger" element={<PlaceholderPage title="Ledger" />} />
            <Route path="/reports/sales-gst" element={<PlaceholderPage title="Sales GST Report" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
